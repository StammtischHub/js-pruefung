import { api } from "./api.js";

const app = document.getElementById("app");
const navButtons = document.querySelectorAll("#main-nav button");

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    renderView(button.dataset.view);
  });
});

function renderView(viewName) {
  app.innerHTML = `<p>View "${viewName}" ist noch nicht implementiert.</p>`;
}

async function checkBackend() {
  try {
    await api.health();
    console.log("BFF ist erreichbar.");
  } catch (err) {
    console.warn("BFF nicht erreichbar.", err);
  }
}

checkBackend();
renderView("inbox");
