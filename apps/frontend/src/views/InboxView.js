import { mockDocuments } from "../mocks/mockDocuments.js";
import { renderDocumentDetails } from "../components/DocumentDetails.js";

async function getInboxDocuments() {
  return mockDocuments;
}

export async function renderInboxView(app) {
  const documents = await getInboxDocuments();

  const inboxDocuments = documents.filter(
    (doc) => doc.status === "inbox",
  );

  app.innerHTML = `
    <section class="view">
      <h2>Inbox</h2>

      <table id="inbox-table">
        <thead>
          <tr>
            <th>Dateiname</th>
            <th>Status</th>
            <th>Kategorie</th>
            <th>Confidence</th>
            <th>Klassifizierungsart</th>
          </tr>
        </thead>

        <tbody id="inbox-list"></tbody>
      </table>

      <p id="inbox-empty" hidden>
        Keine Dokumente in der Inbox.
      </p>
    </section>
  `;

  const inboxList = document.getElementById("inbox-list");
  const inboxTable = document.getElementById("inbox-table");
  const inboxEmpty = document.getElementById("inbox-empty");

  if (inboxDocuments.length === 0) {
    inboxTable.hidden = true;
    inboxEmpty.hidden = false;
    return;
  }

  inboxDocuments.forEach((doc) => {
    const row = document.createElement("tr");

    row.dataset.id = doc.id;

    row.innerHTML = `
      <td>${doc.filename}</td>
      <td>${doc.status}</td>
      <td>${doc.category}</td>
      <td>${Math.round(doc.confidence * 100)} %</td>
      <td>${doc.classificationType}</td>
    `;

    row.addEventListener("click", () => {
      renderDocumentDetails(app, doc, () => {
        renderInboxView(app);
      });
    });

    inboxList.appendChild(row);
  });
}
