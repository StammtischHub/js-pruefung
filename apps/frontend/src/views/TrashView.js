import { api } from "../api.js";
import { renderDocumentTable } from "../components/DocumentTable.js";
import { showToast } from "../components/Toast.js";

const categoryLabels = {
  INVOICE: "Rechnung",
  STATEMENT: "Kontoauszug",
  LETTER: "Brief",
  UNKNOWN: "Unbekannt",
};

async function getTrashDocuments() {
  return api.getDocuments("TRASH");
}

function getBulkResultDetails(results) {
  return results.map((result) => {
    const documentName = result.document?.originalName ?? result.id;

    if (result.status >= 200 && result.status < 300) {
      return `${documentName}: Erfolgreich`;
    }

    return `${documentName}: Fehler (${result.status})`;
  });
}

export async function renderTrashView(app) {
  const documents = await getTrashDocuments();

  const trashDocuments = documents.filter((doc) => doc.state === "TRASH");

  app.innerHTML = `
    <section class="view">
      <h2>Papierkorb</h2>

      <div
        id="trash-bulk-actions"
        class="bulk-actions"
        hidden
      >
        <span id="trash-selection-count"></span>

        <button
          type="button"
          id="trash-to-inbox"
          class="button"
        >
          In Inbox verschieben
        </button>
      </div>

      <div id="trash-list"></div>
    </section>
  `;

  const trashList = document.getElementById("trash-list");

  const bulkActions = document.getElementById("trash-bulk-actions");

  const selectionCount = document.getElementById("trash-selection-count");

  const inboxButton = document.getElementById("trash-to-inbox");

  let selectedIds = [];

  const columns = [
    {
      label: "Dateiname",
      value: (doc) => doc.originalName,
    },
    {
      label: "Status",
      value: (doc) => doc.state,
    },
    {
      label: "Kategorie",
      value: (doc) => categoryLabels[doc.classification?.kind] ?? "–",
    },
    {
      label: "Zur Löschung vorgemerkt",
      value: (doc) =>
        doc.deletionFlagSetDate ? new Date(doc.deletionFlagSetDate).toLocaleString("de-DE") : "–",
    },
  ];

  renderDocumentTable(trashList, trashDocuments, columns, {
    tableId: "trash-table",
    emptyText: "Keine Dokumente im Papierkorb.",
    selectable: true,

    onSelectionChange: (ids) => {
      selectedIds = ids;

      bulkActions.hidden = selectedIds.length === 0;

      selectionCount.textContent =
        selectedIds.length === 1
          ? "1 Dokument ausgewählt"
          : `${selectedIds.length} Dokumente ausgewählt`;
    },
  });

  inboxButton.addEventListener("click", async () => {
    if (selectedIds.length === 0) {
      return;
    }

    inboxButton.disabled = true;

    try {
      const results = await api.continueDocuments(selectedIds);

      const failedResults = results.filter((result) => result.status < 200 || result.status >= 300);

      const details = getBulkResultDetails(results);

      await renderTrashView(app);

      if (failedResults.length === 0) {
        showToast("Dokumente erfolgreich in die Inbox verschoben.", "success", details);
      } else {
        showToast("Aktion teilweise fehlgeschlagen.", "error", details);
      }
    } catch (error) {
      console.error("Verschieben aus dem Papierkorb fehlgeschlagen:", error);

      showToast("Die Dokumente konnten nicht in die Inbox verschoben werden.", "error");

      inboxButton.disabled = false;
    }
  });
}
