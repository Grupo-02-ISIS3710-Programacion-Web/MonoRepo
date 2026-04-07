import { Category, ProductType, SkinType } from "src/enums/enums"

export class CreateProductoDto {
    name!: string
    brand!: string
    skin_type!: SkinType[]
    description!: string
    product_type!: ProductType
    primary_category!: Category
    additional_categories?: Category[]
    ingredients!: string[]
    image_url!: string[]
}
