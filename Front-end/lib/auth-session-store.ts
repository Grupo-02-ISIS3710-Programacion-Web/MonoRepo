"use client";

import { create } from "zustand";
import { getAuthStorageKey, getCurrentUser, loginUser, logoutUser } from "@/lib/auth-session";
import { User } from "@/types/user";

type AuthSessionState = Readonly<{
  user: User | null;
  isReady: boolean;
}>;

type AuthSessionStore = AuthSessionState & {
  setSession: (user: User | null) => void;
};

let isInitialized = false;
let detachStorageListener: (() => void) | null = null;

export const useAuthSessionStore = create<AuthSessionStore>((set) => ({
  user: null,
  isReady: false,
  setSession: (user) => set({ user, isReady: true }),
}));

function attachStorageListener() {
  if (detachStorageListener || typeof window === "undefined") {
    return;
  }

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key !== null && event.key !== getAuthStorageKey()) {
      refreshAuthSession();
      return;
    }

    refreshAuthSession();
  };

  window.addEventListener("storage", handleStorageChange);

  detachStorageListener = () => {
    window.removeEventListener("storage", handleStorageChange);
    detachStorageListener = null;
  };
}

export function initializeAuthSession() {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  if (isInitialized) {
    return;
  }

  isInitialized = true;
  attachStorageListener();
  refreshAuthSession();
}

export function refreshAuthSession() {
  useAuthSessionStore.getState().setSession(getCurrentUser());
}

export function setTestAuthSession(user: User | null) {
  useAuthSessionStore.getState().setSession(user);
}

export function loginAuthSession(identifier: string, password: string) {
  const authenticatedUser = loginUser(identifier, password);
  useAuthSessionStore.getState().setSession(authenticatedUser);

  return authenticatedUser;
}

export function logoutAuthSession() {
  logoutUser();
  useAuthSessionStore.getState().setSession(null);
}
