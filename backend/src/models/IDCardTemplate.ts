import mongoose, { Schema, Document } from 'mongoose';
import { IBase64Image, ITemplateConfiguration } from '../types';

export interface IIDCardTemplate extends Document {
  name: string;
  version: string;
  templateImage: IBase64Image;
  configuration: ITemplateConfiguration;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ElementConfigSchema = new Schema(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number },
    height: { type: Number },
    radius: { type: Number },
    fontSize: { type: Number },
    fontWeight: { type: Schema.Types.Mixed, default: 'normal' },
    color: { type: String, default: '#000000' },
    lineHeight: { type: Number },
    maxLines: { type: Number }
  },
  { _id: false }
);

const TemplateConfigurationSchema = new Schema(
  {
    width: { type: Number, required: true, default: 1012 },
    height: { type: Number, required: true, default: 638 },
    photo: { type: ElementConfigSchema, required: true },
    name: { type: ElementConfigSchema, required: true },
    email: { type: ElementConfigSchema, required: true },
    mobile: { type: ElementConfigSchema, required: true },
    college: { type: ElementConfigSchema, required: true },
    branch: { type: ElementConfigSchema, required: true },
    studentId: { type: ElementConfigSchema, required: true }
  },
  { _id: false }
);

const IDCardTemplateSchema = new Schema<IIDCardTemplate>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    version: {
      type: String,
      required: true,
      trim: true
    },
    templateImage: {
      data: { type: String, required: true },
      mimeType: { type: String, required: true, default: 'image/png' }
    },
    configuration: {
      type: TemplateConfigurationSchema,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

IDCardTemplateSchema.index({ version: 1 }, { unique: true });

export const IDCardTemplate = mongoose.model<IIDCardTemplate>('IDCardTemplate', IDCardTemplateSchema);
