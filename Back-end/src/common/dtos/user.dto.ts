export class UserDto {
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

export class LoginDto {
  identifier: string;
  password: string;
}

export class AuthResponseDto {
  user: UserDto | null;
  success: boolean;
  message?: string;
}
