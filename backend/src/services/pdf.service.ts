import PDFDocument from 'pdfkit';
import sharp from 'sharp';
import { IBase64Image } from '../types';
import { base64ImageToBuffer } from '../utils/base64';

export class PdfService {
  /**
   * Generates a high-quality PDF containing the ID card image.
   * Dynamically adapts to Vertical (Portrait) or Horizontal (Landscape)
   * aspect ratios with zero distortion and zero margins.
   */
  public static async generateCardPdf(cardImage: IBase64Image | string): Promise<Buffer> {
    const { buffer: imageBuffer } = base64ImageToBuffer(cardImage);

    // Detect image dimensions to determine orientation
    const metadata = await sharp(imageBuffer).metadata();
    const imgWidth = metadata.width || 638;
    const imgHeight = metadata.height || 1012;
    const isVertical = imgHeight > imgWidth;

    // PDF dimensions in points maintaining exact ratio (standard ID card format)
    const pdfWidth = isVertical ? 319 : 506;
    const pdfHeight = isVertical ? 506 : 319;

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: [pdfWidth, pdfHeight],
        margins: { top: 0, bottom: 0, left: 0, right: 0 }
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Draw ID card image edge-to-edge
      doc.image(imageBuffer, 0, 0, {
        width: pdfWidth,
        height: pdfHeight
      });

      doc.end();
    });
  }
}
