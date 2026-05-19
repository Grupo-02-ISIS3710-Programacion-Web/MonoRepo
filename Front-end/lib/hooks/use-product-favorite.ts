"use client";

import { Product } from "@/types/product";
import { useEffect, useState } from "react";
import {
    addUserFavorite,
    removeUserFavorite,
} from "@/lib/api-client";

import { useAuthSession } from "@/lib/hooks/use-auth-session";

type UseProductFavoriteParams = Readonly<{
    product: Product;
    productIndex: number;
    isFavorite: boolean;
    onFavoriteSelect: (productId: string) => Promise<void>;
    onFavoriteDeselect: (productId: string) => Promise<void>;
}>;

export function useProductFavorite({
    product,
    productIndex,
    isFavorite: initialIsFavorite,
    onFavoriteSelect,
    onFavoriteDeselect,
}: UseProductFavoriteParams) {

    const { user } = useAuthSession();

    const [isFavorite, setIsFavorite] =
        useState(initialIsFavorite);

    useEffect(() => {
        setIsFavorite(initialIsFavorite);
    }, [initialIsFavorite]);

    const toggleFavorite = async () => {

        if (!user?.id) return;

        const next = !isFavorite;

        setIsFavorite(next);

        try {

            if (next) {

                await addUserFavorite(
                    user.id,
                    product.id,
                );

                await onFavoriteSelect(product.id);

            } else {

                await removeUserFavorite(
                    user.id,
                    product.id,
                );

                await onFavoriteDeselect(product.id);
            }

        } catch (err) {

            console.error(
                "Error al actualizar favorito:",
                err,
            );

            setIsFavorite(!next);
        }
    };

    return {
        isFavorite,
        toggleFavorite,
        productIndex,
    };
}