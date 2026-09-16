import { showToast } from "./Toast.js";

export function renderDocumentEditDialog(doc, onSave) {
  const dialog = document.createElement("dialog");

  dialog.innerHTML = `
    <form id="document-edit-form">
      <h2>Metadaten bearbeiten</h2>

      <label for="edit-category">
        Kategorie
      </label>

      <select id="edit-category" required>
        <option value="INVOICE">Rechnung</option>
        <option value="STATEMENT">Kontoauszug</option>
        <option value="LETTER">Brief</option>
        <option value="UNKNOWN">Unbekannt</option>
      </select>

      <label for="edit-doc-id">
        Dokument-ID
      </label>

      <input id="edit-doc-id" type="text" required />

      <label for="edit-doc-date">
        Dokumentdatum
      </label>

      <input id="edit-doc-date" type="text" required />

      <label for="edit-doc-subject">
        Betreff
      </label>

      <input id="edit-doc-subject" type="text" required />

      <button type="button" id="cancel-edit">
        Abbrechen
      </button>

      <button type="submit" id="save-document">
        Speichern
      </button>
    </form>
  `;

  document.body.appendChild(dialog);

  const form = document.getElementById("document-edit-form");
  const categoryInput = document.getElementById("edit-category");
  const docIdInput = document.getElementById("edit-doc-id");
  const docDateInput = document.getElementById("edit-doc-date");
  const docSubjectInput = document.getElementById("edit-doc-subject");
  const cancelButton = document.getElementById("cancel-edit");
  const saveButton = document.getElementById("save-document");

  categoryInput.value = doc.classification.kind;
  docIdInput.value = doc.classification.docId.value;
  docDateInput.value = doc.classification.docDateSic.value;
  docSubjectInput.value = doc.classification.docSubject.value;

  cancelButton.addEventListener("click", () => {
    dialog.close();
  });

  dialog.addEventListener("close", () => {
    dialog.remove();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const changes = {
      kind: categoryInput.value,
      docId: docIdInput.value.trim(),
      docDateSic: docDateInput.value.trim(),
      docSubject: docSubjectInput.value.trim(),
    };

    try {
      saveButton.disabled = true;

      await onSave(changes);

      dialog.close();
    } catch (error) {
      console.error("Updating metadata failed:", error);

      showToast("Metadaten konnten nicht gespeichert werden.", "error");
    } finally {
      saveButton.disabled = false;
    }
  });

  dialog.showModal();
}
