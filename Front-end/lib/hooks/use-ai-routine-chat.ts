"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { getProducts } from "@/lib/api";
import { Product, SkinType } from "@/types/product";
import { Routine, RoutineStep } from "@/types/routine";

type AiRoutineMessageRole = "assistant" | "user";

export type AiRoutineMessage = Readonly<{
  id: string;
  role: AiRoutineMessageRole;
  content: string;
}>;

export type AiRoutineStarterPrompt = Readonly<{
  id: string;
  label: string;
  value: string;
}>;

export type AiRoutineFocusArea = Readonly<{
  id: string;
  label: string;
}>;

export type AiRoutineContinuousRecommendation = Readonly<{
  id: string;
  title: string;
  description: string;
  prompt: string;
}>;

const starterPromptIds = [
  "hydration",
  "breakouts",
  "barrier",
  "minimalist",
] as const;

const focusAreaIds = [
  "hydration",
  "barrier",
  "texture",
  "sensitivity",
] as const;

const continuousRecommendationIds = [
  "adjustFrequency",
  "swapTexture",
  "simplifyNight",
] as const;

const starterPromptFocusAreas: Record<(typeof starterPromptIds)[number], string[]> = {
  hydration: ["hydration", "barrier"],
  breakouts: ["texture"],
  barrier: ["barrier", "sensitivity"],
  minimalist: ["hydration", "sensitivity"],
};

const focusAreaProductIds: Record<(typeof focusAreaIds)[number], string[]> = {
  hydration: ["12", "15", "5", "10"],
  barrier: ["12", "14", "6", "1"],
  texture: ["2", "3", "13", "5"],
  sensitivity: ["12", "6", "14", "1"],
};

const pmPriorityIds = ["2", "3", "6", "9", "14"];

function buildStep(product: Product, order: number, t: ReturnType<typeof useTranslations>): RoutineStep {
  return {
    id: `ai-step-${product.id}`,
    name: t("draft.stepName", { order: order + 1 }),
    order,
    productId: product.id,
    product,
    notes: t("draft.stepNotes", { productName: product.name }),
  };
}

function buildRecommendedProducts(
  products: Product[],
  selectedFocusAreaIds: string[],
  selectedSkinType: SkinType,
  routineType: string,
) {
  const recommendedIds = selectedFocusAreaIds.flatMap((focusAreaId) => {
    return focusAreaProductIds[focusAreaId as keyof typeof focusAreaProductIds] ?? [];
  });

  const withRoutinePriority = routineType === "pm"
    ? [...pmPriorityIds, ...recommendedIds]
    : recommendedIds;

  const uniqueIds = [...new Set(withRoutinePriority)];
  const skinMatchedProducts = products.filter((product) =>
    uniqueIds.includes(product.id) && product.skin_type.includes(selectedSkinType),
  );
  const fallbackProducts = products.filter((product) => uniqueIds.includes(product.id));

  return (skinMatchedProducts.length > 0 ? skinMatchedProducts : fallbackProducts).slice(0, 6);
}

function reorderSteps(steps: RoutineStep[]) {
  return steps.map((step, index) => ({
    ...step,
    order: index,
  }));
}

function buildConversationIteration(message: string, t: ReturnType<typeof useTranslations>) {
  return [
    {
      id: `user-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`,
      role: "user" as const,
      content: message,
    },
    {
      id: `assistant-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`,
      role: "assistant" as const,
      content: t("messages.pendingReply"),
    },
  ];
}

export function useAiRoutineChat(userId: string, userName: string) {
  const t = useTranslations("AiRoutine");
  const products = useMemo(() => getProducts(), []);

  const [inputValue, setInputValue] = useState("");
  const [selectedFocusAreaIds, setSelectedFocusAreaIds] = useState<string[]>([
    "hydration",
    "barrier",
  ]);
  const [routineDraft, setRoutineDraft] = useState<Routine>(() => {
    const initialRecommendedProducts = buildRecommendedProducts(
      products,
      ["hydration", "barrier"],
      SkinType.MIXTA,
      "am",
    ).slice(0, 3);

    return {
      id: `ai-routine-${userId}`,
      userId,
      name: t("draft.initialName"),
      description: t("draft.initialDescription"),
      type: "am",
      skinType: SkinType.MIXTA,
      steps: initialRecommendedProducts.map((product, index) => buildStep(product, index, t)),
    };
  });
  const [messages, setMessages] = useState<AiRoutineMessage[]>([
    {
      id: "assistant-intro",
      role: "assistant",
      content: t("messages.assistantIntro", { name: userName }),
    },
    {
      id: "user-goal",
      role: "user",
      content: t("messages.userGoal"),
    },
    {
      id: "assistant-follow-up",
      role: "assistant",
      content: t("messages.assistantFollowUp"),
    },
  ]);

  const starterPrompts = useMemo<AiRoutineStarterPrompt[]>(
    () =>
      starterPromptIds.map((id) => ({
        id,
        label: t(`starterPrompts.${id}.label`),
        value: t(`starterPrompts.${id}.value`),
      })),
    [t],
  );

  const focusAreas = useMemo<AiRoutineFocusArea[]>(
    () =>
      focusAreaIds.map((id) => ({
        id,
        label: t(`focusAreas.items.${id}`),
      })),
    [t],
  );

  const continuousRecommendations = useMemo<AiRoutineContinuousRecommendation[]>(
    () =>
      continuousRecommendationIds.map((id) => ({
        id,
        title: t(`continuousRecommendations.items.${id}.title`),
        description: t(`continuousRecommendations.items.${id}.description`),
        prompt: t(`continuousRecommendations.items.${id}.prompt`),
      })),
    [t],
  );

  const recommendedProducts = useMemo(
    () =>
      buildRecommendedProducts(
        products,
        selectedFocusAreaIds,
        routineDraft.skinType,
        routineDraft.type,
      ),
    [products, routineDraft.skinType, routineDraft.type, selectedFocusAreaIds],
  );

  const appendPrompt = (prompt: string) => {
    setInputValue((currentValue) =>
      currentValue.trim()
        ? `${currentValue}\n${prompt}`
        : prompt,
    );
  };

  const applyStarterPrompt = (starterPromptId: string, value: string) => {
    setSelectedFocusAreaIds(
      starterPromptFocusAreas[starterPromptId as keyof typeof starterPromptFocusAreas] ?? ["hydration"],
    );
    setInputValue(value);
  };

  const toggleFocusArea = (focusAreaId: string) => {
    setSelectedFocusAreaIds((currentFocusAreas) => {
      if (currentFocusAreas.includes(focusAreaId)) {
        if (currentFocusAreas.length === 1) {
          return currentFocusAreas;
        }

        return currentFocusAreas.filter((id) => id !== focusAreaId);
      }

      return [...currentFocusAreas, focusAreaId];
    });
  };

  const updateRoutineField = <TField extends keyof Pick<Routine, "name" | "description" | "type" | "skinType">>(
    field: TField,
    value: Routine[TField],
  ) => {
    setRoutineDraft((currentRoutineDraft) => ({
      ...currentRoutineDraft,
      [field]: value,
    }));
  };

  const toggleProductInRoutine = (product: Product) => {
    setRoutineDraft((currentRoutineDraft) => {
      const alreadySelected = currentRoutineDraft.steps.some((step) => step.productId === product.id);

      if (alreadySelected) {
        return {
          ...currentRoutineDraft,
          steps: reorderSteps(
            currentRoutineDraft.steps.filter((step) => step.productId !== product.id),
          ),
        };
      }

      const nextSteps = [
        ...currentRoutineDraft.steps,
        buildStep(product, currentRoutineDraft.steps.length, t),
      ];

      return {
        ...currentRoutineDraft,
        steps: reorderSteps(nextSteps),
      };
    });
  };

  const updateStepName = (stepId: string, name: string) => {
    setRoutineDraft((currentRoutineDraft) => ({
      ...currentRoutineDraft,
      steps: currentRoutineDraft.steps.map((step) =>
        step.id === stepId
          ? { ...step, name }
          : step,
      ),
    }));
  };

  const updateStepNotes = (stepId: string, notes: string) => {
    setRoutineDraft((currentRoutineDraft) => ({
      ...currentRoutineDraft,
      steps: currentRoutineDraft.steps.map((step) =>
        step.id === stepId
          ? { ...step, notes }
          : step,
      ),
    }));
  };

  const moveStep = (stepId: string, direction: "up" | "down") => {
    setRoutineDraft((currentRoutineDraft) => {
      const currentIndex = currentRoutineDraft.steps.findIndex((step) => step.id === stepId);

      if (currentIndex === -1) {
        return currentRoutineDraft;
      }

      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (targetIndex < 0 || targetIndex >= currentRoutineDraft.steps.length) {
        return currentRoutineDraft;
      }

      const nextSteps = [...currentRoutineDraft.steps];
      [nextSteps[currentIndex], nextSteps[targetIndex]] = [nextSteps[targetIndex], nextSteps[currentIndex]];

      return {
        ...currentRoutineDraft,
        steps: reorderSteps(nextSteps),
      };
    });
  };

  const removeStep = (stepId: string) => {
    setRoutineDraft((currentRoutineDraft) => ({
      ...currentRoutineDraft,
      steps: reorderSteps(
        currentRoutineDraft.steps.filter((step) => step.id !== stepId),
      ),
    }));
  };

  const submitMessage = () => {
    const trimmedValue = inputValue.trim();

    if (!trimmedValue) {
      return;
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      ...buildConversationIteration(trimmedValue, t),
    ]);
    setInputValue("");
  };

  return {
    messages,
    inputValue,
    setInputValue,
    starterPrompts,
    focusAreas,
    selectedFocusAreaIds,
    routineDraft,
    recommendedProducts,
    continuousRecommendations,
    appendPrompt,
    applyStarterPrompt,
    toggleFocusArea,
    updateRoutineField,
    toggleProductInRoutine,
    updateStepName,
    updateStepNotes,
    moveStep,
    removeStep,
    submitMessage,
  };
}
