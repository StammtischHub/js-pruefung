import { renderInboxView } from "./views/InboxView.js";
import { renderReviewView } from "./views/ReviewView.js";
import { renderWaitingView } from "./views/WaitingView.js";
import { renderTrashView } from "./views/TrashView.js";
import { api } from "./api.js";
import { initDocumentUpload } from "./components/DocumentUpload.js";

const app = document.getElementById("app");
let currentView = "inbox";
const navButtons = document.querySelectorAll("#main-nav button");

initDocumentUpload(
  document.getElementById("document-upload"),
  document.getElementById("upload-button"),
  document.getElementById("upload-status"),
  refreshAfterUpload
);

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    renderView(button.dataset.view).catch(handleRenderError);
  });
});

async function refreshAfterUpload(document) {
  await renderView(currentView);

  for (let attempt = 0; attempt < 30; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const pending = await api.getDocuments("SCANNER");
    if (!pending.some((item) => item.id === document.id)) {
      await renderView(currentView);
      return;
    }
  }
}

async function renderView(viewName) {
  currentView = viewName;
  navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === viewName);
  });

  switch (viewName) {
    case "inbox":
      await renderInboxView(app);
      break;

    case "review":
      await renderReviewView(app);
      break;

    case "waiting":
      await renderWaitingView(app);
      break;

    case "trash":
      await renderTrashView(app);
      break;

    default:
      await renderInboxView(app);
  }
}

function handleRenderError(error) {
  console.error("Die Ansicht konnte nicht geladen werden:", error);
  app.textContent = "Die Ansicht konnte nicht geladen werden. Bitte versuche es erneut.";
}

renderView("inbox").catch(handleRenderError);
