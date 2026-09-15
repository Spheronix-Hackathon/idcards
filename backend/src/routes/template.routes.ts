import { Router } from 'express';
import { TemplateController } from '../controllers/template.controller';
import { authenticateAdmin, requireSuperAdmin } from '../middleware/auth.middleware';
import { uploadPhoto } from '../middleware/upload.middleware';

const router = Router();

// Templates listing (accessible to all authenticated admins)
router.get('/', authenticateAdmin, TemplateController.getTemplates);

// Template upload and configuration (SUPER_ADMIN only)
router.post(
  '/',
  authenticateAdmin,
  requireSuperAdmin,
  uploadPhoto.single('templateImage'),
  TemplateController.createTemplate
);

// Template activation (SUPER_ADMIN only)
router.patch('/:id/activate', authenticateAdmin, requireSuperAdmin, TemplateController.activateTemplate);

// Template deletion (SUPER_ADMIN only)
router.delete('/:id', authenticateAdmin, requireSuperAdmin, TemplateController.deleteTemplate);

export default router;
