"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StarterPromptsPanelProps } from "@/components/ai-routine/types";

export default function StarterPromptsPanel({
  starterPrompts,
  focusAreas,
  selectedFocusAreaIds,
  applyStarterPrompt,
  toggleFocusArea,
  t,
}: StarterPromptsPanelProps) {
  return (
    <Card className="border-[#e8ebf1] shadow-none">
      <CardHeader className="gap-3">
        <CardTitle className="text-xl">{t("starterPrompts.title")}</CardTitle>
        <CardDescription>{t("starterPrompts.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {starterPrompts.map((prompt) => (
            <Button
              key={prompt.id}
              type="button"
              variant="outline"
              className="h-auto whitespace-normal rounded-full px-4 py-2 text-left"
              onClick={() => applyStarterPrompt(prompt.id, prompt.value)}
            >
              {prompt.label}
            </Button>
          ))}
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {t("focusAreas.title")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("focusAreas.description")}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {focusAreas.map((focusArea) => {
              const isSelected = selectedFocusAreaIds.includes(focusArea.id);

              return (
                <Button
                  key={focusArea.id}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  className="rounded-full"
                  onClick={() => toggleFocusArea(focusArea.id)}
                >
                  {focusArea.label}
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
