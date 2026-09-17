import { createDocumentPreview } from "../components/DocumentPreview.js";
import { renderDocumentEditDialog } from "../components/DocumentEditDialog.js";
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

export async function renderInboxView(app, documentToOpen = null, openNextByDefault = false) {
  const documents = await getInboxDocuments();

  const inboxDocuments = documents.filter((doc) => doc.state === "INBOX");

  app.innerHTML = `
    <section class="view">
      <h2>Inbox</h2>
      <p>Dokument auswählen, um Kategorie und Metadaten zu prüfen.</p>
      <p>Confidence zeigt den niedrigsten Wert der drei erkannten Metadatenfelder.</p>
      <button class="button" type="button" id="inbox-refresh">Aktualisieren</button>

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

  const section = app.querySelector("section");
  const refreshButton = section.querySelector("#inbox-refresh");

  refreshButton.addEventListener("click", async () => {
    refreshButton.disabled = true;

    try {
      await renderInboxView(app);
    } catch (error) {
      console.error("Inbox konnte nicht geladen werden:", error);
      showToast("Die Inbox konnte nicht aktualisiert werden.", "error");
    } finally {
      refreshButton.disabled = false;
    }
  });

  function openCorrection(doc, keepOpenNextSelected = false) {
    renderDocumentEditDialog(
      doc,
      async (changes, openNextDocument) => {
        await api.reviewDocument(doc.id, changes);

        if (openNextDocument) {
          const nextDocument = await api.getNextDocument();

          if (section.isConnected) {
            await renderInboxView(
              app,
              nextDocument?.id ? nextDocument : null,
              true
            );
          }

          if (nextDocument?.id) {
            showToast("Prüfung abgeschlossen. Das nächste Dokument wird geöffnet.");
          } else {
            showToast("Prüfung abgeschlossen. Keine weiteren Dokumente zu prüfen.");
          }

          return;
        }

        showToast("Prüfung abgeschlossen. Das Dokument ist unter Bearbeitet verfügbar.");

        if (section.isConnected) {
          try {
            await renderInboxView(app);
          } catch (error) {
            console.error("Inbox konnte nicht aktualisiert werden:", error);

            showToast(
              "Prüfung abgeschlossen, aber die Inbox konnte nicht aktualisiert werden.",
              "error"
            );
          }
        }
      },
      keepOpenNextSelected
    );
  }

  let selectedIds = [];

  const columns = [
    {
      label: "Dateiname",
      render: (doc) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "document-name-button";
        button.textContent = doc.originalName;
        button.title = "Dokument prüfen";
        button.addEventListener("click", () => openCorrection(doc));
        return button;
      },
    },
    {
      label: "Vorschau",
      render: createDocumentPreview,
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
      render: (doc) => {
        const scores = ["docId", "docDateSic", "docSubject"].map(
          (field) => doc.classification?.[field]?.score
        );
        return scores.every((score) => Number.isFinite(score) && score >= 0 && score <= 1)
          ? createConfidenceView(Math.min(...scores))
          : "Nicht verfügbar";
      },
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
        return renderInboxView(app);
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

      const failedResults = results.filter((result) => result.status < 200 || result.status >= 300);

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
        showToast("Aktion teilweise fehlgeschlagen.", "error", details);
      }
    } catch (error) {
      console.error("Bulk-Aktion fehlgeschlagen:", error);

      showToast("Die Aktion konnte nicht durchgeführt werden.", "error");

      waitButton.disabled = false;
      deleteButton.disabled = false;
    }
  }

  waitButton.addEventListener("click", () => {
    runBulkAction(api.waitDocuments, "Dokumente erfolgreich zurückgestellt.");
  });

  deleteButton.addEventListener("click", () => {
    runBulkAction(
      api.prepareDocumentsForDeletion,
      "Dokumente erfolgreich zur Löschung vorgemerkt."
    );
  });

  if (documentToOpen?.id) {
    window.setTimeout(() => {
      openCorrection(documentToOpen, openNextByDefault);
    }, 0);
  }
}
