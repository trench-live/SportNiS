const TOKEN_STORAGE_KEY = "sportnis.token";

type Listener = (token: string | null) => void;

let currentToken: string | null = localStorage.getItem(TOKEN_STORAGE_KEY);
const listeners = new Set<Listener>();

export function getToken(): string | null {
  return currentToken;
}

export function setToken(token: string | null): void {
  currentToken = token;
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
  listeners.forEach((listener) => listener(token));
}

export function subscribeToken(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
