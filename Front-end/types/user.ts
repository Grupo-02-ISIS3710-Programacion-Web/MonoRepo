export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
  login: string;
  password: string;
  city: string;
  skinType: string;
  bio: string;
  reviewCount: number;
  favoriteProductIds: string[];
  createdRoutineIds: string[];
}
