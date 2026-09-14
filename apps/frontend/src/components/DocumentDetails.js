import { createConfidenceView } from "./ConfidenceView.js";

export function renderDocumentDetails(app, doc, onBack) {
  app.innerHTML = `
    <section id="detail-view" class="view">
      <h2>Dokumentdetails</h2>

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
        <span>${doc.classificationResult.kind}</span>
      </p>

      <p>
        <strong>Klassifizierungsart:</strong>
        <span>${doc.classificationType}</span>
      </p>

      <hr />

      <h3>Erkannte Metadaten</h3>
      <p>
        <strong>Dokument-ID:</strong>
        <span>${doc.classificationResult.docId.value}</span>
      </p>

      <div class="confidence-row">
        <strong>Confidence:</strong>
        ${createConfidenceView(doc.classificationResult.docId.score)}
      </div>


      <p>
        <strong>Dokumentdatum:</strong>
        <span>${doc.classificationResult.docDateSic.value}</span>
      </p>

      <div class="confidence-row">
        <strong>Confidence:</strong>
        ${createConfidenceView(doc.classificationResult.docDateSic.score)}
      </div>


     <p>
        <strong>Betreff:</strong>
        <span>${doc.classificationResult.docSubject.value}</span>
      </p>

      <div class="confidence-row">
        <strong>Confidence:</strong>
        ${createConfidenceView(doc.classificationResult.docSubject.score)}
      </div>

      <button type="button" id="back-to-inbox">
        Zurück zur Inbox
      </button>
    </section>
  `;

  document.getElementById("back-to-inbox").addEventListener("click", onBack);
}
