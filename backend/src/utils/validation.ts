import { z } from 'zod';
import { StudentStatus, AdminRole } from '../types';

export const studentRegistrationSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters'),
  email: z
    .string({ required_error: 'Email address is required' })
    .trim()
    .email('Invalid email address')
    .toLowerCase(),
  mobile: z
    .string({ required_error: 'Mobile number is required' })
    .trim()
    .min(10, 'Mobile number must be at least 10 digits')
    .max(20, 'Mobile number cannot exceed 20 characters')
    .regex(/^[+0-9\s-]+$/, 'Mobile number contains invalid characters'),
  collegeName: z
    .string({ required_error: 'College name is required' })
    .trim()
    .min(2, 'College name must be at least 2 characters')
    .max(200, 'College name cannot exceed 200 characters'),
  branch: z
    .string({ required_error: 'Branch / Department is required' })
    .trim()
    .min(2, 'Branch / Department must be at least 2 characters')
    .max(150, 'Branch / Department cannot exceed 150 characters'),
  course: z.string().trim().max(100).optional().default(''),
  rollNumber: z.string().trim().max(50).optional().default(''),
  graduationYear: z.string().trim().max(10).optional().default('')
});

export const studentRetrievalSchema = z.object({
  studentId: z
    .string({ required_error: 'Student ID is required' })
    .trim()
    .min(5, 'Invalid Student ID format')
    .toUpperCase(),
  email: z
    .string({ required_error: 'Email address is required' })
    .trim()
    .email('Invalid email address')
    .toLowerCase()
});

export const adminLoginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Invalid email address')
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters')
});

export const updateStudentStatusSchema = z.object({
  status: z.nativeEnum(StudentStatus, {
    errorMap: () => ({ message: 'Invalid status value' })
  })
});

export const templateConfigSchema = z.object({
  name: z.string().min(2, 'Template name is required'),
  version: z.string().min(1, 'Version is required'),
  configuration: z.any()
});
