import sharp from 'sharp';
import { IBase64Image } from '../types';
import { bufferToBase64Image } from '../utils/base64';

// Optimize Sharp memory & concurrency for low-memory cloud tiers (prevents Render OOM crashes)
sharp.cache({ memory: 50, files: 20, items: 100 });
sharp.concurrency(2);

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export class PhotoService {
  /**
   * Validates and processes uploaded student photograph.
   * Performs deep inspection with Sharp to verify valid raster image data.
   * Resizes image to maximum 800x800, optimizes compression, and returns Base64.
   */
  public static async processStudentPhoto(buffer: Buffer, declaredMimeType: string): Promise<IBase64Image> {
    if (!ALLOWED_MIME_TYPES.includes(declaredMimeType.toLowerCase())) {
      throw new Error('Unsupported image format. Allowed formats: JPEG, JPG, PNG, WEBP.');
    }

    let metadata: sharp.Metadata;
    try {
      metadata = await sharp(buffer).metadata();
    } catch (err) {
      throw new Error('Invalid or corrupted image file.');
    }

    if (!metadata.format || !['jpeg', 'png', 'webp'].includes(metadata.format)) {
      throw new Error('Image format verification failed. Vector (SVG) and non-standard image types are rejected.');
    }

    // Resize image maintaining aspect ratio within 800x800 boundary
    const processedBuffer = await sharp(buffer)
      .resize({
        width: 800,
        height: 800,
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 85
      })
      .toBuffer();

    return bufferToBase64Image(processedBuffer, 'image/jpeg');
  }

  /**
   * Prepares a circular cropped photo buffer matching target diameter.
   * Uses an SVG circular mask with alpha transparency for seamless compositing.
   */
  public static async createCircularPhoto(photoBuffer: Buffer, diameter: number): Promise<Buffer> {
    const radius = Math.floor(diameter / 2);

    // SVG alpha mask for circular clipping
    const circleSvg = Buffer.from(
      `<svg width="${diameter}" height="${diameter}">
        <circle cx="${radius}" cy="${radius}" r="${radius}" fill="#FFFFFF" />
      </svg>`
    );

    // Single-pass direct crop, mask & PNG encode (10x faster)
    return await sharp(photoBuffer)
      .resize(diameter, diameter, {
        fit: 'cover',
        position: 'center'
      })
      .composite([
        {
          input: circleSvg,
          blend: 'dest-in'
        }
      ])
      .png({ compressionLevel: 4 })
      .toBuffer();
  }
}
