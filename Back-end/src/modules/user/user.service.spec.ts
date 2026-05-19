jest.mock('./entities/user.entity', () => ({
  User: class User {},
  UserSchema: {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';

const createModelMock = () => {
  const modelMock = {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    findByIdAndDelete: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };
  return modelMock;
};

const USER_ID = '507f1f77bcf86cd799439011';

const mockUser = {
  _id: USER_ID,
  nombre: 'Test User',
  email: 'test@example.com',
  contrasenia: 'hashed-password',
};

describe('UserService', () => {
  let service: UserService;
  const modelMock = createModelMock();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getModelToken('User'), useValue: modelMock },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll()', () => {
    it('returns all users excluding contrasenia', async () => {
      modelMock.exec.mockResolvedValue([mockUser]);

      const result = await service.findAll();

      expect(modelMock.find).toHaveBeenCalled();
      expect(modelMock.select).toHaveBeenCalledWith('-contrasenia');
      expect(result).toEqual([mockUser]);
    });

    it('returns empty array when no users', async () => {
      modelMock.exec.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne()', () => {
    it('returns user when found', async () => {
      modelMock.exec.mockResolvedValue(mockUser);

      const result = await service.findOne(USER_ID);

      expect(modelMock.findById).toHaveBeenCalledWith(USER_ID);
      expect(modelMock.select).toHaveBeenCalledWith('-contrasenia');
      expect(result).toEqual(mockUser);
    });

    it('throws NotFoundException when user not found', async () => {
      modelMock.exec.mockResolvedValue(null);

      await expect(service.findOne(USER_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update()', () => {
    const updateDto = { nombre: 'Updated' };

    it('updates and returns user when found', async () => {
      const updated = { ...mockUser, ...updateDto };
      modelMock.exec.mockResolvedValue(updated);

      const result = await service.update(USER_ID, updateDto);

      expect(modelMock.findByIdAndUpdate).toHaveBeenCalledWith(
        USER_ID,
        updateDto,
        { new: true },
      );
      expect(modelMock.select).toHaveBeenCalledWith('-contrasenia');
      expect(result).toEqual(updated);
    });

    it('throws NotFoundException when user not found', async () => {
      modelMock.exec.mockResolvedValue(null);

      await expect(
        service.update(USER_ID, updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove()', () => {
    it('deletes and returns success message when user found', async () => {
      modelMock.exec.mockResolvedValue(mockUser);

      const result = await service.remove(USER_ID);

      expect(modelMock.findByIdAndDelete).toHaveBeenCalledWith(USER_ID);
      expect(result).toEqual({ message: 'Usuario eliminado correctamente' });
    });

    it('throws NotFoundException when user not found', async () => {
      modelMock.exec.mockResolvedValue(null);

      await expect(service.remove(USER_ID)).rejects.toThrow(NotFoundException);
    });
  });
});
