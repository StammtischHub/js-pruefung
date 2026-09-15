export function renderDocumentTable(container, documents, columns, options = {}) {
  const { emptyText = "Keine Dokumente vorhanden.", onRowClick, tableId } = options;

  if (documents.length === 0) {
    container.innerHTML = `
      <p class="document-table-empty">
        ${emptyText}
      </p>
    `;
    return;
  }

  const table = document.createElement("table");

  table.classList.add("document-table");

  if (tableId) {
    table.id = tableId;
  }

  table.innerHTML = `
    <thead>
      <tr>
        ${columns.map((column) => `<th>${column.label}</th>`).join("")}
      </tr>
    </thead>

    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  documents.forEach((doc) => {
    const row = document.createElement("tr");

    row.dataset.id = doc.id;

    columns.forEach((column) => {
      const cell = document.createElement("td");

      if (column.render) {
        cell.innerHTML = column.render(doc);
      } else {
        cell.textContent = column.value(doc);
      }

      row.appendChild(cell);
    });

    if (onRowClick) {
      row.classList.add("clickable");

      row.addEventListener("click", () => {
        onRowClick(doc);
      });
    }

    tbody.appendChild(row);
  });

  container.innerHTML = "";
  container.appendChild(table);
}
