import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '2ea290b9ed1a115df185ff5666289541';
const R2_ENDPOINT =
  process.env.R2_ENDPOINT || `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '';
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'idcard';

export const isR2Configured = (): boolean => {
  return Boolean(R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME);
};

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY
  }
});

export class R2Service {
  /**
   * Uploads an image buffer directly to Cloudflare R2 bucket.
   * Returns the object key path.
   */
  public static async uploadImage(
    key: string,
    buffer: Buffer,
    contentType: string = 'image/jpeg'
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType
    });

    await r2Client.send(command);
    return key;
  }

  /**
   * Retrieves an image buffer from Cloudflare R2 bucket.
   */
  public static async getImage(key: string): Promise<{ buffer: Buffer; contentType: string }> {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key
    });

    const response = await r2Client.send(command);
    const byteArray = await response.Body?.transformToByteArray();
    return {
      buffer: Buffer.from(byteArray || []),
      contentType: response.ContentType || 'image/jpeg'
    };
  }
}
