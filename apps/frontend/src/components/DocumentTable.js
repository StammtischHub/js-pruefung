export function renderDocumentTable(container, documents, columns, options = {}) {
  const {
    emptyText = "Keine Dokumente vorhanden.",
    onRowClick,
    onSelectionChange,
    selectable = false,
    tableId,
  } = options;

  if (documents.length === 0) {
    container.innerHTML = `
      <p class="document-table-empty">
        ${emptyText}
      </p>
    `;
    return;
  }

  const selectedIds = new Set();
  const table = document.createElement("table");

  table.classList.add("document-table");

  if (tableId) {
    table.id = tableId;
  }

  table.innerHTML = `
    <thead>
      <tr>
        ${
          selectable
            ? `
          <th class="document-select-column">
            <input
              type="checkbox"
              data-select-all
              aria-label="Alle Dokumente auswählen"
            />
          </th>
        `
            : ""
        }
        ${columns.map((column) => `<th>${column.label}</th>`).join("")}
      </tr>
    </thead>

    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");
  const selectAllCheckbox = table.querySelector("[data-select-all]");

  function updateSelection() {
    if (selectAllCheckbox) {
      selectAllCheckbox.checked = selectedIds.size === documents.length;
      selectAllCheckbox.indeterminate = selectedIds.size > 0 && selectedIds.size < documents.length;
    }

    if (onSelectionChange) {
      onSelectionChange([...selectedIds]);
    }
  }

  documents.forEach((doc) => {
    const row = document.createElement("tr");

    row.dataset.id = doc.id;

    if (selectable) {
      const selectionCell = document.createElement("td");
      selectionCell.classList.add("document-select-column");

      const checkbox = document.createElement("input");

      checkbox.type = "checkbox";
      checkbox.dataset.documentId = doc.id;
      checkbox.setAttribute("aria-label", `${doc.originalName} auswählen`);

      checkbox.addEventListener("click", (event) => {
        event.stopPropagation();
      });

      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          selectedIds.add(doc.id);
        } else {
          selectedIds.delete(doc.id);
        }

        updateSelection();
      });

      selectionCell.appendChild(checkbox);
      row.appendChild(selectionCell);
    }

    columns.forEach((column) => {
      const cell = document.createElement("td");

      if (column.render) {
        const content = column.render(doc);
        if (content instanceof Node) {
          cell.appendChild(content);
        } else {
          cell.innerHTML = content;
        }
      } else {
        cell.textContent = column.value(doc);
      }

      row.appendChild(cell);
    });

    if (onRowClick) {
      row.classList.add("clickable");

      row.addEventListener("click", (event) => {
        if (event.target.closest("a, button, input, select, textarea, details, object")) return;
        onRowClick(doc);
      });
    }

    tbody.appendChild(row);
  });

  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", () => {
      const checkboxes = tbody.querySelectorAll("input[data-document-id]");

      checkboxes.forEach((checkbox) => {
        checkbox.checked = selectAllCheckbox.checked;

        if (selectAllCheckbox.checked) {
          selectedIds.add(checkbox.dataset.documentId);
        } else {
          selectedIds.delete(checkbox.dataset.documentId);
        }
      });

      updateSelection();
    });
  }

  container.innerHTML = "";
  container.appendChild(table);
}
