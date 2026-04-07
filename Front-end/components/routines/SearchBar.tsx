"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getProducts } from "@/lib/api";
import { Category, Product } from "@/types/product";
import { Button } from "../ui/button";
import { useTranslations } from "next-intl";

type SearchBarProps = Readonly<{
    searchTerm: string;
    selectedCategory: Category | null;
    onSearchChange: (term: string) => void;
    onCategoryChange: (category: Category | null) => void;
    compact?: boolean;
}>;

const formatCategoryName = (category: Category): string => {
    return category
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

export default function SearchBar({
    searchTerm,
    selectedCategory,
    onSearchChange,
    onCategoryChange,
    compact = false
}: SearchBarProps) {
    const [products, setProducts] = useState<Product[]>([]);
    useEffect(() => {
        const products = getProducts();
        setProducts(products);
    }, []);
    const t = useTranslations("SearchBar");
    const availableCategories = useMemo(() => {
        const categorySet = new Set<Category>();
        products.forEach((product) => {
            product.category.forEach((cat) => {
                categorySet.add(cat);
            });
        });
        return Array.from(categorySet);
    }, [products]);

    return (
        <div className={compact ? "w-full rounded-xl border p-3" : "w-full bg-white rounded-2xl p-6 shadow-sm mb-6"}>
            {/* Search Input */}
            <div className={compact ? "flex items-center gap-2 bg-muted rounded-full px-3 py-2 mb-3" : "flex items-center gap-3 bg-gray-100 rounded-full px-4 py-3 mb-6"}>
                <Search className="w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder={t("placeholder")}
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="bg-transparent flex-1 min-w-0 outline-none text-gray-700 placeholder-gray-400"
                />
            </div>

            <div className="overflow-x-auto flex gap-2 pb-2">
                <Button
                    onClick={() => onCategoryChange(null)}
                    className={`${compact ? "px-4" : "px-6"} py-2 rounded-full font-medium text-sm transition-colors whitespace-nowrap shrink-0 ${selectedCategory === null
                        ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                        : "bg-muted/20 text-foreground hover:bg-secondary"
                        }`}
                >
                    {t("allProducts")}
                </Button>

                {availableCategories.map((category) => (
                    <Button
                        key={category}
                        onClick={() => onCategoryChange(category)}
                        className={`${compact ? "px-4" : "px-6"} py-2 rounded-full font-medium text-sm transition-colors whitespace-nowrap shrink-0 ${selectedCategory === category
                            ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                            : "bg-muted/20 text-foreground hover:bg-secondary"
                            }`}
                    >
                        {formatCategoryName(category)}
                    </Button>
                ))}
            </div>
        </div>
    );
}
