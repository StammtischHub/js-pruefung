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
};
