import { api } from "../api.js";

const categoryLabels = {
  INVOICE: "Rechnung",
  STATEMENT: "Kontoauszug",
  LETTER: "Brief",
  UNKNOWN: "Unbekannt",
};

export async function renderWaitingView(app) {
  const documents = await api.getDocuments("WAITING");
  app.innerHTML = `
    <section class="view">
      <h2>Warteposition</h2>
      <p id="waiting-message" class="success-message"></p>

      <table id="waiting-table" class="document-table">
        <thead>
          <tr>
            <th>Dateiname</th>
            <th>Status</th>
            <th>Kategorie</th>
            <th>Aktionen</th>
          </tr>
        </thead>

        <tbody id="waiting-list"></tbody>
      </table>

      <p id="waiting-empty" hidden>
        Keine Dokumente in der Warteposition.
      </p>
    </section>
  `;

  const waitingList = document.getElementById("waiting-list");
  const waitingTable = document.getElementById("waiting-table");
  const waitingEmpty = document.getElementById("waiting-empty");

  if (documents.length === 0) {
    waitingTable.hidden = true;
    waitingEmpty.hidden = false;
    return;
  }

  documents.forEach((doc) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td></td>
      <td></td>
      <td></td>
      <td>
        <button type="button" id="wait-document">
          Zurückholen
          </button>
      </td>
      `;
    row.cells[0].textContent = doc.originalName;
    row.cells[1].textContent = doc.state;
    row.cells[2].textContent = categoryLabels[doc.classification?.kind] ?? "Unbekannt";

    const button = row.querySelector("button");

    button.addEventListener("click", async () => {
      const message = document.getElementById("waiting-message");
      button.disabled = true;

      try {
        const results = await api.continueDocuments([doc.id]);
        const result = results[0];

        if (!result || result.status !== 200) {
          throw new Error(result?.error);
        }

        await renderWaitingView(app);
        document.getElementById("waiting-message").textContent =
          `Dokument "${doc.originalName}" wurde zurückgeholt.`;
      } catch (error) {
        message.className = "error-message";
        message.textContent = "Das Dokument konnte nicht zurückgeholt werden: " + error.message;
        button.disabled = false;
      }
    });

    waitingList.appendChild(row);
  });
}
