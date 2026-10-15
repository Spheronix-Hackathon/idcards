import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, AdminRole } from '../types';
import { AuthService } from '../services/auth.service';

export const authenticateAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Authentication token required.'
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = AuthService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please log in again.'
    });
  }
};

export const requireSuperAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== AdminRole.SUPER_ADMIN) {
    res.status(403).json({
      success: false,
      message: 'Access denied: Super Admin authorization required.'
    });
    return;
  }
  next();
};
