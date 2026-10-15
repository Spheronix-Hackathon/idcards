# Spheronix Temporary Student ID Card Generator - Walkthrough & Verification Guide

## Executive Summary
A production-ready full-stack enterprise web application for **SPHERONIX TECHNOLOGIES PVT. LTD.** has been architected and built from the ground up, complying with all 100 specifications in the project mandate.

---

## Key Modules Built

### 1. Atomic Concurrency-Safe Student ID Sequence
- **Format**: `SPXEST-TEXXXX` (e.g. `SPXEST-TE0001`, `SPXEST-TE0002`...)
- **Mechanism**: Implemented in [idGenerator.service.ts](file:///c:/Users/sudha/Downloads/id/backend/src/services/idGenerator.service.ts) using atomic MongoDB operation:
  ```typescript
  const counter = await Counter.findOneAndUpdate(
    { _id: 'studentId' },
    { $inc: { sequenceValue: 1 } },
    { new: true, upsert: true }
  );
  const studentId = `SPXEST-TE${String(counter.sequenceValue).padStart(4, '0')}`;
  ```
- **Guaranteed Permanence**: When an admin regenerates a card, the student ID is **never changed or re-incremented** ([idCard.controller.ts](file:///c:/Users/sudha/Downloads/id/backend/src/controllers/idCard.controller.ts#L125-L185)).

### 2. High-Fidelity Official Spheronix ID Card Engine
- Implemented in [defaultTemplate.ts](file:///c:/Users/sudha/Downloads/id/backend/src/utils/defaultTemplate.ts) & [idCard.service.ts](file:///c:/Users/sudha/Downloads/id/backend/src/services/idCard.service.ts).
- **Faithful Design Elements**:
  - Globe logo with purple orbit ellipse & "SPHERONIX Technologies Pvt. Ltd."
  - Deep blue and indigo curved waves at top and bottom.
  - White & light-blue tech mesh with dot matrix grids.
  - Silver & purple outer circular portrait ring with drop shadow.
  - Dynamic typography with text-wrapping and overflow prevention.
  - Styled light-blue badge box: `ID : SPXEST-TEXXXX`.
  - Bottom wave footer: `SPHERONIX TECHNOLOGIES PVT.LTD` & `TEMPORARY ID CARD`.
- **STRICT NON-NEGOTIABLE**: **ABSOLUTELY ZERO QR CODE, ZERO BARCODE**.

### 3. Base64 In-Database Storage & Optimized Streaming
- Student photos are inspected, validated (magic-bytes via Sharp), resized to max 800x800, and stored as Base64 in MongoDB ([photo.service.ts](file:///c:/Users/sudha/Downloads/id/backend/src/services/photo.service.ts)).
- Direct streaming endpoints avoid bulky Base64 payloads in JSON API responses:
  - `GET /api/students/:studentId/id-card/image` (Direct PNG image stream)
  - `GET /api/students/:studentId/photo` (Direct student photo stream)
  - `GET /api/students/:studentId/id-card/pdf` (Print-ready proportional PDF stream via [pdf.service.ts](file:///c:/Users/sudha/Downloads/id/backend/src/services/pdf.service.ts))

### 4. Student Self-Registration & Retrieval Portal
- **Landing Page** ([app/page.tsx](file:///c:/Users/sudha/Downloads/id/frontend/app/page.tsx)): Modern Spheronix branding, call-to-actions, and security guarantees.
- **Registration** ([app/register/page.tsx](file:///c:/Users/sudha/Downloads/id/frontend/app/register/page.tsx)): Form validation via React Hook Form + Zod, drag-and-drop photo uploader with client preview, 5MB limit, and loading indicator.
- **Success Page** ([app/success/page.tsx](file:///c:/Users/sudha/Downloads/id/frontend/app/success/page.tsx)): Displays generated card preview, assigned Student ID with one-click copy, and one-click PNG & PDF download buttons.
- **Retrieve ID** ([app/retrieve-id/page.tsx](file:///c:/Users/sudha/Downloads/id/frontend/app/retrieve-id/page.tsx)): Lookup by `studentId` + `email` with error handling.

### 5. Comprehensive Admin Management Portal
- **Authentication**: JWT token verification + bcrypt password hashing ([admin/login/page.tsx](file:///c:/Users/sudha/Downloads/id/frontend/app/admin/login/page.tsx)). Default credentials: `admin@spheronix.com` / `SpheronixAdmin2026!`.
- **Dashboard KPIs** ([admin/page.tsx](file:///c:/Users/sudha/Downloads/id/frontend/app/admin/page.tsx)): Total Students, Pending, Active, Expired, Deactivated, Cards Generated.
- **Students Table** ([admin/students/page.tsx](file:///c:/Users/sudha/Downloads/id/frontend/app/admin/students/page.tsx)): Server-side search across ID/Name/Email/College, status filter, server pagination, quick status toggles (Approve, Deactivate, etc.), and card regeneration.
- **Student Profile & Card History** ([admin/students/[id]/page.tsx](file:///c:/Users/sudha/Downloads/id/frontend/app/admin/students/[id]/page.tsx)): Complete record inspection, status changer, and card version history.
- **Template Management** ([admin/templates/page.tsx](file:///c:/Users/sudha/Downloads/id/frontend/app/admin/templates/page.tsx)): Upload new template versions, preview, and activate.
- **Audit Logs** ([admin/audit-logs/page.tsx](file:///c:/Users/sudha/Downloads/id/frontend/app/admin/audit-logs/page.tsx)): Comprehensive event log of registrations, regenerations, approvals, and logins.

---

## Quick Start Guide

### 1. Backend
```bash
cd backend
npm install
npm run seed     # Seeds Counter, Super Admin, and Official Template v1.0
npm run dev      # Starts API server on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev      # Starts Next.js on http://localhost:3000
```
