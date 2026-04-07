"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";

import { getProducts } from "@/lib/api";
import { getRoutineById } from "@/lib/routine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PasoRutinaCard from "@/components/routines/PasoRutinaCard";
import SearchBar from "@/components/routines/SearchBar";
import CardProducto from "@/components/routines/CardProducto";
import { Product, Category, SkinType } from "@/types/product";
import { Routine } from "@/types/routine";
import { RoutineFormData } from "@/types/routine-form";
import { useTranslations } from "next-intl";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import { clearAiRoutineDraft, readAiRoutineDraft } from "@/lib/ai-routine-draft";

type RoutineFormMode = "create" | "edit";

type RoutineFormProps = Readonly<{
    mode: RoutineFormMode;
}>;

const generateId = () => Math.random().toString(36).substring(2, 11);

export default function RoutineForm({ mode }: RoutineFormProps) {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
    const [isProductsDialogOpen, setIsProductsDialogOpen] = useState(false);
    const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(mode === "create");
    const [isRoutineMissing, setIsRoutineMissing] = useState(false);
    const previousProductsSignatureRef = useRef<string>("");
    const searchParams = useSearchParams();

    const tCreate = useTranslations("CrearRutina");
    const tEdit = useTranslations("EditarRutina");
    const tRoutine = useTranslations("GuardarRutina");
    const tSteps = useTranslations("GuardarRutina.steps");
    const tSkin = useTranslations("SkinTypes");
    const { user } = useAuthSession();

    const filteredProducts = useMemo(() => {
        return allProducts.filter((product) => {
            const matchesSearch =
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.product_type.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = !selectedCategory || product.category.includes(selectedCategory);

            return matchesSearch && matchesCategory;
        });
    }, [allProducts, searchTerm, selectedCategory]);

    const selectedProducts = useMemo(() => {
        return allProducts.filter((product) => selectedProductIds.has(product.id));
    }, [allProducts, selectedProductIds]);

    const productsSignature = useMemo(
        () => selectedProducts.map((product) => product.id).join(","),
        [selectedProducts]
    );

    const { control, register, handleSubmit, reset, getValues, setValue, watch, setError, clearErrors, formState: { errors } } = useForm<RoutineFormData>({
        defaultValues: {
            name: "",
            description: "",
            type: "am",
            skinType: "",
            steps: []
        }
    });

    const selectedTimeOfDay = watch("type");

    const { fields, move, remove } = useFieldArray({
        control,
        name: "steps"
    });

    useEffect(() => {
        const products = getProducts();
        setAllProducts(products);

        if (mode === "create") {
            const aiRoutineDraft = readAiRoutineDraft();
            if (aiRoutineDraft) {
                reset(aiRoutineDraft);
                setSelectedProductIds(new Set(aiRoutineDraft.steps.map((step) => step.product.id)));
                previousProductsSignatureRef.current = aiRoutineDraft.steps.map((step) => step.product.id).join(",");
                clearAiRoutineDraft();
                return;
            }

            const preselectedId = searchParams.get("product");
            if (preselectedId && products.some((product) => product.id === preselectedId)) {
                setSelectedProductIds(new Set([preselectedId]));
            }
            return;
        }

        const routineId = searchParams.get("id");
        const routine = routineId ? getRoutineById(routineId) : undefined;

        if (!routine) {
            setIsRoutineMissing(true);
            setIsInitialDataLoaded(true);
            return;
        }

        const routineSteps = routine.steps
            .map((step) => {
                const product = products.find((item) => item.id === step.productId);

                if (!product) {
                    return null;
                }

                return {
                    id: step.id,
                    name: step.name,
                    order: step.order,
                    product,
                    notes: step.notes
                };
            })
            .filter((step): step is RoutineFormData["steps"][number] => step !== null)
            .sort((left, right) => left.order - right.order);

        reset({
            name: routine.name,
            description: routine.description,
            type: routine.type,
            skinType: routine.skinType,
            steps: routineSteps
        });

        setSelectedProductIds(new Set(routineSteps.map((step) => step.product.id)));
        previousProductsSignatureRef.current = routineSteps.map((step) => step.product.id).join(",");
        setIsInitialDataLoaded(true);
    }, [mode, reset, searchParams]);

    useEffect(() => {
        if (!isInitialDataLoaded) {
            return;
        }

        if (previousProductsSignatureRef.current === productsSignature) {
            return;
        }

        const currentValues = getValues();

        reset({
            name: currentValues.name ?? "",
            description: currentValues.description ?? "",
            type: currentValues.type ?? "am",
            skinType: currentValues.skinType ?? "",
            steps: selectedProducts.map((product, index) => {
                const existingStep = currentValues.steps?.find((step) => step.product.id === product.id);

                return {
                    id: existingStep?.id ?? generateId(),
                    name: existingStep?.name ?? "",
                    order: index,
                    product,
                    notes: existingStep?.notes ?? ""
                };
            })
        });

        previousProductsSignatureRef.current = productsSignature;
    }, [getValues, isInitialDataLoaded, productsSignature, reset, selectedProducts]);

    useEffect(() => {
        if (fields.length > 0) {
            clearErrors("steps");
        }
    }, [clearErrors, fields.length]);

    const handleAddToRoutine = (product: Product) => {
        if (selectedProductIds.has(product.id)) {
            toast.info(tRoutine("toast.alreadyAdded", { name: product.name }));
            return;
        }

        setSelectedProductIds((prev) => new Set([...prev, product.id]));
        toast.success(tRoutine("toast.added", { name: product.name }));
    };

    const handleRemoveProduct = (productId: string) => {
        setSelectedProductIds((prev) => {
            const next = new Set(prev);
            next.delete(productId);
            return next;
        });
    };

    const handleMoveUp = (index: number) => {
        if (index > 0) {
            move(index, index - 1);
        }
    };

    const handleMoveDown = (index: number) => {
        if (index < fields.length - 1) {
            move(index, index + 1);
        }
    };

    const handleRemoveStep = (index: number) => {
        const stepProduct = fields[index]?.product as Product | undefined;
        if (stepProduct) {
            handleRemoveProduct(stepProduct.id);
        }
        remove(index);
    };

    const onSubmit = (data: RoutineFormData) => {
        if (data.steps.length === 0) {
            setError("steps", { type: "manual", message: tSteps("errors.atLeastOneStep") });
            return;
        }

        const routineId = searchParams.get("id");
        if (!user) {
            toast.error("Authentication required");
            return;
        }

        const routine: Routine = {
            id: mode === "edit" && routineId ? routineId : generateId(),
            userId: user.id,
            name: data.name,
            description: data.description,
            type: data.type,
            skinType: data.skinType as SkinType,
            steps: data.steps.map((step, index) => ({
                id: step.id,
                name: step.name,
                order: index,
                productId: step.product.id,
                notes: step.notes
            }))
        };

        if (mode === "create") {
            toast.success(tCreate("toasts.created"));
        } else {
            toast.success(tEdit("toasts.saved"));
        }
        console.log(mode === "edit" ? "Routine edited" : "Routine created", routine);
    };

    if (mode === "edit" && isRoutineMissing) {
        return (
            <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
                <Card>
                    <CardContent className="space-y-2 pt-6 text-center">
                        <h1 className="text-2xl font-bold text-foreground">{tEdit("notFoundTitle")}</h1>
                        <p className="text-muted-foreground">{tEdit("notFoundDescription")}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const pageTitle = mode === "edit" ? tEdit("title") : tCreate("title");
    const pageDescription = mode === "edit" ? tEdit("description") : tCreate("description");
    const submitLabel = mode === "edit" ? tEdit("submitButton") : tRoutine("submitButton");
    const stepArrayError = errors.steps as { message?: string } | undefined;

    return (
        <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
            <header className="mb-6 text-center md:mb-8">
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                    {pageTitle}
                </h1>
                <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                    {pageDescription}
                </p>
            </header>
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(320px,380px)_1fr] md:items-start lg:gap-6">
                <div className="space-y-6 md:sticky md:top-6 md:self-start">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl md:text-2xl">{tCreate("routineInfo")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">{tRoutine("infoCard.nameLabel")}</p>
                                <Input
                                    {...register("name", {
                                        required: tRoutine("validation.nameRequired"),
                                        minLength: { value: 3, message: tRoutine("validation.nameMin") }
                                    })}
                                    placeholder={tSteps("routineNamePlaceholder")}
                                />
                                {errors.name?.message && (
                                    <p className="text-sm text-red-600">{errors.name.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">{tRoutine("infoCard.descriptionLabel")}</p>
                                <Textarea
                                    {...register("description", {
                                        required: tRoutine("validation.descriptionRequired"),
                                        minLength: { value: 10, message: tRoutine("validation.descriptionMin") }
                                    })}
                                    placeholder={tRoutine("infoCard.descriptionPlaceholder")}
                                    rows={4}
                                />
                                {errors.description?.message && (
                                    <p className="text-sm text-red-600">{errors.description.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">{tRoutine("infoCard.timeOfDayLabel")}</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        type="button"
                                        variant={selectedTimeOfDay === "am" ? "default" : "outline"}
                                        onClick={() => setValue("type", "am")}
                                    >
                                        {tRoutine("infoCard.timeOfDay.am")}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={selectedTimeOfDay === "pm" ? "default" : "outline"}
                                        onClick={() => setValue("type", "pm")}
                                    >
                                        {tRoutine("infoCard.timeOfDay.pm")}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="routine-skin-type" className="text-sm font-medium text-muted-foreground">
                                    {tRoutine("infoCard.skinTypeLabel")}
                                </label>
                                <select
                                    id="routine-skin-type"
                                    {...register("skinType", {
                                        required: tRoutine("validation.skinTypeRequired")
                                    })}
                                    className="border-input bg-transparent focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                                >
                                    <option value="">{tRoutine("infoCard.skinTypePlaceholder")}</option>
                                    {Object.values(SkinType).map((skinType) => (
                                        <option key={skinType} value={skinType}>
                                            {tSkin(skinType)}
                                        </option>
                                    ))}
                                </select>
                                {errors.skinType?.message && (
                                    <p className="text-sm text-red-600">{errors.skinType.message}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Button type="submit" className="w-full">{submitLabel}</Button>
                </div>

                <div className="space-y-3 md:min-w-0">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{tSteps("title")}</h2>
                        <Dialog open={isProductsDialogOpen} onOpenChange={setIsProductsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button type="button" variant="outline">{tRoutine("infoCard.selectProductsButton")}</Button>
                            </DialogTrigger>
                            <DialogContent className="flex max-h-[90vh] w-[95vw] max-w-[95vw] flex-col overflow-hidden p-4 sm:p-6 lg:max-w-6xl">
                                <DialogHeader>
                                    <DialogTitle>{tRoutine("productDialog.title")}</DialogTitle>
                                </DialogHeader>

                                <div className="flex min-h-0 flex-1 flex-col">
                                    <SearchBar
                                        searchTerm={searchTerm}
                                        selectedCategory={selectedCategory}
                                        onSearchChange={setSearchTerm}
                                        onCategoryChange={setSelectedCategory}
                                        compact
                                    />

                                    <div className="min-h-0 flex-1 overflow-y-auto pr-2">
                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                            {filteredProducts.length === 0 && (
                                                <p className="col-span-full text-center text-muted-foreground">{tRoutine("productDialog.noResults")}</p>
                                            )}

                                            {filteredProducts.map((product) => (
                                                <motion.div
                                                    key={product.id}
                                                    layout="position"
                                                    transition={{ duration: 0.16, ease: "easeInOut" }}
                                                    className="overflow-hidden"
                                                >
                                                    <CardProducto
                                                        product={product}
                                                        onAddToRoutine={() => handleAddToRoutine(product)}
                                                        showButton
                                                        compact
                                                    />
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <p className="text-sm text-muted-foreground">{tRoutine("infoCard.productsSelected", { count: selectedProducts.length })}</p>
                    {stepArrayError?.message && (
                        <p className="text-sm text-red-600">{stepArrayError.message}</p>
                    )}
                    {fields.length === 0 && (
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm text-muted-foreground">{tSteps("empty")}</p>
                            </CardContent>
                        </Card>
                    )}

                    <AnimatePresence initial={false} mode="sync">
                        {fields.map((field, index) => {
                            const product = field.product as Product;

                            return (
                                <motion.div
                                    key={field.id}
                                    layout
                                    initial={{ opacity: 0, y: 1 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 1 }}
                                    transition={{ duration: 0.22, ease: "easeInOut" }}
                                >
                                    <PasoRutinaCard
                                        index={index}
                                        totalSteps={fields.length}
                                        product={product}
                                        stepId={field.id}
                                        register={register}
                                        nameError={errors.steps?.[index]?.name?.message as string | undefined}
                                        notesError={errors.steps?.[index]?.notes?.message as string | undefined}
                                        onMoveUp={() => handleMoveUp(index)}
                                        onMoveDown={() => handleMoveDown(index)}
                                        onRemove={() => handleRemoveStep(index)}
                                    />
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </form>
        </div>
    );
}