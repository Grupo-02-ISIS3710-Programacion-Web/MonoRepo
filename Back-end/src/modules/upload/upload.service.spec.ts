import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from './upload.service';

jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
    },
  },
}));

import { v2 as cloudinary } from 'cloudinary';

describe('UploadService', () => {
  let service: UploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadService],
    }).compile();

    service = module.get<UploadService>(UploadService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('uploadAvatar()', () => {
    const fakeFile = {
      buffer: Buffer.from('test-image'),
      originalname: 'avatar.jpg',
    } as Express.Multer.File;

    it('uploads file to cloudinary and returns secure_url', async () => {
      const expectedUrl = 'https://res.cloudinary.com/skin4all/avatars/abc123';
      const mockUploadStream = { end: jest.fn() };

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (_options, callback) => {
          callback(null, { secure_url: expectedUrl });
          return mockUploadStream;
        },
      );

      const result = await service.uploadAvatar(fakeFile);

      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        { folder: 'skin4all/avatars' },
        expect.any(Function),
      );
      expect(mockUploadStream.end).toHaveBeenCalledWith(fakeFile.buffer);
      expect(result).toBe(expectedUrl);
    });

    it('rejects when cloudinary returns an error', async () => {
      const mockUploadStream = { end: jest.fn() };
      const cloudinaryError = new Error('Cloudinary error');

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (_options, callback) => {
          callback(cloudinaryError, null);
          return mockUploadStream;
        },
      );

      await expect(service.uploadAvatar(fakeFile)).rejects.toThrow(
        'Cloudinary error',
      );
    });
  });
});
