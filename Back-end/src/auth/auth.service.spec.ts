jest.mock('../modules/user/entities/user.entity', () => ({
  User: class User {},
  UserSchema: {},
}));

jest.mock('bcrypt', () => ({
  hashSync: jest.fn(() => 'hashed-password'),
  compareSync: jest.fn(() => true),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

const mockFoundUser = {
  _id: 'user-123',
  email: 'test@example.com',
  contrasenia: 'hashed-password',
  nombre: 'Test User',
  toObject: jest.fn(() => ({
    _id: 'user-123',
    email: 'test@example.com',
    nombre: 'Test User',
    contrasenia: 'hashed-password',
  })),
  save: jest.fn().mockResolvedValue(true),
};

const mockUserModel = jest.fn().mockImplementation(() => mockFoundUser);

Object.assign(mockUserModel, {
  findOne: jest.fn().mockResolvedValue(mockFoundUser),
});

const mockJwtService = {
  sign: jest.fn(() => 'jwt-token-123'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken('User'), useValue: mockUserModel },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register()', () => {
    const registerDto = {
      nombre: 'Test User',
      email: 'test@example.com',
      contrasenia: 'Password123',
      confirmarContrasenia: 'Password123',
    };

    it('creates user and returns user data with token', async () => {
      const result = await service.register(registerDto as any);

      expect(mockUserModel).toHaveBeenCalled();
      expect(mockFoundUser.save).toHaveBeenCalled();
      expect(result).toHaveProperty('token', 'jwt-token-123');
      expect(result).not.toHaveProperty('contrasenia');
    });

    it('throws BadRequestException on duplicate email (code 11000)', async () => {
      const error = { code: 11000, keyPattern: { email: 1 } };
      const modelFn = jest.fn().mockImplementation(() => {
        throw error;
      });
      Object.assign(modelFn, { findOne: jest.fn() });

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AuthService,
          { provide: getModelToken('User'), useValue: modelFn },
          { provide: JwtService, useValue: mockJwtService },
        ],
      }).compile();

      service = module.get<AuthService>(AuthService);

      await expect(service.register(registerDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login()', () => {
    const loginDto = {
      email: 'test@example.com',
      contrasenia: 'Password123',
    };

    it('returns user and token on valid credentials', async () => {
      mockUserModel.findOne.mockResolvedValue(mockFoundUser);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('token', 'jwt-token-123');
      expect(result.user).not.toHaveProperty('contrasenia');
    });

    it('throws when user not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow();
    });

    it('throws on invalid password', async () => {
      mockUserModel.findOne.mockResolvedValue(mockFoundUser);
      const bcrypt = require('bcrypt');
      bcrypt.compareSync.mockReturnValueOnce(false);

      await expect(service.login(loginDto)).rejects.toThrow();
    });
  });
});
