const BASE_URL = "http://localhost:4000/api";

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    if (response.status === 401) {
      sessionStorage.removeItem("username");
      window.setTimeout(() => {
        window.dispatchEvent(new Event("session-expired"));
      }, 0);
    }

    const error = new Error(`API-Error: ${response.status} ${response.statusText}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

async function identify(username) {
  const response = await fetch(`${BASE_URL}/identify`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });

  if (!response.ok) {
    throw new Error(`API-Error: ${response.status} ${response.statusText}`);
  }
}

export const api = {
  identify,
  health: () => request("/health"),
  getDocuments: (state) => request(`/documents/?state=${encodeURIComponent(state)}`),
  updateDocument: (id, metadata) =>
    request(`/documents/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(metadata),
    }),
  uploadDocument: (file) => {
    const body = new FormData();
    body.append("file", file);

    return request("/documents/", { method: "POST", headers: {}, body });
  },
  reclassifyDocument: (id) =>
    request("/documents/classify", {
      method: "POST",
      body: JSON.stringify({
        documentIds: [id],
      }),
    }),

  prepareForDeletion: (id) =>
    request("/documents/prep-for-deletion", {
      method: "PUT",
      body: JSON.stringify({
        documentIds: [id],
      }),
    }),
};
