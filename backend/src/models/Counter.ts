import mongoose, { Schema, model } from 'mongoose';

export interface ICounter {
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

export const Counter = model<ICounter>('Counter', CounterSchema);
