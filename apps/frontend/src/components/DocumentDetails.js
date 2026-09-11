import { renderDocumentEditDialog } from "./DocumentEditDialog.js";

export function renderDocumentDetails(app, doc, onBack) {
  app.innerHTML = `
    <section id="detail-view" class="view">
      <h2>Dokumentdetails</h2>
      <p id="save-message" class="success-message"></p>
      <p>
        <strong>ID:</strong>
        <span>${doc.id}</span>
      </p>

      <p>
        <strong>Dateiname:</strong>
        <span>${doc.filename}</span>
      </p>

      <p>
        <strong>Status:</strong>
        <span>${doc.status}</span>
      </p>

      <p>
        <strong>Kategorie:</strong>
        <span>${doc.category}</span>
      </p>

      <p>
        <strong>Confidence:</strong>
        <span>${Math.round(doc.confidence * 100)} %</span>
      </p>

      <p>
        <strong>Klassifizierungsart:</strong>
        <span>${doc.classificationType}</span>
      </p>

      <hr />

      <h3>Metadaten</h3>

      <p>
        <strong>Dokument-ID:</strong>
        <span>${doc.docId.value}</span>
        (${Math.round(doc.docId.score * 100)} %)
      </p>

      <p>
        <strong>Dokumentdatum:</strong>
        <span>${doc.docDate.value}</span>
        (${Math.round(doc.docDate.score * 100)} %)
      </p>

      <p>
        <strong>Betreff:</strong>
        <span>${doc.docSubject.value}</span>
        (${Math.round(doc.docSubject.score * 100)} %)
      </p>

      <button type="button" id="edit-document">
        Metadaten bearbeiten
      </button>

      <button type="button" id="back-to-inbox">
        Zurück zur Inbox
      </button>
    </section>
  `;

  document.getElementById("back-to-inbox").addEventListener("click", onBack);

  document.getElementById("edit-document").addEventListener("click", () => {
    renderDocumentEditDialog(doc, async (changes) => {
      // Simulating error
      if (changes.docSubject === "FEHLER") {
        throw new Error("Fehler beim Speichern der Metadaten!");
      }
      doc.category = changes.category;
      doc.docId.value = changes.docId;
      doc.docDate.value = changes.docDate;
      doc.docSubject.value = changes.docSubject;

      renderDocumentDetails(app, doc, onBack);

      document.getElementById("save-message").textContent = "Metadaten erfolgreich gespeichert!";
    });
  });
}
