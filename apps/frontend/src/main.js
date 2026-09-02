import { api } from "./api.js";
import { mockDocuments } from "./mockDocuments.js";

const inboxList = document.getElementById("inbox-list");
const inboxTable = document.getElementById("inbox-table");
const inboxEmpty = document.getElementById("inbox-empty");
const backToInboxButton = document.getElementById("back-to-inbox");
const navButtons = document.querySelectorAll("#main-nav button");

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    renderView(button.dataset.view);
  });
});

backToInboxButton.addEventListener("click", () => {
  renderView("inbox");
});

function renderView(viewName) {
  const views = document.querySelectorAll(".view");

  views.forEach((view) => {
    view.hidden = true;
  });

  const selectedView = document.getElementById(`${viewName}-view`);

  if (selectedView) {
    selectedView.hidden = false;
  }

  navButtons.forEach((button) => {
    button.classList.remove("active");

    if (button.dataset.view === viewName) {
      button.classList.add("active");
    }
  });
}

async function checkBackend() {
  try {
    await api.health();
    console.log("BFF ist erreichbar.");
  } catch (err) {
    console.warn("BFF nicht erreichbar.", err);
  }
}

async function getInboxDocuments() {
  return mockDocuments; // Wird durch API-Funktion ersetzt
}

async function renderInbox() {
  const documents = await getInboxDocuments();

  const inboxDocuments = documents.filter((doc) => doc.status === "inbox");

  inboxList.innerHTML = "";

  if (inboxDocuments.length === 0) {
    inboxTable.hidden = true;
    inboxEmpty.hidden = false;
    return;
  }

  inboxTable.hidden = false;
  inboxEmpty.hidden = true;

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
      showDocumentDetails(doc);
    });

    inboxList.appendChild(row);
  });
}

function showDocumentDetails(doc) {
  document.getElementById("detail-id").textContent = doc.id;
  document.getElementById("detail-filename").textContent = doc.filename;
  document.getElementById("detail-status").textContent = doc.status;
  document.getElementById("detail-category").textContent = doc.category;

  document.getElementById("detail-confidence").textContent =
    `${Math.round(doc.confidence * 100)} %`;

  document.getElementById("detail-classification-type").textContent = doc.classificationType;

  document.getElementById("detail-doc-id").textContent = doc.docId.value;

  document.getElementById("detail-doc-id-score").textContent =
    `${Math.round(doc.docId.score * 100)} %`;

  document.getElementById("detail-doc-date").textContent = doc.docDate.value;

  document.getElementById("detail-doc-date-score").textContent =
    `${Math.round(doc.docDate.score * 100)} %`;

  document.getElementById("detail-doc-subject").textContent = doc.docSubject.value;

  document.getElementById("detail-doc-subject-score").textContent =
    `${Math.round(doc.docSubject.score * 100)} %`;

  renderView("detail");
}

checkBackend();
renderInbox();
renderView("inbox");
