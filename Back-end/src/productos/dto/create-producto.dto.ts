import { Category, SkinType } from "src/enums/enums"

export class CreateProductoDto {
    name!: string
    brand!: string
    skin_type!: SkinType[]
    product_type!: string
    primary_category!: Category
    additional_categories?: Category[]
    ingredients!: string[]
    image_url!: string[]
}
