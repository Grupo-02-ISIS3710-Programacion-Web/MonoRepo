"use client";

import { Product } from "@/types/product";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import Image from "next/image";
import StarRating from "./star-rating";
import { Stack } from "@mui/material";
import { FlaskConical, Heart, Smile } from "lucide-react";
import { Button } from "../ui/button";
import { toLowerCaseAndReplaceSpacesWithHyphens } from "@/lib/string-utils";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useProductFavorite } from "@/lib/hooks/use-product-favorite";
import { ReactNode } from "react";

interface ProductCardProps {
    productIndex: number;
    product: Product;
    onFavoriteSelect?: (productIndex: number) => void;
    onFavoriteDeselect?: (productIndex: number) => void;
    showFavoriteButton?: boolean;
    action?: ReactNode;
    className?: string;
}

export function ProductCard({
    productIndex,
    product,
    onFavoriteSelect = () => undefined,
    onFavoriteDeselect = () => undefined,
    showFavoriteButton = true,
    action,
    className
}: ProductCardProps) {

    const t = useTranslations("ProductCard");
    const productHref = `/descubrir/${toLowerCaseAndReplaceSpacesWithHyphens(product.name)}`;
    const { isFavorite, toggleFavorite } = useProductFavorite({
        product,
        productIndex,
        onFavoriteSelect,
        onFavoriteDeselect,
    });

    return (
        <Card className={`p-0 h-full overflow-hidden ${className ?? ""}`}>
            <Link href={productHref}>
                <CardHeader className="bg-muted/70 p-5 flex items-center justify-center">
                    <div className="flex justify-center items-center w-full h-full">
                        <Image
                            src={product.image_url[0]}
                            alt={product.name}
                            width={250}
                            height={250}
                            unoptimized
                            className="object-cover h-50 w-50 rounded-md"
                        />
                    </div>
                </CardHeader>
            </Link>

            <CardContent className="pb-5">
                <div className="flex flex-row items-center justify-between pb-1">
                    <div className="text-primary font-bold">{product.brand}</div>
                    {showFavoriteButton && (
                        <Button
                            variant={isFavorite ? "secondary" : "outline"}
                            size="sm"
                            className="h-8 px-2 rounded-2xl"
                            onClick={toggleFavorite}
                            aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                        >
                            <Heart size={16} />
                        </Button>
                    )}
                </div>

                <CardTitle>
                    <Link href={productHref}>
                        {product.name}
                    </Link>
                </CardTitle>

                <CardDescription className="mt-3 flex flex-col gap-1">
                    <StarRating
                        rating={product.rating}
                        reviewCount={product.review_count}
                        size={10}
                        className="mb-1"
                    />
                    <div className="flex flex-row gap-1 items-center-safe">
                        <Smile className="text-primary" size={20} />
                        {t("productType")}: {t(`productTypes.${product.product_type}`)}
                    </div>
                    <div className="flex flex-row gap-1 items-center-safe">
                        <FlaskConical className="text-primary" size={20} />
                        {t("keyIngredient")}: {product.ingredients[0]}
                    </div>
                </CardDescription>

                {action ? (
                    <div className="mt-4">
                        {action}
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}