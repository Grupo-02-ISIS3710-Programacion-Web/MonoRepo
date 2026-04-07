"use client";

import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import CardProducto from "@/components/routines/CardProducto";
import RoutineDrawer from "@/components/routines/RoutineDrawer";
import RoutineSidebar from "@/components/routines/RoutineSidebar";
import { Product, Category } from "@/types/product";
import { getProducts } from "@/lib/api";
import SearchBar from "@/components/routines/SearchBar";
import { useTranslations } from "next-intl";

const getProductos = async (): Promise<Product[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(getProducts());
        }, 1000);
    });
};

export default function GridProductos() {
    const [productos, setProductos] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set());
    const t = useTranslations("GridProductos");
    useEffect(() => {
        getProductos().then((data) => {
            setProductos(data);
            setLoading(false);
        });
    }, []);

    const filteredProductos = useMemo(() => {
        return productos.filter((product) => {
            const matchesSearch =
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.product_type.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = !selectedCategory || product.category.includes(selectedCategory);

            return matchesSearch && matchesCategory;
        });
    }, [productos, searchTerm, selectedCategory]);

    const handleAddToRoutine = (product: Product) => {
        if (addedProducts.has(product.id)) {
            toast.info(t("toast.alreadyAdded", { name: product.name }));
            return;
        }

        setAddedProducts((prev) => new Set([...prev, product.id]));
        toast.success(t("toast.added", { name: product.name }));
    };

    const handleRemoveProduct = (productId: string) => {
        setAddedProducts((prev) => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
        });
        const product = productos.find((p) => p.id === productId);
        if (product) {
            toast.success(t("toast.removed", { name: product.name }));
        }
    };

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Search Bar - 3 columns */}
                <div className="lg:col-span-3">
                    <SearchBar
                        searchTerm={searchTerm}
                        selectedCategory={selectedCategory}
                        onSearchChange={setSearchTerm}
                        onCategoryChange={setSelectedCategory}
                    />
                </div>

                <div className="hidden lg:block lg:col-span-2 lg:row-span-2">
                    <RoutineSidebar
                        addedProducts={addedProducts}
                        products={productos}
                        onRemoveProduct={handleRemoveProduct}
                    />
                </div>

                <div className="lg:col-span-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {loading && <p className="text-center">{t("loading")}</p>}
                        {!loading && filteredProductos.length === 0 && (
                            <p className="text-center text-gray-500 col-span-full">
                                {t("noResults")}
                            </p>
                        )}
                        {!loading &&
                            filteredProductos.map((product) => (
                                <CardProducto
                                    key={product.id}
                                    product={product}
                                    onAddToRoutine={() => handleAddToRoutine(product)}
                                    showButton={true}
                                />
                            ))}
                    </div>
                </div>
            </div>

            {/* Mobile Drawer */}
            <RoutineDrawer
                addedProducts={addedProducts}
                products={productos}
                onRemoveProduct={handleRemoveProduct}
            />
        </div>
    );
}