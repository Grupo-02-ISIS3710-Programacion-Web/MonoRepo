"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import { Product } from "@/types/product";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

type SuggestionWithReason = {
  productId: string;
  reason: string;
};

type ProductSuggestionsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestions: SuggestionWithReason[];
  products: Product[];
  onConfirm: (selectedProductIds: string[]) => void;
  onCancel: () => void;
};

export default function ProductSuggestionsModal({
  open,
  onOpenChange,
  suggestions,
  products,
  onConfirm,
  onCancel,
}: ProductSuggestionsModalProps) {
  const t = useTranslations("AiRoutine");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(suggestions.map((s) => s.productId))
  );

  const suggestedProducts = suggestions
    .map((s) => ({
      suggestion: s,
      product: products.find((p) => p.id === s.productId),
    }))
    .filter((item) => item.product);

  const toggleProduct = (productId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selectedIds));
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(suggestions.map((s) => s.productId)));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[95vw] max-w-2xl flex-col overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>{t("suggestionsModal.title")}</DialogTitle>
          <DialogDescription>
            {t("suggestionsModal.description")}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-3">
            {suggestedProducts.map(({ suggestion, product }) => {
              if (!product) return null;
              const isSelected = selectedIds.has(product.id);

              return (
                <div
                  key={product.id}
                  onClick={() => toggleProduct(product.id)}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-accent/50"
                  }`}
                >
                  <div
                    className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>

                  <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium leading-none">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.brand}
                          </p>
                        </div>
                      </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {suggestion.reason}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {product.category?.slice(0, 1).map((cat) => (
                        <Badge key={cat} variant="secondary" className="text-[10px]">
                          {cat}
                        </Badge>
                      ))}
                      {product.skin_type?.slice(0, 3).map((type) => (
                        <Badge key={type} variant="outline" className="text-[10px]">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between border-t px-6 py-3">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
            >
              {t("suggestionsModal.selectAll")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDeselectAll}
            >
              {t("suggestionsModal.deselectAll")}
            </Button>
          </div>
          <span className="text-xs text-muted-foreground">
            {selectedIds.size} {t("suggestionsModal.selected")}
          </span>
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" />
            {t("suggestionsModal.cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={selectedIds.size === 0}
          >
            <Check className="mr-2 h-4 w-4" />
            {t("suggestionsModal.addToRoutine")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
