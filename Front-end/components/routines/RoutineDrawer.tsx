"use client";

import { Product } from "@/types/product";
import {
    Drawer,
    DrawerContent,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import RoutineSummary from "./RoutineSummary";
import { useTranslations } from "next-intl";

type RoutineDrawerProps = Readonly<{
    addedProducts: Set<string>;
    products: Product[];
    onRemoveProduct?: (productId: string) => void;
}>;

export default function RoutineDrawer({
    addedProducts,
    products,
    onRemoveProduct
}: RoutineDrawerProps) {
    const t = useTranslations("RoutineDrawer");
    return (
        <div className="fixed bottom-6 right-6 md:hidden z-40">
            <Drawer>
                <DrawerTrigger asChild>
                    <Button
                        className="
                        inline-flex items-center justify-center
                        px-6 py-6
                        rounded-2xl
                        shadow-lg
                        transition-all">
                        <span className="text-lg font-bold">
                            {t("viewRoutine")}
                        </span>
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </DrawerTrigger>
                <DrawerContent className="h-3/4">
                    <div className="p-6 h-full flex flex-col">
                        <RoutineSummary
                            addedProducts={addedProducts}
                            products={products}
                            onRemoveProduct={onRemoveProduct}
                        />
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
