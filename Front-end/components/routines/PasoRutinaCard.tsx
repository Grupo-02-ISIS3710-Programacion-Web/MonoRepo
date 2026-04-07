import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import CardProducto from "@/components/routines/CardProducto";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import type { ChangeEvent } from "react";
import { UseFormRegister } from "react-hook-form";
import { useTranslations } from "next-intl";
import { RoutineFormData } from "@/types/routine-form";

type PasoRutinaCardProps = Readonly<{
    index: number;
    totalSteps: number;
    product: Product;
    stepId: string;
    register?: UseFormRegister<RoutineFormData>;
    nameError?: string;
    notesError?: string;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onRemove: () => void;
    nameValue?: string;
    notesValue?: string;
    onNameChange?: (value: string) => void;
    onNotesChange?: (value: string) => void;
}>;

export default function PasoRutinaCard({
    index,
    totalSteps,
    product,
    stepId,
    register,
    nameError,
    notesError,
    onMoveUp,
    onMoveDown,
    onRemove,
    nameValue,
    notesValue,
    onNameChange,
    onNotesChange
}: PasoRutinaCardProps) {
    const t = useTranslations("GuardarRutina.steps");

    const nameFieldProps = register
        ? register(`steps.${index}.name`, {
            required: t("errors.nameRequired"),
            minLength: { value: 2, message: t("errors.nameMin") }
        })
        : {
            value: nameValue ?? "",
            onChange: (event: ChangeEvent<HTMLInputElement>) => onNameChange?.(event.target.value)
        };

    const notesFieldProps = register
        ? register(`steps.${index}.notes`, {
            required: t("errors.descriptionRequired"),
            minLength: { value: 5, message: t("errors.descriptionMin") }
        })
        : {
            value: notesValue ?? "",
            onChange: (event: ChangeEvent<HTMLTextAreaElement>) => onNotesChange?.(event.target.value)
        };

    return (
        <Card className="gap-3">
            <CardContent className="space-y-3 pt-4">
                <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg md:text-xl">{t("stepNumber", { number: index + 1 })}</CardTitle>

                    <div className="flex items-center gap-1">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            onClick={onMoveUp}
                            disabled={index === 0}
                            aria-label="Mover paso arriba"
                        >
                            <ArrowUp />
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            onClick={onMoveDown}
                            disabled={index === totalSteps - 1}
                            aria-label="Mover paso abajo"
                        >
                            <ArrowDown />
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon-sm"
                            onClick={onRemove}
                            aria-label="Eliminar paso"
                        >
                            <Trash2 />
                        </Button>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{t("nameLabel")}</p>
                    <Input
                        {...nameFieldProps}
                        placeholder={t("namePlaceholder")}
                    />
                    {nameError && <p className="text-sm text-red-600">{nameError}</p>}
                </div>

                <CardProducto product={product} showButton={false} compact />

                <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{t("descriptionLabel")}</p>
                    <Textarea
                        {...notesFieldProps}
                        placeholder={t("descriptionPlaceholder")}
                    />
                    {notesError && <p className="text-sm text-red-600">{notesError}</p>}
                </div>
            </CardContent>
        </Card>
    );
}
