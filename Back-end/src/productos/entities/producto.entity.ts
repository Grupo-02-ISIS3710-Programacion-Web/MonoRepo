import { Category, ProductType, SkinType } from "src/enums/enums";

export class Producto {
    id!: string;
    name!: string;
    brand!: string;
    description!: string;
    skin_type!: SkinType[];
    product_type!: ProductType;
    category!: Category[];
    ingredients!: string[];
    rating!: number;
    review_count!: number;
    image_url!: string[];
}
