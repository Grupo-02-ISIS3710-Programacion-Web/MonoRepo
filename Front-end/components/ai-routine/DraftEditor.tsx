"use client";

import { AnimatePresence, motion } from "motion/react";

import PasoRutinaCard from "@/components/routines/PasoRutinaCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SkinType } from "@/types/product";
import { aiRoutineSkinTypes, DraftEditorProps } from "@/components/ai-routine/types";

export default function DraftEditor({
  title,
  description,
  continueLabel,
  routineDraft,
  t,
  tSkin,
  updateRoutineField,
  updateStepName,
  updateStepNotes,
  moveStep,
  removeStep,
  onContinue,
}: DraftEditorProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-3">
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">{t("draft.fields.name")}</p>
          <Input
            value={routineDraft.name}
            onChange={(event) => updateRoutineField("name", event.target.value)}
            placeholder={t("draft.placeholders.name")}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-foreground">{t("draft.fields.description")}</p>
          <Textarea
            value={routineDraft.description}
            onChange={(event) => updateRoutineField("description", event.target.value)}
            placeholder={t("draft.placeholders.description")}
            rows={4}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">{t("draft.fields.type")}</p>
            <div className="flex gap-2">
              {["am", "pm"].map((routineType) => (
                <Button
                  key={routineType}
                  type="button"
                  variant={routineDraft.type === routineType ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => updateRoutineField("type", routineType)}
                >
                  {t(`draft.typeOptions.${routineType}`)}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">{t("draft.fields.skinType")}</p>
            <Select
              value={routineDraft.skinType}
              onValueChange={(value) => updateRoutineField("skinType", value as SkinType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("draft.placeholders.skinType")} />
              </SelectTrigger>
              <SelectContent>
                {aiRoutineSkinTypes.map((skinType) => (
                  <SelectItem key={skinType} value={skinType}>
                    {tSkin(skinType)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">{t("draft.structure.title")}</p>
            <p className="text-sm text-muted-foreground">
              {t("draft.structure.summary", { count: routineDraft.steps.length })}
            </p>
          </div>
          <div className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold text-muted-foreground">
            {routineDraft.id}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-foreground">{t("draft.stepsTitle")}</h3>
          <span className="text-xs text-muted-foreground">{t("draft.stepsCount", { count: routineDraft.steps.length })}</span>
        </div>

        {routineDraft.steps.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
            {t("draft.empty")}
          </div>
        ) : (
          <AnimatePresence initial={false} mode="sync">
            {routineDraft.steps.map((step, index) => (
              <motion.div
                key={step.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <PasoRutinaCard
                  index={index}
                  totalSteps={routineDraft.steps.length}
                  product={step.product!}
                  stepId={step.id}
                  nameValue={step.name}
                  notesValue={step.notes ?? ""}
                  onNameChange={(value) => updateStepName(step.id, value)}
                  onNotesChange={(value) => updateStepNotes(step.id, value)}
                  onMoveUp={() => moveStep(step.id, "up")}
                  onMoveDown={() => moveStep(step.id, "down")}
                  onRemove={() => removeStep(step.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <Button type="button" className="w-full" onClick={onContinue}>
        {continueLabel}
      </Button>
    </div>
  );
}
