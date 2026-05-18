"use client";
import { Product } from "@/types/product";
import { X, ArrowRightCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLocale, useTranslations } from 'next-intl';
type RoutineSummaryProps = Readonly<{
    addedProducts: Set<string>;
    products: Product[];
    onRemoveProduct?: (productId: string) => void;
}>;

export default function RoutineSummary({
    addedProducts,
    products,
    onRemoveProduct
}: RoutineSummaryProps) {
    const locale = useLocale();
    const t = useTranslations("RoutineSummary");
    const routineProducts = products.filter((p) => addedProducts.has(p.id));
    return (
        <div className="flex flex-col h-full gap-4">
            <div>
                <h2 className="text-xl font-bold text-foreground">
                    {t("title")}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    {t("productsCount", { count: routineProducts.length })}
                </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
                {routineProducts.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                        {t("empty")}
                    </p>
                ) : (
                    routineProducts.map((product) => (
                        <div
                            key={product.id}
                            className="flex gap-3 p-3 bg-muted rounded-lg items-start"
                        >
                            <div className="relative w-12 h-16 shrink-0">
                                <img
                                    src={product.image_url[0] || "/producto.jpg"}
                                    alt={product.name}
                                    className="object-contain w-full h-full"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-foreground truncate">
                                    {product.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {product.brand}
                                </p>
                            </div>
                            {onRemoveProduct && (
                                <button
                                    onClick={() => onRemoveProduct(product.id)}
                                    className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>

            {routineProducts.length > 0 && (
                <Link
                    href={{
                        pathname: "/routine/guardar",
                        query: {
                            products: Array.from(addedProducts).join(",")
                        }
                    }}
                >
                    <Button className="w-full">
                        {t("save")} <ArrowRightCircle className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
            )
            }
        </div >
    );
}
