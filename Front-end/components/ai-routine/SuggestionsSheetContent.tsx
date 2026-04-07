"use client";

import { Plus, Sparkles } from "lucide-react";

import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { SuggestionsSheetContentProps } from "@/components/ai-routine/types";

export default function SuggestionsSheetContent({
  recommendedProducts,
  routineDraft,
  continuousRecommendations,
  appendPrompt,
  onToggleSuggestedProduct,
  t,
}: SuggestionsSheetContentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          {t("recommendedProducts.title")}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("recommendedProducts.description")}
        </p>
      </div>

      <div className="grid gap-4">
        {recommendedProducts.map((product, index) => {
          const isSelected = routineDraft.steps.some((step) => step.productId === product.id);

          return (
            <ProductCard
              key={product.id}
              productIndex={index}
              product={product}
              showFavoriteButton={false}
              className="border-border/70 shadow-none"
              action={
                <Button
                  type="button"
                  variant={isSelected ? "secondary" : "outline"}
                  className="w-full"
                  onClick={() => onToggleSuggestedProduct(product)}
                >
                  {isSelected ? (
                    <>
                      <Sparkles size={16} />
                      {t("recommendedProducts.actions.added")}
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      {t("recommendedProducts.actions.add")}
                    </>
                  )}
                </Button>
              }
            />
          );
        })}
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-foreground">
          {t("continuousRecommendations.title")}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("continuousRecommendations.description")}
        </p>

        <div className="mt-4 space-y-3">
          {continuousRecommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className="rounded-2xl border border-border/70 bg-background p-4"
            >
              <p className="text-sm font-semibold text-foreground">
                {recommendation.title}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {recommendation.description}
              </p>
              <Button
                type="button"
                variant="ghost"
                className="mt-2 px-0 text-primary hover:bg-transparent"
                onClick={() => appendPrompt(recommendation.prompt)}
              >
                {t("continuousRecommendations.addToChat")}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
