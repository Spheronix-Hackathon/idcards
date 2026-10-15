import { AuditLog } from '../models/AuditLog';
import { AuditAction } from '../types';
import mongoose from 'mongoose';

export class AuditService {
  public static async log(params: {
    action: AuditAction;
    description: string;
    adminId?: string | mongoose.Types.ObjectId;
    studentId?: string | mongoose.Types.ObjectId;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      await AuditLog.create({
        action: params.action,
        description: params.description,
        admin: params.adminId ? new mongoose.Types.ObjectId(params.adminId.toString()) : undefined,
        student: params.studentId ? new mongoose.Types.ObjectId(params.studentId.toString()) : undefined,
        metadata: params.metadata
      });
    } catch (err) {
      console.error('[AuditLog] Failed to record audit log:', err);
    }
  }
}
