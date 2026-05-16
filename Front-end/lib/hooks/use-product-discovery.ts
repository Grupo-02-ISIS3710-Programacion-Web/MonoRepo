"use client";

import { fetchProducts } from "@/lib/api-client";
import { productsFavorites } from "@/lib/favorites";
import { Category, Product, SkinType } from "@/types/product";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

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

export function useProductDiscovery(
  selectedCategory: Category | "ALL",
  searchQueryParam = ""
) {
  const [products, setProducts] = useState<Product[]>([]);
  const [allBrands, setAllBrands] = useState<string[]>([]);
  const [allIngredients, setAllIngredients] = useState<string[]>([]);
  const [filters, setFilters] = useState<DiscoveryFilters>(defaultFilters);
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [isPending, startTransition] = useTransition();

  // Carga inicial sin filtros para poblar brands e ingredientes del FilterHeader
  useEffect(() => {
    fetchProducts().then((all) => {
      setAllBrands(Array.from(new Set(all.map((p) => p.brand))));
      setAllIngredients(Array.from(new Set(all.flatMap((p) => p.ingredients))));
    }).catch(() => {});
  }, []);

  // Cada vez que cambian filtros, categoría o búsqueda → llama al backend
  useEffect(() => {
    startTransition(async () => {
      try {
        const results = await fetchProducts({
          category: selectedCategory,
          search: searchQueryParam,
          brands: filters.brands,
          skinTypes: filters.skinTypes,
          excludeIngredients: filters.ingredients,
        });
        setProducts(results);
      } catch {
        setProducts([]);
      }
    });
  }, [selectedCategory, searchQueryParam, filters]);

  const handleFavoriteSelect = useCallback(
    (productIndex: number) => {
      const selected = products[productIndex];
      if (!selected) return;
      setFavoriteProducts((prev) => {
        if (prev.some((p) => p.id === selected.id)) return prev;
        if (!productsFavorites.some((p) => p.id === selected.id))
          productsFavorites.push(selected);
        return [...prev, selected];
      });
    },
    [products]
  );

  const handleFavoriteDeselect = useCallback(
    (productIndex: number) => {
      const deselected = products[productIndex];
      if (!deselected) return;
      setFavoriteProducts((prev) =>
        prev.filter((p) => p.id !== deselected.id)
      );
    },
    [products]
  );

  return {
    favoriteProducts,
    filters,
    setFilters,
    filteredProducts: products,
    brands: allBrands,
    ingredients: allIngredients,
    isPending,
    handleFavoriteSelect,
    handleFavoriteDeselect,
  };
}