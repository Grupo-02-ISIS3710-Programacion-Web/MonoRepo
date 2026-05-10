"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Product, SkinType } from "@/types/product";
import { Routine, RoutineStep } from "@/types/routine";
import {
  chatWithAI as chatWithAI_API,
  fetchProductsBatch,
  ChatMessage,
  createChat,
  getChat,
  saveChatMessage,
  updateChatDraft,
} from "@/lib/api-client";

type AiRoutineMessageRole = "assistant" | "user";

export type AiRoutineMessage = Readonly<{
  id: string;
  role: AiRoutineMessageRole;
  content: string;
  recommendedProducts?: {
    productId: string;
    reason: string;
    otherAlternatives?: { id: string; reason: string }[];
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

const starterPromptFocusAreas: Record<(typeof starterPromptIds)[number], string[]> = {
  hydration: ["hydration", "barrier"],
  breakouts: ["texture"],
  barrier: ["barrier", "sensitivity"],
  minimalist: ["hydration", "sensitivity"],
};

export function useAiRoutineChat(
  userId: string,
  userName: string,
  chatId?: string | null,
  router?: { push: (url: string) => void },
) {
  const t = useTranslations("AiRoutine");
  const [isInitializing, setIsInitializing] = useState(!!chatId);

  const [inputValue, setInputValue] = useState("");
  const [selectedFocusAreaIds, setSelectedFocusAreaIds] = useState<string[]>([
    "hydration",
    "barrier",
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingRoutine, setIsGeneratingRoutine] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(chatId || null);
  const hasSentFirstMessage = useRef(false);

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

  const draftSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved chat state on mount
  useEffect(() => {
    if (!chatId || !userId) {
      setIsInitializing(false);
      return;
    }

    const loadChat = async () => {
      try {
        const chat = await getChat(chatId, userId);
        if (chat) {
          // Restore messages
          if (chat.messages && chat.messages.length > 0) {
            // Collect all product IDs from saved messages
            const allProductIds = new Set<string>();
            chat.messages.forEach((m: any) => {
              if (m.recommendedProducts) {
                m.recommendedProducts.forEach((rec: any) => {
                  allProductIds.add(rec.productId);
                  if (rec.otherAlternatives) {
                    rec.otherAlternatives.forEach((alt: any) => allProductIds.add(alt.id));
                  }
                });
              }
            });

            // Resolve product details
            let productMap = new Map<string, any>();
            if (allProductIds.size > 0) {
              try {
                const batchResult = await fetchProductsBatch([...allProductIds]);
                productMap = new Map(batchResult.map((p) => [p.id, p]));
              } catch (error) {
                console.error("Error resolving products for restored chat:", error);
              }
            }

            const restoredMessages: AiRoutineMessage[] = [
              {
                id: "assistant-intro",
                role: "assistant",
                content: t("messages.assistantIntro", { name: userName }),
              },
              ...chat.messages.map((m: any) => {
                const enrichedRecommendedProducts = (m.recommendedProducts || [])
                  .map((rec: any) => {
                    const product = productMap.get(rec.productId);
                    const alternativesDetails = (rec.otherAlternatives || [])
                      .map((alt: any) => productMap.get(alt.id))
                      .filter(Boolean);
                    return product ? {
                      productId: rec.productId,
                      reason: rec.reason,
                      otherAlternatives: rec.otherAlternatives,
                      product,
                      alternativesDetails,
                    } : null;
                  })
                  .filter(Boolean);

                return {
                  id: `restored-${Date.now()}-${Math.random()}`,
                  role: m.role as AiRoutineMessageRole,
                  content: m.content,
                  recommendedProducts: enrichedRecommendedProducts.length > 0 ? enrichedRecommendedProducts : undefined,
                  draftUpdate: m.draftUpdate || undefined,
                };
              }),
            ];
            setMessages(restoredMessages);
          }

          // Restore routine draft
          if (chat.routineDraft) {
            const draft = chat.routineDraft;
            setRoutineDraft({
              id: `ai-routine-${userId}`,
              userId,
              name: draft.name || t("draft.initialName"),
              description: draft.description || t("draft.initialDescription"),
              type: draft.type || "am",
              skinType: draft.skinType || SkinType.MIXTA,
              steps: (draft.steps || []).map((step: any, index: number) => ({
                ...step,
                order: index,
              })),
            });
          }

          // Restore focus areas
          if (chat.selectedFocusAreaIds && chat.selectedFocusAreaIds.length > 0) {
            setSelectedFocusAreaIds(chat.selectedFocusAreaIds);
          }
        }
      } catch (error) {
        console.error("Error loading chat:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    loadChat();
  }, [chatId, userId, t, userName]);

  // Debounced draft save
  const saveDraftToBackend = useCallback((draft: Routine, chatIdToSave: string) => {
    if (!chatIdToSave) return;

    if (draftSaveTimerRef.current) {
      clearTimeout(draftSaveTimerRef.current);
    }

    draftSaveTimerRef.current = setTimeout(async () => {
      try {
        await updateChatDraft(chatIdToSave, userId, {
          name: draft.name,
          description: draft.description,
          type: draft.type,
          skinType: draft.skinType,
          steps: draft.steps.map((s) => ({
            id: s.id,
            name: s.name,
            order: s.order,
            productId: s.productId,
            notes: s.notes ?? "",
          })),
        });
      } catch (error) {
        console.error("Error saving draft:", error);
      }
    }, 5000);
  }, [userId]);

  // Save draft whenever it changes (debounced)
  useEffect(() => {
    if (activeChatId) {
      saveDraftToBackend(routineDraft, activeChatId);
    }
  }, [routineDraft, activeChatId, saveDraftToBackend]);

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

      // Resolve product details via batch endpoint
      let resolvedProducts = response.recommendedProducts;
      if (response.recommendedProducts && response.recommendedProducts.length > 0) {
        const allIds = [
          ...response.recommendedProducts.map((r) => r.productId),
          ...response.recommendedProducts
            .flatMap((r) => r.otherAlternatives?.map((a) => a.id) ?? []),
        ];
        const uniqueIds = [...new Set(allIds)];

        if (uniqueIds.length > 0) {
          try {
            const batchResult = await fetchProductsBatch(uniqueIds);
            const productMap = new Map(batchResult.map((p) => [p.id, p]));

            resolvedProducts = response.recommendedProducts.map((rec) => {
              const product = productMap.get(rec.productId);
              const alternativesDetails = (rec.otherAlternatives ?? [])
                .map((alt) => productMap.get(alt.id))
                .filter(Boolean);

              return {
                productId: rec.productId,
                reason: rec.reason,
                otherAlternatives: rec.otherAlternatives,
                product,
                alternativesDetails,
              };
            }).filter((r) => r.product);
          } catch (error) {
            console.error("Error resolving product details:", error);
          }
        }
      }

      const assistantMessage: AiRoutineMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.response,
        recommendedProducts: resolvedProducts && resolvedProducts.length > 0
          ? resolvedProducts.map((rec: any) => ({
              productId: rec.productId,
              reason: rec.reason,
              otherAlternatives: rec.otherAlternatives,
              product: rec.product,
              alternativesDetails: rec.alternativesDetails,
            }))
          : undefined,
      };

      setMessages((currentMessages) => [...currentMessages, assistantMessage]);

      // Create chat on first message if no active chat
      let currentChatId = activeChatId;
      if (!currentChatId) {
        if (!hasSentFirstMessage.current) {
          hasSentFirstMessage.current = true;
          const newChat = await createChat(userId, selectedFocusAreaIds);
          currentChatId = newChat.chatId;
          setActiveChatId(currentChatId);
          if (router) {
            router.push(`/ai-routine?chatId=${currentChatId}`);
          }
        }
      }

      // Save user message
      if (currentChatId) {
        await saveChatMessage(currentChatId, userId, {
          role: "user",
          content: trimmedValue,
        });

        // Save AI response
        await saveChatMessage(currentChatId, userId, {
          role: "assistant",
          content: response.response,
          recommendedProducts: response.recommendedProducts,
          draftUpdate: response.draftUpdate,
        });
      }

      // Apply draft updates from AI response
      if (response.draftUpdate?.steps) {
        // Handle draft updates if needed
      }
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
  }, [inputValue, isLoading, messages, userId, routineDraft, t, activeChatId, selectedFocusAreaIds, router]);

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
    isInitializing,
    starterPrompts,
    focusAreas,
    selectedFocusAreaIds,
    routineDraft,
    activeChatId,
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
