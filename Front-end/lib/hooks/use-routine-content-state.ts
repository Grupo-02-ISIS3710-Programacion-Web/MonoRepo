"use client";

import { Routine } from "@/types/routine";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { deleteRoutine } from "@/lib/api-client";

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

    const handleDeleteRoutine = async (routineId: string) => {
        const routineName = routines.find((routine) => routine.id === routineId)?.name || "Rutina";

        try {
            await deleteRoutine(routineId);
            setRoutines((prev) => prev.filter((routine) => routine.id !== routineId));
            setDeletingRoutineId(null);
            toast.success(`${routineName} ${deletedLabel}`);
        } catch (error) {
            toast.error("Error al eliminar la rutina");
            console.error("Failed to delete routine:", error);
        }
    };

    return {
        deletingRoutineId,
        setDeletingRoutineId,
        routines,
        handleDeleteRoutine,
    };
}
