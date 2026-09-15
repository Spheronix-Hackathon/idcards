import mongoose, { Schema, Document } from 'mongoose';
import { AdminRole } from '../types';

export interface IAdmin extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: Object.values(AdminRole),
      default: AdminRole.ADMIN
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const Admin = mongoose.model<IAdmin>('Admin', AdminSchema);
