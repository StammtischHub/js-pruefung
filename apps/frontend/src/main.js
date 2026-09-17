import { renderInboxView } from "./views/InboxView.js";
import { renderWaitingView } from "./views/WaitingView.js";
import { renderTrashView } from "./views/TrashView.js";
import { api } from "./api.js";
import { initDocumentUpload } from "./components/DocumentUpload.js";
import { renderProcessedView } from "./views/ProcessedView.js";
import { renderReviewView } from "./views/ReviewView.js";

const app = document.getElementById("app");
let currentView = "inbox";
const navButtons = document.querySelectorAll("#main-nav button");
const authenticatedActions = document.getElementById("authenticated-actions");
const userDisplay = document.getElementById("user-display");

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
function showAuthenticatedUser(username) {
  userDisplay.textContent = `Angemeldet als: ${username}`;
  authenticatedActions.hidden = false;
}

function renderLogin(infoMessage = "") {
  authenticatedActions.hidden = true;
  userDisplay.textContent = "";

  app.innerHTML = `
  <section class="view">
    <h2>Login</h2>
    <form id="login-form">
      <label for="username">Benutzername:</label>
      <input type="text" id="username" name="username" maxlength="50" required />
      <button class="button" type="submit">Login</button>

      <p id="login-message"></p>
    </form>
  </section>
  `;

  const form = document.getElementById("login-form");
  const input = document.getElementById("username");
  const message = document.getElementById("login-message");
  const button = form.querySelector("button");

  message.textContent = infoMessage;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = input.value.trim();
    if (!username) {
      message.textContent = "Bitte gib einen Benutzernamen ein.";
      return;
    }

    button.disabled = true;

    try {
      await api.identify(username);

      sessionStorage.setItem("username", username);
      showAuthenticatedUser(username);
    } catch (error) {
      message.textContent = "Login fehlgeschlagen: " + error.message;
      button.disabled = false;
      return;
    }

    renderView("inbox").catch(handleRenderError);
  });
}

window.addEventListener("session-expired", () => {
  renderLogin("Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.");
});

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

    case "processed":
      await renderProcessedView(app);
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

const savedUsername = sessionStorage.getItem("username");
if (savedUsername) {
  showAuthenticatedUser(savedUsername);
  renderView("inbox").catch(handleRenderError);
} else {
  renderLogin();
}
