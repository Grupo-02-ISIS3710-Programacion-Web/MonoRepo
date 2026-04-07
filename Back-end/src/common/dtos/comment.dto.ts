export class CommentCreateDto {
  userId: string;
  comment: string;
}

export class CommentUpdateDto {
  comment?: string;
  upvotes?: string[];
  downvotes?: string[];
}
