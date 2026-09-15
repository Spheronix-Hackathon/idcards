import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { IDCardController } from '../controllers/idCard.controller';
import { authenticateAdmin } from '../middleware/auth.middleware';
import { adminLoginLimiter } from '../middleware/rateLimit.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { adminLoginSchema, updateStudentStatusSchema } from '../utils/validation';

const router = Router();

// Admin Authentication
router.post('/login', adminLoginLimiter, validateBody(adminLoginSchema), AdminController.login);
router.post('/logout', authenticateAdmin, AdminController.logout);

// Protected Admin Dashboard & Management Routes
router.get('/dashboard', authenticateAdmin, AdminController.getDashboardMetrics);
router.get('/students', authenticateAdmin, AdminController.getStudents);
router.get('/students/:id', authenticateAdmin, AdminController.getStudentDetails);
router.patch(
  '/students/:id/status',
  authenticateAdmin,
  validateBody(updateStudentStatusSchema),
  AdminController.updateStudentStatus
);

// Card Regeneration via Admin
router.post('/id-cards/:id/regenerate', authenticateAdmin, IDCardController.regenerateCard);

// System Audit Logs
router.get('/audit-logs', authenticateAdmin, AdminController.getAuditLogs);

export default router;
