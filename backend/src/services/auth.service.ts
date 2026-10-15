import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { IAuthPayload, AdminRole } from '../types';

export class AuthService {
  private static getJwtSecret(): string {
    return process.env.JWT_SECRET || 'spheronix_secure_jwt_secret_2026_production';
  }

  public static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  public static async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  public static generateToken(payload: IAuthPayload): string {
    return jwt.sign(payload, this.getJwtSecret(), {
      expiresIn: '7d'
    });
  }

  public static verifyToken(token: string): IAuthPayload {
    return jwt.verify(token, this.getJwtSecret()) as IAuthPayload;
  }
}
