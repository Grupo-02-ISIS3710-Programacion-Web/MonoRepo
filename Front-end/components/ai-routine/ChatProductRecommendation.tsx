"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

type ProductRecommendationProps = {
  product: Product;
  reason: string;
  alternativesDetails?: Product[];
  onAddToRoutine?: (product: Product) => void;
  stepName?: string;
  notes?: string;
};

export default function ChatProductRecommendation({
  product,
  reason,
  alternativesDetails,
  onAddToRoutine,
  stepName,
  notes
}: ProductRecommendationProps) {
  const [showAlternatives, setShowAlternatives] = useState(true);
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    onAddToRoutine?.(product);
    setIsAdded(true);
  };

  // Get first image URL from product
  const getImageUrl = (product: Product): string => {
    const url = product.image_url?.[0];
    if (!url) return "/producto.jpg";
    // If it's already a full URL, return as-is
    if (url.startsWith("http")) return url;
    // Otherwise, prepend API base URL
    return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const mainImageUrl = getImageUrl(product);

  // Helper to get first category as string
  const getFirstCategory = (cat: typeof product.category): string => {
    if (!cat) return "";
    if (Array.isArray(cat)) return cat[0] || "";
    return cat;
  };

  return (
    <Card className="mt-3 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="relative h-16 w-16 flex-shrink-0">
            <Image 
              src={mainImageUrl}
              alt={product.name}
              fill
              className="rounded-md object-cover"
              unoptimized
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold truncate">{product.name}</h4>
            <p className="text-xs text-muted-foreground">{product.brand}</p>
            {product.category && (
              <Badge variant="secondary" className="mt-1 text-[10px]">
                {getFirstCategory(product.category)}
              </Badge>
            )}
            <p className="mt-1 text-xs text-muted-foreground italic">"{reason}"</p>
            
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {!isAdded ? (
                <Button 
                  type="button" 
                  size="sm" 
                  onClick={handleAdd}
                  className="h-7 text-xs"
                >
                  <Check className="mr-1 h-3 w-3" />
                  Add to Routine
                </Button>
              ) : (
                <span className="text-xs text-green-600">✓ Added</span>
              )}
              
              {alternativesDetails && alternativesDetails.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAlternatives(!showAlternatives)}
                  className="h-7 text-xs"
                >
                  {showAlternatives ? (
                    <>
                      <ChevronUp className="mr-1 h-3 w-3" />
                      Hide Alternatives
                    </>
                  ) : (
                    <>
                      <ChevronDown className="mr-1 h-3 w-3" />
                      Alternatives ({alternativesDetails.length})
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {showAlternatives && alternativesDetails && alternativesDetails.length > 0 && (
          <div className="mt-3 space-y-2 border-t pt-3">
            <p className="text-xs font-semibold text-muted-foreground">Alternative Options:</p>
            {alternativesDetails.map((alt) => {
              const altImageUrl = getImageUrl(alt);
              return (
                <div key={alt.id} className="flex items-center gap-2 rounded-lg border p-2">
                  <div className="relative h-10 w-10 flex-shrink-0">
                    <Image 
                      src={altImageUrl}
                      alt={alt.name}
                      fill
                      className="rounded object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{alt.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{alt.brand}</p>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => onAddToRoutine?.(alt)}
                    className="h-6 text-xs flex-shrink-0"
                  >
                    Add
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
