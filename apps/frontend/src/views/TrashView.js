import { api } from "../api.js";
import { renderDocumentTable } from "../components/DocumentTable.js";

const categoryLabels = {
  INVOICE: "Rechnung",
  STATEMENT: "Kontoauszug",
  LETTER: "Brief",
  UNKNOWN: "Unbekannt",
};

async function getTrashDocuments() {
  return api.getDocuments("TRASH");
}

export async function renderTrashView(app) {
  const documents = await getTrashDocuments();

  const trashDocuments = documents.filter((doc) => doc.state === "TRASH");

  app.innerHTML = `
    <section class="view">
      <h2>Papierkorb</h2>

      <div id="trash-list"></div>
    </section>
  `;

  const trashList = document.getElementById("trash-list");

  const columns = [
    {
      label: "Dateiname",
      value: (doc) => doc.originalName,
    },
    {
      label: "Status",
      value: (doc) => doc.state,
    },
    {
      label: "Kategorie",
      value: (doc) => categoryLabels[doc.classification?.kind] ?? "–",
    },
    {
      label: "Zur Löschung vorgemerkt",
      value: (doc) =>
        doc.deletionFlagSetDate ? new Date(doc.deletionFlagSetDate).toLocaleString("de-DE") : "–",
    },
  ];

  renderDocumentTable(trashList, trashDocuments, columns, {
    tableId: "trash-table",
    emptyText: "Keine Dokumente im Papierkorb.",
  });
}
