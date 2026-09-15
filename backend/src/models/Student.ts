import mongoose, { Schema, Document } from 'mongoose';
import { StudentStatus, IBase64Image } from '../types';

export interface IStudent extends Document {
  studentId: string;
  fullName: string;
  email: string;
  mobile: string;
  collegeName: string;
  branch: string;
  course?: string;
  rollNumber?: string;
  graduationYear?: string;
  photo: IBase64Image;
  status: StudentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    collegeName: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    branch: {
      type: String,
      required: true,
      trim: true
    },
    course: {
      type: String,
      trim: true,
      default: ''
    },
    rollNumber: {
      type: String,
      trim: true,
      default: ''
    },
    graduationYear: {
      type: String,
      trim: true,
      default: ''
    },
    photo: {
      data: {
        type: String,
        required: true
      },
      mimeType: {
        type: String,
        required: true,
        default: 'image/jpeg'
      }
    },
    status: {
      type: String,
      enum: Object.values(StudentStatus),
      default: StudentStatus.PENDING,
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Compound and search indexes
StudentSchema.index({ createdAt: -1 });
StudentSchema.index({ fullName: 'text', collegeName: 'text', branch: 'text' });

export const Student = mongoose.model<IStudent>('Student', StudentSchema);
