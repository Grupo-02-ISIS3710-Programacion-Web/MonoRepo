jest.mock('@nestjs/axios', () => ({
  HttpService: jest.fn(),
}), { virtual: true });

import { Test, TestingModule } from '@nestjs/testing';
import { SuscripcionesController } from './suscripciones.controller';
import { SuscripcionesService } from './suscripciones.service';

const mockSuscripcionesService = {
  getMerchantInfo: jest.fn(),
  create: jest.fn(),
  getStatus: jest.fn(),
  cancel: jest.fn(),
  chargeAll: jest.fn(),
  handleWebhook: jest.fn(),
};

describe('SuscripcionesController', () => {
  let controller: SuscripcionesController;
  let service: typeof mockSuscripcionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuscripcionesController],
      providers: [
        { provide: SuscripcionesService, useValue: mockSuscripcionesService },
      ],
    }).compile();

    controller = module.get<SuscripcionesController>(SuscripcionesController);
    service = module.get(SuscripcionesService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getMerchantInfo()', () => {
    it('calls service.getMerchantInfo and returns result', async () => {
      const expected = { data: { name: 'Test Merchant' } };
      service.getMerchantInfo.mockResolvedValue(expected);

      const result = await controller.getMerchantInfo();

      expect(service.getMerchantInfo).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });
  });

  describe('create()', () => {
    it('calls service.create with the DTO', async () => {
      const dto = {
        token: 'tok_test',
        acceptanceToken: 'acc_test',
        acceptPersonalAuth: '1',
        payerEmail: 'test@example.com',
        userId: 'user-123',
        transactionAmount: 20000,
        currencyId: 'COP',
      };
      const expected = {
        transactionId: 'tx-001',
        status: 'APPROVED',
        paymentSourceId: 12345,
      };
      service.create.mockResolvedValue(expected);

      const result = await controller.create(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('getStatus()', () => {
    it('calls service.getStatus with userId', async () => {
      service.getStatus.mockResolvedValue({ isPremium: true });

      const result = await controller.getStatus('user-123');

      expect(service.getStatus).toHaveBeenCalledWith('user-123');
      expect(result).toEqual({ isPremium: true });
    });
  });

  describe('cancel()', () => {
    it('calls service.cancel with paymentSourceId', async () => {
      service.cancel.mockResolvedValue({
        message: 'Suscripción cancelada exitosamente',
      });

      const result = await controller.cancel(12345);

      expect(service.cancel).toHaveBeenCalledWith(12345);
      expect(result).toEqual({
        message: 'Suscripción cancelada exitosamente',
      });
    });
  });

  describe('chargeAll()', () => {
    it('calls service.chargeAll and returns result', async () => {
      const expected = {
        total: 2,
        charged: 1,
        failed: 1,
        details: [
          { userId: 'u1', charged: true },
          { userId: 'u2', charged: false },
        ],
      };
      service.chargeAll.mockResolvedValue(expected);

      const result = await controller.chargeAll();

      expect(service.chargeAll).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });
  });

  describe('handleWebhook()', () => {
    it('calls service.handleWebhook with body', async () => {
      const body = { event: 'transaction.updated', data: { transaction: { id: 'tx-001' } } };
      service.handleWebhook.mockResolvedValue({ received: true });

      const result = await controller.handleWebhook(body);

      expect(service.handleWebhook).toHaveBeenCalledWith(body);
      expect(result).toEqual({ received: true });
    });
  });
});
