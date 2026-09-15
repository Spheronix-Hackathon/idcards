export enum StudentStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  REJECTED = 'REJECTED',
  DEACTIVATED = 'DEACTIVATED'
}

export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN'
}

export interface Student {
  _id: string;
  studentId: string;
  fullName: string;
  email: string;
  mobile: string;
  collegeName: string;
  branch: string;
  course?: string;
  rollNumber?: string;
  graduationYear?: string;
  status: StudentStatus;
  createdAt: string;
  updatedAt: string;
  photoUrl?: string;
  cardImageUrl?: string;
  cardPdfUrl?: string;
}

export interface IDCard {
  _id: string;
  student: string | Student;
  studentId: string;
  template: {
    _id: string;
    name: string;
    version: string;
  };
  templateVersion: string;
  issueDate: string;
  expiryDate: string;
  status: StudentStatus;
  version: number;
  createdAt: string;
}

export interface Template {
  _id: string;
  name: string;
  version: string;
  isActive: boolean;
  configuration: any;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalStudents: number;
  pending: number;
  active: number;
  expired: number;
  rejected: number;
  deactivated: number;
  totalCards: number;
  cardsGeneratedToday: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
