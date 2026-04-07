export interface Comment {
  id: string;
  userId: string;
  comment: string;
  createdAt?: string;
  upvotes: string[];
  downvotes: string[];
}
