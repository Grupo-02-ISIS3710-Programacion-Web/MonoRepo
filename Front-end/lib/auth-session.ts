import { authenticateUser, getUserById } from "@/lib/api";
import { User } from "@/types/user";

const AUTH_STORAGE_KEY = "skin4all.auth.userId";

const isClient = () => typeof window !== "undefined";

export function getAuthStorageKey() {
  return AUTH_STORAGE_KEY;
}

export function getCurrentUserId(): string | null {
  if (!isClient()) {
    return null;
  }

  return window.localStorage.getItem(AUTH_STORAGE_KEY);
}

export function getCurrentUser(): User | null {
  const userId = getCurrentUserId();
  if (!userId) {
    return null;
  }

  return getUserById(userId) ?? null;
}

export function loginUser(identifier: string, password: string): User | null {
  const user = authenticateUser(identifier, password);
  if (!user || !isClient()) {
    return user;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, user.id);
  return user;
}

export function logoutUser() {
  if (!isClient()) {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
