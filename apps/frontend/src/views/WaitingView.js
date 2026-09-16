import { api } from "../api.js";
import { showToast } from "../components/Toast.js";

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
        <button type="button" class="button continue-document">
          Zurückholen
        </button>
      </td>
    `;

    row.cells[0].textContent = doc.originalName;
    row.cells[1].textContent = doc.state;
    row.cells[2].textContent =
      categoryLabels[doc.classification?.kind] ?? "Unbekannt";

    const button = row.querySelector(".continue-document");

    button.addEventListener("click", async () => {
      try {
        button.disabled = true;
        button.textContent = "Wird zurückgeholt...";

        const results = await api.continueDocuments([doc.id]);
        const result = results[0];

        if (!result) {
          throw new Error("Keine Antwort für das Dokument erhalten.");
        }

        if (result.error) {
          throw new Error(result.error);
        }

        if (typeof result.status === "number" && result.status >= 400) {
          throw new Error(`Zurückholen fehlgeschlagen: ${result.status}`);
        }

        await renderWaitingView(app);

        showToast(
          `Dokument "${doc.originalName}" wurde zurück in die Inbox verschoben.`
        );
      } catch (error) {
        console.error("Continuing document failed:", error);

        showToast(
          "Das Dokument konnte nicht zurückgeholt werden.",
          "error"
        );

        button.disabled = false;
        button.textContent = "Zurückholen";
      }
    });

    waitingList.appendChild(row);
  });
}
