"use client";

import { useState } from "react";
import { FilePenLine } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

import { Link, useRouter } from "@/i18n/navigation";
import { useAiRoutineChat } from "@/lib/hooks/use-ai-routine-chat";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ChatPanel from "@/components/ai-routine/ChatPanel";
import DraftEditor from "@/components/ai-routine/DraftEditor";
import StarterPromptsPanel from "@/components/ai-routine/StarterPromptsPanel";
import SuggestionsSheetContent from "@/components/ai-routine/SuggestionsSheetContent";

type AiRoutineWorkspaceProps = Readonly<{ user: User }>;

export default function AiRoutineWorkspace({ user }: AiRoutineWorkspaceProps) {
  const t = useTranslations("AiRoutine");
  const tSkin = useTranslations("SkinTypes");
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chatId");

  const {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    isInitializing,
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
  } = useAiRoutineChat(user.id, user.name, chatId, router);

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveRoutine = async () => {
    if (routineDraft.steps.length === 0) {
      toast.warning(t("draft.save.warningNoSteps"));
      return;
    }

    setIsSaving(true);
    try {
      const { createRoutine } = await import("@/lib/api-client");
      await createRoutine({
        userId: user.id,
        name: routineDraft.name,
        description: routineDraft.description,
        type: routineDraft.type,
        skinType: routineDraft.skinType,
        steps: routineDraft.steps.map((step, index) => ({
          id: step.id,
          name: step.name,
          order: index,
          productId: step.productId,
          notes: step.notes ?? "",
        })),
      });
      toast.success(t("draft.save.success"));
      router.push("/profile");
    } catch (error) {
      console.error("Failed to save routine:", error);
      toast.error(t("draft.save.error"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuggestedProductToggle = (product: typeof recommendedProducts[number]) => {
    const isSelected = routineDraft.steps.some((step) => step.productId === product.id);
    toggleProductInRoutine(product);

    if (!isSelected) {
      toast.success(t("recommendedProducts.toast.added", { name: product.name }));
    }
  };

  if (isInitializing) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading chat...</p>
      </main>
    );
  }

  return (
    <main className="flex h-screen flex-col bg-background">
      <div className="flex-shrink-0 border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-8 md:py-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full bg-primary/8 px-3 py-1 text-xs font-semibold tracking-wide text-primary">
                {t("badge")}
              </span>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
                {t("title")}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="outline">
                <Link href="/routine/crear">{t("headerActions.manualBuilder")}</Link>
              </Button>

              <Sheet>
                <SheetTrigger asChild>
                  <Button type="button" variant="outline">
                    {t("headerActions.suggestions")}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
                  <SheetHeader>
                    <SheetTitle>{t("suggestionsSheet.title")}</SheetTitle>
                    <SheetDescription>{t("suggestionsSheet.description")}</SheetDescription>
                  </SheetHeader>
                  <div className="px-4 pb-6">
                    <SuggestionsSheetContent
                      recommendedProducts={recommendedProducts}
                      routineDraft={routineDraft}
                      continuousRecommendations={continuousRecommendations}
                      appendPrompt={appendPrompt}
                      onToggleSuggestedProduct={handleSuggestedProductToggle}
                      t={t}
                    />
                  </div>
                  <SheetFooter className="border-t pt-4">
                    <SheetClose asChild>
                      <Button type="button" variant="outline">Close</Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 overflow-hidden px-4 py-4 md:px-8 md:py-5 lg:gap-8">
        <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-hidden">
          {messages.length > 0 ? (
            <div className="flex min-w-0 flex-1 flex-col min-h-0">
              <ChatPanel
                userName={user.name}
                messages={messages}
                inputValue={inputValue}
                setInputValue={setInputValue}
                onSubmit={submitMessage}
                t={t}
                addProductToRoutine={addProductToRoutine}
                isLoading={isLoading}
              />
            </div>
          ) : (
            <>
              <ChatPanel
                userName={user.name}
                messages={messages}
                inputValue={inputValue}
                setInputValue={setInputValue}
                onSubmit={submitMessage}
                t={t}
                addProductToRoutine={addProductToRoutine}
                isLoading={isLoading}
              />
              <StarterPromptsPanel
                starterPrompts={starterPrompts}
                focusAreas={focusAreas}
                selectedFocusAreaIds={selectedFocusAreaIds}
                applyStarterPrompt={applyStarterPrompt}
                toggleFocusArea={toggleFocusArea}
                t={t}
              />
            </>
          )}
        </div>

        <div className="hidden md:flex md:w-[380px] md:flex-shrink-0">
          <div className="flex w-full flex-col overflow-hidden rounded-2xl border bg-card">
            <div className="overflow-y-auto p-5">
              <DraftEditor
                title={t("draft.title")}
                description={t("draft.description")}
                continueLabel={t("draft.actions.continue")}
                routineDraft={routineDraft}
                t={t}
                tSkin={tSkin}
                updateRoutineField={updateRoutineField}
                updateStepName={updateStepName}
                updateStepNotes={updateStepNotes}
                moveStep={moveStep}
                removeStep={removeStep}
                onContinue={handleSaveRoutine}
              />
            </div>
          </div>
        </div>
      </div>

      <Drawer>
        <DrawerTrigger asChild>
          <Button
            type="button"
            className="fixed right-6 bottom-6 z-50 rounded-full shadow-lg md:hidden"
            size="lg"
          >
            <FilePenLine size={16} />
            {t("mobileDraft.open")}
          </Button>
        </DrawerTrigger>

        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{t("mobileDraft.title")}</DrawerTitle>
            <DrawerDescription>{t("mobileDraft.description")}</DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-2">
            <DraftEditor
              title={t("draft.title")}
              description={t("draft.description")}
              continueLabel={t("draft.actions.continue")}
              routineDraft={routineDraft}
              t={t}
              tSkin={tSkin}
              updateRoutineField={updateRoutineField}
              updateStepName={updateStepName}
              updateStepNotes={updateStepNotes}
              moveStep={moveStep}
              removeStep={removeStep}
              onContinue={handleSaveRoutine}
            />
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button type="button" variant="outline">{t("mobileDraft.close")}</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </main>
  );
}
