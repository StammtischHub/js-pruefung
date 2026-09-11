import { renderInboxView } from "./views/InboxView.js";
import { renderReviewView } from "./views/ReviewView.js";
import { renderWaitingView } from "./views/WaitingView.js";
import { renderTrashView } from "./views/TrashView.js";

const app = document.getElementById("app");
const navButtons = document.querySelectorAll("#main-nav button");

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    renderView(button.dataset.view);
  });
});

async function renderView(viewName) {
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

renderView("inbox");
