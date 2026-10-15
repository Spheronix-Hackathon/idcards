# Spheronix Temporary Student ID Card Generator - Implementation Plan

## Executive Overview
**Client**: SPHERONIX TECHNOLOGIES PVT. LTD.  
**Project**: Spheronix Temporary Student ID Card Generator  
**System Type**: Full-Stack Enterprise Web Application (Student Self-Registration Portal + Admin Management Portal + Automated ID Card & PDF Generation Engine)

### Core Mandates & Non-Negotiables:
1. **Official Template Fidelity**: Replicate the exact official Spheronix ID card layout:
   - Header: "SPHERONIX Technologies Pvt. Ltd." with Globe Logo & purple orbit.
   - Deep blue and indigo curved waves at top & bottom.
   - White & soft light-blue tech background with subtle circuit/grid accents.
   - Decorative blue dot-matrix clusters on left and right flanks.
   - Circular photo frame with silver and purple border ring.
   - Clean dynamic typography:
     - `Student's Full Name` (Bold dark indigo title)
     - `Email Address       : {{EMAIL}}`
     - `Mobile Number       : {{MOBILE}}`
     - `College Name        : {{COLLEGE_NAME}}`
     - `Branch / Department : {{BRANCH}}` (with dynamic multi-line wrapping and boundary protection)
     - `ID                  : SPXEST-TEXXXX` (within a dedicated styled light-blue badge box)
   - Bottom curved wave footer:
     - `SPHERONIX TECHNOLOGIES PVT.LTD`
     - `TEMPORARY ID CARD`
2. **STRICT EXCLUSION**: **ABSOLUTELY NO QR CODE, NO BARCODE, NO SCAN CODE** anywhere on the ID card.
3. **Atomic Student ID Format**: `SPXEST-TEXXXX` (e.g. `SPXEST-TE0001`, `SPXEST-TE0002`... expanding safely past 9999).
   - Generated strictly on the backend inside an atomic transactional counter / sequence.
   - Concurrency safe (no duplicates under simultaneous load).
   - Permanent association with student record.
   - Internal UUID / ObjectId as primary key; `studentId` has `UNIQUE` database constraint.
4. **Card Regeneration Rule**: When an admin regenerates a card (e.g., using an updated template version), the public `studentId` remains identical (`SPXEST-TE0001`). Never increment student ID on regeneration.
5. **Database & Storage Architecture**:
   - MongoDB + Mongoose only (No PostgreSQL, Prisma, MySQL, SQL).
   - No S3, Cloudinary, or permanent local disk file storage.
   - Student photos and generated ID cards stored as Base64 strings in MongoDB documents with mimeType.
   - Image pre-processing and compression via Sharp (resizing to max 800x800 for photos to maintain strict document size limits).
   - MongoDB GridFS integration for large PDFs if needed.
   - Lightweight JSON responses: API endpoints stream images directly (`GET /api/students/:studentId/id-card/image`, `GET /api/students/:studentId/photo`, `GET /api/students/:studentId/id-card/pdf`) instead of packing heavy Base64 into collection list payloads.

---

## User Review Required

> [!IMPORTANT]
> ### 1. Template Image Asset
> In Section 4, you noted: *"I will provide the official Spheronix Technologies Pvt. Ltd. ID-card template as an image. Use the provided image as the source of truth."*  
> Please place your official template image file into the workspace directory `c:\Users\sudha\Downloads\id\` (e.g. `template.png` or `template.jpg`) or specify its path/name.  
> We also have a built-in SVG vector reconstruction of the official Spheronix design ready as the default high-resolution base template (with the exact blue waves, purple orbit globe logo, decorative dot matrices, and circular silver/purple portrait ring) which can be seeded automatically if you prefer.

> [!CAUTION]
> ### 2. Terminal Script Execution Permission (`agentapi.bat`)
> When executing shell commands via the automated runner, the system encountered:  
> `open C:/Users/sudha/.gemini/antigravity-ide/bin/agentapi.bat: Access is denied.`  
> And when creating IDE artifacts:  
> `mkdir C:/Users/sudha/.gemini/antigravity-ide/brain/...: Access is denied.`  
> This indicates that the folder `C:\Users\sudha\.gemini\antigravity-ide\` has permission restrictions (e.g., owned by Administrator, read-only, or blocked by Windows Defender / file locks).  
> To allow terminal commands (`npm install`, running servers, and executing tests) to run:
> 1. Close any external terminal windows that might have `agentapi.bat` locked.
> 2. Check permissions for `C:\Users\sudha\.gemini\antigravity-ide\` to make sure your current Windows user account has full read/write access.

---

## Proposed System Architecture

### Monorepo Structure (`spheronix-id-card/` in `c:\Users\sudha\Downloads\id\`)
```
c:\Users\sudha\Downloads\id\
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts                 # MongoDB Mongoose connection & pool handling
│   │   ├── models/
│   │   │   ├── Counter.ts                  # Atomic sequence collection for SPXEST-TEXXXX
│   │   │   ├── Student.ts                  # Student entity with photo Base64, email/mobile unique indexes
│   │   │   ├── IDCard.ts                   # Generated card records, Base64 image, version, PDF
│   │   │   ├── IDCardTemplate.ts           # Active & versioned card templates with coordinate configs
│   │   │   ├── Admin.ts                    # Admin users with bcrypt passwordHash & roles
│   │   │   └── AuditLog.ts                 # Enterprise audit logs for all actions
│   │   ├── controllers/
│   │   │   ├── student.controller.ts       # Registration, retrieve, get details, stream photo
│   │   │   ├── admin.controller.ts         # Admin auth, dashboard metrics, student management, approvals
│   │   │   ├── idCard.controller.ts        # ID card image stream, PDF stream, admin regeneration
│   │   │   └── template.controller.ts      # Template upload, versioning, activation/deactivation
│   │   ├── services/
│   │   │   ├── idGenerator.service.ts      # Atomic findOneAndUpdate sequence generator
│   │   │   ├── photo.service.ts            # Sharp image validation, mime check, resize, circular crop, optimize
│   │   │   ├── idCard.service.ts           # Sharp/SVG composite engine with dynamic typography wrapping
│   │   │   ├── pdf.service.ts              # High-DPI PDF generation matching card aspect ratio
│   │   │   └── auth.service.ts             # JWT token issuance, verification, password hashing
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts          # Bearer JWT & role verification (ADMIN vs SUPER_ADMIN)
│   │   │   ├── upload.middleware.ts        # Multer memory storage with 5MB limit & magic-byte check
│   │   │   ├── validation.middleware.ts    # Zod schema validation for all endpoints
│   │   │   ├── rateLimit.middleware.ts     # Express rate limiters for registration, retrieval, auth
│   │   │   └── error.middleware.ts         # Centralized error handler with standardized JSON output
│   │   ├── routes/
│   │   │   ├── student.routes.ts           # /api/students/*
│   │   │   ├── admin.routes.ts             # /api/admin/*
│   │   │   ├── idCard.routes.ts            # /api/students/:studentId/id-card/*
│   │   │   └── template.routes.ts          # /api/admin/templates/*
│   │   ├── utils/
│   │   │   ├── base64.ts                   # Buffer <-> Base64 helpers with mimeType parsing
│   │   │   └── seed.ts                     # Initial seed for SUPER_ADMIN, Counter, & Default Spheronix Template
│   │   ├── app.ts                          # Express configuration, CORS, Helmet, rate-limits, routes
│   │   └── server.ts                       # Server bootstrap & graceful shutdown
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── app/
│   │   ├── layout.tsx                      # Root layout with Inter font, metadata, notifications
│   │   ├── page.tsx                        # Spheronix landing page with hero, branding, CTA buttons
│   │   ├── register/
│   │   │   └── page.tsx                    # Student registration page with live photo crop & Zod validation
│   │   ├── success/
│   │   │   └── page.tsx                    # Success page showing generated card, ID badge, PNG/PDF download
│   │   ├── retrieve-id/
│   │   │   └── page.tsx                    # Student ID retrieval by Student ID + Email verification
│   │   ├── id-card/
│   │   │   └── [studentId]/
│   │   │       └── page.tsx                # Card viewer & download center
│   │   └── admin/
│   │       ├── login/
│   │       │   └── page.tsx                # Admin login with JWT session
│   │       ├── layout.tsx                  # Protected Admin dashboard shell with navigation & sidebar
│   │       ├── page.tsx                    # Admin KPI metrics dashboard (Pending, Active, Expired, Totals)
│   │       ├── students/
│   │       │   ├── page.tsx                # Server-paginated student table with search, filters & actions
│   │       │   └── [id]/
│   │       │       └── page.tsx            # Student profile details, ID card history, approval/status controls
│   │       ├── templates/
│   │       │   └── page.tsx                # Template manager: upload new versions, coordinate visualizer, activate
│   │       └── audit-logs/
│   │           └── page.tsx                # System audit trail table
│   ├── components/
│   │   ├── StudentForm.tsx                 # React Hook Form + Zod student registration form
│   │   ├── PhotoUpload.tsx                 # Drag-and-drop photo uploader with client preview & validation
│   │   ├── IDCardPreview.tsx               # High-res canvas/image card viewer with zoom & flip
│   │   ├── DownloadButtons.tsx             # One-click PNG & PDF download action group
│   │   ├── AdminSidebar.tsx                # Sleek dark-blue/indigo collapsible admin navigation
│   │   ├── DashboardCard.tsx               # Metric statistics card with gradient accent
│   │   ├── StudentTable.tsx                # Data table with badge statuses, search debounce, pagination
│   │   ├── StatusBadge.tsx                 # Color-coded pill badge for PENDING, ACTIVE, EXPIRED, etc.
│   │   ├── SearchBar.tsx                   # Debounced server-side search input
│   │   └── Pagination.tsx                  # Accessible server-side pagination controller
│   ├── lib/
│   │   └── api.ts                          # Axios/Fetch API client wrapper with auth interceptor
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── .env.example
└── README.md
```

---

## Detailed Component & Data Specifications

### 1. Atomic Student ID Sequence Engine (`Counter.ts` & `idGenerator.service.ts`)
- Database model:
  ```typescript
  {
    _id: "studentId",
    sequenceValue: { type: Number, default: 0 }
  }
  ```
- Atomic generation:
  ```typescript
  const counter = await Counter.findOneAndUpdate(
    { _id: "studentId" },
    { $inc: { sequenceValue: 1 } },
    { new: true, upsert: true }
  );
  const studentId = `SPXEST-TE${String(counter.sequenceValue).padStart(4, "0")}`;
  ```
- Uniqueness is guaranteed at the MongoDB storage engine level.
- On card regeneration, the existing `studentId` is preserved; the counter is NEVER touched.

### 2. High-Fidelity ID Card Rendering Engine (`idCard.service.ts` & `photo.service.ts`)
- **Strictly No QR Code, No Barcode**.
- Template resolution: 1012 × 638 px (or proportional high-DPI aspect ratio matching standard credit/ID card 1.586 ratio).
- Elements composited in layers via Sharp:
  1. Base Template (Spheronix branding, logo, curved waves, tech dot clusters).
  2. Student Photo: Processed from Base64, circular-masked via SVG clipping mask with silver/purple border ring at `(x, y, radius)`.
  3. Dynamic SVG typography overlay:
     - Name: Bold Dark Indigo (wrapped if > 26 chars).
     - Labels & Values:
       - `Email Address : {{email}}`
       - `Mobile Number : {{mobile}}`
       - `College Name : {{collegeName}}`
       - `Branch / Department : {{branch}}` (multi-line wrapping support).
       - Badge Box: `ID : SPXEST-TEXXXX` in styled light-blue rounded container.
  4. Footer: `SPHERONIX TECHNOLOGIES PVT.LTD` / `TEMPORARY ID CARD`.
- Output: Optimally compressed PNG Base64 stored in MongoDB + direct streaming endpoint.
- PDF: Vector-embedded high-DPI document generated via PDFKit / pdf-lib matching the ID card aspect ratio.

### 3. MongoDB Schemas & Indexes
- **Student**:
  - `studentId`: String, unique, indexed.
  - `email`: String, unique, indexed, lowercase.
  - `mobile`: String, unique, indexed.
  - `fullName`, `collegeName`, `branch`, `course`, `rollNumber`, `graduationYear`.
  - `photo`: `{ data: String, mimeType: String }`.
  - `status`: Enum (`PENDING`, `ACTIVE`, `EXPIRED`, `REJECTED`, `DEACTIVATED`), default `PENDING`.
  - Timestamps enabled.
- **IDCard**:
  - `student`: ObjectId ref Student.
  - `studentId`: String, indexed.
  - `template`: ObjectId ref IDCardTemplate.
  - `templateVersion`: String.
  - `generatedImage`: `{ data: String, mimeType: String }`.
  - `pdfData`: Optional Base64 or GridFS reference.
  - `issueDate`, `expiryDate`, `status`, `version` (increments on admin regeneration).
- **IDCardTemplate**:
  - `name`: String.
  - `version`: String (e.g. `1.0`).
  - `templateImage`: `{ data: String, mimeType: String }`.
  - `configuration`: Coordinate maps for photo, name, email, mobile, college, branch, studentId.
  - `isActive`: Boolean.
- **Admin**:
  - `email`: String, unique, indexed.
  - `passwordHash`: String (bcrypt hash with salt rounds 12).
  - `role`: Enum (`SUPER_ADMIN`, `ADMIN`).
- **AuditLog**:
  - `admin`, `student`, `action`, `description`, `createdAt`.

### 4. API Endpoints
| Method | Endpoint | Access | Purpose |
|--------|----------|--------|---------|
| `POST` | `/api/students` | Public | Register student, validate, generate ID, render card |
| `POST` | `/api/students/retrieve` | Public | Retrieve card info via `studentId` + `email` |
| `GET` | `/api/students/:studentId` | Public/Auth | Get student details |
| `GET` | `/api/students/:studentId/photo` | Public | Stream student photo with `image/jpeg` |
| `GET` | `/api/students/:studentId/id-card` | Public | Get card metadata & status |
| `GET` | `/api/students/:studentId/id-card/image` | Public | Stream PNG image directly (`image/png`) |
| `GET` | `/api/students/:studentId/id-card/pdf` | Public | Download PDF directly with attachment header |
| `POST` | `/api/admin/login` | Public | Admin authentication -> returns JWT |
| `POST` | `/api/admin/logout` | Protected | Clear session |
| `GET` | `/api/admin/dashboard` | Admin | Aggregated metrics (pending, active, expired, counts) |
| `GET` | `/api/admin/students` | Admin | Server-paginated students with search & status filters |
| `GET` | `/api/admin/students/:id` | Admin | Full student record & ID card versions |
| `PATCH` | `/api/admin/students/:id/status` | Admin | Change student status (APPROVE, REJECT, DEACTIVATE) |
| `POST` | `/api/admin/id-cards/:id/regenerate` | Admin | Regenerate card using active template version |
| `GET` | `/api/admin/templates` | Admin | List all template versions |
| `POST` | `/api/admin/templates` | Super Admin | Upload new template version |
| `PATCH` | `/api/admin/templates/:id` | Super Admin | Activate / deactivate template |
| `GET` | `/api/admin/audit-logs` | Admin | Fetch system audit logs |

---

## Verification & Testing Plan

### 1. Test Case 1: Rohit Kumar (Primary Test)
- Data:
  - Name: `Rohit Kumar`
  - Email: `rohit.kumar@example.com`
  - Mobile: `+91 98765 43210`
  - College: `ABC Engineering College`
  - Branch: `Computer Science and Engineering`
- Verify:
  - Generated Student ID: `SPXEST-TE0001`
  - Card generated instantly with official Spheronix layout
  - Photo cropped into circular frame with silver/purple border
  - Dynamic fields rendered cleanly with no overlap
  - **Zero QR code / barcode**
  - Footer displays `SPHERONIX TECHNOLOGIES PVT.LTD` & `TEMPORARY ID CARD`
  - Direct PNG download works
  - Direct PDF download works

### 2. Test Case 2: Anjali Sharma & Sequence Integrity
- Register `Anjali Sharma`.
- Verify Student ID: `SPXEST-TE0002`.
- Verify Rohit Kumar remains `SPXEST-TE0001`.

### 3. Test Case 3: Duplicate Protection
- Re-register with `rohit.kumar@example.com` or `+91 98765 43210`.
- Verify exact error returned: `"An account with this email address already exists."`
- Verify no duplicate records or counter increments.

### 4. Test Case 4: Card Regeneration
- Admin regenerates Rohit Kumar's card.
- Verify Student ID remains `SPXEST-TE0001` (never `SPXEST-TE0003`).
- Verify Card version increments to `2`.
- Verify AuditLog records `CARD_REGENERATED`.

### 5. Test Case 5: Student Retrieval & Security
- Retrieve with `SPXEST-TE0001` + `rohit.kumar@example.com` -> Success.
- Retrieve with wrong email -> `"Student ID or email address is incorrect."`
- Verify unauthorized requests cannot access admin endpoints.
