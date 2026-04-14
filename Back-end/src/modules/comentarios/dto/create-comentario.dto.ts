export class CreateComentarioDto {
    userId!: string;
    comment!: string;
    createdAt!: string;
    upvotes: string[] = [];
    downvotes: string[] = [];
}
