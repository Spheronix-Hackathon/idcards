import { Request, Response, NextFunction } from 'express';
import sharp from 'sharp';
import { IDCard } from '../models/IDCard';
import { Student } from '../models/Student';
import { IDCardTemplate } from '../models/IDCardTemplate';
import { IDCardService } from '../services/idCard.service';
import { PdfService } from '../services/pdf.service';
import { AuditService } from '../services/audit.service';
import { AuditAction, AuthenticatedRequest } from '../types';
import { base64ImageToBuffer } from '../utils/base64';

export class IDCardController {
  /**
   * Retrieves metadata and status of the current ID card.
   */
  public static async getCardMetadata(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { studentId } = req.params;
      const card = await IDCard.findOne({ studentId: studentId.trim().toUpperCase() })
        .sort({ version: -1 })
        .populate('template', 'name version')
        .select('-generatedImage.data -pdfData.data');

      if (!card) {
        res.status(404).json({
          success: false,
          message: 'ID card record not found.'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          ...card.toObject(),
          imageUrl: `/api/students/${studentId}/id-card/image`,
          pdfUrl: `/api/students/${studentId}/id-card/pdf`
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Direct image streaming endpoint for generated ID card PNG.
   * Features self-healing: automatically upgrades any legacy horizontal cards to the
   * official vertical template without user intervention.
   */
  public static async streamCardImage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { studentId } = req.params;
      const download = req.query.download === 'true';

      const card = await IDCard.findOne({ studentId: studentId.trim().toUpperCase() })
        .sort({ version: -1 });

      if (!card || !card.generatedImage || !card.generatedImage.data) {
        res.status(404).json({
          success: false,
          message: 'Generated ID card image not found.'
        });
        return;
      }

      let { buffer, mimeType } = base64ImageToBuffer(card.generatedImage);

      // Auto-upgrade: If card is currently in horizontal format OR was generated with older template version
      try {
        const activeTemplate = await IDCardTemplate.findOne({ isActive: true });
        if (activeTemplate) {
          const meta = await sharp(buffer).metadata();
          const isHorizontal = !!(meta.width && meta.height && meta.width > meta.height);
          const isOlderVersion = card.templateVersion !== activeTemplate.version;

          if (isHorizontal || isOlderVersion) {
            const student = await Student.findOne({ studentId: card.studentId });
            if (student) {
              console.log(`[IDCardController] Upgrading ${card.studentId} to latest vertical template (${activeTemplate.version})...`);
              const updatedImage = await IDCardService.generateStudentIdCard(student, activeTemplate);
              card.generatedImage = updatedImage;
              card.template = activeTemplate._id;
              card.templateVersion = activeTemplate.version;
              await card.save();
              const refreshed = base64ImageToBuffer(updatedImage);
              buffer = refreshed.buffer;
              mimeType = refreshed.mimeType;
            }
          }
        }
      } catch (autoErr) {
        console.warn(`[IDCardController] Auto-upgrade check bypassed:`, autoErr);
      }

      const filename = `SPHERONIX-ID-${card.studentId}-v${card.version}.png`;

      res.setHeader('Content-Type', mimeType || 'image/png');
      res.setHeader(
        'Content-Disposition',
        `${download ? 'attachment' : 'inline'}; filename="${filename}"`
      );
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Direct PDF streaming endpoint.
   * Dynamically compiles high-DPI vector/raster PDF matching ID card dimensions.
   */
  public static async streamCardPdf(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { studentId } = req.params;

      const card = await IDCard.findOne({ studentId: studentId.trim().toUpperCase() })
        .sort({ version: -1 });

      if (!card || !card.generatedImage || !card.generatedImage.data) {
        res.status(404).json({
          success: false,
          message: 'ID card data not found for PDF export.'
        });
        return;
      }

      let cardImage = card.generatedImage;

      // Auto-upgrade to vertical if horizontal or older version
      try {
        const activeTemplate = await IDCardTemplate.findOne({ isActive: true });
        if (activeTemplate) {
          const { buffer } = base64ImageToBuffer(cardImage);
          const meta = await sharp(buffer).metadata();
          const isHorizontal = !!(meta.width && meta.height && meta.width > meta.height);
          const isOlderVersion = card.templateVersion !== activeTemplate.version;

          if (isHorizontal || isOlderVersion) {
            const student = await Student.findOne({ studentId: card.studentId });
            if (student) {
              const updatedImage = await IDCardService.generateStudentIdCard(student, activeTemplate);
              card.generatedImage = updatedImage;
              card.template = activeTemplate._id;
              card.templateVersion = activeTemplate.version;
              await card.save();
              cardImage = updatedImage;
            }
          }
        }
      } catch (e) {}

      const pdfBuffer = await PdfService.generateCardPdf(cardImage);
      const filename = `SPHERONIX-ID-${card.studentId}-v${card.version}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Regenerates an ID card for an existing student.
   * CRITICAL REQUIREMENT:
   * 1. Preserves the exact same studentId (e.g. SPXEST-TE0001). Never increments counter.
   * 2. Uses the currently active template.
   * 3. Creates a new IDCard document with version = latestVersion + 1.
   * 4. Records an audit log.
   */
  public static async regenerateCard(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const studentIdParam = req.params.studentId || req.params.id;

      // Find student by studentId or _id
      const student = await Student.findOne({
        $or: [
          { studentId: studentIdParam.trim().toUpperCase() },
          ...(studentIdParam.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: studentIdParam }] : [])
        ]
      });

      if (!student) {
        res.status(404).json({
          success: false,
          message: 'Student not found.'
        });
        return;
      }

      // Find active template
      const activeTemplate = await IDCardTemplate.findOne({ isActive: true });
      if (!activeTemplate) {
        res.status(400).json({
          success: false,
          message: 'No active ID card template found to regenerate card.'
        });
        return;
      }

      // Find previous latest card to get current version
      const latestCard = await IDCard.findOne({ studentId: student.studentId })
        .sort({ version: -1 });

      const newVersion = (latestCard?.version || 1) + 1;

      // Generate new card image with current active template
      const newCardImage = await IDCardService.generateStudentIdCard(
        student,
        activeTemplate
      );

      // Create new IDCard record preserving studentId
      const newCard = await IDCard.create({
        student: student._id,
        studentId: student.studentId, // STRICT: Same ID
        template: activeTemplate._id,
        templateVersion: activeTemplate.version,
        generatedImage: newCardImage,
        status: student.status,
        version: newVersion
      });

      // Record Audit Log
      await AuditService.log({
        action: AuditAction.CARD_REGENERATED,
        description: `Temporary ID card regenerated to version ${newVersion} for student ${student.studentId}`,
        adminId: req.user?.adminId,
        studentId: student._id,
        metadata: {
          studentId: student.studentId,
          templateVersion: activeTemplate.version,
          previousVersion: latestCard?.version || 1,
          newVersion
        }
      });

      res.status(200).json({
        success: true,
        message: `ID card regenerated successfully to version ${newVersion}`,
        data: {
          studentId: student.studentId,
          version: newCard.version,
          templateVersion: activeTemplate.version,
          cardImageUrl: `/api/students/${student.studentId}/id-card/image`,
          cardPdfUrl: `/api/students/${student.studentId}/id-card/pdf`
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
