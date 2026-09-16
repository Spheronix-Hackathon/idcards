import mongoose, { Schema, Document, model } from 'mongoose';
import { AuditAction } from '../types';

export interface IAuditLog extends Document {
  admin?: mongoose.Types.ObjectId;
  student?: mongoose.Types.ObjectId;
  action: AuditAction;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    action: {
      type: String,
      enum: Object.values(AuditAction),
      required: true,
      index: true
    },
    description: {
      type: String,
      required: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false
  }
);

AuditLogSchema.index({ createdAt: -1 });

export const AuditLog = model<IAuditLog>('AuditLog', AuditLogSchema);
