import { Injectable } from '@nestjs/common';
import { UserDto, AuthResponseDto } from '../../common/dtos/user.dto';
import { MOCK_USERS } from './user.data';

@Injectable()
export class UserService {
  private users: UserDto[] = MOCK_USERS;

  getAll(): UserDto[] {
    return this.users;
  }

  getById(id: string): UserDto | undefined {
    return this.users.find((user) => user.id === id);
  }

  authenticate(identifier: string, password: string): AuthResponseDto {
    const normalizedIdentifier = identifier.trim().toLowerCase();
    const normalizedPassword = password.trim();

    const user = this.users.find((candidate) => {
      const matchesIdentifier =
        candidate.email.toLowerCase() === normalizedIdentifier ||
        candidate.login.toLowerCase() === normalizedIdentifier;

      return matchesIdentifier && candidate.password === normalizedPassword;
    });

    return {
      user: user || null,
      success: !!user,
      message: user ? 'Authentication successful' : 'Invalid credentials',
    };
  }
}
