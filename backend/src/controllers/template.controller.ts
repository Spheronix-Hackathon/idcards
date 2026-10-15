import { Response, NextFunction } from 'express';
import { IDCardTemplate } from '../models/IDCardTemplate';
import { IDCard } from '../models/IDCard';
import { AuditService } from '../services/audit.service';
import { AuthenticatedRequest, AuditAction } from '../types';
import { bufferToBase64Image } from '../utils/base64';
import { DEFAULT_TEMPLATE_CONFIG } from '../utils/defaultTemplate';

export class TemplateController {
  /**
   * Lists all ID card templates.
   */
  public static async getTemplates(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const templates = await IDCardTemplate.find()
        .sort({ createdAt: -1 })
        .select('-templateImage.data');

      res.status(200).json({
        success: true,
        data: templates
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Uploads and registers a new template version.
   */
  public static async createTemplate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { name, version, configuration, makeActive } = req.body;

      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'Template image file is required.'
        });
        return;
      }

      const existingVersion = await IDCardTemplate.findOne({ version: version.trim() });
      if (existingVersion) {
        res.status(409).json({
          success: false,
          message: `Template version ${version} already exists. Please specify a new version number.`
        });
        return;
      }

      const templateImage = bufferToBase64Image(req.file.buffer, req.file.mimetype);

      let parsedConfig = DEFAULT_TEMPLATE_CONFIG;
      if (configuration) {
        try {
          parsedConfig = typeof configuration === 'string' ? JSON.parse(configuration) : configuration;
        } catch (e) {
          // fallback to default config
        }
      }

      const shouldActivate = makeActive === 'true' || makeActive === true;
      if (shouldActivate) {
        await IDCardTemplate.updateMany({}, { $set: { isActive: false } });
      }

      const template = await IDCardTemplate.create({
        name: name.trim(),
        version: version.trim(),
        templateImage,
        configuration: parsedConfig,
        isActive: shouldActivate
      });

      await AuditService.log({
        action: AuditAction.TEMPLATE_CREATED,
        description: `Template version ${template.version} created`,
        adminId: req.user?.adminId,
        metadata: { version: template.version, name: template.name }
      });

      res.status(201).json({
        success: true,
        message: `Template version ${template.version} created successfully.`,
        data: {
          id: template._id,
          name: template.name,
          version: template.version,
          isActive: template.isActive
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Activates a template version (and deactivates all others).
   */
  public static async activateTemplate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const template = await IDCardTemplate.findById(id);
      if (!template) {
        res.status(404).json({
          success: false,
          message: 'Template not found.'
        });
        return;
      }

      // Deactivate all templates
      await IDCardTemplate.updateMany({}, { $set: { isActive: false } });

      template.isActive = true;
      await template.save();

      await AuditService.log({
        action: AuditAction.TEMPLATE_ACTIVATED,
        description: `Template version ${template.version} activated as active card design`,
        adminId: req.user?.adminId,
        metadata: { templateId: template._id, version: template.version }
      });

      res.status(200).json({
        success: true,
        message: `Template version ${template.version} is now active.`,
        data: {
          id: template._id,
          name: template.name,
          version: template.version,
          isActive: true
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Safely deletes a template if no existing ID cards are referencing it.
   */
  public static async deleteTemplate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const template = await IDCardTemplate.findById(id);
      if (!template) {
        res.status(404).json({
          success: false,
          message: 'Template not found.'
        });
        return;
      }

      // Check if cards are currently referencing this template
      const cardCount = await IDCard.countDocuments({ template: template._id });
      if (cardCount > 0) {
        res.status(400).json({
          success: false,
          message: `Cannot delete template version ${template.version}. It is referenced by ${cardCount} generated ID cards.`
        });
        return;
      }

      await IDCardTemplate.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: `Template version ${template.version} deleted.`
      });
    } catch (error) {
      next(error);
    }
  }
}
