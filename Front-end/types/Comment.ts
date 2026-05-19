export type Comment = {
  _id?: string;
  id?: string;
  userId: string | { _id: string; nombre: string; avatarUrl: string }; 
  comment: string;
  upvotes: string[];
  downvotes: string[];
  createdAt?: string;
};