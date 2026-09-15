import { api } from "../api.js";
import { createConfidenceView } from "./ConfidenceView.js";
import { renderDocumentEditDialog } from "./DocumentEditDialog.js";

const categoryLabels = {
  INVOICE: "Rechnung",
  STATEMENT: "Kontoauszug",
  LETTER: "Brief",
  UNKNOWN: "Unbekannt",
};

export function renderDocumentDetails(app, doc, onBack) {
  app.innerHTML = `
    <section id="detail-view" class="view">
      <h2>Dokumentdetails</h2>
      <p id="save-message" class="success-message"></p>

      <h3>Dokument</h3>

      <p>
        <strong>ID:</strong>
        <span>${doc.id}</span>
      </p>

      <p>
        <strong>Dateiname:</strong>
        <span>${doc.originalName}</span>
      </p>

      <p>
        <strong>Status:</strong>
        <span>${doc.state}</span>
      </p>

      <p>
        <strong>Pfad:</strong>
        <span>${doc.path}</span>
      </p>

      <hr />

      <h3>Klassifizierung</h3>

      <p>
        <strong>Kategorie:</strong>
        <span>${categoryLabels[doc.classification?.kind] ?? "Unbekannt"}</span>
      </p>

      <p>
        <strong>Klassifizierungsart:</strong>
        <span>${doc.classification.type}</span>
      </p>

      <hr />

      <h3>Erkannte Metadaten</h3>
      <p>
        <strong>Dokument-ID:</strong>
        <span id="document-id-value"></span>
      </p>

      <div class="confidence-row">
        <strong>Confidence:</strong>
        ${createConfidenceView(doc.classification.docId.score)}
      </div>


      <p>
        <strong>Dokumentdatum:</strong>
        <span id="document-date-value"></span>
      </p>

      <div class="confidence-row">
        <strong>Confidence:</strong>
        ${createConfidenceView(doc.classification.docDateSic.score)}
      </div>


     <p>
        <strong>Betreff:</strong>
        <span id="document-subject-value"></span>
      </p>

      <div class="confidence-row">
        <strong>Confidence:</strong>
        ${createConfidenceView(doc.classification.docSubject.score)}
      </div>
      <button type="button" id="edit-document">
        Metadaten bearbeiten
      </button>
      <button type="button" id="back-to-inbox">
        Zurück zur Inbox
      </button>
    </section>
  `;
  document.getElementById("document-date-value").textContent = doc.classification.docDateSic.value;
  document.getElementById("document-subject-value").textContent =
    doc.classification.docSubject.value;
  document.getElementById("document-id-value").textContent = doc.classification.docId.value;
  document.getElementById("back-to-inbox").addEventListener("click", onBack);

  document.getElementById("edit-document").addEventListener("click", () => {
    renderDocumentEditDialog(doc, async (changes) => {
      const updateDocument = await api.updateDocument(doc.id, changes);

      renderDocumentDetails(app, updateDocument, onBack);

      document.getElementById("save-message").textContent = "Metadaten erfolgreich gespeichert!";
    });
  });
}
