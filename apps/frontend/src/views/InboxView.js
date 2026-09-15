import { api } from "../api.js";
import { renderDocumentDetails } from "../components/DocumentDetails.js";
import { createConfidenceView } from "../components/ConfidenceView.js";
import { renderDocumentTable } from "../components/DocumentTable.js";

const categoryLabels = {
  INVOICE: "Rechnung",
  STATEMENT: "Kontoauszug",
  LETTER: "Brief",
  UNKNOWN: "Unbekannt",
};

async function getInboxDocuments() {
  return api.getDocuments("INBOX");
}

export async function renderInboxView(app) {
  const documents = await getInboxDocuments();

  const inboxDocuments = documents.filter((doc) => doc.state === "INBOX");

  app.innerHTML = `
    <section class="view">
      <h2>Inbox</h2>

      <div id="inbox-list"></div>
    </section>
  `;

  const inboxList = document.getElementById("inbox-list");

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
      label: "Confidence",
      render: (doc) =>
        createConfidenceView(
          Math.min(
            doc.classification?.docId?.score ?? 0,
            doc.classification?.docDateSic?.score ?? 0,
            doc.classification?.docSubject?.score ?? 0
          )
        ),
    },
    {
      label: "Klassifizierungsart",
      value: (doc) => doc.classification?.type ?? "–",
    },
  ];

  renderDocumentTable(inboxList, inboxDocuments, columns, {
    tableId: "inbox-table",
    emptyText: "Keine Dokumente in der Inbox.",
    onRowClick: (doc) => {
      renderDocumentDetails(app, doc, () => {
        renderInboxView(app);
      });
    },
  });
}
