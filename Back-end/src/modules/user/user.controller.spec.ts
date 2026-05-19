jest.mock('./entities/user.entity', () => ({
  User: class User {},
  UserSchema: {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { NotFoundException } from '@nestjs/common';

const mockUserService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const USER_ID = '507f1f77bcf86cd799439011';

const mockUser = {
  _id: USER_ID,
  nombre: 'Test User',
  email: 'test@example.com',
};

describe('UserController', () => {
  let controller: UserController;
  let service: typeof mockUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get(UserService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll()', () => {
    it('calls service.findAll and returns users', async () => {
      service.findAll.mockResolvedValue([mockUser]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockUser]);
    });

    it('returns empty array when no users exist', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne()', () => {
    it('calls service.findOne with id', async () => {
      service.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(USER_ID);

      expect(service.findOne).toHaveBeenCalledWith(USER_ID);
      expect(result).toEqual(mockUser);
    });

    it('propagates NotFoundException from service', async () => {
      service.findOne.mockRejectedValue(
        new NotFoundException(`Usuario con id ${USER_ID} no encontrado`),
      );

      await expect(controller.findOne(USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update()', () => {
    const updateDto = { nombre: 'Updated Name' };

    it('calls service.update with id and DTO', async () => {
      const updated = { ...mockUser, ...updateDto };
      service.update.mockResolvedValue(updated);

      const result = await controller.update(USER_ID, updateDto as any);

      expect(service.update).toHaveBeenCalledWith(USER_ID, updateDto);
      expect(result).toEqual(updated);
    });

    it('propagates NotFoundException if user not found', async () => {
      service.update.mockRejectedValue(
        new NotFoundException(`Usuario con id ${USER_ID} no encontrado`),
      );

      await expect(
        controller.update(USER_ID, updateDto as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove()', () => {
    it('calls service.remove with id and returns message', async () => {
      const response = { message: 'Usuario eliminado correctamente' };
      service.remove.mockResolvedValue(response);

      const result = await controller.remove(USER_ID);

      expect(service.remove).toHaveBeenCalledWith(USER_ID);
      expect(result).toEqual(response);
    });

    it('propagates NotFoundException if user not found', async () => {
      service.remove.mockRejectedValue(
        new NotFoundException(`Usuario con id ${USER_ID} no encontrado`),
      );

      await expect(controller.remove(USER_ID)).rejects.toThrow(NotFoundException);
    });
  });
});
