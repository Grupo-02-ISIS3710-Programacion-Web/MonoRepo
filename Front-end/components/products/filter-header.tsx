"use client";
import { Box, CardContent, Chip, Stack, Typography } from "@mui/material";
import {
    Combobox,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    ComboboxContent,
} from "../ui/combobox";
import { Card } from "../ui/card";
import { SkinType } from "@/types/product";
import { capitalizeFirstLetter } from "@/lib/string-utils";
import { Button } from "../ui/button";
import { useTranslations } from "next-intl";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { useFilterHeaderState } from "@/lib/hooks/use-filter-header-state";

interface FilterHeaderProps {
    brands: string[];
    ingredients: string[];
    productCount: number;
    onFiltersChange: (filters: {
        skinTypes: SkinType[];
        brands: string[];
        ingredients: string[];
    }) => void;
}

interface FilterHeaderDesktopMobileProps {
    brands: string[];
    ingredients: string[];
    productCount: number;
    selectedSkinTypes: SkinType[];
    selectedBrands: string[];
    selectedIngredients: string[];
    updateSelectedItems: (selType: "skin" | "brand" | "ingredient", selection: string[], skinTypes?: SkinType[]) => void;
    resetFilters: () => void;
    handleDeleteChip: (
        item: string | SkinType,
        type: "skinType" | "brand" | "ingredient"
    ) => void;
}

export function FilterHeader({
    brands,
    ingredients,
    productCount,
    onFiltersChange,
}: FilterHeaderProps) {
    const {
        selectedSkinTypes,
        selectedBrands,
        selectedIngredients,
        updateSelectedItems,
        handleDeleteChip,
        resetFilters,
    } = useFilterHeaderState({ onFiltersChange });

    return (
        <>
            <div className="hidden lg:block">
                <FilterHeaderDesktop
                    brands={brands}
                    ingredients={ingredients}
                    productCount={productCount}
                    selectedBrands={selectedBrands}
                    selectedIngredients={selectedIngredients}
                    selectedSkinTypes={selectedSkinTypes}
                    updateSelectedItems={updateSelectedItems}
                    resetFilters={resetFilters}
                    handleDeleteChip={handleDeleteChip}
                />
            </div>
            <div className="block lg:hidden">
                <FilterHeaderMobile
                    brands={brands}
                    ingredients={ingredients}
                    productCount={productCount}
                    selectedBrands={selectedBrands}
                    selectedIngredients={selectedIngredients}
                    selectedSkinTypes={selectedSkinTypes}
                    updateSelectedItems={updateSelectedItems}
                    resetFilters={resetFilters}
                    handleDeleteChip={handleDeleteChip}
                />
            </div>
        </>
    )
}

export function FilterHeaderDesktop({
    brands,
    ingredients,
    productCount,
    selectedSkinTypes,
    selectedBrands,
    selectedIngredients,
    updateSelectedItems,
    resetFilters,
    handleDeleteChip
}: FilterHeaderDesktopMobileProps) {
    const t = useTranslations("FilterHeader");
    const tSkin = useTranslations("SkinTypes");

    const skinTypes = Object.values(SkinType);

    return (
        <Card className="p-0">
            <CardContent className="p-0">
                <Stack
                    direction={"column"}
                    gap={2}
                    flexWrap="wrap"
                    justifyContent={"space-between"}
                    paddingLeft={2}
                    alignContent={"right"}
                >
                    {/* header */}
                    <Stack direction={"row"} gap={2} alignItems={"baseline"} justifyContent={"space-between"}>
                        <Box flexDirection={"column"}>
                            <h2>{t("title")}</h2>
                            <p>{t("description")}</p>
                        </Box>

                        <Typography className="body italic text-muted-foreground px-5">
                            {t("productCount", { count: productCount })}
                        </Typography>
                    </Stack>

                    {/* filters comboboxes */}
                    <Stack direction={"row"} gap={2}>
                        <Combobox
                            items={skinTypes}
                            multiple
                            autoHighlight
                            value={selectedSkinTypes}
                            onValueChange={(value) => updateSelectedItems("skin", [], value)}
                        >
                            <ComboboxInput placeholder={t("filters.skinType")} className="bg-muted/20" />
                            <ComboboxContent>
                                <ComboboxList>
                                    {(item) => (
                                        <ComboboxItem key={item} value={item}>
                                            {tSkin(item)}
                                        </ComboboxItem>
                                    )}
                                </ComboboxList>
                            </ComboboxContent>
                        </Combobox>

                        <Combobox
                            items={brands}
                            multiple
                            autoHighlight
                            value={selectedBrands}
                            onValueChange={(value) => updateSelectedItems("brand", value)}
                        >
                            <ComboboxInput
                                placeholder={t("filters.brand")}
                                className="bg-muted/20"
                            />
                            <ComboboxContent>
                                <ComboboxList>
                                    {(item) => (
                                        <ComboboxItem key={item} value={item}>
                                            {capitalizeFirstLetter(item)}
                                        </ComboboxItem>
                                    )}
                                </ComboboxList>
                            </ComboboxContent>
                        </Combobox>

                        <Combobox
                            items={ingredients}
                            multiple
                            autoHighlight
                            value={selectedIngredients}
                            onValueChange={(value) => updateSelectedItems("ingredient", value)}
                        >
                            <ComboboxInput placeholder={t("filters.excludeIngredients")} className="bg-muted/20" />
                            <ComboboxContent>
                                <ComboboxList>
                                    {(item) => (
                                        <ComboboxItem key={item} value={item}>
                                            {capitalizeFirstLetter(item)}
                                        </ComboboxItem>
                                    )}
                                </ComboboxList>
                            </ComboboxContent>
                        </Combobox>

                        <Button variant={"secondary"} onClick={resetFilters} className="text-sm font-medium">
                            {t("clearFilters")}
                        </Button>
                    </Stack>

                    {/* chips */}
                    <Stack direction={"row"} gap={1} flexWrap="wrap">
                        {selectedSkinTypes.map((skin) => (
                            <Chip
                                sx={{
                                    backgroundColor: "var(--border)",
                                    color: "var(--muted-foreground)",
                                    border: "1px solid var(--border)",
                                    "& .MuiChip-deleteIcon:hover": {
                                        color: "var(--secondary)",
                                    },
                                }}
                                key={skin}
                                label={`${t("chips.skin")} ${tSkin(skin)}`}
                                onDelete={() => handleDeleteChip(skin, "skinType")}
                            />
                        ))}

                        {selectedBrands.map((brand) => (
                            <Chip
                                sx={{
                                    backgroundColor: "var(--border)",
                                    color: "var(--muted-foreground)",
                                    border: "1px solid var(--border)",
                                    "& .MuiChip-deleteIcon:hover": {
                                        color: "var(--secondary)",
                                    },
                                }}
                                key={brand}
                                label={t("chips.brand", { brand: capitalizeFirstLetter(brand) })}
                                onDelete={() => handleDeleteChip(brand, "brand")}
                            />
                        ))}

                        {selectedIngredients.map((ingredient) => (
                            <Chip
                                sx={{
                                    backgroundColor: "var(--border)",
                                    color: "var(--muted-foreground)",
                                    border: "1px solid var(--border)",
                                    "& .MuiChip-deleteIcon:hover": {
                                        color: "var(--secondary)",
                                    },
                                }}
                                key={ingredient}
                                label={t("chips.exclude", {
                                    ingredient: capitalizeFirstLetter(ingredient),
                                })}
                                onDelete={() => handleDeleteChip(ingredient, "ingredient")}
                            />
                        ))}
                    </Stack>
                </Stack>
            </CardContent>

        </Card>
    );
}

export function FilterHeaderMobile({
    brands,
    ingredients,
    productCount,
    selectedSkinTypes,
    selectedBrands,
    selectedIngredients,
    updateSelectedItems,
    resetFilters,
    handleDeleteChip
}: FilterHeaderDesktopMobileProps) {
    const t = useTranslations("FilterHeader");
    const tSkin = useTranslations("SkinTypes");

    const skinTypes = Object.values(SkinType);

    return (
        <Stack
            direction={"column"}
            gap={1}
            flexWrap="wrap"
            justifyContent={"space-between"}
            paddingLeft={2}
            alignContent={"right"}
        >
            {/* header */}
            <Box flexDirection={"column"}>
                <h2>{t("title")}</h2>
                <p>{t("description")}</p>
            </Box>

            <Accordion
                type="single"
                collapsible
                defaultValue="filter"
                className="bg-card px-5 w-full rounded-2xl"
            >
                <AccordionItem value="filter">
                    <AccordionTrigger className="text-muted-foreground text-sm">{t("filter")}</AccordionTrigger>
                    <AccordionContent>
                        <div className="flex flex-col gap-3 justify-center">
                            <Combobox
                                items={skinTypes}
                                multiple
                                autoHighlight
                                value={selectedSkinTypes}
                                onValueChange={(value) => updateSelectedItems("skin", [], value)}
                            >
                                <ComboboxInput placeholder={t("filters.skinType")} className="bg-muted/20 w-full" />
                                <ComboboxContent>
                                    <ComboboxList>
                                        {(item) => (
                                            <ComboboxItem key={item} value={item}>
                                                {tSkin(item)}
                                            </ComboboxItem>
                                        )}
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>

                            <Combobox
                                items={brands}
                                multiple
                                autoHighlight
                                value={selectedBrands}
                                onValueChange={(value) => updateSelectedItems("brand", value)}
                            >
                                <ComboboxInput
                                    placeholder={t("filters.brand")}
                                    className="bg-muted/20 w-full"
                                />
                                <ComboboxContent>
                                    <ComboboxList>
                                        {(item) => (
                                            <ComboboxItem key={item} value={item}>
                                                {capitalizeFirstLetter(item)}
                                            </ComboboxItem>
                                        )}
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>

                            <Combobox
                                items={ingredients}
                                multiple
                                autoHighlight
                                value={selectedIngredients}
                                onValueChange={(value) => updateSelectedItems("ingredient", value)}
                            >
                                <ComboboxInput placeholder={t("filters.excludeIngredients")} className="bg-muted/20 w-full" />
                                <ComboboxContent>
                                    <ComboboxList>
                                        {(item) => (
                                            <ComboboxItem key={item} value={item}>
                                                {capitalizeFirstLetter(item)}
                                            </ComboboxItem>
                                        )}
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>
                            <Button variant={"secondary"} onClick={resetFilters} className="text-sm font-medium">
                                {t("clearFilters")}
                            </Button>
                        </div>

                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <Typography className="body italic text-muted-foreground">
                {t("productCount", { count: productCount })}
            </Typography>
            <Stack direction={"row"} gap={1} flexWrap="wrap">
                {selectedSkinTypes.map((skin) => (
                    <Chip
                        sx={{
                            backgroundColor: "var(--border)",
                            color: "var(--muted-foreground)",
                            border: "1px solid var(--border)",
                            "& .MuiChip-deleteIcon:hover": {
                                color: "var(--secondary)",
                            },
                        }}
                        key={skin}
                        label={`${t("chips.skin")} ${tSkin(skin)}`}
                        onDelete={() => handleDeleteChip(skin, "skinType")}
                    />
                ))}

                {selectedBrands.map((brand) => (
                    <Chip
                        sx={{
                            backgroundColor: "var(--border)",
                            color: "var(--muted-foreground)",
                            border: "1px solid var(--border)",
                            "& .MuiChip-deleteIcon:hover": {
                                color: "var(--secondary)",
                            },
                        }}
                        key={brand}
                        label={t("chips.brand", { brand: capitalizeFirstLetter(brand) })}
                        onDelete={() => handleDeleteChip(brand, "brand")}
                    />
                ))}

                {selectedIngredients.map((ingredient) => (
                    <Chip
                        sx={{
                            backgroundColor: "var(--border)",
                            color: "var(--muted-foreground)",
                            border: "1px solid var(--border)",
                            "& .MuiChip-deleteIcon:hover": {
                                color: "var(--secondary)",
                            },
                        }}
                        key={ingredient}
                        label={t("chips.exclude", {
                            ingredient: capitalizeFirstLetter(ingredient),
                        })}
                        onDelete={() => handleDeleteChip(ingredient, "ingredient")}
                    />
                ))}
            </Stack>
        </Stack>
    )
}