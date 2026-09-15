import mongoose, { Schema, Document } from 'mongoose';
import { IBase64Image, StudentStatus } from '../types';

export interface IIDCard extends Document {
  student: mongoose.Types.ObjectId;
  studentId: string;
  template: mongoose.Types.ObjectId;
  templateVersion: string;
  generatedImage: IBase64Image;
  pdfData?: IBase64Image;
  issueDate: Date;
  expiryDate: Date;
  status: StudentStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const IDCardSchema = new Schema<IIDCard>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true
    },
    studentId: {
      type: String,
      required: true,
      index: true
    },
    template: {
      type: Schema.Types.ObjectId,
      ref: 'IDCardTemplate',
      required: true
    },
    templateVersion: {
      type: String,
      required: true
    },
    generatedImage: {
      data: { type: String, required: true },
      mimeType: { type: String, required: true, default: 'image/png' }
    },
    pdfData: {
      data: { type: String },
      mimeType: { type: String, default: 'application/pdf' }
    },
    issueDate: {
      type: Date,
      default: Date.now
    },
    expiryDate: {
      type: Date,
      default: () => new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // 6 months temporary validity
    },
    status: {
      type: String,
      enum: Object.values(StudentStatus),
      default: StudentStatus.PENDING,
      index: true
    },
    version: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

IDCardSchema.index({ studentId: 1, version: -1 });

export const IDCard = mongoose.model<IIDCard>('IDCard', IDCardSchema);
