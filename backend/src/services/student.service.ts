import { Student, IStudent } from '../models/Student';
import { IDCard, IIDCard } from '../models/IDCard';
import { IDCardTemplate } from '../models/IDCardTemplate';
import { PhotoService } from './photo.service';
import { generateNextStudentId } from './idGenerator.service';
import { IDCardService } from './idCard.service';
import { AuditService } from './audit.service';
import { AuditAction, StudentStatus, IBase64Image } from '../types';
import { getDefaultTemplateImage, DEFAULT_TEMPLATE_CONFIG } from '../utils/defaultTemplate';

export interface CreateStudentDTO {
  fullName: string;
  email: string;
  mobile: string;
  collegeName: string;
  branch: string;
  course?: string;
  rollNumber?: string;
  graduationYear?: string;
  photoBuffer: Buffer;
  photoMimeType: string;
}

export class StudentService {
  /**
   * Complete business workflow to register a student:
   * 1. Check duplicates
   * 2. Process photo with Sharp
   * 3. Atomically increment counter to generate Student ID
   * 4. Persist student in MongoDB
   * 5. Load/seed active template
   * 6. Composite ID card image (no QR code)
   * 7. Persist IDCard
   * 8. Record audit logs
   */
  public static async register(dto: CreateStudentDTO): Promise<{ student: IStudent; idCard: IIDCard }> {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const normalizedMobile = dto.mobile.trim();

    // Check duplicate email
    const existingEmail = await Student.findOne({ email: normalizedEmail });
    if (existingEmail) {
      throw new Error('An account with this email address already exists.');
    }

    // Check duplicate mobile
    const existingMobile = await Student.findOne({ mobile: normalizedMobile });
    if (existingMobile) {
      throw new Error('An account with this mobile number already exists.');
    }

    // Process & resize photo to max 800x800
    const processedPhoto = await PhotoService.processStudentPhoto(dto.photoBuffer, dto.photoMimeType);

    // Atomic Student ID generation
    const studentId = await generateNextStudentId();

    // Create Student entity
    const student = await Student.create({
      studentId,
      fullName: dto.fullName.trim(),
      email: normalizedEmail,
      mobile: normalizedMobile,
      collegeName: dto.collegeName.trim(),
      branch: dto.branch.trim(),
      course: dto.course?.trim() || '',
      rollNumber: dto.rollNumber?.trim() || '',
      graduationYear: dto.graduationYear?.trim() || '',
      photo: processedPhoto,
      status: StudentStatus.PENDING
    });

    // Retrieve or seed active vertical template
    let activeTemplate = await IDCardTemplate.findOne({
      isActive: true,
      'configuration.height': { $gt: 700 }
    });

    if (!activeTemplate) {
      console.log('[StudentService] Enforcing official Spheronix Vertical template as default...');
      const defaultImage = await getDefaultTemplateImage();
      await IDCardTemplate.updateMany({}, { isActive: false });
      activeTemplate = await IDCardTemplate.findOneAndUpdate(
        { version: '1.0' },
        {
          name: 'Official Spheronix Vertical Standard Template',
          version: '1.0',
          templateImage: defaultImage,
          configuration: DEFAULT_TEMPLATE_CONFIG,
          isActive: true
        },
        { upsert: true, new: true }
      );
    }

    // Generate Card (guaranteed NO QR code)
    const generatedCardImage = await IDCardService.generateStudentIdCard(student, activeTemplate);

    // Save IDCard version 1
    const idCard = await IDCard.create({
      student: student._id,
      studentId: student.studentId,
      template: activeTemplate._id,
      templateVersion: activeTemplate.version,
      generatedImage: generatedCardImage,
      status: StudentStatus.PENDING,
      version: 1
    });

    // Audit logs
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

    return { student, idCard };
  }

  /**
   * Retrieves student by Student ID + Email verification
   */
  public static async retrieve(studentId: string, email: string) {
    const student = await Student.findOne({
      studentId: studentId.trim().toUpperCase(),
      email: email.toLowerCase().trim()
    }).select('-photo.data');

    if (!student) {
      throw new Error('Student ID or email address is incorrect.');
    }

    const latestCard = await IDCard.findOne({ studentId: student.studentId })
      .sort({ version: -1 })
      .select('-generatedImage.data -pdfData.data');

    return { student, card: latestCard };
  }
}
