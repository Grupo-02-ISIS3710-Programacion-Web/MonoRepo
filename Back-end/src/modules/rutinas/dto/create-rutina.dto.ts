export class CreateRutinaDto {
    userId: string;
    name: string;
    description: string;
    publishedAt?: string;
    type: string;
    skinType: string;
    steps: {
        id: string;
        name: string;
        order: number;
        productId: string;
        product?: object;
        notes?: string;
    }[];
    comments?: object[];
    upvotes?: string[];
    downvotes?: string[];
}
