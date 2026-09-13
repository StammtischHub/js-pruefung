import { api } from "../api.js";
import { renderDocumentDetails } from "../components/DocumentDetails.js";
import { createConfidenceView } from "../components/ConfidenceView.js";

async function getInboxDocuments() {
  return api.getDocuments("INBOX");
}

export async function renderInboxView(app) {
  const documents = await getInboxDocuments();

  const inboxDocuments = documents.filter((doc) => doc.state === "INBOX");

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
      <td></td>
      <td></td>
      <td></td>
      <td>${createConfidenceView(
        Math.min(
          doc.classificationResult?.docId?.score ?? 0,
          doc.classificationResult?.docDateSic?.score ?? 0,
          doc.classificationResult?.docSubject?.score ?? 0
        )
      )}</td>
      <td></td>
    `;

    row.cells[0].textContent = doc.originalName;
    row.cells[1].textContent = doc.state;
    row.cells[2].textContent = doc.classificationResult?.kind ?? "–";
    row.cells[4].textContent = doc.classificationType ?? "–";

    row.addEventListener("click", () => {
      renderDocumentDetails(app, doc, () => {
        renderInboxView(app);
      });
    });

    inboxList.appendChild(row);
  });
}
