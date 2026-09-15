import mongoose, { Schema, Document } from 'mongoose';

export interface ICounter extends Document {
  _id: string;
  sequenceValue: number;
}

const CounterSchema = new Schema<ICounter>(
  {
    _id: { type: String, required: true },
    sequenceValue: { type: Number, required: true, default: 0 }
  },
  {
    timestamps: false,
    versionKey: false
  }
);

export const Counter = mongoose.model<ICounter>('Counter', CounterSchema);
