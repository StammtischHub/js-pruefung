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

function renderView(viewName) {
  navButtons.forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.view === viewName,
    );
  });

  switch (viewName) {
    case "inbox":
      renderInboxView(app);
      break;

    case "review":
      renderReviewView(app);
      break;

    case "waiting":
      renderWaitingView(app);
      break;

    case "trash":
      renderTrashView(app);
      break;

    default:
      renderInboxView(app);
  }
}

renderView("inbox");
