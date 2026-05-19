jest.mock('../modules/user/entities/user.entity', () => ({
  User: class User {},
  UserSchema: {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BadRequestException } from '@nestjs/common';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: typeof mockAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('register()', () => {
    const registerDto = {
      nombre: 'Test User',
      email: 'test@example.com',
      contrasenia: 'Password123',
      confirmarContrasenia: 'Password123',
    };

    it('calls service.register with DTO and returns user with token', async () => {
      const expected = {
        nombre: 'Test User',
        email: 'test@example.com',
        token: 'jwt-token-123',
      };
      service.register.mockResolvedValue(expected);

      const result = await controller.register(registerDto as any);

      expect(service.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expected);
    });

    it('propagates BadRequestException on duplicate email', async () => {
      service.register.mockRejectedValue(
        new BadRequestException('Este correo ya está registrado'),
      );

      await expect(
        controller.register(registerDto as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login()', () => {
    const loginDto = {
      email: 'test@example.com',
      contrasenia: 'Password123',
    };

    it('calls service.login with DTO and returns user with token', async () => {
      const expected = {
        user: { nombre: 'Test User', email: 'test@example.com' },
        token: 'jwt-token-123',
      };
      service.login.mockResolvedValue(expected);

      const result = await controller.login(loginDto as any);

      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expected);
    });

    it('propagates BadRequestException on invalid credentials', async () => {
      service.login.mockRejectedValue(
        new BadRequestException('Credenciales inválidas'),
      );

      await expect(controller.login(loginDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getProfile()', () => {
    it('returns user from request', () => {
      const req = { user: { id: 'user-123', email: 'test@example.com' } };

      const result = controller.getProfile(req);

      expect(result).toEqual(req.user);
    });
  });
});
