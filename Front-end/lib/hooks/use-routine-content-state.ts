"use client";

import { Routine } from "@/types/routine";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type UseRoutineContentStateParams = Readonly<{
    filteredRoutines: Routine[];
    deletedLabel: string;
}>;

export function useRoutineContentState({
    filteredRoutines,
    deletedLabel,
}: UseRoutineContentStateParams) {
    const [deletingRoutineId, setDeletingRoutineId] = useState<string | null>(null);
    const [routines, setRoutines] = useState<Routine[]>(filteredRoutines);

    useEffect(() => {
        setRoutines(filteredRoutines);
    }, [filteredRoutines]);

    const handleDeleteRoutine = (routineId: string) => {
        const routineName = routines.find((routine) => routine.id === routineId)?.name || "Rutina";

        setRoutines((prev) => prev.filter((routine) => routine.id !== routineId));
        setDeletingRoutineId(null);
        toast.success(`${routineName} ${deletedLabel}`);
    };

    return {
        deletingRoutineId,
        setDeletingRoutineId,
        routines,
        handleDeleteRoutine,
    };
}
