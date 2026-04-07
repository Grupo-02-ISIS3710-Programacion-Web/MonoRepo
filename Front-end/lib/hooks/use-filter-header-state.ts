"use client";

import { SkinType } from "@/types/product";
import { useEffect, useState } from "react";

type Filters = {
    skinTypes: SkinType[];
    brands: string[];
    ingredients: string[];
};

type ChipType = "skinType" | "brand" | "ingredient";
type SelectionType = "skin" | "brand" | "ingredient";

type UseFilterHeaderStateParams = Readonly<{
    onFiltersChange: (filters: Filters) => void;
}>;

export function useFilterHeaderState({ onFiltersChange }: UseFilterHeaderStateParams) {
    const [selectedSkinTypes, setSelectedSkinTypes] = useState<SkinType[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

    useEffect(() => {
        onFiltersChange({
            skinTypes: selectedSkinTypes,
            brands: selectedBrands,
            ingredients: selectedIngredients,
        });
    }, [selectedSkinTypes, selectedBrands, selectedIngredients, onFiltersChange]);

    const updateSelectedItems = (
        selectionType: SelectionType,
        selection: string[],
        skinTypes?: SkinType[]
    ) => {
        if (selectionType === "skin") {
            setSelectedSkinTypes(skinTypes ?? []);
            return;
        }

        if (selectionType === "brand") {
            setSelectedBrands(selection);
            return;
        }

        setSelectedIngredients(selection);
    };

    const handleDeleteChip = (item: string | SkinType, type: ChipType) => {
        if (type === "skinType") {
            setSelectedSkinTypes((prev) => prev.filter((skinType) => skinType !== item));
            return;
        }

        if (type === "brand") {
            setSelectedBrands((prev) => prev.filter((brand) => brand !== item));
            return;
        }

        setSelectedIngredients((prev) => prev.filter((ingredient) => ingredient !== item));
    };

    const resetFilters = () => {
        setSelectedSkinTypes([]);
        setSelectedBrands([]);
        setSelectedIngredients([]);
    };

    return {
        selectedSkinTypes,
        selectedBrands,
        selectedIngredients,
        updateSelectedItems,
        handleDeleteChip,
        resetFilters,
    };
}
