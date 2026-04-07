const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

function buildHeaders(token, hasBody) {
  const headers = {};
  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function apiRequest(path, options = {}) {
  const { token, body, method = "GET" } = options;
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: buildHeaders(token, body !== undefined),
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = payload?.message ?? `${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  return payload;
}
