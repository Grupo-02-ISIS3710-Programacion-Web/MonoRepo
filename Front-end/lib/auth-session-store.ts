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

export async function initializeAuthSession() {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  if (isInitialized) {
    return;
  }

  isInitialized = true;
  attachStorageListener();
  await refreshAuthSession();
}

  export async function refreshAuthSession() {
    const token = localStorage.getItem("skin4all.auth.token");

    if (!token) {
      useAuthSessionStore.getState().setSession(null);
      return;
    }

    try {

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error();
      }

      const user = await response.json();

      useAuthSessionStore
        .getState()
        .setSession(user);

    } catch {

      localStorage.removeItem("skin4all.auth.token");

      useAuthSessionStore
        .getState()
        .setSession(null);
    }
  }


  export function setTestAuthSession(user: User | null) {
    useAuthSessionStore.getState().setSession(user);
  }

  export async function loginAuthSession(
    email: string,
    contrasenia: string,
  ) {

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          contrasenia,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        Array.isArray(data.message)
          ? data.message[0]
          : data.message ||
              "Error al iniciar sesión"
      );
    }

    localStorage.setItem(
      "skin4all.auth.token",
      data.token,
    );

    useAuthSessionStore
      .getState()
      .setSession(data.user);

    return data.user;
  }

  export function logoutAuthSession() {

    localStorage.removeItem(
      "skin4all.auth.token"
    );

    useAuthSessionStore
      .getState()
      .setSession(null);
  }
