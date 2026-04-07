"use client";

import { Stack } from "@mui/material";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { ButtonGroup } from "../ui/button-group";
import {
    Droplets,
    LayoutDashboard,
    Pipette,
    SoapDispenserDroplet,
    Sparkles,
    SprayCan,
    Sun
} from "lucide-react";

import { Category } from "@/types/product";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface CategoriesCardProps {
    currentCategory?: Category | "ALL";
}

interface CategoriesCardDesktopMobileProps {
    isCategorySelected: (category: Category | "ALL") => boolean;
}

const categories = [
    { icon: <LayoutDashboard />, value: "ALL" },
    { icon: <SoapDispenserDroplet />, value: Category.LIMPIEZA },
    { icon: <Droplets />, value: Category.HIDRATACION },
    { icon: <Pipette />, value: Category.ANTIOXIDANTE },
    { icon: <SprayCan />, value: Category.REPARACION },
    { icon: <Sun />, value: Category.EXFOLIACION },
    { icon: <Sparkles />, value: Category.ANTI_EDAD }
] as const;

export function CategoriesCard({ currentCategory }: CategoriesCardProps) {

    const isSelected = (categoryName: string) => {
        return currentCategory === categoryName;
    };

    return (
        <>
            <div className="hidden lg:block">
                <CategoriesCardDesktop isCategorySelected={isSelected} />
            </div>

            <div className="block lg:hidden">
                <CategoriesCardMobile isCategorySelected={isSelected} />
            </div>
        </>
    );
}

export function CategoriesCardDesktop({ isCategorySelected }: CategoriesCardDesktopMobileProps) {

    const t = useTranslations("CategoriesCard");
    const tCat = useTranslations("Categories");

    return (
        <div className="px-1">
            <Card className="mx-auto px-0">
                <CardHeader>
                    <CardTitle>
                        {t("title")}
                    </CardTitle>
                    <CardDescription>
                        {t("description")}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Stack direction={"column"}>
                        <ButtonGroup orientation="vertical" className="h-full w-full">
                            {categories.map((category, index) => (
                                <Button
                                    key={index}
                                    className={`flex justify-baseline w-full hover:bg-secondary py-5 ${isCategorySelected(category.value)
                                        ? "bg-secondary text-secondary-foreground"
                                        : "bg-muted/20 text-foreground"
                                        }`}
                                    asChild
                                >
                                    <Link
                                        href={category.value === "ALL"
                                            ? "/descubrir"
                                            : `?category=${category.value}`}
                                        className="flex justify-baseline gap-2"
                                    >
                                        {category.icon}
                                        <div>
                                            {tCat(`${category.value}.label`)}
                                        </div>
                                    </Link>
                                </Button>
                            ))}
                        </ButtonGroup>
                    </Stack>
                </CardContent>
            </Card>
        </div>
    );
}

export function CategoriesCardMobile({ isCategorySelected }: CategoriesCardDesktopMobileProps) {

    const tCat = useTranslations("Categories");

    return (
        <div className="px-1 flex justify-begin gap-1 overflow-auto">
            {categories.map((category, index) => (
                <Button
                    key={index}
                    className={`flex justify-baseline w-fit hover:bg-secondary py-5 ${isCategorySelected(category.value)
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted text-foreground"
                        }`}
                    asChild
                >
                    <Link
                        href={category.value === "ALL"
                            ? "/descubrir"
                            : `?category=${category.value}`}
                        className="flex justify-baseline gap-2"
                    >
                        {category.icon}
                        <div>
                            {tCat(`${category.value}.label`)}
                        </div>
                    </Link>
                </Button>
            ))}

        </div>
    );
}