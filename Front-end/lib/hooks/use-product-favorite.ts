"use client";

import { productsFavorites } from "@/lib/favorites";
import { Product } from "@/types/product";
import { useState } from "react";

type UseProductFavoriteParams = Readonly<{
    product: Product;
    productIndex: number;
    onFavoriteSelect: (productIndex: number) => void;
    onFavoriteDeselect: (productIndex: number) => void;
}>;

export function useProductFavorite({
    product,
    productIndex,
    onFavoriteSelect,
    onFavoriteDeselect,
}: UseProductFavoriteParams) {
    const [isFavorite, setIsFavorite] = useState(
        productsFavorites.some((favoriteProduct) => favoriteProduct.id === product.id)
    );

    const toggleFavorite = () => {
        const next = !isFavorite;
        setIsFavorite(next);

        if (next) {
            onFavoriteSelect(productIndex);
            return;
        }

        onFavoriteDeselect(productIndex);
    };

    return {
        isFavorite,
        toggleFavorite,
    };
}
