export function renderDocumentEditDialog(doc, onSave) {
  const dialog = document.createElement("dialog");

  dialog.innerHTML = `
        <form id ="document-edit-form">
            <h2>Metadaten bearbeiten</h2>

            <label for="edit-category">
            Kategorie
            </label>
            <select id="edit-category" required>
                <option value="INVOICE">Rechnung</option>
                <option value="BANK_STATEMENT">Kontoauszug</option>
                <option value="OTHER">Sonstiges</option>
            </select>

            <label for="edit-doc-id">
            Dokument-ID
            </label>
            <input id="edit-doc-id" type="text" required />

            <label for="edit-doc-date">
            Dokumentdatum
            </label>
            <input id="edit-doc-date" type="date" required />

            <label for="edit-doc-subject">
            Betreff
            </label>
            <input id="edit-doc-subject" type="text" required />

            <p id="edit-message"></p>

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
  const message = document.getElementById("edit-message");

  categoryInput.value = doc.category;
  docIdInput.value = doc.docId.value;
  docDateInput.value = doc.docDate.value;
  docSubjectInput.value = doc.docSubject.value;

  cancelButton.addEventListener("click", () => {
    dialog.close();
  });

  dialog.addEventListener("close", () => {
    dialog.remove();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const changes = {
      category: categoryInput.value,
      docId: docIdInput.value,
      docDate: docDateInput.value,
      docSubject: docSubjectInput.value,
    };

    try {
      saveButton.disabled = true;

      await onSave(changes);

      dialog.close();
    } catch (error) {
      message.textContent = error.message;
      message.className = "error-message";
    } finally {
      saveButton.disabled = false;
    }
  });

  dialog.showModal();
}
