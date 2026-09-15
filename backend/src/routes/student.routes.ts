import express from 'express';
import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { IDCardController } from '../controllers/idCard.controller';
import { uploadPhoto } from '../middleware/upload.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { registrationLimiter, retrievalLimiter } from '../middleware/rateLimit.middleware';
import { authenticateAdmin } from '../middleware/auth.middleware';
import { studentRegistrationSchema, studentRetrievalSchema } from '../utils/validation';

const router = express.Router();

// Student registration with photo upload and rate limiting
router.post(
  '/',
  registrationLimiter,
  uploadPhoto.single('photo'),
  validateBody(studentRegistrationSchema),
  StudentController.registerStudent
);

// Student retrieval by studentId + email
router.post(
  '/retrieve',
  retrievalLimiter,
  validateBody(studentRetrievalSchema),
  StudentController.retrieveStudent
);

// Public student direct photo streaming
router.get('/:studentId/photo', StudentController.getStudentPhoto);

// Public card metadata & direct file streaming
router.get('/:studentId/id-card', IDCardController.getCardMetadata);
router.get('/:studentId/id-card/image', IDCardController.streamCardImage);
router.get('/:studentId/id-card/pdf', IDCardController.streamCardPdf);

// Card regeneration (Protected admin action preserving same student ID)
router.post('/:studentId/regenerate-card', authenticateAdmin, IDCardController.regenerateCard);

// Student public details
router.get('/:studentId', StudentController.getStudentByStudentId);

export default router;
