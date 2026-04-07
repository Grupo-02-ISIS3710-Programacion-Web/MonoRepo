import { SkinType } from "src/enums/enums";

export class RoutineStep {
    id: string;
    name: string;
    order: number;
    productId: string;
    product?: Product;
    notes?: string;
}

export class Rutina {
    id!: string;
    userId!: string;
    name!: string;
    description!: string;
    publishedAt?: string;
    type!: string;
    skinType!: SkinType;
    steps!: RoutineStep[];
    comments?: Comment[];
    upvotes?: string[];
    downvotes?: string[];
    views?: number;
}
