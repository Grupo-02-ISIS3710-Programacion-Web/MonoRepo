"use client";

import { FilePenLine, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Link, useRouter } from "@/i18n/navigation";
import { saveAiRoutineDraft } from "@/lib/ai-routine-draft";
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
  const {
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
  } = useAiRoutineChat(user.id, user.name);

  const handleContinueToBuilder = () => {
    saveAiRoutineDraft(routineDraft);
    router.push("/routine/crear");
  };

  const handleSuggestedProductToggle = (product: typeof recommendedProducts[number]) => {
    const isSelected = routineDraft.steps.some((step) => step.productId === product.id);
    toggleProductInRoutine(product);

    if (!isSelected) {
      toast.success(t("recommendedProducts.toast.added", { name: product.name }));
    }
  };

  return (
    <main className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <Drawer>
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full bg-primary/8 px-3 py-1 text-xs font-semibold tracking-wide text-primary">
                {t("badge")}
              </span>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-foreground">
                {t("title")}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                {t("description")}
              </p>
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
                </SheetContent>
              </Sheet>

              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    className="group hidden md:inline-flex gap-2 rounded-full bg-primary px-5 text-primary-foreground shadow-md transition hover:shadow-lg"
                  >
                    <Sparkles size={16} className="transition group-hover:scale-110" />
                    <span>{t("mobileDraft.open")}</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full p-0 sm:max-w-2xl xl:max-w-3xl">
                  <div className="flex h-full flex-col">
                    <SheetHeader className="border-b px-6 py-5 text-left">
                      <SheetTitle>{t("mobileDraft.title")}</SheetTitle>
                      <SheetDescription>{t("mobileDraft.description")}</SheetDescription>
                    </SheetHeader>

                    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
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
                        onContinue={handleContinueToBuilder}
                      />
                    </div>

                    <SheetFooter className="border-t px-6 py-4 sm:justify-start">
                      <SheetClose asChild>
                        <Button type="button" variant="outline">{t("mobileDraft.close")}</Button>
                      </SheetClose>
                    </SheetFooter>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

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
                onContinue={handleContinueToBuilder}
              />
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button type="button" variant="outline">{t("mobileDraft.close")}</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>

          <div className="space-y-6">
            <section className="space-y-6">
              <ChatPanel
                userName={user.name}
                messages={messages}
                inputValue={inputValue}
                setInputValue={setInputValue}
                onSubmit={submitMessage}
                t={t}
              />

              <StarterPromptsPanel
                starterPrompts={starterPrompts}
                focusAreas={focusAreas}
                selectedFocusAreaIds={selectedFocusAreaIds}
                applyStarterPrompt={applyStarterPrompt}
                toggleFocusArea={toggleFocusArea}
                t={t}
              />
            </section>
          </div>
        </Drawer>
      </div>
    </main>
  );
}
