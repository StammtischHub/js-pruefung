import { api } from "../api.js";
import { showToast } from "./Toast.js";

export function initDocumentUpload(input, button, status, onUploaded) {
  button.addEventListener("click", () => input.click());

  input.addEventListener("change", async () => {
    const file = input.files[0];

    if (!file || input.disabled) {
      return;
    }

    input.disabled = true;
    button.disabled = true;

    status.hidden = false;
    status.textContent = `„${file.name}“ wird hochgeladen …`;

    let document;

    try {
      document = await api.uploadDocument(file);

      status.hidden = true;
      status.textContent = "";

      showToast(
        `„${file.name}“ wurde erfolgreich hochgeladen. Die automatische Verarbeitung läuft.`
      );
    } catch (error) {
      console.error("Das Dokument konnte nicht hochgeladen werden:", error);

      status.hidden = true;
      status.textContent = "";

      showToast(
        `„${file.name}“ konnte nicht hochgeladen werden.`,
        "error"
      );

      return;
    } finally {
      input.disabled = false;
      button.disabled = false;
      input.value = "";
    }

    try {
      await onUploaded(document);
    } catch (error) {
      console.error("Die Liste konnte nicht aktualisiert werden:", error);

      showToast(
        "Upload erfolgreich, aber die Liste konnte nicht aktualisiert werden.",
        "error"
      );
    }
  });
}
