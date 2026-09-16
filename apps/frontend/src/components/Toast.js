export function showToast(message, type = "success", details = []) {
  const existingToast = document.querySelector(".toast");

  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");

  toast.className = `toast ${type}`;

  const messageElement = document.createElement("strong");
  messageElement.textContent = message;

  toast.appendChild(messageElement);

  if (details.length > 0) {
    const list = document.createElement("ul");

    details.forEach((detail) => {
      const item = document.createElement("li");
      item.textContent = detail;

      list.appendChild(item);
    });

    toast.appendChild(list);
  }

  document.body.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 4000);
}
