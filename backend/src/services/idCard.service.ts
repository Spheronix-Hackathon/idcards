import sharp from 'sharp';
import { IStudent } from '../models/Student';
import { IIDCardTemplate } from '../models/IDCardTemplate';
import { IBase64Image } from '../types';
import { base64ImageToBuffer, bufferToBase64Image } from '../utils/base64';
import { PhotoService } from './photo.service';

/**
 * Escapes special XML characters for safe embedding inside SVG text tags.
 */
const escapeXml = (unsafe: string): string => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '\'':
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
};

/**
 * Splits text across multiple lines if it exceeds maximum character width.
 */
const wrapText = (text: string, maxCharsPerLine: number, maxLines: number = 2): string[] => {
  if (text.length <= maxCharsPerLine) {
    return [text];
  }

  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + (currentLine ? ' ' : '') + word).length <= maxCharsPerLine) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
      if (lines.length === maxLines - 1) {
        break;
      }
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  return lines;
};

/**
 * Normalizes and formats college/branch text for professional ID card presentation.
 */
const formatField = (str: string): string => {
  const trimmed = (str || '').trim();
  if (!trimmed) return '';
  // Short acronyms (e.g. KVSR, CSE, ECE, IT, MECH, CIVIL, MBA, MCA, AI, ML)
  if (trimmed.length <= 6 || /^[a-zA-Z0-9\s&/-]{2,6}$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  // Title case words
  return trimmed.replace(/\b\w+/g, (word) => {
    if (word.length <= 3 && ['and', 'for', 'the', 'of', 'in'].includes(word.toLowerCase())) {
      return word.toLowerCase();
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
};

export class IDCardService {
  /**
   * Generates the composite ID card PNG image supporting both Vertical (Portrait)
   * and Horizontal (Landscape) official Spheronix layouts.
   * STRICT GUARANTEE: Contains NO QR code, barcode, or scanner markers.
   */
  public static async generateStudentIdCard(
    student: IStudent,
    template: IIDCardTemplate
  ): Promise<IBase64Image> {
    const config = template.configuration;
    const isVertical = config.height > config.width;
    const { buffer: templateBuffer } = base64ImageToBuffer(template.templateImage);
    const { buffer: photoBuffer } = base64ImageToBuffer(student.photo);

    // 1. Process and circular-mask student photo (210px diameter centered in clean photo area)
    const photoDiameter = isVertical ? (config.photo.width || 210) : (config.photo.width || 220);
    const circularPhotoBuffer = await PhotoService.createCircularPhoto(photoBuffer, photoDiameter);

    // 2. Prepare text content with dynamic formatting
    const studentName = escapeXml(student.fullName.toUpperCase());
    const email = escapeXml(student.email);
    const mobile = escapeXml(student.mobile);
    const studentId = escapeXml(student.studentId);
    const formattedCollege = formatField(student.collegeName);
    const formattedBranch = formatField(student.branch);

    let svgOverlay = '';

    if (isVertical) {
      // ----------------------------------------------------
      // VERTICAL (PORTRAIT) CARD LAYOUT (638 x 1012 px)
      // Calibrated to official Spheronix circle-free template
      // ----------------------------------------------------
      const collegeLines = wrapText(formattedCollege, 24, 2);
      const branchLines = wrapText(formattedBranch, 24, 2);
      const emailFontSize = email.length > 28 ? 14 : email.length > 22 ? 15.5 : 17;

      svgOverlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${config.width}" height="${config.height}" viewBox="0 0 ${config.width} ${config.height}">
        <style>
          .name-text-vert {
            font-family: 'Montserrat', 'Inter', 'Segoe UI', Arial, sans-serif;
            font-size: ${studentName.length > 22 ? 19 : studentName.length > 16 ? 21 : 23}px;
            font-weight: 900;
            fill: #0A2540;
            letter-spacing: 0.8px;
            text-anchor: middle;
          }
          .value-text-vert {
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            font-size: 17px;
            font-weight: 700;
            fill: #1E293B;
            letter-spacing: 0.2px;
          }
          .id-badge-bg-vert {
            fill: #FFFFFF;
            stroke: #0066FF;
            stroke-width: 1.8;
          }
          .id-badge-label-vert {
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            font-size: 13.5px;
            font-weight: 800;
            fill: #0066FF;
            letter-spacing: 0.8px;
          }
          .id-badge-value-vert {
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            font-size: 16.5px;
            font-weight: 900;
            fill: #0A3B8B;
            letter-spacing: 1.5px;
          }
        </style>

        <!-- Executive Framing Rings for Student Photo (centered at cx: 319, cy: 318) -->
        <circle cx="319" cy="318" r="105" fill="none" stroke="#FFFFFF" stroke-width="4" />
        <circle cx="319" cy="318" r="107" fill="none" stroke="#0066FF" stroke-width="2.5" />

        <!-- Executive Student Full Name Banner (completely covers placeholder, looks intentional & premium) -->
        <g transform="translate(59, 456)">
          <rect x="0" y="0" width="520" height="58" rx="14" fill="#FFFFFF" stroke="#D0E1F9" stroke-width="1.5" />
          <text x="260" y="37" class="name-text-vert">${studentName}</text>
        </g>

        <!-- Student Details Values (precisely aligned with pre-printed labels & colons) -->
        <text x="310" y="586" class="value-text-vert" font-size="${emailFontSize}px">${email}</text>
        <text x="310" y="653" class="value-text-vert">${mobile}</text>

        <!-- College Name -->
        <g transform="translate(310, 721)">
          ${collegeLines
            .map(
              (line, idx) =>
                `<text x="0" y="${idx * 20}" class="value-text-vert">${escapeXml(line)}</text>`
            )
            .join('')}
        </g>

        <!-- Branch / Department -->
        <g transform="translate(310, 796)">
          ${branchLines
            .map(
              (line, idx) =>
                `<text x="0" y="${idx * 20}" class="value-text-vert">${escapeXml(line)}</text>`
            )
            .join('')}
        </g>

        <!-- Dedicated Official Student ID Badge in bottom white area -->
        <g transform="translate(179, 836)">
          <rect x="0" y="0" width="280" height="42" rx="21" class="id-badge-bg-vert" />
          <text x="140" y="27" text-anchor="middle">
            <tspan class="id-badge-label-vert">STUDENT ID : </tspan>
            <tspan class="id-badge-value-vert">${studentId}</tspan>
          </text>
        </g>
      </svg>`;
    } else {
      // ----------------------------------------------------
      // HORIZONTAL (LANDSCAPE) CARD LAYOUT (1012 x 638 px)
      // Exact reproduction of the provided template image
      // ----------------------------------------------------
      const collegeLines = wrapText(student.collegeName, 42, 2);
      const branchLines = wrapText(student.branch, 42, 2);

      svgOverlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${config.width}" height="${config.height}" viewBox="0 0 ${config.width} ${config.height}">
        <style>
          .name-text {
            font-family: 'Inter', 'Montserrat', Arial, sans-serif;
            font-size: ${studentName.length > 24 ? 22 : 28}px;
            font-weight: 900;
            fill: #091E42;
            letter-spacing: 0.8px;
          }
          .label-text {
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            font-size: 16px;
            font-weight: 700;
            fill: #334155;
          }
          .value-text {
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            font-size: 16px;
            font-weight: 600;
            fill: #0F172A;
          }
          .id-badge-bg {
            fill: #E2EEFF;
            stroke: #9EC5FE;
            stroke-width: 1.5;
          }
          .id-badge-label {
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            font-size: 16px;
            font-weight: 800;
            fill: #1E40AF;
            letter-spacing: 0.5px;
          }
          .id-badge-value {
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            font-size: 18px;
            font-weight: 900;
            fill: #0A3B8B;
            letter-spacing: 1.2px;
          }
        </style>

        <!-- Student Full Name -->
        <text x="${config.name.x}" y="${config.name.y}" class="name-text">${studentName}</text>

        <!-- Email Address -->
        <g transform="translate(${config.email.x}, ${config.email.y})">
          <text x="0" y="0" class="label-text">Email Address</text>
          <text x="180" y="0" class="label-text">:</text>
          <text x="195" y="0" class="value-text">${email}</text>
        </g>

        <!-- Mobile Number -->
        <g transform="translate(${config.mobile.x}, ${config.mobile.y})">
          <text x="0" y="0" class="label-text">Mobile Number</text>
          <text x="180" y="0" class="label-text">:</text>
          <text x="195" y="0" class="value-text">${mobile}</text>
        </g>

        <!-- College Name -->
        <g transform="translate(${config.college.x}, ${config.college.y})">
          <text x="0" y="0" class="label-text">College Name</text>
          <text x="180" y="0" class="label-text">:</text>
          ${collegeLines
            .map(
              (line, idx) =>
                `<text x="195" y="${idx * 22}" class="value-text">${escapeXml(line)}</text>`
            )
            .join('')}
        </g>

        <!-- Branch / Department -->
        <g transform="translate(${config.branch.x}, ${config.branch.y + (collegeLines.length > 1 ? 16 : 0)})">
          <text x="0" y="0" class="label-text">Branch / Department</text>
          <text x="180" y="0" class="label-text">:</text>
          ${branchLines
            .map(
              (line, idx) =>
                `<text x="195" y="${idx * 22}" class="value-text">${escapeXml(line)}</text>`
            )
            .join('')}
        </g>

        <!-- ID Badge Container -->
        <g transform="translate(${config.studentId.x}, ${config.studentId.y + (collegeLines.length > 1 || branchLines.length > 1 ? 16 : 0)})">
          <rect x="0" y="-24" width="280" height="42" rx="10" class="id-badge-bg" />
          <text x="16" y="2" class="id-badge-label">ID :</text>
          <text x="56" y="2" class="id-badge-value">${studentId}</text>
        </g>
      </svg>`;
    }

    const svgOverlayBuffer = Buffer.from(svgOverlay);

    // 3. Composite all layers onto the base template image (photo centered at 319, 318)
    const photoLeft = isVertical ? (config.photo.x ?? 214) : config.photo.x;
    const photoTop = isVertical ? (config.photo.y ?? 213) : config.photo.y;

    const finalCardBuffer = await sharp(templateBuffer)
      .resize(config.width, config.height)
      .composite([
        {
          input: circularPhotoBuffer,
          top: photoTop,
          left: photoLeft
        },
        {
          input: svgOverlayBuffer,
          top: 0,
          left: 0
        }
      ])

      .png({ quality: 95, compressionLevel: 8 })
      .toBuffer();

    return bufferToBase64Image(finalCardBuffer, 'image/png');
  }
}
