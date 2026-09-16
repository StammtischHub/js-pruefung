import { api } from "../api.js";
import { renderDocumentDetails } from "../components/DocumentDetails.js";
import { createConfidenceView } from "../components/ConfidenceView.js";
import { renderDocumentTable } from "../components/DocumentTable.js";
import { showToast } from "../components/Toast.js";

const categoryLabels = {
  INVOICE: "Rechnung",
  STATEMENT: "Kontoauszug",
  LETTER: "Brief",
  UNKNOWN: "Unbekannt",
};

async function getInboxDocuments() {
  return api.getDocuments("INBOX");
}

export async function renderInboxView(app) {
  const documents = await getInboxDocuments();

  const inboxDocuments = documents.filter((doc) => doc.state === "INBOX");

  app.innerHTML = `
    <section class="view">
      <h2>Inbox</h2>

      <div id="inbox-bulk-actions" class="bulk-actions" hidden>
        <span id="inbox-selection-count"></span>

        <button type="button" id="bulk-wait" class="button">
          Zurückstellen
        </button>

        <button type="button" id="bulk-delete" class="button">
          Löschen vormerken
        </button>
      </div>

      <div id="inbox-list"></div>
    </section>
  `;

  const inboxList = document.getElementById("inbox-list");
  const bulkActions = document.getElementById("inbox-bulk-actions");
  const selectionCount = document.getElementById("inbox-selection-count");
  const waitButton = document.getElementById("bulk-wait");
  const deleteButton = document.getElementById("bulk-delete");

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

  renderDocumentTable(inboxList, inboxDocuments, columns, {
    tableId: "inbox-table",
    emptyText: "Keine Dokumente in der Inbox.",
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
        renderInboxView(app);
      });
    },
  });

  async function runBulkAction(action, successMessage) {
    if (selectedIds.length === 0) {
      return;
    }

    waitButton.disabled = true;
    deleteButton.disabled = true;

    try {
      const results = await action(selectedIds);

      const failedResults = results.filter(
        (result) => result.status < 200 || result.status >= 300
      );

      const details = results.map((result) => {
        const name = result.document?.originalName ?? result.id;

        if (result.status >= 200 && result.status < 300) {
          return `${name}: Erfolgreich`;
        }

        return `${name}: Fehler (${result.status})`;
      });

      await renderInboxView(app);

      if (failedResults.length === 0) {
        showToast(successMessage, "success", details);
      } else {
        showToast(
          "Aktion teilweise fehlgeschlagen.",
          "error",
          details
        );
      }
    } catch (error) {
      console.error("Bulk-Aktion fehlgeschlagen:", error);

      showToast(
        "Die Aktion konnte nicht durchgeführt werden.",
        "error"
      );

      waitButton.disabled = false;
      deleteButton.disabled = false;
    }
  }

  waitButton.addEventListener("click", () => {
    runBulkAction(
      api.waitDocuments,
      "Dokumente erfolgreich zurückgestellt."
    );
  });

  deleteButton.addEventListener("click", () => {
    runBulkAction(
      api.prepareDocumentsForDeletion,
      "Dokumente erfolgreich zur Löschung vorgemerkt."
    );
  });
}
