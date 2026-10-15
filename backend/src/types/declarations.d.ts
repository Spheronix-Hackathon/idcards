// Ambient type declarations for backend dependencies before node_modules are populated
declare module 'mongoose' {
  const mongoose: any;
  export = mongoose;
  export type Schema = any;
  export type Document = any;
}

declare module 'express' {
  const express: any;
  export = express;
  export type Request = any;
  export type Response = any;
  export type NextFunction = any;
  export type Express = any;
  export type Router = any;
}

declare module 'express-rate-limit' {
  const rateLimit: any;
  export default rateLimit;
}

declare module 'cors' {
  const cors: any;
  export default cors;
}

declare module 'helmet' {
  const helmet: any;
  export default helmet;
}

declare module 'dotenv' {
  export function config(options?: any): any;
}

declare module 'bcrypt' {
  export function hash(data: any, saltOrRounds: any): Promise<string>;
  export function compare(data: any, encrypted: string): Promise<boolean>;
}

declare module 'jsonwebtoken' {
  export function sign(payload: any, secretOrPrivateKey: any, options?: any): string;
  export function verify(token: string, secretOrPublicKey: any, options?: any): any;
}

declare module 'multer' {
  const multer: any;
  export = multer;
  export type FileFilterCallback = any;
}

declare module 'sharp' {
  const sharp: any;
  export = sharp;
  export type Metadata = any;
}

declare module 'pdfkit' {
  const PDFDocument: any;
  export = PDFDocument;
}

declare module 'fs' {
  const fs: any;
  export = fs;
}

declare module 'path' {
  const path: any;
  export = path;
}

declare module 'zod' {
  export const z: any;
}

declare module 'stream' {
  export class Readable {
    push(chunk: any): boolean;
    pipe(dest: any): any;
  }
}
