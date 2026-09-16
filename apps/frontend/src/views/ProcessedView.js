import { api } from "../api.js";
import { renderDocumentDetails } from "../components/DocumentDetails.js";
import { renderDocumentTable } from "../components/DocumentTable.js";
import { createConfidenceView } from "../components/ConfidenceView.js";
import { showToast } from "../components/Toast.js";

const categoryLabels = {
  INVOICE: "Rechnung",
  STATEMENT: "Kontoauszug",
  LETTER: "Brief",
  UNKNOWN: "Unbekannt",
};

async function getProcessedDocuments() {
  return api.getDocuments("PROCESSED");
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

export async function renderProcessedView(app) {
  const documents = await getProcessedDocuments();

  const processedDocuments = documents.filter((doc) => doc.state === "PROCESSED");

  app.innerHTML = `
    <section class="view">
      <h2>Bearbeitet</h2>

      <div
        id="processed-bulk-actions"
        class="bulk-actions"
        hidden
      >
        <span id="processed-selection-count"></span>

        <button
          type="button"
          id="processed-to-inbox"
          class="button"
        >
          In Inbox verschieben
        </button>

        <button
          type="button"
          id="processed-to-trash"
          class="button"
        >
          Löschen vormerken
        </button>
      </div>

      <div id="processed-list"></div>
    </section>
  `;

  const processedList = document.getElementById("processed-list");

  const bulkActions = document.getElementById("processed-bulk-actions");

  const selectionCount = document.getElementById("processed-selection-count");

  const inboxButton = document.getElementById("processed-to-inbox");

  const trashButton = document.getElementById("processed-to-trash");

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
      value: (doc) => categoryLabels[doc.classification?.kind] ?? "Unbekannt",
    },
    {
      label: "Confidence",
      render: (doc) =>
        createConfidenceView(
          Math.min(
            doc.classification?.docId?.score ?? 0,
            doc.classification?.docDateSic?.score ?? 0,
            doc.classification?.docSubject?.score ?? 0
          )
        ),
    },
    {
      label: "Klassifizierungsart",
      value: (doc) => doc.classification?.type ?? "–",
    },
  ];

  renderDocumentTable(processedList, processedDocuments, columns, {
    tableId: "processed-table",
    emptyText: "Keine bearbeiteten Dokumente vorhanden.",
    selectable: true,

    onSelectionChange: (ids) => {
      selectedIds = ids;

      bulkActions.hidden = selectedIds.length === 0;

      selectionCount.textContent =
        selectedIds.length === 1
          ? "1 Dokument ausgewählt"
          : `${selectedIds.length} Dokumente ausgewählt`;
    },

    onRowClick: (doc) => {
      renderDocumentDetails(app, doc, () => {
        renderProcessedView(app);
      });
    },
  });

  async function runBulkAction(action, successMessage) {
    if (selectedIds.length === 0) {
      return;
    }

    inboxButton.disabled = true;
    trashButton.disabled = true;

    try {
      const results = await action(selectedIds);

      const failedResults = results.filter((result) => result.status < 200 || result.status >= 300);

      const details = getBulkResultDetails(results);

      await renderProcessedView(app);

      if (failedResults.length === 0) {
        showToast(successMessage, "success", details);
      } else {
        showToast("Aktion teilweise fehlgeschlagen.", "error", details);
      }
    } catch (error) {
      console.error("Bulk-Aktion fehlgeschlagen:", error);

      showToast("Die Aktion konnte nicht durchgeführt werden.", "error");

      inboxButton.disabled = false;
      trashButton.disabled = false;
    }
  }

  inboxButton.addEventListener("click", () => {
    runBulkAction(api.continueDocuments, "Dokumente erfolgreich in die Inbox verschoben.");
  });

  trashButton.addEventListener("click", () => {
    runBulkAction(
      api.prepareDocumentsForDeletion,
      "Dokumente erfolgreich zur Löschung vorgemerkt."
    );
  });
}
