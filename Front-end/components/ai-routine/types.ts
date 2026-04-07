"use client";

import { Product, SkinType } from "@/types/product";
import { Routine } from "@/types/routine";
import { AiRoutineContinuousRecommendation, AiRoutineFocusArea, AiRoutineMessage, AiRoutineStarterPrompt } from "@/lib/hooks/use-ai-routine-chat";

export type Translator = (key: string, values?: Record<string, string | number>) => string;

export type DraftEditorProps = Readonly<{
  title: string;
  description: string;
  continueLabel: string;
  routineDraft: Routine;
  t: Translator;
  tSkin: Translator;
  updateRoutineField: <TField extends keyof Pick<Routine, "name" | "description" | "type" | "skinType">>(
    field: TField,
    value: Routine[TField],
  ) => void;
  updateStepName: (stepId: string, name: string) => void;
  updateStepNotes: (stepId: string, notes: string) => void;
  moveStep: (stepId: string, direction: "up" | "down") => void;
  removeStep: (stepId: string) => void;
  onContinue: () => void;
}>;

export type ChatPanelProps = Readonly<{
  userName: string;
  messages: AiRoutineMessage[];
  inputValue: string;
  setInputValue: (value: string) => void;
  onSubmit: () => void;
  t: Translator;
}>;

export type StarterPromptsPanelProps = Readonly<{
  starterPrompts: AiRoutineStarterPrompt[];
  focusAreas: AiRoutineFocusArea[];
  selectedFocusAreaIds: string[];
  applyStarterPrompt: (starterPromptId: string, value: string) => void;
  toggleFocusArea: (focusAreaId: string) => void;
  t: Translator;
}>;

export type SuggestionsSheetContentProps = Readonly<{
  recommendedProducts: Product[];
  routineDraft: Routine;
  continuousRecommendations: AiRoutineContinuousRecommendation[];
  appendPrompt: (prompt: string) => void;
  onToggleSuggestedProduct: (product: Product) => void;
  t: Translator;
}>;

export const aiRoutineSkinTypes = Object.values(SkinType);
