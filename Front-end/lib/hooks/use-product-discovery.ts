"use client";

import { fetchProducts, getUserFavorites } from "@/lib/api-client";
import { Category, Product, SkinType } from "@/types/product";
import { useCallback, useEffect, useState, useTransition } from "react";
import { useAuthSession } from "@/lib/hooks/use-auth-session";

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
  const { user, refreshSession } = useAuthSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [allBrands, setAllBrands] = useState<string[]>([]);
  const [allIngredients, setAllIngredients] = useState<string[]>([]);
  const [filters, setFilters] = useState<DiscoveryFilters>(defaultFilters);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  


  // Cargar favoritos una sola vez
  useEffect(() => {

    setFavoriteIds(
      new Set(user?.favoriteProductIds ?? [])
    );

  }, [user]);

  useEffect(() => {
    let ignore = false;

    startTransition(async () => {
      try {
        const results = await fetchProducts({
          category: selectedCategory,
          search: searchQueryParam,
          brands: filters.brands,
          skinTypes: filters.skinTypes,
          excludeIngredients: filters.ingredients,
        });

        if (ignore) return;

        setProducts(results);
        setAllBrands(Array.from(new Set(results.map((p) => p.brand))));
        setAllIngredients(Array.from(new Set(results.flatMap((p) => p.ingredients))));
      } catch {
        if (!ignore) setProducts([]);
      }
    });

    return () => { ignore = true; };
  }, [selectedCategory, searchQueryParam, filters]);

  const handleFavoriteSelect = async (productId: string) => {

    try {

      if (!user?.id) return;

      await fetch(
        `http://localhost:3000/users/${user.id}/favorites/${productId}`,
        {
          method: "POST",
        }
      );

      await refreshSession();

    } catch (error) {

      console.error(error);
    }
  };

  const handleFavoriteDeselect = async (productId: string) => {

    try {

      if (!user?.id) return;

      await fetch(
        `http://localhost:3000/users/${user.id}/favorites/${productId}`,
        {
          method: "DELETE",
        }
      );

      await refreshSession();

    } catch (error) {

      console.error(error);
    }
  };

  return {
    filters,
    setFilters,
    filteredProducts: products,
    brands: allBrands,
    ingredients: allIngredients,
    isPending,
    favoriteIds,
    handleFavoriteSelect,
    handleFavoriteDeselect,
  };
}