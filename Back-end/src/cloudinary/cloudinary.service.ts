/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable }from 'stream';

@Injectable()
export class CloudinaryService {
    constructor(private readonly config: ConfigService) {
        cloudinary.config({
            cloud_name: config.getOrThrow('CLOUDINARY_CLOUD_NAME'),
            api_key:    config.getOrThrow('CLOUDINARY_API_KEY'),
            api_secret: config.getOrThrow('CLOUDINARY_API_SECRET'),
        });
    }


    uploadBuffer(buffer: Buffer, folder: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result) => {
          if (error) {
            return reject(new BadRequestException(`Cloudinary error: ${error.message}`));
          }
          resolve(result.secure_url); 
        },
      );
      Readable.from(buffer).pipe(uploadStream);
    });
  }
}
