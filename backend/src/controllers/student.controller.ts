import { Request, Response, NextFunction } from 'express';
import { Student } from '../models/Student';
import { IDCard } from '../models/IDCard';
import { IDCardTemplate } from '../models/IDCardTemplate';
import { PhotoService } from '../services/photo.service';
import { generateNextStudentId } from '../services/idGenerator.service';
import { IDCardService } from '../services/idCard.service';
import { AuditService } from '../services/audit.service';
import { AuditAction, StudentStatus } from '../types';
import { base64ImageToBuffer } from '../utils/base64';
import { getDefaultTemplateImage, DEFAULT_TEMPLATE_CONFIG } from '../utils/defaultTemplate';

export class StudentController {
  /**
   * Registers a new student, generates atomic Student ID, processes photo,
   * generates official Spheronix temporary ID card, and saves records to MongoDB.
   */
  public static async registerStudent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { fullName, email, mobile, collegeName, branch, course, rollNumber, graduationYear } = req.body;

      // 1. Validate photo upload
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'Student photograph is required. Please upload a clear passport-style photo.'
        });
        return;
      }

      // 2. Duplicate checks (Email & Mobile)
      const normalizedEmail = email.toLowerCase().trim();
      const existingEmail = await Student.findOne({ email: normalizedEmail });
      if (existingEmail) {
        res.status(409).json({
          success: false,
          message: 'An account with this email address already exists.'
        });
        return;
      }

      const existingMobile = await Student.findOne({ mobile: mobile.trim() });
      if (existingMobile) {
        res.status(409).json({
          success: false,
          message: 'An account with this mobile number already exists.'
        });
        return;
      }

      // 3. Process and optimize photo
      const processedPhoto = await PhotoService.processStudentPhoto(
        req.file.buffer,
        req.file.mimetype
      );

      // 4. Atomically generate unique Student ID (e.g. SPXEST-TE0001)
      const studentId = await generateNextStudentId();

      // 5. Create Student record
      const student = await Student.create({
        studentId,
        fullName: fullName.trim(),
        email: normalizedEmail,
        mobile: mobile.trim(),
        collegeName: collegeName.trim(),
        branch: branch.trim(),
        course: course ? course.trim() : '',
        rollNumber: rollNumber ? rollNumber.trim() : '',
        graduationYear: graduationYear ? graduationYear.trim() : '',
        photo: processedPhoto,
        status: StudentStatus.PENDING
      });

      // 6. Retrieve active template (or create default if none exists)
      let activeTemplate = await IDCardTemplate.findOne({ isActive: true });
      if (!activeTemplate) {
        const defaultImage = await getDefaultTemplateImage();
        activeTemplate = await IDCardTemplate.create({
          name: 'Official Spheronix Standard Template',
          version: '1.0',
          templateImage: defaultImage,
          configuration: DEFAULT_TEMPLATE_CONFIG,
          isActive: true
        });
      }

      // 7. Generate ID Card image (strictly NO QR CODE)
      const generatedCardImage = await IDCardService.generateStudentIdCard(
        student,
        activeTemplate
      );

      // 8. Create IDCard record
      const idCard = await IDCard.create({
        student: student._id,
        studentId: student.studentId,
        template: activeTemplate._id,
        templateVersion: activeTemplate.version,
        generatedImage: generatedCardImage,
        status: StudentStatus.PENDING,
        version: 1
      });

      // 9. Audit log
      await AuditService.log({
        action: AuditAction.STUDENT_CREATED,
        description: `Student ${student.fullName} registered with ID ${student.studentId}`,
        studentId: student._id,
        metadata: { studentId: student.studentId, email: student.email }
      });

      await AuditService.log({
        action: AuditAction.CARD_GENERATED,
        description: `Temporary ID card version 1 generated for student ${student.studentId}`,
        studentId: student._id,
        metadata: { templateVersion: activeTemplate.version }
      });

      // Return clean response without huge Base64 payload
      res.status(201).json({
        success: true,
        data: {
          studentId: student.studentId,
          fullName: student.fullName,
          email: student.email,
          collegeName: student.collegeName,
          branch: student.branch,
          status: student.status,
          cardVersion: idCard.version,
          cardImageUrl: `/api/students/${student.studentId}/id-card/image`,
          cardPdfUrl: `/api/students/${student.studentId}/id-card/pdf`
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves student details and card info using Student ID + Email verification.
   */
  public static async retrieveStudent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { studentId, email } = req.body;

      const student = await Student.findOne({
        studentId: studentId.trim().toUpperCase(),
        email: email.toLowerCase().trim()
      }).select('-photo.data');

      if (!student) {
        res.status(404).json({
          success: false,
          message: 'Student ID or email address is incorrect.'
        });
        return;
      }

      const latestCard = await IDCard.findOne({ studentId: student.studentId })
        .sort({ version: -1 })
        .select('-generatedImage.data -pdfData.data');

      res.status(200).json({
        success: true,
        data: {
          studentId: student.studentId,
          fullName: student.fullName,
          email: student.email,
          mobile: student.mobile,
          collegeName: student.collegeName,
          branch: student.branch,
          status: student.status,
          issueDate: latestCard?.issueDate,
          expiryDate: latestCard?.expiryDate,
          cardVersion: latestCard?.version || 1,
          cardImageUrl: `/api/students/${student.studentId}/id-card/image`,
          cardPdfUrl: `/api/students/${student.studentId}/id-card/pdf`,
          photoUrl: `/api/students/${student.studentId}/photo`
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get student details by Student ID.
   */
  public static async getStudentByStudentId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { studentId } = req.params;
      const student = await Student.findOne({
        studentId: studentId.trim().toUpperCase()
      }).select('-photo.data');

      if (!student) {
        res.status(404).json({
          success: false,
          message: 'Student not found.'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          ...student.toObject(),
          photoUrl: `/api/students/${student.studentId}/photo`,
          cardImageUrl: `/api/students/${student.studentId}/id-card/image`,
          cardPdfUrl: `/api/students/${student.studentId}/id-card/pdf`
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Direct image streaming endpoint for student photo.
   */
  public static async getStudentPhoto(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { studentId } = req.params;
      const student = await Student.findOne({
        studentId: studentId.trim().toUpperCase()
      }).select('photo');

      if (!student || !student.photo || !student.photo.data) {
        res.status(404).json({
          success: false,
          message: 'Student photo not found.'
        });
        return;
      }

      const { buffer, mimeType } = base64ImageToBuffer(student.photo);

      res.setHeader('Content-Type', mimeType || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24h
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }
}
