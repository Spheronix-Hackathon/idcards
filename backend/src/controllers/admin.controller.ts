import { Response, NextFunction } from 'express';
import { Admin } from '../models/Admin';
import { Student } from '../models/Student';
import { IDCard } from '../models/IDCard';
import { AuditLog } from '../models/AuditLog';
import { AuthService } from '../services/auth.service';
import { AuditService } from '../services/audit.service';
import { AuthenticatedRequest, AuditAction, StudentStatus } from '../types';

export class AdminController {
  /**
   * Admin Login authentication.
   */
  public static async login(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      const admin = await Admin.findOne({ email: normalizedEmail });
      if (!admin) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password credentials.'
        });
        return;
      }

      const isMatch = await AuthService.comparePassword(password, admin.passwordHash);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password credentials.'
        });
        return;
      }

      const token = AuthService.generateToken({
        adminId: admin._id.toString(),
        email: admin.email,
        role: admin.role,
        name: admin.name
      });

      await AuditService.log({
        action: AuditAction.ADMIN_LOGIN,
        description: `Admin ${admin.name} (${admin.email}) logged in successfully`,
        adminId: admin._id
      });

      res.status(200).json({
        success: true,
        data: {
          token,
          admin: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin Logout.
   */
  public static async logout(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (req.user) {
        await AuditService.log({
          action: AuditAction.ADMIN_LOGOUT,
          description: `Admin ${req.user.name} logged out`,
          adminId: req.user.adminId
        });
      }

      res.status(200).json({
        success: true,
        message: 'Logged out successfully.'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Dashboard statistics & metrics aggregator.
   */
  public static async getDashboardMetrics(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      // Perform parallel aggregation for optimal performance
      const [
        totalStudents,
        pendingStudents,
        activeStudents,
        expiredStudents,
        rejectedStudents,
        deactivatedStudents,
        totalCards,
        cardsToday,
        recentStudents,
        recentCards
      ] = await Promise.all([
        Student.countDocuments(),
        Student.countDocuments({ status: StudentStatus.PENDING }),
        Student.countDocuments({ status: StudentStatus.ACTIVE }),
        Student.countDocuments({ status: StudentStatus.EXPIRED }),
        Student.countDocuments({ status: StudentStatus.REJECTED }),
        Student.countDocuments({ status: StudentStatus.DEACTIVATED }),
        IDCard.countDocuments(),
        IDCard.countDocuments({ createdAt: { $gte: todayStart } }),
        Student.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select('-photo.data'),
        IDCard.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('student', 'fullName email collegeName')
          .select('-generatedImage.data -pdfData.data')
      ]);

      res.status(200).json({
        success: true,
        data: {
          metrics: {
            totalStudents,
            pending: pendingStudents,
            active: activeStudents,
            expired: expiredStudents,
            rejected: rejectedStudents,
            deactivated: deactivatedStudents,
            totalCards,
            cardsGeneratedToday: cardsToday
          },
          recentStudents,
          recentCards
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Server-side paginated students listing with search and filters.
   */
  public static async getStudents(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
      const search = (req.query.search as string || '').trim();
      const status = req.query.status as string;
      const college = (req.query.college as string || '').trim();

      const filter: any = {};

      if (status && Object.values(StudentStatus).includes(status as StudentStatus)) {
        filter.status = status;
      }

      if (college) {
        filter.collegeName = new RegExp(college, 'i');
      }

      if (search) {
        filter.$or = [
          { studentId: new RegExp(search, 'i') },
          { fullName: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') },
          { mobile: new RegExp(search, 'i') },
          { collegeName: new RegExp(search, 'i') },
          { branch: new RegExp(search, 'i') }
        ];
      }

      const total = await Student.countDocuments(filter);
      const totalPages = Math.ceil(total / limit);

      const students = await Student.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-photo.data');

      res.status(200).json({
        success: true,
        data: students.map((s) => ({
          ...s.toObject(),
          photoUrl: `/api/students/${s.studentId}/photo`,
          cardImageUrl: `/api/students/${s.studentId}/id-card/image`,
          cardPdfUrl: `/api/students/${s.studentId}/id-card/pdf`
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves single student details with all card version histories.
   */
  public static async getStudentDetails(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const student = await Student.findById(id).select('-photo.data');
      if (!student) {
        res.status(404).json({
          success: false,
          message: 'Student record not found.'
        });
        return;
      }

      const idCards = await IDCard.find({ studentId: student.studentId })
        .sort({ version: -1 })
        .populate('template', 'name version')
        .select('-generatedImage.data -pdfData.data');

      res.status(200).json({
        success: true,
        data: {
          student: {
            ...student.toObject(),
            photoUrl: `/api/students/${student.studentId}/photo`,
            cardImageUrl: `/api/students/${student.studentId}/id-card/image`,
            cardPdfUrl: `/api/students/${student.studentId}/id-card/pdf`
          },
          cards: idCards
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Updates student status (APPROVE, REJECT, DEACTIVATE, etc.).
   */
  public static async updateStudentStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const student = await Student.findById(id);
      if (!student) {
        res.status(404).json({
          success: false,
          message: 'Student record not found.'
        });
        return;
      }

      const previousStatus = student.status;
      student.status = status;
      await student.save();

      // Synchronize latest card status
      await IDCard.updateMany(
        { studentId: student.studentId },
        { $set: { status } }
      );

      let auditAction = AuditAction.STUDENT_APPROVED;
      if (status === StudentStatus.REJECTED) auditAction = AuditAction.STUDENT_REJECTED;
      else if (status === StudentStatus.DEACTIVATED) auditAction = AuditAction.STUDENT_DEACTIVATED;
      else if (status === StudentStatus.ACTIVE && previousStatus === StudentStatus.DEACTIVATED)
        auditAction = AuditAction.STUDENT_REACTIVATED;

      await AuditService.log({
        action: auditAction,
        description: `Student ${student.studentId} status changed from ${previousStatus} to ${status}`,
        adminId: req.user?.adminId,
        studentId: student._id,
        metadata: { previousStatus, newStatus: status }
      });

      res.status(200).json({
        success: true,
        message: `Student status updated to ${status} successfully.`,
        data: {
          id: student._id,
          studentId: student.studentId,
          status: student.status
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves paginated audit logs.
   */
  public static async getAuditLogs(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 25));

      const total = await AuditLog.countDocuments();
      const totalPages = Math.ceil(total / limit);

      const logs = await AuditLog.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('admin', 'name email role')
        .populate('student', 'fullName studentId');

      res.status(200).json({
        success: true,
        data: logs,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
