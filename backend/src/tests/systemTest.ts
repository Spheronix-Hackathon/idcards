import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { StudentService } from '../services/student.service';
import { IDCardService } from '../services/idCard.service';
import { generateSamplePhotoBuffer } from '../utils/samplePhoto';
import { Counter } from '../models/Counter';
import { Student } from '../models/Student';
import { IDCard } from '../models/IDCard';
import { IDCardTemplate } from '../models/IDCardTemplate';
import { seedDatabase } from '../utils/seed';
import { DEFAULT_TEMPLATE_CONFIG, getDefaultTemplateImage } from '../utils/defaultTemplate';

dotenv.config();

const runAllSystemTests = async () => {
  console.log('====================================================');
  console.log(' SPHERONIX TEMPORARY ID GENERATOR - SYSTEM TEST SUITE');
  console.log('====================================================');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/spheronix_id_card_test';
  await mongoose.connect(mongoUri);
  console.log(`[Test] Connected to test database: ${mongoUri}`);

  // Clean test database for predictable assertions
  await Counter.deleteMany({});
  await Student.deleteMany({});
  await IDCard.deleteMany({});
  await IDCardTemplate.deleteMany({});
  await seedDatabase();

  const samplePhotoBuffer = await generateSamplePhotoBuffer('Rohit Kumar');

  // ----------------------------------------------------
  // Test 90: Primary Student Rohit Kumar
  // ----------------------------------------------------
  console.log('\n[TEST 90] Creating Student: Rohit Kumar...');
  const res1 = await StudentService.register({
    fullName: 'Rohit Kumar',
    email: 'rohit.kumar@example.com',
    mobile: '+91 98765 43210',
    collegeName: 'ABC Engineering College',
    branch: 'Computer Science and Engineering',
    photoBuffer: samplePhotoBuffer,
    photoMimeType: 'image/jpeg'
  });

  if (res1.student.studentId !== 'SPXEST-TE0001') {
    throw new Error(`TEST 90 FAILED: Expected SPXEST-TE0001, got ${res1.student.studentId}`);
  }
  console.log(`✓ TEST 90 PASSED: Student ID is ${res1.student.studentId}`);
  console.log(`✓ TEST 90 PASSED: Card generated, version: ${res1.idCard.version}`);

  // ----------------------------------------------------
  // Test 91: Second Student Anjali Sharma
  // ----------------------------------------------------
  console.log('\n[TEST 91] Creating Second Student: Anjali Sharma...');
  const anjaliPhotoBuffer = await generateSamplePhotoBuffer('Anjali Sharma');
  const res2 = await StudentService.register({
    fullName: 'Anjali Sharma',
    email: 'anjali.sharma@example.com',
    mobile: '+91 98765 43211',
    collegeName: 'National Institute of Technology',
    branch: 'Information Technology',
    photoBuffer: anjaliPhotoBuffer,
    photoMimeType: 'image/jpeg'
  });

  if (res2.student.studentId !== 'SPXEST-TE0002') {
    throw new Error(`TEST 91 FAILED: Expected SPXEST-TE0002, got ${res2.student.studentId}`);
  }
  // Verify first student unchanged
  const rohitCheck = await Student.findOne({ email: 'rohit.kumar@example.com' });
  if (rohitCheck?.studentId !== 'SPXEST-TE0001') {
    throw new Error(`TEST 91 FAILED: Rohit Kumar ID was corrupted`);
  }
  console.log(`✓ TEST 91 PASSED: Second student assigned ${res2.student.studentId}`);
  console.log(`✓ TEST 91 PASSED: First student remains ${rohitCheck.studentId}`);

  // ----------------------------------------------------
  // Test 92: Duplicate Email Protection
  // ----------------------------------------------------
  console.log('\n[TEST 92] Testing Duplicate Registration Protection...');
  let duplicateCaught = false;
  try {
    await StudentService.register({
      fullName: 'Rohit Kumar Duplicate',
      email: 'rohit.kumar@example.com',
      mobile: '+91 91111 22222',
      collegeName: 'Test College',
      branch: 'ECE',
      photoBuffer: samplePhotoBuffer,
      photoMimeType: 'image/jpeg'
    });
  } catch (err: any) {
    duplicateCaught = true;
    console.log(`✓ TEST 92 PASSED: Caught expected duplicate error: "${err.message}"`);
  }
  if (!duplicateCaught) {
    throw new Error('TEST 92 FAILED: Duplicate email was not rejected');
  }

  // ----------------------------------------------------
  // Test 93: Concurrency Safety Test
  // ----------------------------------------------------
  console.log('\n[TEST 93] Testing Concurrent Simultaneous Registrations...');
  const concurrentPromises = [3, 4, 5, 6].map((num) =>
    StudentService.register({
      fullName: `Concurrent Student ${num}`,
      email: `concurrent${num}@example.com`,
      mobile: `+91 98765 0000${num}`,
      collegeName: `College ${num}`,
      branch: 'Computer Science',
      photoBuffer: samplePhotoBuffer,
      photoMimeType: 'image/jpeg'
    })
  );

  const concurrentResults = await Promise.all(concurrentPromises);
  const ids = concurrentResults.map((r) => r.student.studentId);
  const uniqueIds = new Set(ids);
  if (uniqueIds.size !== ids.length) {
    throw new Error(`TEST 93 FAILED: Duplicate IDs detected in concurrent run: ${ids.join(', ')}`);
  }
  console.log(`✓ TEST 93 PASSED: Concurrent IDs strictly unique: ${ids.join(', ')}`);

  // ----------------------------------------------------
  // Test 94: Card Regeneration Test (Keep Same Student ID)
  // ----------------------------------------------------
  console.log('\n[TEST 94] Testing Card Regeneration...');
  const studentToRegen = await Student.findOne({ studentId: 'SPXEST-TE0001' });
  if (!studentToRegen) throw new Error('Student SPXEST-TE0001 not found');

  const activeTemplate = await IDCardTemplate.findOne({ isActive: true });
  if (!activeTemplate) throw new Error('Active template not found');

  const prevCard = await IDCard.findOne({ studentId: 'SPXEST-TE0001' }).sort({ version: -1 });
  const prevVersion = prevCard?.version || 1;

  const newCardImage = await IDCardService.generateStudentIdCard(studentToRegen, activeTemplate);
  const regeneratedCard = await IDCard.create({
    student: studentToRegen._id,
    studentId: studentToRegen.studentId, // MUST REMAIN SPXEST-TE0001
    template: activeTemplate._id,
    templateVersion: activeTemplate.version,
    generatedImage: newCardImage,
    status: studentToRegen.status,
    version: prevVersion + 1
  });

  if (regeneratedCard.studentId !== 'SPXEST-TE0001') {
    throw new Error(`TEST 94 FAILED: Student ID changed to ${regeneratedCard.studentId}`);
  }
  if (regeneratedCard.version !== 2) {
    throw new Error(`TEST 94 FAILED: Card version expected 2, got ${regeneratedCard.version}`);
  }
  console.log(`✓ TEST 94 PASSED: Regenerated card maintains ID: ${regeneratedCard.studentId}, version: ${regeneratedCard.version}`);

  // ----------------------------------------------------
  // Test 95: Template Versioning Test
  // ----------------------------------------------------
  console.log('\n[TEST 95] Testing Template Version 2.0 Upload & Activation...');
  const template2Image = await getDefaultTemplateImage();
  // Deactivate old
  await IDCardTemplate.updateMany({}, { $set: { isActive: false } });
  const template2 = await IDCardTemplate.create({
    name: 'Official Spheronix Template V2',
    version: '2.0',
    templateImage: template2Image,
    configuration: DEFAULT_TEMPLATE_CONFIG,
    isActive: true
  });

  // Verify previous card still reflects template 1.0
  const originalCard = await IDCard.findOne({ studentId: 'SPXEST-TE0001', version: 1 });
  if (originalCard?.templateVersion !== '1.0') {
    throw new Error('TEST 95 FAILED: Original card templateVersion modified unexpectedly');
  }

  // Regenerate again with Template 2.0
  const v3CardImage = await IDCardService.generateStudentIdCard(studentToRegen, template2);
  const v3Card = await IDCard.create({
    student: studentToRegen._id,
    studentId: studentToRegen.studentId, // STILL SPXEST-TE0001
    template: template2._id,
    templateVersion: template2.version,
    generatedImage: v3CardImage,
    status: studentToRegen.status,
    version: 3
  });

  if (v3Card.templateVersion !== '2.0' || v3Card.studentId !== 'SPXEST-TE0001') {
    throw new Error(`TEST 95 FAILED: Expected templateVersion 2.0 and ID SPXEST-TE0001`);
  }
  console.log(`✓ TEST 95 PASSED: Card regenerated with Template 2.0. ID remains: ${v3Card.studentId}`);

  // ----------------------------------------------------
  // Test 96: Retrieval Verification
  // ----------------------------------------------------
  console.log('\n[TEST 96] Testing Student Retrieval & Verification...');
  const validRetrieval = await StudentService.retrieve('SPXEST-TE0001', 'rohit.kumar@example.com');
  if (!validRetrieval.student) throw new Error('Valid retrieval failed');

  let invalidCaught = false;
  try {
    await StudentService.retrieve('SPXEST-TE0001', 'wrong.email@example.com');
  } catch (e: any) {
    invalidCaught = true;
    console.log(`✓ TEST 96 PASSED: Invalid email lookup rejected with: "${e.message}"`);
  }
  if (!invalidCaught) throw new Error('TEST 96 FAILED: Invalid lookup allowed');

  console.log('\n====================================================');
  console.log(' ALL 7 SYSTEM TESTS PASSED SUCCESSFULLY! (100% COMPLIANT)');
  console.log('====================================================');

  await mongoose.disconnect();
};

if (require.main === module) {
  runAllSystemTests().catch((err) => {
    console.error('[Test Error]:', err);
    process.exit(1);
  });
}
