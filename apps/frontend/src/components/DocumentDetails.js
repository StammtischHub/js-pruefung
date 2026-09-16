import { api } from "../api.js";
import { createConfidenceView } from "./ConfidenceView.js";
import { renderDocumentEditDialog } from "./DocumentEditDialog.js";
import { showToast } from "./Toast.js";

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

      <button type="button" id="reclassify-document">
        Klassifizierung wiederholen
      </button>

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
      <button type="button" id="wait-document">
      Zurückstellen
      </button>
      <button type="button" id="edit-document">
        Metadaten bearbeiten
      </button>

      <button type="button" id="mark-for-deletion">
        Löschen vormerken
      </button>

      <button type="button" id="back-to-inbox">
        Zurück zur Inbox
      </button>
    </section>
  `;

  document.getElementById("document-date-value").textContent =
    doc.classification.docDateSic.value;

  document.getElementById("document-subject-value").textContent =
    doc.classification.docSubject.value;

  document.getElementById("document-id-value").textContent =
    doc.classification.docId.value;

  document.getElementById("back-to-inbox").addEventListener("click", onBack);
  document.getElementById("wait-document").addEventListener("click", async () => {
    const button = document.getElementById("wait-document");
    const message = document.getElementById("save-message");
    button.disabled = true;

    try {
      const results = await api.waitDocuments([doc.id]);
      const result = results[0];

      if (!result || result.status !== 200) {
        throw new Error(result?.error);
      }

      message.className = "success-message";
      message.textContent = `Dokument "${doc.originalName}" wurde zurückgestellt.`;
      button.textContent = "Zurückgestellt";

      window.setTimeout(() => {
        onBack();
      }, 1200);
    } catch (error) {
      message.className = "error-message";
      message.textContent = "Das Dokument konnte nicht zurückgestellt werden: " + error.message;
      button.disabled = false;
    }
  });

  document.getElementById("edit-document").addEventListener("click", () => {
    renderDocumentEditDialog(doc, async (changes) => {
      const updatedDocument = await api.updateDocument(doc.id, changes);

      renderDocumentDetails(app, updatedDocument, onBack);

      showToast("Metadaten erfolgreich gespeichert.");
    });
  });

  const reclassifyButton = document.getElementById("reclassify-document");

  reclassifyButton.addEventListener("click", async () => {
    try {
      reclassifyButton.disabled = true;
      reclassifyButton.textContent = "Klassifizierung läuft...";

      const response = await api.reclassifyDocument(doc.id);
      const result = Array.isArray(response) ? response[0] : response;

      if (!result) {
        throw new Error("Keine Antwort für das Dokument erhalten.");
      }

      if (result.error) {
        throw new Error(result.error);
      }

      if (typeof result.status === "number" && result.status >= 400) {
        throw new Error(`Klassifizierung fehlgeschlagen: ${result.status}`);
      }

      const updatedDocument = result.document ?? result;

      if (!updatedDocument?.id) {
        throw new Error("Kein aktualisiertes Dokument erhalten.");
      }

      renderDocumentDetails(app, updatedDocument, onBack);

      showToast("Klassifizierung erfolgreich wiederholt.");
    } catch (error) {
      console.error("Reclassify failed:", error);

      showToast(
        "Klassifizierung konnte nicht erneut durchgeführt werden.",
        "error"
      );

      reclassifyButton.disabled = false;
      reclassifyButton.textContent = "Klassifizierung wiederholen";
    }
  });

  const deleteButton = document.getElementById("mark-for-deletion");

  deleteButton.addEventListener("click", async () => {
    try {
      deleteButton.disabled = true;
      deleteButton.textContent = "Wird vorgemerkt...";

      const response = await api.prepareForDeletion(doc.id);
      const result = Array.isArray(response) ? response[0] : response;

      if (!result) {
        throw new Error("Keine Antwort für das Dokument erhalten.");
      }

      if (result.error) {
        throw new Error(result.error);
      }

      if (typeof result.status === "number" && result.status >= 400) {
        throw new Error(`Vormerken fehlgeschlagen: ${result.status}`);
      }

      onBack();

      showToast("Dokument wurde zur Löschung vorgemerkt.");
    } catch (error) {
      console.error("Preparing document for deletion failed:", error);

      showToast(
        "Dokument konnte nicht zur Löschung vorgemerkt werden.",
        "error"
      );

      deleteButton.disabled = false;
      deleteButton.textContent = "Löschen vormerken";
    }
  });
}
