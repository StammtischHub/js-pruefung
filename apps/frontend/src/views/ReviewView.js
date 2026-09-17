import { api } from "../api.js";
import { renderDocumentTable } from "../components/DocumentTable.js";
import { renderDocumentEditDialog } from "../components/DocumentEditDialog.js";
import { createConfidenceView } from "../components/ConfidenceView.js";
import { createDocumentPreview } from "../components/DocumentPreview.js";
import { showToast } from "../components/Toast.js";

const categoryLabels = {
  INVOICE: "Rechnung",
  STATEMENT: "Kontoauszug",
  LETTER: "Brief",
  UNKNOWN: "Unbekannt",
};

export async function renderReviewView(app) {
  app.innerHTML = `
    <section class="view">
      <h2 id="review-heading">Zu prüfen</h2>
      <p>Dokument auswählen, um Kategorie und Metadaten zu korrigieren.</p>
      <p>Confidence zeigt den niedrigsten Wert der drei erkannten Metadatenfelder.</p>
      <p role="status"></p>
      <button class="button" type="button" data-refresh>Aktualisieren</button>
      <div id="review-list"></div>
    </section>
  `;

  const section = app.querySelector("section");
  const list = section.querySelector("#review-list");
  const status = section.querySelector('[role="status"]');
  const refreshButton = section.querySelector("[data-refresh]");

  function openCorrection(doc) {
    renderDocumentEditDialog(doc, async (changes) => {
      await api.updateDocument(doc.id, changes);
      showToast("Metadaten erfolgreich gespeichert.");
      if (section.isConnected) await refresh();
    });
  }

  const columns = [
    {
      label: "Dateiname",
      render: (doc) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "document-name-button";
        button.textContent = doc.originalName;
        button.title = doc.originalName;
        button.addEventListener("click", () => openCorrection(doc));
        return button;
      },
    },
    { label: "Vorschau", render: createDocumentPreview },
    {
      label: "Vorgeschlagene Kategorie",
      value: (doc) => categoryLabels[doc.classification?.kind] ?? "Unbekannt",
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
  ];

  async function refresh() {
    refreshButton.disabled = true;
    status.textContent = "Dokumente werden geladen …";
    list.replaceChildren();

    try {
      const documents = await api.getReviewDocuments();
      if (!section.isConnected) return;
      renderDocumentTable(list, documents, columns, {
        tableId: "review-table",
        emptyText: "Keine Dokumente müssen überprüft werden.",
        onRowClick: openCorrection,
      });
      status.textContent = `${documents.length} Dokument${documents.length === 1 ? "" : "e"} zu prüfen.`;
      refreshButton.textContent = "Aktualisieren";
    } catch (error) {
      if (!section.isConnected || error.status === 401) return;
      console.error("Prüfliste konnte nicht geladen werden:", error);
      status.textContent = "Die Prüfliste konnte nicht geladen werden. Bitte versuche es erneut.";
      refreshButton.textContent = "Erneut versuchen";
    } finally {
      refreshButton.disabled = false;
    }
  }

  refreshButton.addEventListener("click", refresh);
  await refresh();
}
