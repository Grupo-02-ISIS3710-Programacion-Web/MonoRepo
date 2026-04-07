"use client";

import AuthRequiredCard from "@/components/auth/AuthRequiredCard";
import RoutineForm from "@/components/routines/RoutineForm";
import { useAuthSession } from "@/lib/hooks/use-auth-session";

export default function CrearRutinaPage() {
    const { isReady, isLoggedIn } = useAuthSession();

    if (!isReady) {
        return null;
    }

    if (!isLoggedIn) {
        return <AuthRequiredCard redirectPath="/routine/crear" />;
    }

    return <RoutineForm mode="create" />;
}