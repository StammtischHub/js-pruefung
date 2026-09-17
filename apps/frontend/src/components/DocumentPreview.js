import { api } from "../api.js";

export function createDocumentPreview(doc) {
  const details = document.createElement("details");
  details.className = "document-preview";
  const summary = document.createElement("summary");
  summary.textContent = "PDF-Vorschau";
  details.appendChild(summary);

  details.addEventListener("toggle", () => {
    if (!details.open || details.querySelector("object")) return;
    const url = api.getDocumentPdfUrl(doc.id);
    const preview = document.createElement("object");
    preview.type = "application/pdf";
    preview.data = `${url}#page=1&toolbar=0&navpanes=0`;
    preview.textContent = "Die PDF-Vorschau ist nicht verfügbar.";

    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "PDF separat öffnen";
    details.append(preview, link);
  });

  return details;
}
