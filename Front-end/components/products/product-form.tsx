'use client';
import { Card, CardHeader, CardContent, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Category, SkinType, ProductType } from "@/types/product";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { InputGroup, InputGroupTextarea } from "../ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList, ComboboxTrigger, ComboboxValue, useComboboxAnchor } from "../ui/combobox";
import { Fragment, useState } from "react";

export default function ProductForm() {
    const t = useTranslations("CreateProductPage");
    const tCat = useTranslations("Categories");
    const tProdType = useTranslations("ProductTypes");
    const tSkinType = useTranslations("SkinTypes");
    const categories = Object.values(Category);
    const skinTypes = Object.values(SkinType);
    const productTypes = Object.values(ProductType);
    const [ingredientsRaw, setIngredientsRaw] = useState("");

    const createProductSchema = z.object({
        name: z.string().min(3, { message: t("errors.nameMin") }),
        brand: z.string().min(2, { message: t("errors.brandMin") }),
        description: z.string().min(10, { message: t("errors.descriptionMin") }),
        skin_type: z.array(z.enum(SkinType)).min(1, { message: t("errors.skinTypeRequired") }),
        product_type: z.enum(ProductType, { message: t("errors.productTypeRequired") }),
        primary_category: z.enum(Category, {message: t("errors.primaryCategoryRequired")
        }),
        additional_categories: z.array(z.enum(Category)).optional().default([]),
        ingredients: z.array(z.string().min(2)).min(1, { message: t("errors.ingredientsRequired") }),
        image_url: z.array(z.string().url({ message: t("errors.imageUrlInvalid") })).min(1, {
        message: t("errors.imageUrlRequired"),
        }),
        })
        .refine(
        (data) => !data.additional_categories.includes(data.primary_category),
        {
            message: "La categoría principal no puede estar repetida en las adicionales",
            path: ["additional_categories"]
        }
    );

    
    type FormInput = z.input<typeof createProductSchema>;
    type FormValues = z.output<typeof createProductSchema>;

    function onSubmit(data: FormValues) {
        console.log(data)
        toast.success("Producto enviado para revisión ✅", {
            description: "Un administrador revisará la propuesta."
        })
    }

    const form = useForm<FormInput, unknown, FormValues>({
        resolver: zodResolver(createProductSchema),
        defaultValues: {
            name: "",
            brand: "",
            description: "",
            skin_type: [],
            product_type: undefined,
            primary_category: undefined,
            additional_categories: [],
            ingredients: [],
            image_url: []
        }
    })

    const selectedPrimaryCat = form.watch("primary_category");

    const additionalCategoryOptions = categories.filter((c) => c !== selectedPrimaryCat);

    const anchorCategories = useComboboxAnchor();
    const anchorSkinTypes = useComboboxAnchor();

    return (
        <Card className="w-full md:w-3/4 mx-auto">
            <CardHeader>
                <CardTitle className="text-center text-3xl">{t("title")}</CardTitle>
                <div className="w-full flex justify-center">
                    <CardDescription className="text-center w-11/12">{t("submitDisclaimer")}</CardDescription>
                </div>
            </CardHeader>
            <form id="product-form" onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent>
                    <FieldGroup>

                        <Controller
                        name="name"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                            <FieldLabel className="text-primary" htmlFor="name">
                                {t("productName")}
                            </FieldLabel>
                            <Input
                                {...field}
                                id="name"
                                placeholder={t("productNamePlaceholder")}
                                aria-invalid={fieldState.invalid}
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                            </Field>
                        )}
                        />


                        <Controller
                        name="brand"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel className="text-primary" htmlFor="brand">
                                    {t("brand")}
                                </FieldLabel>

                                <Input
                                    {...field}
                                    id="brand"
                                    placeholder="La Roche Posay"
                                    aria-invalid={fieldState.invalid}
                                />

                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}/>

                        <Controller
                        name="description"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                            <FieldLabel className="text-primary">
                                {t("description")}
                            </FieldLabel>
                            <InputGroup>
                                <InputGroupTextarea
                                {...field}
                                id="description"
                                placeholder={t("descriptionPlaceholder")}
                                rows={3}
                                aria-invalid={fieldState.invalid}
                                />
                            </InputGroup>
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                            </Field>
                        )}
                        />
                        
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* PRIMARY CATEGORY */}

                            <Controller
                            name="primary_category"
                            control={form.control}
                            render={({ field, fieldState }) => (

                                <Field>
                                    <FieldLabel className="text-primary">
                                        {t("primaryCategory")}
                                    </FieldLabel>

                                    <Select 
                                        name={field.name} 
                                        value={field.value} 
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger id="product-form-primary-category" aria-invalid={fieldState.invalid}>
                                            <SelectValue placeholder={t("primaryCategoryPlaceholder")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((c) => (
                                                <SelectItem key={c} value={c}>{tCat(`${c}.label`)}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>

                            )}
                            />

                            {/* ADDITIONAL CATEGORIES */}
                            <Controller
                            name="additional_categories"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                <FieldLabel className="text-primary">{t("additionalCategories")}</FieldLabel>

                                <Combobox
                                    items={additionalCategoryOptions}
                                    multiple
                                    autoHighlight
                                    value={field.value ?? []}
                                    onValueChange={field.onChange}
                                    disabled={!selectedPrimaryCat}
                                >
                                    
                                    <ComboboxChips ref={anchorCategories} className="w-full">
                                        <ComboboxValue>
                                            {(values) => {
                                                const safeValues = Array.isArray(values) ? values : [];

                                                return (
                                                    <>
                                                    {safeValues.map((value: string) => (
                                                        <ComboboxChip key={value}>
                                                        {tCat(`${value}.label`)}
                                                        </ComboboxChip>
                                                    ))}

                                                    <ComboboxChipsInput
                                                        placeholder={safeValues.length === 0 ? t("additionalCategoriesPlaceholder") : ""}
                                                        aria-invalid={fieldState.invalid}
                                                        className="min-w-24 flex-1"
                                                    />
                                                    </>
                                                );
                                                }}
                                        </ComboboxValue>

                                        <ComboboxTrigger className="ml-auto text-muted-foreground" />
                                    </ComboboxChips>

                                    <ComboboxContent anchor={anchorCategories}>
                                    <ComboboxList>
                                        {(item) => (
                                        <ComboboxItem key={item} value={item}>
                                            {tCat(`${item}.label`)}
                                        </ComboboxItem>
                                        )}
                                    </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>

                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                            />
                        </div>
                        
                            
                        <div className="flex flex-col md:flex-row gap-4">
                            
                            {/* Skin Types */}

                            <Controller
                            name="skin_type"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                <FieldLabel className="text-primary">{t("skinTypes")}</FieldLabel>

                                <Combobox
                                    items={skinTypes}
                                    multiple
                                    autoHighlight
                                    value={field.value ?? []}
                                    onValueChange={field.onChange}
                                >
                                    
                                    <ComboboxChips ref={anchorSkinTypes} className="w-full">
                                        <ComboboxValue>
                                            {(values) => (
                                            <Fragment>
                                                {values.map((value: string) => (
                                                <ComboboxChip key={value}>{tSkinType(`${value}`)}</ComboboxChip>
                                                ))}

                                                <ComboboxChipsInput
                                                placeholder={values.length === 0 ? t("skinTypesPlaceholder") : ""}
                                                aria-invalid={fieldState.invalid}
                                                className="min-w-24 flex-1"
                                                />
                                            </Fragment>
                                            )}
                                        </ComboboxValue>

                                        <ComboboxTrigger className="ml-auto text-muted-foreground" />
                                    </ComboboxChips>

                                    <ComboboxContent anchor={anchorSkinTypes}>
                                    <ComboboxList>
                                        {(item) => (
                                        <ComboboxItem key={item} value={item}>
                                            {tSkinType(`${item}`)}
                                        </ComboboxItem>
                                        )}
                                    </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>

                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                            />

                            <Controller
                            name="product_type"
                            control={form.control}
                            render={({ field, fieldState }) => (

                                <Field data-invalid={fieldState.invalid}>

                                    <FieldLabel className="text-primary" htmlFor="product_type">
                                        {t("productType")}
                                    </FieldLabel>

                                    <Combobox
                                        items={productTypes}
                                        value={field.value ?? ""}
                                        onValueChange={field.onChange}
                                        itemToStringLabel={(item: ProductType) => (item ?tProdType(item) : "")}
                                    >
                                        <ComboboxInput
                                        placeholder={t("productTypePlaceholder")}
                                        aria-invalid={fieldState.invalid}
                                        showClear={!!field.value}
                                        />
                                        <ComboboxContent>
                                        <ComboboxList>
                                            {(item) => (
                                            <ComboboxItem key={item} value={item}>
                                                {tProdType(item)}
                                            </ComboboxItem>
                                            )}
                                        </ComboboxList>
                                        </ComboboxContent>
                                    </Combobox>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}

                                </Field>
                            )}
                            />

                        </div>

                    


                    {/* INGREDIENTS */}

                    <Controller
                    name="ingredients"
                    control={form.control}
                    render={({ field, fieldState }) => (

                        <Field data-invalid={fieldState.invalid}>

                        <FieldLabel className="text-primary">
                            {t("ingredients")}
                        </FieldLabel>

                        <InputGroup>

                            <InputGroupTextarea
                            placeholder={t("ingredientsPlaceholder")}
                            rows={3}
                            value={ingredientsRaw}
                            onChange={(e) => setIngredientsRaw(e.target.value)}
                            onBlur={(e) =>
                                field.onChange(
                                    e.target.value
                                    .split(",")
                                    .map((v) => v.trim())
                                    .filter(Boolean)
                                )
                            }
                            />

                        </InputGroup>

                        {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                        )}

                        </Field>

                    )}
                    />


                    {/* IMAGE URL */}

                    <Controller
                    name="image_url"
                    control={form.control}
                    render={({ field, fieldState }) => (

                        <Field data-invalid={fieldState.invalid}>

                        <FieldLabel className="text-primary">
                            {t("imageUrl")}
                        </FieldLabel>

                        <Input
                            placeholder="https://..."
                            value={field.value[0] ?? ""}
                            onChange={(e) =>
                            field.onChange([e.target.value])
                            }
                        />

                        {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                        )}

                        </Field>

                    )}
                    />

                    </FieldGroup>
                </CardContent>
            </form>

            <CardFooter>

                <Field orientation="horizontal">

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            form.reset();
                            setIngredientsRaw("");
                        }}
                    >
                        Reset
                    </Button>

                    <Button
                        type="submit"
                        form="product-form"
                    >
                        Submit
                    </Button>

                </Field>

            </CardFooter>
        </Card>
    )
}