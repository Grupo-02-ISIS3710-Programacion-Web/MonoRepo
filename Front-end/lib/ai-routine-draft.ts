"use client";

import { Routine } from "@/types/routine";
import { RoutineFormData } from "@/types/routine-form";

const AI_ROUTINE_DRAFT_STORAGE_KEY = "skin4all.ai-routine.draft";

function isClient() {
  return typeof window !== "undefined";
}

export function mapRoutineToRoutineFormData(routine: Routine): RoutineFormData {
  return {
    name: routine.name,
    description: routine.description,
    type: routine.type,
    skinType: routine.skinType,
    steps: routine.steps
      .slice()
      .sort((left, right) => left.order - right.order)
      .map((step, index) => ({
        id: step.id,
        name: step.name,
        order: index,
        product: step.product!,
        notes: step.notes ?? "",
      })),
  };
}

export function saveAiRoutineDraft(routine: Routine) {
  if (!isClient()) {
    return;
  }

  window.sessionStorage.setItem(
    AI_ROUTINE_DRAFT_STORAGE_KEY,
    JSON.stringify(mapRoutineToRoutineFormData(routine)),
  );
}

export function readAiRoutineDraft(): RoutineFormData | null {
  if (!isClient()) {
    return null;
  }

  const value = window.sessionStorage.getItem(AI_ROUTINE_DRAFT_STORAGE_KEY);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as RoutineFormData;
  } catch {
    return null;
  }
}

export function clearAiRoutineDraft() {
  if (!isClient()) {
    return;
  }

  window.sessionStorage.removeItem(AI_ROUTINE_DRAFT_STORAGE_KEY);
}
