import { showToast } from "./Toast.js";

export function renderDocumentEditDialog(doc, onSave, openNextByDefault = false) {
  const dialog = document.createElement("dialog");
  const isInbox = doc.state === "INBOX";

  dialog.innerHTML = `
    <form id="document-edit-form">
      <h2 id="edit-heading">
        ${isInbox ? "Dokument prüfen" : "Metadaten bearbeiten"}
      </h2>

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

      ${
    isInbox
      ? `
            <label for="open-next-document">
              <input id="open-next-document" type="checkbox" />
              Nächstes Dokument öffnen
            </label>
          `
      : ""
  }

      <button type="button" id="cancel-edit">
        Abbrechen
      </button>

      <button type="submit" id="save-document">
        ${isInbox ? "Speichern und Prüfung abschließen" : "Speichern"}
      </button>
    </form>
  `;

  document.body.appendChild(dialog);

  const form = dialog.querySelector("#document-edit-form");
  const categoryInput = dialog.querySelector("#edit-category");
  const docIdInput = dialog.querySelector("#edit-doc-id");
  const docDateInput = dialog.querySelector("#edit-doc-date");
  const docSubjectInput = dialog.querySelector("#edit-doc-subject");
  const nextDocumentCheckbox = dialog.querySelector("#open-next-document");
  const cancelButton = dialog.querySelector("#cancel-edit");
  const saveButton = dialog.querySelector("#save-document");
  const mainNav = document.getElementById("main-nav");

  categoryInput.value = doc.classification?.kind ?? "UNKNOWN";
  docIdInput.value = doc.classification?.docId?.value ?? "";
  docDateInput.value = doc.classification?.docDateSic?.value ?? "";
  docSubjectInput.value = doc.classification?.docSubject?.value ?? "";

  if (nextDocumentCheckbox) {
    nextDocumentCheckbox.checked = openNextByDefault;
  }

  cancelButton.addEventListener("click", () => {
    dialog.close();
  });

  const closeForExpiredSession = () => dialog.close();
  const closeForNavigation = () => dialog.close();

  window.addEventListener("session-expired", closeForExpiredSession);
  mainNav?.addEventListener("click", closeForNavigation);

  dialog.addEventListener("close", () => {
    window.removeEventListener("session-expired", closeForExpiredSession);
    mainNav?.removeEventListener("click", closeForNavigation);
    dialog.remove();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (saveButton.disabled) return;

    const changes = {};

    if (categoryInput.value !== doc.classification?.kind) {
      changes.kind = categoryInput.value;
    }

    if (docIdInput.value.trim() !== doc.classification?.docId?.value) {
      changes.docId = docIdInput.value.trim();
    }

    if (docDateInput.value.trim() !== doc.classification?.docDateSic?.value) {
      changes.docDateSic = docDateInput.value.trim();
    }

    if (docSubjectInput.value.trim() !== doc.classification?.docSubject?.value) {
      changes.docSubject = docSubjectInput.value.trim();
    }

    const openNextDocument = nextDocumentCheckbox?.checked ?? false;

    try {
      saveButton.disabled = true;

      await onSave(changes, openNextDocument);

      dialog.close();
    } catch (error) {
      console.error("Updating metadata failed:", error);

      showToast(error.message || "Die Prüfung konnte nicht abgeschlossen werden.", "error");
    } finally {
      saveButton.disabled = false;
    }
  });

  dialog.showModal();
}
