import { Product, SkinType } from "@/types/product";

export type RoutineStepFormData = {
    id: string;
    name: string;
    order: number;
    product: Product;
    notes: string;
};

export type RoutineFormData = {
    name: string;
    description: string;
    type: string;
    skinType: SkinType | "";
    steps: RoutineStepFormData[];
};
