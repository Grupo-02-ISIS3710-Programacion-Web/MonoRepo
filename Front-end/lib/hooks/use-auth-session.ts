"use client";

import { useEffect } from "react";
import { User } from "@/types/user";
import {
  initializeAuthSession,
  loginAuthSession,
  logoutAuthSession,
  refreshAuthSession,
  setTestAuthSession,
  useAuthSessionStore,
} from "@/lib/auth-session-store";

const TEST_DEFAULT_USER: User = {
  id: "u1",
  name: "Sofía Navarro",
  avatarUrl: "https://i.pravatar.cc/80?img=29",
  email: "sofia@skin4all.com",
  login: "sofian",
  password: "skin4all123",
  city: "Madrid, Spain",
  skinType: "Combination / Sensitive",
  bio: "Barrier-first skincare lover sharing simple routines and soothing product picks.",
  reviewCount: 18,
  favoriteProductIds: ["1", "5", "12", "14"],
  createdRoutineIds: ["r1", "r7"],
};

export function useAuthSession() {
  const { user, isReady } = useAuthSessionStore();

  useEffect(() => {
    if (process.env.NODE_ENV === "test") {
      setTestAuthSession(TEST_DEFAULT_USER);
      return;
    }

    initializeAuthSession();
  }, []);

  return {
    user,
    isReady,
    isLoggedIn: !!user,
    login: loginAuthSession,
    logout: logoutAuthSession,
    refreshSession: refreshAuthSession,
  };
}
