import { api } from "../api.js";
import { renderDocumentTable } from "../components/DocumentTable.js";
import { showToast } from "../components/Toast.js";

const categoryLabels = {
  INVOICE: "Rechnung",
  STATEMENT: "Kontoauszug",
  LETTER: "Brief",
  UNKNOWN: "Unbekannt",
};

async function getWaitingDocuments() {
  return api.getDocuments("WAITING");
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

export async function renderWaitingView(app) {
  const documents = await getWaitingDocuments();

  const waitingDocuments = documents.filter((doc) => doc.state === "WAITING");

  app.innerHTML = `
    <section class="view">
      <h2>Warteposition</h2>

      <div id="waiting-bulk-actions" class="bulk-actions" hidden>
        <span id="waiting-selection-count"></span>

        <button type="button" id="bulk-continue" class="button">
          Zurückholen
        </button>

        <button type="button" id="bulk-delete-waiting" class="button">
          Löschen vormerken
        </button>
      </div>

      <div id="waiting-list"></div>
    </section>
  `;

  const waitingList = document.getElementById("waiting-list");
  const bulkActions = document.getElementById("waiting-bulk-actions");
  const selectionCount = document.getElementById("waiting-selection-count");
  const continueButton = document.getElementById("bulk-continue");
  const deleteButton = document.getElementById("bulk-delete-waiting");

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
      label: "Aktionen",
      render: (doc) => `
        <button
          type="button"
          class="button continue-document"
          data-document-id="${doc.id}"
        >
          Zurückholen
        </button>
      `,
    },
  ];

  renderDocumentTable(waitingList, waitingDocuments, columns, {
    tableId: "waiting-table",
    emptyText: "Keine Dokumente in der Warteposition.",
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

  document.querySelectorAll(".continue-document").forEach((button) => {
    button.addEventListener("click", async () => {
      const documentId = button.dataset.documentId;

      const doc = waitingDocuments.find((document) => document.id === documentId);

      try {
        button.disabled = true;
        button.textContent = "Wird zurückgeholt...";

        const results = await api.continueDocuments([documentId]);
        const result = results[0];

        if (!result) {
          throw new Error("Keine Antwort für das Dokument erhalten.");
        }

        if (result.error) {
          throw new Error(result.error);
        }

        if (typeof result.status === "number" && result.status >= 400) {
          throw new Error(`Zurückholen fehlgeschlagen: ${result.status}`);
        }

        await renderWaitingView(app);

        showToast(
          `Dokument "${doc?.originalName ?? documentId}" wurde zurück in die Inbox verschoben.`
        );
      } catch (error) {
        console.error("Continuing document failed:", error);

        showToast("Das Dokument konnte nicht zurückgeholt werden.", "error");

        button.disabled = false;
        button.textContent = "Zurückholen";
      }
    });
  });

  async function runBulkAction(action, successMessage) {
    if (selectedIds.length === 0) {
      return;
    }

    continueButton.disabled = true;
    deleteButton.disabled = true;

    try {
      const results = await action(selectedIds);

      const failedResults = results.filter((result) => result.status < 200 || result.status >= 300);

      const details = getBulkResultDetails(results);

      await renderWaitingView(app);

      if (failedResults.length === 0) {
        showToast(successMessage, "success", details);
      } else {
        showToast("Aktion teilweise fehlgeschlagen.", "error", details);
      }
    } catch (error) {
      console.error("Bulk-Aktion fehlgeschlagen:", error);

      showToast("Die Aktion konnte nicht durchgeführt werden.", "error");

      continueButton.disabled = false;
      deleteButton.disabled = false;
    }
  }

  continueButton.addEventListener("click", () => {
    runBulkAction(api.continueDocuments, "Dokumente erfolgreich zurück in die Inbox verschoben.");
  });

  deleteButton.addEventListener("click", () => {
    runBulkAction(
      api.prepareDocumentsForDeletion,
      "Dokumente erfolgreich zur Löschung vorgemerkt."
    );
  });
}
