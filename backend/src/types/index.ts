import { Request } from 'express';

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

export enum AuditAction {
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  ADMIN_LOGOUT = 'ADMIN_LOGOUT',
  STUDENT_CREATED = 'STUDENT_CREATED',
  STUDENT_ID_GENERATED = 'STUDENT_ID_GENERATED',
  CARD_GENERATED = 'CARD_GENERATED',
  CARD_REGENERATED = 'CARD_REGENERATED',
  STUDENT_APPROVED = 'STUDENT_APPROVED',
  STUDENT_REJECTED = 'STUDENT_REJECTED',
  STUDENT_DEACTIVATED = 'STUDENT_DEACTIVATED',
  STUDENT_REACTIVATED = 'STUDENT_REACTIVATED',
  TEMPLATE_CREATED = 'TEMPLATE_CREATED',
  TEMPLATE_UPDATED = 'TEMPLATE_UPDATED',
  TEMPLATE_ACTIVATED = 'TEMPLATE_ACTIVATED',
  TEMPLATE_DEACTIVATED = 'TEMPLATE_DEACTIVATED'
}

export interface IBase64Image {
  data: string;
  mimeType: string;
}

export interface ITemplateElementConfig {
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  fontSize?: number;
  fontWeight?: string | number;
  color?: string;
  lineHeight?: number;
  maxLines?: number;
}

export interface ITemplateConfiguration {
  width: number;
  height: number;
  photo: ITemplateElementConfig;
  name: ITemplateElementConfig;
  email: ITemplateElementConfig;
  mobile: ITemplateElementConfig;
  college: ITemplateElementConfig;
  branch: ITemplateElementConfig;
  studentId: ITemplateElementConfig;
}

export interface IAuthPayload {
  adminId: string;
  email: string;
  role: AdminRole;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: IAuthPayload;
}
