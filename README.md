# Spheronix Student ID Card Generator

**Client**: SPHERONIX TECHNOLOGIES PVT. LTD.  
**Repository**: `https://github.com/Spheronix-Hackathon/idcards.git`  
**System**: Full-Stack Enterprise Web Application (Student Self-Registration Portal + Admin Management Portal + Automated ID Card & PDF Generation Engine)

---

## 1. System Architecture & Features

### Official Template Fidelity
- Replicates the official Spheronix layout:
  - Header: "SPHERONIX Technologies Pvt. Ltd." with Globe Logo & purple orbit.
  - Deep blue and indigo curved waves at top & bottom.
  - White & soft light-blue tech background with circuit/grid accents.
  - Decorative blue dot-matrix clusters on left and right flanks.
  - Circular photo frame with silver and purple border ring.
  - Clean dynamic typography (Name, Email, Mobile, College Name, Branch/Department, ID Badge).
  - Bottom curved wave footer: `SPHERONIX TECHNOLOGIES PVT.LTD` & `STUDENT ID CARD`.
- **STRICT NON-NEGOTIABLE**: **NO QR CODE, NO BARCODE, NO SCAN CODE** anywhere on the ID card.

### Atomic Student ID Generation
- Format: `SPXEST-TEXXXX` (e.g. `SPXEST-TE0001`, `SPXEST-TE0002`... expanding safely past 9999).
- Generated exclusively on the backend via atomic MongoDB `Counter` with `findOneAndUpdate({ _id: 'studentId' }, { $inc: { sequenceValue: 1 } }, { new: true, upsert: true })`.
- Frontend never generates or edits the ID.
- Concurrency safe under simultaneous submissions.
- **Card Regeneration Rule**: When an admin regenerates a card (e.g., using an updated template version), the public `studentId` remains identical (`SPXEST-TE0001`). Never increment student ID on regeneration.

### Image & Document Storage
- **No S3, No Cloudinary, No local disk files**.
- Student photos and generated ID cards are stored as Base64 strings directly in MongoDB documents with `mimeType`.
- Sharp optimizes and compresses photos before encoding (resizing to max 800x800).
- Dedicated direct streaming endpoints:
  - `GET /api/students/:studentId/id-card/image` (Content-Type: `image/png`)
  - `GET /api/students/:studentId/photo` (Content-Type: `image/jpeg`)
  - `GET /api/students/:studentId/id-card/pdf` (Content-Type: `application/pdf`)
- Heavy Base64 strings are excluded from collection list API JSON responses to keep payloads fast and lightweight.

---

## 2. Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom Spheronix theme
- **Forms & Validation**: React Hook Form + Zod
- **Icons**: Lucide React

### Backend
- **Framework**: Node.js + Express.js
- **Language**: TypeScript
- **Database**: MongoDB + Mongoose (No SQL / Prisma)
- **Image Processing**: Sharp
- **PDF Engine**: PDFKit
- **Authentication**: JWT (JSON Web Tokens) + bcrypt (12 salt rounds)
- **Security**: Helmet, CORS, Express Rate Limiters, Multer memory storage

---

## 3. Directory Layout

```
c:\Users\sudha\Downloads\id\
├── backend/
│   ├── src/
│   │   ├── config/database.ts            # MongoDB connection with reconnection & shutdown
│   │   ├── models/                       # Student, IDCard, Admin, Counter, IDCardTemplate, AuditLog
│   │   ├── controllers/                  # Student, Admin, IDCard, Template controllers
│   │   ├── services/                     # idGenerator, photo, idCard, pdf, auth, audit services
│   │   ├── middleware/                   # auth, upload (5MB max), validation, rateLimit, error
│   │   ├── routes/                       # student, admin, template routes
│   │   ├── utils/                        # base64, validation, defaultTemplate, seed
│   │   ├── app.ts                        # Express setup & CORS
│   │   └── server.ts                     # Server bootstrap
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
├── frontend/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout & navbar
│   │   ├── page.tsx                      # Landing page
│   │   ├── register/page.tsx             # Student registration
│   │   ├── success/page.tsx              # Card generation success & downloads
│   │   ├── retrieve-id/page.tsx          # Student lookup by ID + Email
│   │   ├── id-card/[studentId]/page.tsx  # Public card viewer
│   │   └── admin/                        # Admin portal (login, dashboard, students, templates, audit-logs)
│   ├── components/                       # Reusable UI components
│   ├── lib/api.ts                        # Unified API client
│   ├── types/index.ts                    # Shared TypeScript models
│   ├── package.json
│   └── tailwind.config.ts
├── .env.example
└── README.md
```

---

## 4. Getting Started & Running Locally

### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally at `mongodb://127.0.0.1:27017` (or MongoDB Atlas connection string)

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed     # Seeds default Counter, Super Admin, and Official Template v1.0
npm run dev      # Runs Express server at http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Runs Next.js app at http://localhost:3000
```

### 3. Default Credentials
- **Admin Portal**: `http://localhost:3000/admin/login`
- **Email**: `admin@spheronix.com`
- **Password**: `SpheronixAdmin2026!`

---

## 5. Verification & Test Scenarios

### Test 1: Rohit Kumar (First Student)
1. Navigate to `http://localhost:3000/register`.
2. Enter:
   - **Full Name**: Rohit Kumar
   - **Email**: rohit.kumar@example.com
   - **Mobile**: +91 98765 43210
   - **College Name**: ABC Engineering College
   - **Branch**: Computer Science and Engineering
3. Upload student photograph.
4. Click **GENERATE STUDENT ID**.
5. **Expected Result**:
   - Assigned Student ID: `SPXEST-TE0001`
   - Generated ID card displayed with official Spheronix branding, circular photo frame, dynamic typography.
   - **ZERO QR CODE / BARCODE**.
   - One-click PNG and printable PDF downloads function seamlessly.

### Test 2: Anjali Sharma (Atomic Sequence Increment)
1. Register next student: Anjali Sharma.
2. **Expected Result**: Assigned Student ID: `SPXEST-TE0002`.
3. Rohit Kumar's ID remains `SPXEST-TE0001`.

### Test 3: Duplicate Email / Mobile Prevention
1. Attempt to register again with `rohit.kumar@example.com`.
2. **Expected Result**: Clean 409 conflict message: `"An account with this email address already exists."` No counter increment.

### Test 4: Card Regeneration
1. Log in to Admin Portal (`/admin/login`).
2. Go to Students -> select Rohit Kumar (`SPXEST-TE0001`).
3. Click **Regenerate Card**.
4. **Expected Result**:
   - Student ID remains `SPXEST-TE0001` (NEVER incremented!).
   - Card version increments to `v2`.
   - Audit trail logs `CARD_REGENERATED`.
