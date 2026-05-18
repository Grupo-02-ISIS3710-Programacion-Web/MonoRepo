"use client";

import { Suspense } from "react";
import AuthRequiredCard from "@/components/auth/AuthRequiredCard";
import PremiumRequiredCard from "@/components/premium/PremiumRequiredCard";
import AiRoutineWorkspace from "@/components/ai-routine/AiRoutineWorkspace";
import { useAuthSession } from "@/lib/hooks/use-auth-session";

function AiRoutineContent() {
  const { isReady, isLoggedIn, user } = useAuthSession();

  if (!isReady) {
    return null;
  }

  if (!isLoggedIn || !user) {
    return <AuthRequiredCard redirectPath="/ai-routine" />;
  }

  if (!user.isPremium) {
    return <PremiumRequiredCard />;
  }

  return <AiRoutineWorkspace user={user} />;
}

export default function AiRoutinePage() {
  return (
    <Suspense>
      <AiRoutineContent />
    </Suspense>
  );
}
