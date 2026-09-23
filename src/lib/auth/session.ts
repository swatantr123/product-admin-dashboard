import type { AuthUser, LoginResponse, StoredSession } from "./types";
import { AUTH_STORAGE_KEY } from "./types";

const isBrowser = () => typeof window !== "undefined";

export function getStoredSession(): StoredSession | null {
  if (!isBrowser()) {
    return null;
  }

  const storedSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession) as StoredSession;
  } catch {
    clearStoredSession();
    return null;
  }
}

export function getAccessToken(): string | null {
  return getStoredSession()?.accessToken ?? null;
}

export function saveSession(response: LoginResponse): StoredSession {
  const session: StoredSession = {
    user: getUserFromLoginResponse(response),
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
  };

  if (isBrowser()) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  }

  return session;
}

export function clearStoredSession(): void {
  if (isBrowser()) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function getUserFromLoginResponse(response: LoginResponse): AuthUser {
  return {
    id: response.id,
    username: response.username,
    email: response.email,
    firstName: response.firstName,
    lastName: response.lastName,
    image: response.image,
  };
}