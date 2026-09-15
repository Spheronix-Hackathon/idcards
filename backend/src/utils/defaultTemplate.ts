import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { ITemplateConfiguration, IBase64Image } from '../types';
import { bufferToBase64Image } from './base64';

// Search locations for the official template image provided by user (prioritizing deafult.png)
const TEMPLATE_PATHS = [
  path.resolve(__dirname, '../../../frontend/image/deafult.png'),
  path.resolve(__dirname, '../../frontend/image/deafult.png'),
  path.resolve(process.cwd(), '../frontend/image/deafult.png'),
  path.resolve(process.cwd(), 'frontend/image/deafult.png'),
  'c:/Users/sudha/Downloads/id/frontend/image/deafult.png',
  path.resolve(__dirname, '../assets/official_template.png'),
  path.resolve(process.cwd(), 'src/assets/official_template.png'),
  path.resolve(__dirname, '../../../frontend/image/ChatGPT Image Sep 15, 2026,.png'),
  path.resolve(__dirname, '../../../frontend/image/ChatGPT Image Sep 15, 2026, 11_14_29 AM.png'),
  path.resolve(process.cwd(), 'template.png')
];

/**
 * Loads the user-provided official template PNG buffer if available.
 */
export const loadOfficialTemplateBuffer = (): { buffer: Buffer; filePath: string } | null => {
  for (const p of TEMPLATE_PATHS) {
    try {
      if (fs.existsSync(p)) {
        const buffer = fs.readFileSync(p);
        console.log(`[Template] Found official template at: ${p}`);
        return { buffer, filePath: p };
      }
    } catch (e) {
      // Continue trying other candidate paths
    }
  }
  return null;
};

/**
 * Generates the official Spheronix Vertical (Portrait) base template SVG (638 x 1012 px)
 * as fallback/vector reproduction.
 */
export const generateVerticalTemplateSvg = (): string => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 638 1012" width="638" height="1012">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="60%" stop-color="#F8FAFF" />
      <stop offset="100%" stop-color="#EFF6FF" />
    </linearGradient>

    <linearGradient id="topBlueWave" x1="0%" y1="0%" x2="100%" y2="80%">
      <stop offset="0%" stop-color="#09388E" />
      <stop offset="50%" stop-color="#0C45A6" />
      <stop offset="100%" stop-color="#1B55B8" />
    </linearGradient>

    <linearGradient id="bottomBlueWave" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#072B70" />
      <stop offset="60%" stop-color="#0B42A0" />
      <stop offset="100%" stop-color="#124FB8" />
    </linearGradient>

    <linearGradient id="cyanBlueRing" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0066FF" />
      <stop offset="50%" stop-color="#00B4D8" />
      <stop offset="100%" stop-color="#0077B6" />
    </linearGradient>

    <pattern id="dotPattern" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.8" fill="#0066FF" fill-opacity="0.25" />
    </pattern>
  </defs>

  <!-- Base Background -->
  <rect width="638" height="1012" fill="url(#bgGradient)" />

  <!-- Top Blue Layered Waves -->
  <path d="M 0,0 L 638,0 L 638,138 C 500,168 380,128 260,146 C 160,162 80,126 0,144 Z" fill="#90E0EF" fill-opacity="0.7" />
  <path d="M 0,0 L 638,0 L 638,124 C 500,152 380,114 260,132 C 160,148 80,114 0,130 Z" fill="url(#topBlueWave)" />

  <!-- Spheronix Header Logo (SPHER-Globe-NIX) -->
  <g transform="translate(110, 85)">
    <text x="0" y="44" font-family="'Montserrat', 'Arial Black', sans-serif" font-size="44" font-weight="900" fill="#6A1B9A" letter-spacing="1">SPHER</text>
    <!-- Globe Circle -->
    <circle cx="225" cy="30" r="28" fill="#0D47A1" />
    <circle cx="225" cy="30" r="26" fill="#1565C0" />
    <path d="M 205,30 Q 225,18 245,30" fill="none" stroke="#FFFFFF" stroke-width="2.5" />
    <path d="M 205,30 Q 225,42 245,30" fill="none" stroke="#FFFFFF" stroke-width="2.5" />
    <ellipse cx="225" cy="30" rx="10" ry="26" fill="none" stroke="#FFFFFF" stroke-width="2.5" />
    <line x1="199" y1="30" x2="251" y2="30" stroke="#FFFFFF" stroke-width="2.5" />
    <text x="260" y="44" font-family="'Montserrat', 'Arial Black', sans-serif" font-size="44" font-weight="900" fill="#6A1B9A" letter-spacing="1">NIX</text>
    <text x="2" y="70" font-family="'Times New Roman', serif" font-size="24" font-weight="700" fill="#0D47A1">Technologies</text>
    <text x="272" y="70" font-family="'Times New Roman', serif" font-size="24" font-weight="700" fill="#0D47A1">Pvt.Ltd</text>
  </g>

  <!-- Left and Right Dot Matrices -->
  <rect x="24" y="240" width="70" height="110" fill="url(#dotPattern)" rx="4" />
  <rect x="544" y="240" width="70" height="110" fill="url(#dotPattern)" rx="4" />

  <!-- Clean Photo Area (Zero Silhouette / Zero Rings - Matching deafult.png) -->


  <!-- Pre-printed Labels with Aligned Colons -->
  <g transform="translate(64, 0)">
    <text x="0" y="604" font-family="'Inter', 'Segoe UI', sans-serif" font-size="18" font-weight="800" fill="#0066FF">Email Address</text>
    <text x="220" y="604" font-family="'Inter', 'Segoe UI', sans-serif" font-size="18" font-weight="800" fill="#0066FF">:</text>

    <text x="0" y="670" font-family="'Inter', 'Segoe UI', sans-serif" font-size="18" font-weight="800" fill="#0066FF">Mobile Number</text>
    <text x="220" y="670" font-family="'Inter', 'Segoe UI', sans-serif" font-size="18" font-weight="800" fill="#0066FF">:</text>

    <text x="0" y="736" font-family="'Inter', 'Segoe UI', sans-serif" font-size="18" font-weight="800" fill="#0066FF">College Name</text>
    <text x="220" y="736" font-family="'Inter', 'Segoe UI', sans-serif" font-size="18" font-weight="800" fill="#0066FF">:</text>

    <text x="0" y="802" font-family="'Inter', 'Segoe UI', sans-serif" font-size="18" font-weight="800" fill="#0066FF">Branch / Department</text>
    <text x="220" y="802" font-family="'Inter', 'Segoe UI', sans-serif" font-size="18" font-weight="800" fill="#0066FF">:</text>
  </g>

  <!-- Bottom Curved Waves -->
  <path d="M 0,870 C 140,845 260,890 390,865 C 500,840 575,870 638,855 L 638,1012 L 0,1012 Z" fill="#90E0EF" fill-opacity="0.8" />
  <path d="M 0,885 C 140,860 260,905 390,880 C 500,855 575,885 638,870 L 638,1012 L 0,1012 Z" fill="url(#bottomBlueWave)" />

  <!-- Bottom Footer Branding -->
  <g transform="translate(319, 948)">
    <text x="0" y="0" text-anchor="middle" font-family="'Montserrat', Arial, sans-serif" font-size="17" font-weight="900" fill="#FFFFFF" letter-spacing="2">SPHERONIX TECHNOLOGIES PVT.LTD</text>
    <text x="0" y="24" text-anchor="middle" font-family="'Inter', sans-serif" font-size="13" font-weight="800" fill="#00F0FF" letter-spacing="3.5">TEMPORARY ID CARD</text>
  </g>
</svg>`;
};

/**
 * Returns the active default template configuration (Vertical Portrait).
 */
export const DEFAULT_VERTICAL_TEMPLATE_CONFIG: ITemplateConfiguration = {
  width: 638,
  height: 1012,
  photo: {
    x: 214, // (638 - 210) / 2 = 214 (centered at X = 319)
    y: 213, // centered at Y = 318 in the clean photo area
    width: 210,
    height: 210,
    radius: 105
  },
  name: {
    x: 319,
    y: 492,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0A2540',
    maxLines: 1
  },
  studentId: {
    x: 179,
    y: 834,
    width: 280,
    height: 42,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A3B8B'
  },
  email: {
    x: 310,
    y: 586, // aligned with colon baseline in deafult.png
    fontSize: 17,
    color: '#1E293B',
    lineHeight: 22
  },
  mobile: {
    x: 310,
    y: 653, // aligned with colon baseline in deafult.png
    fontSize: 17,
    color: '#1E293B',
    lineHeight: 22
  },
  college: {
    x: 310,
    y: 721, // aligned with colon baseline in deafult.png
    width: 290,
    fontSize: 17,
    color: '#1E293B',
    lineHeight: 22,
    maxLines: 2
  },
  branch: {
    x: 310,
    y: 796, // aligned with colon baseline in deafult.png
    width: 290,
    fontSize: 17,
    color: '#1E293B',
    lineHeight: 22,
    maxLines: 2
  }
};

/**
 * Horizontal (Landscape) configuration matching the previous landscape format.
 */
export const DEFAULT_HORIZONTAL_TEMPLATE_CONFIG: ITemplateConfiguration = {
  width: 1012,
  height: 638,
  photo: {
    x: 48,
    y: 165,
    width: 224,
    height: 224,
    radius: 112
  },
  name: {
    x: 310,
    y: 198,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#091E42',
    maxLines: 1
  },
  email: {
    x: 310,
    y: 254,
    fontSize: 16,
    color: '#1E293B'
  },
  mobile: {
    x: 310,
    y: 298,
    fontSize: 16,
    color: '#1E293B'
  },
  college: {
    x: 310,
    y: 342,
    width: 650,
    fontSize: 16,
    color: '#1E293B'
  },
  branch: {
    x: 310,
    y: 400,
    width: 650,
    fontSize: 16,
    color: '#1E293B'
  },
  studentId: {
    x: 310,
    y: 472,
    width: 270,
    height: 44,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#073B88'
  }
};

export const DEFAULT_TEMPLATE_CONFIG = DEFAULT_VERTICAL_TEMPLATE_CONFIG;

/**
 * Returns rasterized PNG Base64 string for the default vertical template.
 * Prioritizes the user's provided official image file if available!
 */
export const getDefaultVerticalTemplateImage = async (): Promise<IBase64Image> => {
  const official = loadOfficialTemplateBuffer();
  if (official) {
    console.log(`[Template] Successfully loaded official template image from: ${official.filePath}`);
    // Normalize to standard 638 x 1012 resolution
    const normalizedBuffer = await sharp(official.buffer)
      .resize(638, 1012, { fit: 'fill' })
      .png({ quality: 95 })
      .toBuffer();
    return bufferToBase64Image(normalizedBuffer, 'image/png');
  }

  // Fallback to high-resolution vector SVG template
  console.log('[Template] Rendering vector SVG vertical template fallback...');
  const svg = generateVerticalTemplateSvg();
  const pngBuffer = await sharp(Buffer.from(svg))
    .png({ quality: 100 })
    .toBuffer();
  return bufferToBase64Image(pngBuffer, 'image/png');
};

export const generateHorizontalTemplateSvg = (): string => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1012 638" width="1012" height="638">
    <rect width="1012" height="638" fill="#FFFFFF" />
    <path d="M 0,0 L 1012,0 L 1012,72 C 880,98 740,54 530,82 C 330,108 170,52 0,84 Z" fill="#0C45A6" />
  </svg>`;
};

export const getDefaultHorizontalTemplateImage = async (): Promise<IBase64Image> => {
  const svg = generateHorizontalTemplateSvg();
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return bufferToBase64Image(pngBuffer, 'image/png');
};

export const getDefaultTemplateImage = getDefaultVerticalTemplateImage;
export const generateDefaultTemplateSvg = generateVerticalTemplateSvg;
