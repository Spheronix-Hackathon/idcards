import sharp from 'sharp';

/**
 * Generates a high-quality sample student portrait JPEG buffer for automated tests and seeding.
 * Uses an SVG vector portrait rendered into an 800x800 JPEG image.
 */
export const generateSamplePhotoBuffer = async (name = 'Rohit Kumar'): Promise<Buffer> => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1E3A8A" />
        <stop offset="50%" stop-color="#3B82F6" />
        <stop offset="100%" stop-color="#60A5FA" />
      </linearGradient>
      <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0F172A" />
        <stop offset="100%" stop-color="#1E293B" />
      </linearGradient>
    </defs>

    <!-- Background -->
    <rect width="800" height="800" fill="url(#bgGrad)" />

    <!-- Stylized Portrait Silhouette -->
    <!-- Shoulders -->
    <path d="M 160,800 C 160,540 260,500 400,500 C 540,500 640,540 640,800 Z" fill="url(#bodyGrad)" />
    <!-- Neck -->
    <rect x="350" y="420" width="100" height="120" rx="20" fill="#F8D7BE" />
    <!-- Head -->
    <ellipse cx="400" cy="350" rx="140" ry="170" fill="#FADBC8" />
    <!-- Hair -->
    <path d="M 260,350 C 260,180 320,150 400,150 C 480,150 540,180 540,350 C 510,250 470,220 400,220 C 330,220 290,250 260,350 Z" fill="#1E293B" />
    
    <!-- Initials Badge Overlay -->
    <circle cx="400" cy="360" r="75" fill="#0E3A8C" fill-opacity="0.85" />
    <text x="400" y="388" font-family="'Inter', 'Segoe UI', sans-serif" font-size="72" font-weight="900" fill="#FFFFFF" text-anchor="middle">${initials}</text>
  </svg>`;

  return await sharp(Buffer.from(svg))
    .jpeg({ quality: 90 })
    .toBuffer();
};
