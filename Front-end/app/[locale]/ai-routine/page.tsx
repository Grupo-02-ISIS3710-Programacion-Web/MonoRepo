"use client";

import AuthRequiredCard from "@/components/auth/AuthRequiredCard";
import AiRoutineWorkspace from "@/components/ai-routine/AiRoutineWorkspace";
import { useAuthSession } from "@/lib/hooks/use-auth-session";

export default function AiRoutinePage() {
  const { isReady, isLoggedIn, user } = useAuthSession();

  if (!isReady) {
    return null;
  }

  if (!isLoggedIn || !user) {
    return <AuthRequiredCard redirectPath="/ai-routine" />;
  }

  return <AiRoutineWorkspace user={user} />;
}
