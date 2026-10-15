import { IBase64Image } from '../types';

export const bufferToBase64Image = (buffer: Buffer, mimeType: string): IBase64Image => {
  const base64 = buffer.toString('base64');
  return {
    data: `data:${mimeType};base64,${base64}`,
    mimeType
  };
};

export const base64ImageToBuffer = (base64Image: IBase64Image | string): { buffer: Buffer; mimeType: string } => {
  const rawString = typeof base64Image === 'string' ? base64Image : base64Image.data;
  const matches = rawString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

  if (matches && matches.length === 3) {
    return {
      mimeType: matches[1],
      buffer: Buffer.from(matches[2], 'base64')
    };
  }

  // Fallback if plain base64 string without data URI prefix
  const mimeType = typeof base64Image === 'object' && base64Image.mimeType ? base64Image.mimeType : 'image/png';
  return {
    mimeType,
    buffer: Buffer.from(rawString, 'base64')
  };
};
