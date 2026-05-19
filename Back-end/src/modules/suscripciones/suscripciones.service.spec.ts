jest.mock('@nestjs/axios', () => ({
  HttpService: jest.fn(),
}), { virtual: true });

import * as crypto from 'crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import {
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { SuscripcionesService } from './suscripciones.service';
import { Suscripcion } from './entities/suscripcion.entity';

const USER_ID = '507f1f77bcf86cd799439011';
const PAYMENT_SOURCE_ID = 12345;
const TRANSACTION_ID = 'txn-001';

const createSuscripcionModelMock = () => {
  const mockDocInstance = {
    _id: 'mock-sub-id',
    save: jest.fn().mockResolvedValue(true),
    userId: USER_ID,
    paymentSourceId: PAYMENT_SOURCE_ID,
    payerEmail: 'test@example.com',
    transactionAmount: 20000,
    currencyId: 'COP',
    active: false,
    status: 'PENDING',
    toString: jest.fn(() => 'mock-sub-id'),
  };
  const modelMock = jest.fn().mockImplementation(() => mockDocInstance);
  Object.assign(modelMock, {
    findOne: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    findOneAndUpdate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  });
  return { modelMock, mockDocInstance };
};

describe('SuscripcionesService', () => {
  let service: SuscripcionesService;
  const { modelMock: mockSuscripcionModel, mockDocInstance } =
    createSuscripcionModelMock();
  const mockUserModel = {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findOneAndUpdate: jest.fn(),
  };
  const mockHttpService = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.IS_PRODUCTION = 'false';
    process.env.WOMPI_PRIVATE_KEY = 'test-private';
    process.env.WOMPI_PUBLIC_KEY = 'test-public';
    process.env.WOMPI_INTEGRITY_SECRET = 'test-integrity';
    process.env.WOMPI_EVENT_SECRET = 'test-event-secret';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuscripcionesService,
        {
          provide: getModelToken(Suscripcion.name),
          useValue: mockSuscripcionModel,
        },
        { provide: getModelToken('User'), useValue: mockUserModel },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<SuscripcionesService>(SuscripcionesService);
  });

  describe('getMerchantInfo()', () => {
    it('fetches merchant info from Wompi', async () => {
      const expected = { data: { name: 'Test Merchant' } };
      mockHttpService.get.mockReturnValue(of({ data: expected }));

      const result = await service.getMerchantInfo();

      expect(mockHttpService.get).toHaveBeenCalledWith(
        expect.stringContaining('/merchants/test-public'),
        { headers: { 'Content-Type': 'application/json' } },
      );
      expect(result).toEqual(expected);
    });
  });

  describe('create()', () => {
    const createDto = {
      token: 'tok_test',
      acceptanceToken: 'acc_test',
      acceptPersonalAuth: '1',
      payerEmail: 'test@example.com',
      userId: USER_ID,
      transactionAmount: 20000,
      currencyId: 'COP',
    };

    const mockUser = {
      _id: USER_ID,
      isPremium: false,
    };

    it('throws NotFoundException if user does not exist', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws BadRequestException if user is already premium', async () => {
      mockUserModel.findById.mockResolvedValue({ ...mockUser, isPremium: true });

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('creates payment source, transaction, and returns result on APPROVED', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser);
      mockHttpService.post
        .mockReturnValueOnce(
          of({ data: { data: { id: PAYMENT_SOURCE_ID } } }),
        )
        .mockReturnValueOnce(
          of({
            data: {
              data: {
                id: TRANSACTION_ID,
                status: 'APPROVED',
              },
            },
          }),
        );

      const result = await service.create(createDto);

      expect(mockHttpService.post).toHaveBeenCalledTimes(2);
      expect(mockSuscripcionModel).toHaveBeenCalled();
      expect(mockDocInstance.save).toHaveBeenCalled();
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(USER_ID, {
        isPremium: true,
        paymentSourceId: PAYMENT_SOURCE_ID,
        subscriptionStatus: 'APPROVED',
      });
      expect(result).toEqual({
        transactionId: TRANSACTION_ID,
        status: 'APPROVED',
        paymentSourceId: PAYMENT_SOURCE_ID,
      });
    });

    it('polls transaction status when PENDING and returns final status', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser);
      mockHttpService.post
        .mockReturnValueOnce(
          of({ data: { data: { id: PAYMENT_SOURCE_ID } } }),
        )
        .mockReturnValueOnce(
          of({
            data: {
              data: {
                id: TRANSACTION_ID,
                status: 'PENDING',
              },
            },
          }),
        );
      mockHttpService.get.mockReturnValue(
        of({ data: { data: { status: 'APPROVED' } } }),
      );

      const result = await service.create(createDto);

      expect(mockHttpService.get).toHaveBeenCalledWith(
        expect.stringContaining(`/transactions/${TRANSACTION_ID}`),
        expect.any(Object),
      );
      expect(result.status).toBe('APPROVED');
    });

    it('throws BadRequestException when transaction is DECLINED', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser);
      mockHttpService.post
        .mockReturnValueOnce(
          of({ data: { data: { id: PAYMENT_SOURCE_ID } } }),
        )
        .mockReturnValueOnce(
          of({
            data: {
              data: {
                id: TRANSACTION_ID,
                status: 'DECLINED',
              },
            },
          }),
        );
      mockHttpService.put.mockReturnValue(of({ data: {} }));

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockHttpService.put).toHaveBeenCalledWith(
        expect.stringContaining(`/payment_sources/${PAYMENT_SOURCE_ID}/void`),
        {},
        expect.any(Object),
      );
    });

    it('throws BadRequestException on Wompi payment source error with message', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser);
      const wompiError = {
        response: {
          data: { error: { reason: 'Invalid token' } },
        },
      };
      mockHttpService.post.mockRejectedValue(wompiError);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws InternalServerErrorException on unknown Wompi error', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser);
      mockHttpService.post.mockRejectedValue(new Error('Network error'));

      await expect(service.create(createDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getStatus()', () => {
    it('returns isPremium true when active subscription exists', async () => {
      mockSuscripcionModel.exec.mockResolvedValue({ active: true });

      const result = await service.getStatus(USER_ID);

      expect(mockSuscripcionModel.findOne).toHaveBeenCalledWith({
        userId: USER_ID,
        active: true,
      });
      expect(result).toEqual({ isPremium: true });
    });

    it('returns user isPremium when no subscription found', async () => {
      mockSuscripcionModel.exec.mockResolvedValue(null);
      mockUserModel.findById.mockResolvedValue({ isPremium: false });

      const result = await service.getStatus(USER_ID);

      expect(result).toEqual({ isPremium: false });
    });

    it('returns false when no subscription and no user found', async () => {
      mockSuscripcionModel.exec.mockResolvedValue(null);
      mockUserModel.findById.mockResolvedValue(null);

      const result = await service.getStatus(USER_ID);

      expect(result).toEqual({ isPremium: false });
    });
  });

  describe('chargeAll()', () => {
    const activeSubscriptions = [
      {
        _id: 'sub-1',
        userId: USER_ID,
        paymentSourceId: PAYMENT_SOURCE_ID,
        payerEmail: 'test@example.com',
        transactionAmount: 20000,
        currencyId: 'COP',
        active: true,
        toString: jest.fn(() => 'sub-1'),
      },
    ];

    it('charges all active subscriptions and returns summary', async () => {
      mockSuscripcionModel.exec.mockResolvedValue(activeSubscriptions);
      mockHttpService.post.mockReturnValue(
        of({
          data: {
            data: { id: TRANSACTION_ID, status: 'APPROVED' },
          },
        }),
      );

      const result = await service.chargeAll();

      expect(result.total).toBe(1);
      expect(result.charged).toBe(1);
      expect(result.failed).toBe(0);
    });

    it('returns failed count for declined transactions', async () => {
      mockSuscripcionModel.exec.mockResolvedValue(activeSubscriptions);
      mockHttpService.post.mockReturnValue(
        of({
          data: {
            data: { id: TRANSACTION_ID, status: 'DECLINED' },
          },
        }),
      );

      const result = await service.chargeAll();

      expect(result.total).toBe(1);
      expect(result.charged).toBe(0);
      expect(result.failed).toBe(1);
    });

    it('handles HTTP errors during charge', async () => {
      mockSuscripcionModel.exec.mockResolvedValue(activeSubscriptions);
      mockHttpService.post.mockRejectedValue(new Error('Wompi down'));

      const result = await service.chargeAll();

      expect(result.total).toBe(1);
      expect(result.charged).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.details[0]).toHaveProperty('error');
    });
  });

  describe('cancel()', () => {
    it('voids payment source and updates subscription and user', async () => {
      mockHttpService.put.mockReturnValue(of({ data: {} }));
      mockSuscripcionModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(true),
      });
      mockUserModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(true),
      });

      const result = await service.cancel(PAYMENT_SOURCE_ID);

      expect(mockHttpService.put).toHaveBeenCalledWith(
        expect.stringContaining(
          `/payment_sources/${PAYMENT_SOURCE_ID}/void`,
        ),
        {},
        expect.any(Object),
      );
      expect(mockSuscripcionModel.findOneAndUpdate).toHaveBeenCalledWith(
        { paymentSourceId: PAYMENT_SOURCE_ID },
        { status: 'VOIDED', active: false },
      );
      expect(mockUserModel.findOneAndUpdate).toHaveBeenCalledWith(
        { paymentSourceId: PAYMENT_SOURCE_ID },
        { isPremium: false, subscriptionStatus: 'cancelled' },
      );
      expect(result).toEqual({
        message: 'Suscripción cancelada exitosamente',
      });
    });

    it('throws BadRequestException on Wompi error', async () => {
      const wompiError = {
        response: {
          data: { message: 'Payment source not found' },
        },
      };
      mockHttpService.put.mockRejectedValue(wompiError);

      await expect(service.cancel(PAYMENT_SOURCE_ID)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws InternalServerErrorException on unknown error', async () => {
      mockHttpService.put.mockRejectedValue(new Error('Network error'));

      await expect(service.cancel(PAYMENT_SOURCE_ID)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('handleWebhook()', () => {
    it('returns received true for non-transaction events', async () => {
      const body = { event: 'merchant.update' };

      const result = await service.handleWebhook(body);

      expect(result).toEqual({ received: true });
      expect(mockSuscripcionModel.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('returns received true when checksum does not match', async () => {
      const body = {
        event: 'transaction.updated',
        signature: {
          properties: [],
          checksum: 'INVALID_CHECKSUM',
        },
        timestamp: '1234567890',
        data: { transaction: { id: TRANSACTION_ID } },
      };

      const result = await service.handleWebhook(body);

      expect(result).toEqual({ received: true });
      expect(mockSuscripcionModel.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('processes webhook with valid signature', async () => {
      const eventSecret = 'test-event-secret';
      const timestamp = '1234567890';
      const concatStr = `${TRANSACTION_ID}${timestamp}${eventSecret}`;
      const validChecksum = crypto
        .createHash('sha256')
        .update(concatStr)
        .digest('hex')
        .toUpperCase();

      const body = {
        event: 'transaction.updated',
        signature: {
          properties: ['transaction.id'],
          checksum: validChecksum,
        },
        timestamp,
        data: {
          transaction: { id: TRANSACTION_ID, status: 'APPROVED' },
        },
      };

      mockSuscripcionModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(true),
      });
      mockSuscripcionModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          userId: USER_ID,
        }),
      });
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(true),
      });

      const result = await service.handleWebhook(body);

      expect(result).toEqual({ received: true });
      expect(mockSuscripcionModel.findOneAndUpdate).toHaveBeenCalledWith(
        { wompiTransactionId: TRANSACTION_ID },
        { status: 'APPROVED', active: true },
      );
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(USER_ID, {
        isPremium: true,
        subscriptionStatus: 'APPROVED',
      });
    });

    it('returns received true when no transaction data', async () => {
      const body = {
        event: 'transaction.updated',
        signature: {
          properties: [],
          checksum: 'ANY_CHECKSUM',
        },
        timestamp: '1234567890',
        data: {},
      };

      const result = await service.handleWebhook(body);

      expect(result).toEqual({ received: true });
    });
  });
});
