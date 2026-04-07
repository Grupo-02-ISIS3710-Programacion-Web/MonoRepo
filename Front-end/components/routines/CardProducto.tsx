import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Product } from "@/types/product";
import { useTranslations } from "next-intl";

type CardProductoProps = Readonly<{
    product: Product;
    onAddToRoutine?: () => void;
    showButton?: boolean;
    compact?: boolean;
}>;

const getCategoryLabel = (category: string): string => {
    const categoryMap: Record<string, string> = {
        hidratacion: "HYDRATION",
        limpieza: "CLEANSER",
        exfoliacion: "EXFOLIANT",
        "anti-edad": "ANTI-AGING",
        reparacion: "REPAIR",
        antioxidante: "ANTIOXIDANT"
    };
    return categoryMap[category] || category.toUpperCase();
};

export default function CardProducto({
    product,
    onAddToRoutine,
    showButton = true,
    compact = false
}: CardProductoProps) {
    const primaryCategory = product.category[0] || "";
    const imageUrl = product.image_url[0] || "/producto.jpg";
    const t = useTranslations("CardProducto");
    return (
        <Card className="w-full bg-white shadow-sm">
            <div className={compact ? "flex items-start px-3 gap-4" : "flex items-start px-4 py-3 gap-4"}>

                {/* Image */}
                <div className={compact ? "relative w-12 h-14 shrink-0" : "relative w-16 h-20 shrink-0"}>
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className="object-contain w-full h-full rounded-md"
                    />
                </div>

                {/* Content */}
                <div className={compact ? "flex-1 min-w-0 flex flex-col gap-2" : "flex-1 min-w-0 flex flex-col gap-3"}>
                    {/* Header with title and badge */}
                    <div className={compact ? "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5" : "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2"}>
                        <div className="flex-1 min-w-0">
                            <h3 className={compact ? "font-semibold text-[15px] md:text-base text-gray-900 leading-tight" : "font-semibold text-lg md:text-xl text-gray-900 leading-tight"}>
                                {product.name}
                            </h3>
                            <p className={compact ? "text-sm md:text-[15px] text-gray-500 mt-0.5 wrap-break-word" : "text-base md:text-lg text-gray-500 mt-0.5 wrap-break-word"}>
                                {product.brand} • {product.product_type}
                            </p>
                        </div>
                        <span className={compact ? "inline-flex self-start w-fit max-w-[85%] px-2 py-0.5 bg-blue-100 text-blue-700 text-xs md:text-sm font-medium rounded uppercase wrap-break-word whitespace-normal" : "inline-flex self-start w-fit max-w-[85%] px-2.5 py-1 bg-blue-100 text-blue-700 text-sm md:text-base font-medium rounded uppercase wrap-break-word whitespace-normal"}>
                            {getCategoryLabel(primaryCategory)}
                        </span>
                    </div>

                    {/* Add to Routine button */}
                    {showButton && (
                        <Button
                            type="button"
                            onClick={onAddToRoutine}
                            disabled={!onAddToRoutine}
                            className="w-full sm:w-fit"
                        >
                            <Plus className="w-4 h-4" />
                            {t("addToRoutine")}
                        </Button>
                    )}
                </div>

            </div>
        </Card>
    );
}