"use client";

import { getProducts } from "@/lib/api";
import { productsFavorites } from "@/lib/favorites";
import { normalizeSearchText } from "@/lib/string-utils";
import { Category, Product, SkinType } from "@/types/product";
import { useCallback, useMemo, useState } from "react";

type DiscoveryFilters = {
    skinTypes: SkinType[];
    brands: string[];
    ingredients: string[];
};

const defaultFilters: DiscoveryFilters = {
    skinTypes: [],
    brands: [],
    ingredients: [],
};

export function useProductDiscovery(selectedCategory: Category | "ALL", searchQueryParam = "") {
    const products = getProducts();
    const searchQuery = normalizeSearchText(searchQueryParam);
    const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
    const [filters, setFilters] = useState<DiscoveryFilters>(defaultFilters);

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesCategory =
                selectedCategory === "ALL" ||
                product.category.includes(selectedCategory as Category);

            const matchesBrand =
                filters.brands.length === 0 || filters.brands.includes(product.brand);

            const productSkinTypes = product.skin_type || [];
            const matchesSkinType =
                filters.skinTypes.length === 0 ||
                filters.skinTypes.some((skin) => productSkinTypes.includes(skin));

            const productIngredients = product.ingredients || [];
            const hasExcludedIngredient = filters.ingredients.some((excluded) =>
                productIngredients.includes(excluded)
            );

            const searchableFields = [
                product.name,
                product.brand,
                ...productIngredients,
                ...productSkinTypes,
                ...product.category,
            ];
            const normalizedSearchableText = normalizeSearchText(searchableFields.join(" "));
            const matchesSearch =
                searchQuery.length === 0 || normalizedSearchableText.includes(searchQuery);

            return (
                matchesCategory &&
                matchesBrand &&
                matchesSkinType &&
                !hasExcludedIngredient &&
                matchesSearch
            );
        });
    }, [filters, products, searchQuery, selectedCategory]);

    const brands = useMemo(
        () => Array.from(new Set(products.map((product) => product.brand))),
        [products]
    );

    const ingredients = useMemo(
        () => Array.from(new Set(products.flatMap((product) => product.ingredients))),
        [products]
    );

    const handleFavoriteSelect = useCallback(
        (productIndex: number) => {
            const selectedProduct = products[productIndex];
            if (!selectedProduct) {
                return;
            }

            setFavoriteProducts((prev) => {
                const exists = prev.some((product) => product.id === selectedProduct.id);
                if (exists) {
                    return prev;
                }

                if (!productsFavorites.some((product) => product.id === selectedProduct.id)) {
                    productsFavorites.push(selectedProduct);
                }

                return [...prev, selectedProduct];
            });
        },
        [products]
    );

    const handleFavoriteDeselect = useCallback(
        (productIndex: number) => {
            const deselectedProduct = products[productIndex];
            if (!deselectedProduct) {
                return;
            }

            setFavoriteProducts((prev) =>
                prev.filter((product) => product.id !== deselectedProduct.id)
            );
        },
        [products]
    );

    return {
        favoriteProducts,
        filters,
        setFilters,
        filteredProducts,
        brands,
        ingredients,
        handleFavoriteSelect,
        handleFavoriteDeselect,
    };
}
