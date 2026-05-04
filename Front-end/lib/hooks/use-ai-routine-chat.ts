"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getProducts } from "@/lib/api";
import { Product, SkinType } from "@/types/product";
import { Routine, RoutineStep } from "@/types/routine";
import {
  generateRoutineWithAI,
  suggestProductsWithAI,
  chatWithAI as chatWithAI_API,
  ChatMessage,
} from "@/lib/api-client";

type AiRoutineMessageRole = "assistant" | "user";

export type AiRoutineMessage = Readonly<{
  id: string;
  role: AiRoutineMessageRole;
  content: string;
  recommendedProducts?: {
    productId: string;
    reason: string;
    otherAlternatives?: string[];
    product?: Product;
    alternativesDetails?: Product[];
  }[];
  draftUpdate?: {
    steps?: RoutineStep[];
  };
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

export function useAiRoutineChat(userId: string, userName: string) {
  const t = useTranslations("AiRoutine");
  const products = useMemo(() => getProducts(), []);

  const [inputValue, setInputValue] = useState("");
  const [selectedFocusAreaIds, setSelectedFocusAreaIds] = useState<string[]>([
    "hydration",
    "barrier",
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingRoutine, setIsGeneratingRoutine] = useState(false);

  const [routineDraft, setRoutineDraft] = useState<Routine>(() => ({
    id: `ai-routine-${userId}`,
    userId,
    name: t("draft.initialName"),
    description: t("draft.initialDescription"),
    type: "am",
    skinType: SkinType.MIXTA,
    steps: [],
  }));

  const [messages, setMessages] = useState<AiRoutineMessage[]>([
    {
      id: "assistant-intro",
      role: "assistant",
      content: t("messages.assistantIntro", { name: userName }),
    },
  ]);

  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

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
          steps: currentRoutineDraft.steps
            .filter((step) => step.productId !== product.id)
            .map((step, index) => ({ ...step, order: index })),
        };
      }

      const nextSteps = [
        ...currentRoutineDraft.steps,
        {
          id: `ai-step-${product.id}-${Date.now()}`,
          name: t("draft.stepName", { order: currentRoutineDraft.steps.length + 1 }),
          order: currentRoutineDraft.steps.length,
          productId: product.id,
          product,
          notes: t("draft.stepNotes", { productName: product.name }),
        },
      ];

      return {
        ...currentRoutineDraft,
        steps: nextSteps,
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
        steps: nextSteps.map((step, index) => ({ ...step, order: index })),
      };
    });
  };

  const removeStep = (stepId: string) => {
    setRoutineDraft((currentRoutineDraft) => ({
      ...currentRoutineDraft,
      steps: currentRoutineDraft.steps
        .filter((step) => step.id !== stepId)
        .map((step, index) => ({ ...step, order: index })),
    }));
  };

  const submitMessage = useCallback(async () => {
    const trimmedValue = inputValue.trim();

    if (!trimmedValue || isLoading) {
      return;
    }

    const userMessage: AiRoutineMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedValue,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const chatMessages: ChatMessage[] = messages
        .filter((m) => m.id !== "assistant-intro")
        .map((m) => ({
          role: m.role === "user" ? "user" as const : "assistant" as const,
          content: m.content,
        }));

      chatMessages.push({ role: "user", content: trimmedValue });

      const response = await chatWithAI_API({
        userId,
        messages: chatMessages,
        routineContext: {
          skinType: routineDraft.skinType,
          type: routineDraft.type,
          currentSteps: routineDraft.steps,
        },
      });

      // Simply pass through the backend response - products already populated!
      const assistantMessage: AiRoutineMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.response,
        recommendedProducts: response.recommendedProducts && response.recommendedProducts.length > 0
          ? response.recommendedProducts.map((rec: any) => ({
              productId: rec.productId || rec.product?.id || "",
              reason: rec.reason || "",
              // Map backend otherAlternatives (with product details) to alternativesDetails
              alternativesDetails: rec.otherAlternatives || [],
              product: rec.product,
            }))
          : undefined,
      };

      setMessages((currentMessages) => [...currentMessages, assistantMessage]);
    } catch (error) {
      console.error("Error en chat con IA:", error);
      const errorMessage: AiRoutineMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: t("messages.errorReply"),
      };
      setMessages((currentMessages) => [...currentMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, messages, userId, routineDraft, t]);

  const getProductSuggestions = useCallback(async (stepName: string, category?: string) => {
    try {
      const suggestions = await suggestProductsWithAI({
        skinType: routineDraft.skinType,
        stepName,
        category,
        concerns: selectedFocusAreaIds,
      });
      return suggestions.suggestions || [];
    } catch (error) {
      console.error("Error sugiriendo productos:", error);
      return [];
    }
  }, [routineDraft.skinType, selectedFocusAreaIds]);

  const addProductToRoutine = useCallback((product: Product, stepName?: string, notes?: string) => {
    setRoutineDraft((current) => {
      const alreadyInRoutine = current.steps.some(step => step.productId === product.id);
      
      if (alreadyInRoutine) {
        return current;
      }

      const newStep: RoutineStep = {
        id: `ai-step-${product.id}-${Date.now()}`,
        name: stepName || `Paso ${current.steps.length + 1}`,
        order: current.steps.length,
        productId: product.id,
        product,
        notes: notes || `Usar ${product.name} según las necesidades de tu piel.`,
      };

      return {
        ...current,
        steps: [...current.steps, newStep],
      };
    });

    toast.success(t("recommendedProducts.toast.added", { name: product.name }));
  }, [t]);

  return {
    messages,
    inputValue,
    setInputValue,
    isLoading,
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
    addProductToRoutine,
  };
}
