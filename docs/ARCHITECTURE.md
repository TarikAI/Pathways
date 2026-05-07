# Pathways Architecture

## Overview

Pathways is a cooperative training management platform built with Next.js 15, Prisma ORM, and MySQL. The platform connects students, academic supervisors, and field supervisors to streamline the internship experience.

## Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom brand colors
- **UI Components**: Lucide React icons
- **Forms**: React Hook Form with Zod validation
- **Real-time**: Polling for messages and notifications

### Backend
- **Runtime**: Node.js (Vercel Functions with Fluid Compute)
- **API**: Next.js Route Handlers
- **ORM**: Prisma with MySQL (TiDB Cloud)
- **Authentication**: Auth.js v5 (NextAuth) with credentials provider
- **File Storage**: Vercel Blob (public/private)
- **Email**: Resend for transactional emails

### Infrastructure
- **Hosting**: Vercel
- **Database**: TiDB Cloud (MySQL-compatible)
- **Environment Variables**: Managed via Vercel env

## Project Structure

```
pathways/
├── app/
│   ├── (app)/              # Authenticated app routes
│   │   ├── student/        # Student-facing pages
│   │   ├── supervisor/     # Supervisor pages
│   │   ├── admin/          # Admin pages
│   │   ├── dashboard/      # Role-based dashboard
│   │   ├── messages/       # Messaging system
│   │   ├── notifications/  # Notification center
│   │   └── settings/       # User settings
│   ├── (auth)/             # Authentication pages
│   ├── (marketing)/        # Landing page
│   └── api/                # API routes
├── components/
│   └── layout/             # Layout components
├── lib/
│   ├── auth.ts             # Auth.js config & helpers
│   ├── auth-guards.ts      # Role-based access control
│   ├── blob.ts             # Vercel Blob wrapper
│   ├── db.ts               # Prisma client
│   └── utils.ts            # Utility functions
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed data
└── types/
    └── next-auth.d.ts      # Auth.js type extensions
```

## Core Features

### 1. Authentication & Authorization
- Role-based access control (RBAC)
- Roles: STUDENT, ACADEMIC_SUPERVISOR, FIELD_SUPERVISOR, ADMIN
- Session management via Auth.js
- Password reset flow with email tokens

### 2. Program Management
- Academic supervisors create training programs
- Programs include: title, description, organization, duration, seats
- Application deadlines tracking
- Active/inactive status

### 3. Application Flow
- Students browse and apply to programs
- Field supervisors approve/reject applications
- On approval: Internship + Conversation created automatically
- Academic supervisor assigned during approval

### 4. Internship Tracking
- Progress percentage (0-100%)
- Status: ACTIVE, COMPLETED, ON_HOLD, TERMINATED
- Start/end date tracking
- Linked to original application (provenance)

### 5. Weekly Reports
- Students submit weekly reports
- Attachments via Vercel Blob
- Status workflow: DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED/REJECTED
- Supervisors review and provide feedback
- Notifications on status changes

### 6. Evaluations
- Field supervisors submit periodic evaluations
- Criteria-based scoring (0-10 per criterion)
- Academic supervisor cosign required
- Notifications to student on cosign

### 7. Messaging System
- Multi-participant conversations
- Real-time polling for new messages
- Read receipts (lastReadAt per participant)
- Attachment support

### 8. Notifications
- Fan-out notifications on relevant events
- Types: MESSAGE, REPORT_SUBMITTED, REPORT_REVIEWED, EVALUATION_POSTED, APPLICATION_DECISION
- Unread count tracking
- Mark as read functionality

### 9. Audit Logging
- All state-changing operations logged
- Tracks: user, action, entity, entity ID, metadata, timestamp
- Admin audit log viewer for compliance

## Data Flow

### Application Approval Flow
```
1. Student applies → TrainingApplication (PENDING)
2. Field supervisor approves → PATCH /api/applications/[id]
3. System creates:
   - Internship (ACTIVE)
   - Conversation (with all 3 participants)
   - Initial Message
   - Notifications to student + academic supervisor
   - Audit log entry
```

### Report Submission Flow
```
1. Student submits → POST /api/reports
2. Status set to SUBMITTED
3. Notification sent to academic supervisor
4. Audit log entry created
5. Supervisor reviews → POST /api/reports/[id]/reviews
6. Status updated, notification to student
```

### Evaluation Flow
```
1. Field supervisor submits → POST /api/evaluations
2. Academic supervisor notified (cosign pending)
3. Academic supervisor cosigns → POST /api/evaluations/[id]/cosign
4. Student notified of completed evaluation
```

## Security Considerations

1. **Authentication**: BCrypt with cost factor 12
2. **Session Management**: JWT tokens via Auth.js
3. **Authorization**: Server-side role checks on all protected routes
4. **File Upload**: Vercel Blob with private access by default
5. **Input Validation**: Zod schemas on all API endpoints
6. **CSRF Protection**: Built-in with Next.js/Auth.js
7. **SQL Injection**: Prisma ORM provides protection

## Performance Optimizations

1. **Database Indexes**: Strategic indexes on foreign keys and frequently queried fields
2. **Polling Optimization**: 5-10s intervals for real-time features
3. **Pagination**: Cursor-based pagination for messages and logs
4. **Lazy Loading**: Messages loaded on-demand in conversations
5. **Server Components**: Leverage Next.js RSC for reduced client JS

## Deployment

### Environment Variables Required
- `DATABASE_URL`: MySQL connection string
- `NEXTAUTH_SECRET`: Auth.js secret
- `NEXTAUTH_URL`: Application URL
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob token
- `RESEND_API_KEY`: Resend email API key
- `RESEND_FROM_EMAIL`: Sender email address

### Deployment Steps
1. Push to main branch
2. Vercel auto-deploys
3. Run database migrations: `prisma db push`
4. Seed data: `npm run seed`
