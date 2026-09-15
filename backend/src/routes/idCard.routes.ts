import { Router } from 'express';
import { IDCardController } from '../controllers/idCard.controller';
import { authenticateAdmin } from '../middleware/auth.middleware';

const router = Router();

// ID Card Metadata
router.get('/:studentId', IDCardController.getCardMetadata);

// Direct Image Streaming
router.get('/:studentId/image', IDCardController.streamCardImage);

// Direct PDF Download
router.get('/:studentId/pdf', IDCardController.streamCardPdf);

// Card Regeneration (Admin protected)
router.post('/:studentId/regenerate', authenticateAdmin, IDCardController.regenerateCard);

export default router;
