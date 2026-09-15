const BASE_URL = "http://localhost:4000/api";

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API-Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  health: () => request("/health"),
  getDocuments: (state) => request(`/documents/?state=${encodeURIComponent(state)}`),
  waitDocuments: (documentIds) =>
    request("/documents/wait", {
      method: "PUT",
      body: JSON.stringify({ documentIds }),
    }),

  continueDocuments: (documentIds) =>
    request("/documents/continue", {
      method: "PUT",
      body: JSON.stringify({ documentIds }),
    }),

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
};
