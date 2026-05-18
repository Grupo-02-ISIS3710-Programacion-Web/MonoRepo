import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

const mockUploadService = {
  uploadAvatar: jest.fn(),
};

describe('UploadController', () => {
  let controller: UploadController;
  let service: typeof mockUploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [{ provide: UploadService, useValue: mockUploadService }],
    }).compile();

    controller = module.get<UploadController>(UploadController);
    service = module.get(UploadService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('uploadAvatar()', () => {
    const fakeFile = {
      buffer: Buffer.from('test-image'),
      originalname: 'avatar.jpg',
    } as Express.Multer.File;

    it('calls service.uploadAvatar with file and returns url', async () => {
      const expectedUrl = 'https://res.cloudinary.com/test/avatar.jpg';
      service.uploadAvatar.mockResolvedValue(expectedUrl);

      const result = await controller.uploadAvatar(fakeFile);

      expect(service.uploadAvatar).toHaveBeenCalledWith(fakeFile);
      expect(result).toEqual({ url: expectedUrl });
    });

    it('propagates errors from service', async () => {
      service.uploadAvatar.mockRejectedValue(new Error('Upload failed'));

      await expect(controller.uploadAvatar(fakeFile)).rejects.toThrow(
        'Upload failed',
      );
    });
  });
});
