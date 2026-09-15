import { Counter } from '../models/Counter';

/**
 * Atomically generates the next unique Student ID in format:
 * SPXEST-TEXXXX (e.g. SPXEST-TE0001, SPXEST-TE0002)
 *
 * Uses MongoDB findOneAndUpdate with $inc and upsert: true
 * to guarantee strict concurrency safety and atomic uniqueness.
 */
export const generateNextStudentId = async (): Promise<string> => {
  const counter = await Counter.findOneAndUpdate(
    { _id: 'studentId' },
    { $inc: { sequenceValue: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  if (!counter || counter.sequenceValue === undefined) {
    throw new Error('Failed to atomically increment student ID sequence counter');
  }

  const sequenceNumber = counter.sequenceValue;
  // Pad with leading zeroes to at least 4 digits, expand smoothly beyond 9999
  const formattedNumber = String(sequenceNumber).padStart(4, '0');

  return `SPXEST-TE${formattedNumber}`;
};
