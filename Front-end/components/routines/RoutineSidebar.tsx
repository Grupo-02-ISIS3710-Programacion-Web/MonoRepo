"use client";

import { Product } from "@/types/product";
import RoutineSummary from "./RoutineSummary";

type RoutineSidebarProps = Readonly<{
    addedProducts: Set<string>;
    products: Product[];
    onRemoveProduct?: (productId: string) => void;
}>;

export default function RoutineSidebar({
    addedProducts,
    products,
    onRemoveProduct
}: RoutineSidebarProps) {
    return (
        <div className="hidden md:flex flex-col bg-white rounded-lg p-6 shadow-sm h-fit sticky top-6">
            <RoutineSummary
                addedProducts={addedProducts}
                products={products}
                onRemoveProduct={onRemoveProduct}
            />
        </div>
    );
}
