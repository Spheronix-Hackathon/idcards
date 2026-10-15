import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Admin } from '../models/Admin';
import { Student } from '../models/Student';
import { IDCard } from '../models/IDCard';
import { Counter } from '../models/Counter';
import { IDCardTemplate } from '../models/IDCardTemplate';
import { AuthService } from '../services/auth.service';
import { IDCardService } from '../services/idCard.service';
import { AdminRole } from '../types';
import {
  getDefaultTemplateImage,
  DEFAULT_TEMPLATE_CONFIG,
  getDefaultHorizontalTemplateImage,
  DEFAULT_HORIZONTAL_TEMPLATE_CONFIG,
} from './defaultTemplate';

dotenv.config();

export const seedDatabase = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/spheronix_id_card';
  console.log(`[Seed] Connecting to ${mongoUri}...`);

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }

  // 1. Initialize Counter
  const counter = await Counter.findById('studentId');
  if (!counter) {
    await Counter.create({ _id: 'studentId', sequenceValue: 0 });
    console.log('[Seed] Initialized atomic Student ID counter at 0.');
  } else {
    console.log(`[Seed] Counter already exists with sequenceValue: ${counter.sequenceValue}`);
  }

  // 2. Initialize Super Admin
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@spheronix.com';
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'SpheronixAdmin2026!';
  const existingAdmin = await Admin.findOne({ email: adminEmail });

  if (!existingAdmin) {
    const passwordHash = await AuthService.hashPassword(adminPassword);
    await Admin.create({
      name: 'Spheronix Super Admin',
      email: adminEmail,
      passwordHash,
      role: AdminRole.SUPER_ADMIN
    });
    console.log(`[Seed] Created default Super Admin: ${adminEmail} (password: ${adminPassword})`);
  } else {
    console.log(`[Seed] Admin already exists: ${adminEmail}`);
  }

  // 3. Force-activate Official Spheronix Vertical (Portrait) base template
  console.log('[Seed] Rendering official Spheronix Vertical (Portrait) base template...');
  const verticalImage = await getDefaultTemplateImage();

  // Deactivate any old horizontal templates
  await IDCardTemplate.updateMany({}, { isActive: false });

  // Upsert the official vertical template as active version 4.1 (deafult.png with calibrated baselines)
  const activeVerticalTemplate = await IDCardTemplate.findOneAndUpdate(
    { version: '4.1' },
    {
      name: 'Official Spheronix Default Template v4.1 (Aligned Text)',
      version: '4.1',
      templateImage: verticalImage,
      configuration: DEFAULT_TEMPLATE_CONFIG,
      isActive: true
    },
    { upsert: true, new: true }
  );
  console.log('[Seed] Successfully activated Official Spheronix Default Template v4.1 (deafult.png, 638x1012 px) as Default.');

  // 4. Auto-migrate existing students to the official vertical ID card template
  const students = await Student.find({});
  if (students.length > 0) {
    console.log(`[Seed] Upgrading ${students.length} existing student ID card(s) to official vertical template...`);
    for (const s of students) {
      try {
        const newCardImage = await IDCardService.generateStudentIdCard(s, activeVerticalTemplate);
        const existingCard = await IDCard.findOne({ studentId: s.studentId }).sort({ version: -1 });

        if (existingCard) {
          existingCard.generatedImage = newCardImage;
          existingCard.template = activeVerticalTemplate._id;
          existingCard.templateVersion = activeVerticalTemplate.version;
          await existingCard.save();
          console.log(`[Seed] Migrated card for ${s.studentId} (${s.fullName}) to official vertical template.`);
        } else {
          await IDCard.create({
            student: s._id,
            studentId: s.studentId,
            template: activeVerticalTemplate._id,
            templateVersion: activeVerticalTemplate.version,
            generatedImage: newCardImage,
            status: s.status,
            version: 1
          });
          console.log(`[Seed] Created vertical card for student ${s.studentId}.`);
        }
      } catch (migrateErr) {
        console.warn(`[Seed] Warning migrating ${s.studentId}:`, migrateErr);
      }
    }
  }

  console.log('[Seed] Seeding and vertical template configuration completed successfully!');
};

// If run directly via CLI
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('[Seed] Finished. Disconnecting...');
      return mongoose.disconnect();
    })
    .catch((err) => {
      console.error('[Seed] Error during seeding:', err);
      process.exit(1);
    });
}
