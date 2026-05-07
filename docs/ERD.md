# Pathways Entity Relationship Diagram

## Core Entities

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ id: String (PK)                                                            │
│ email: String (unique)                                                     │
│ passwordHash: String                                                       │
│ fullName: String                                                           │
│ role: Role (enum: STUDENT, ACADEMIC_SUPERVISOR, FIELD_SUPERVISOR, ADMIN)    │
│ avatarUrl: String?                                                         │
│ createdAt: DateTime                                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
        ┌───────────────┐ ┌─────────────────┐ ┌────────────────┐
        │ Internship    │ │TrainingProgram │ │TrainingAppl...  │
        │ (as student)  │ │ (createdBy)     │ │ (as student)    │
        └───────────────┘ └─────────────────┘ └────────────────┘
                    │               │               │
                    ▼               │               │
        ┌───────────────┐           │               │
        │ Internship    │           │               │
        │ (as academic) │           │               │
        └───────────────┘           │               │
                    │               │               │
                    ▼               │               │
        ┌───────────────┐           │               │
        │ Internship    │◄──────────┘               │
        │ (as field)    │                           │
        └───────────────┘                           │
                    │                               │
                    ▼                               │
        ┌─────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TRAININGPROGRAM                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ id: String (PK)                                                            │
│ title: String                                                               │
│ description: String                                                         │
│ organization: String                                                        │
│ durationWeeks: Int                                                          │
│ seats: Int                                                                  │
│ applicationDeadline: DateTime?                                              │
│ active: Boolean                                                              │
│ createdById: String (FK → User.id)                                          │
│ createdAt: DateTime                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ├──────────────────────┐
                                    │                      │
                                    ▼                      ▼
                        ┌───────────────────┐  ┌──────────────────────┐
                        │TrainingApplication│  │    Internship        │
                        │                   │  │                      │
                        └───────────────────┘  └──────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                      TRAININGAPPLICATION                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ id: String (PK)                                                            │
│ studentId: String (FK → User.id)                                            │
│ programId: String (FK → TrainingProgram.id)                                 │
│ status: ApplicationStatus (enum: PENDING, APPROVED, REJECTED, WITHDRAWN)    │
│ coverLetter: String?                                                         │
│ decidedById: String? (FK → User.id)                                         │
│ decidedAt: DateTime?                                                         │
│ createdAt: DateTime                                                         │
│                                                                             │
│ Unique: [studentId, programId]                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ (approved → creates)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INTERNSHIP                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ id: String (PK)                                                            │
│ studentId: String (FK → User.id)                                            │
│ academicSupervisorId: String (FK → User.id)                                  │
│ fieldSupervisorId: String (FK → User.id)                                     │
│ programId: String (FK → TrainingProgram.id)                                  │
│ appliedFromId: String? (FK → TrainingApplication.id) (unique)               │
│ startDate: DateTime                                                         │
│ endDate: DateTime                                                           │
│ status: InternshipStatus (enum: ACTIVE, COMPLETED, ON_HOLD, TERMINATED)     │
│ progressPercent: Int (default: 0)                                            │
│ createdAt: DateTime                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
        ┌───────────────┐ ┌─────────────────┐ ┌────────────────┐
        │ Report        │ │   Evaluation    │ │ConversationPart.│
        │               │ │                 │ │                │
        └───────────────┘ └─────────────────┘ └────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           REPORT                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ id: String (PK)                                                            │
│ internshipId: String (FK → Internship.id)                                   │
│ weekNumber: Int                                                             │
│ title: String                                                               │
│ body: String (text)                                                         │
│ status: ReportStatus (enum: DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, ...) │
│ createdAt: DateTime                                                         │
│                                                                             │
│ Relations:                                                                  │
│   - attachments: ReportAttachment[]                                         │
│   - reviews: ReportReview[]                                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        REPORTREVIEW                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ id: String (PK)                                                            │
│ reportId: String (FK → Report.id)                                           │
│ reviewerId: String (FK → User.id)                                           │
│ decision: String (APPROVED, REJECTED, UNDER_REVIEW)                         │
│ comment: String (text)                                                      │
│ createdAt: DateTime                                                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         EVALUATION                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ id: String (PK)                                                            │
│ internshipId: String (FK → Internship.id)                                   │
│ evaluatorId: String (FK → User.id) (field supervisor)                       │
│ cosignedById: String? (FK → User.id) (academic supervisor)                 │
│ cosignedAt: DateTime?                                                       │
│ period: String                                                              │
│ overallComment: String (text)                                               │
│ totalScore: Int                                                             │
│ createdAt: DateTime                                                         │
│                                                                             │
│ Relations:                                                                  │
│   - criteria: EvaluationCriterion[]                                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                     EVALUATIONCRITERION                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ id: String (PK)                                                            │
│ evaluationId: String (FK → Evaluation.id)                                   │
│ label: String                                                               │
│ score: Int (0-10)                                                           │
│ comment: String? (text)                                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        CONVERSATION                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ id: String (PK)                                                            │
│ createdAt: DateTime                                                         │
│ lastMessageAt: DateTime                                                     │
│                                                                             │
│ Relations:                                                                  │
│   - participants: ConversationParticipant[]                                 │
│   - messages: Message[]                                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                   CONVERSATIONPARTICIPANT                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ conversationId: String (FK → Conversation.id)                               │
│ userId: String (FK → User.id)                                               │
│ joinedAt: DateTime                                                          │
│ lastReadAt: DateTime?                                                       │
│                                                                             │
│ Composite PK: [conversationId, userId]                                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           MESSAGE                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ id: String (PK)                                                            │
│ conversationId: String (FK → Conversation.id)                               │
│ senderId: String (FK → User.id)                                             │
│ body: String (text)                                                         │
│ createdAt: DateTime                                                         │
│                                                                             │
│ Relations:                                                                  │
│   - attachments: MessageAttachment[]                                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        NOTIFICATION                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ id: String (PK)                                                            │
│ userId: String (FK → User.id)                                               │
│ type: NotificationType (enum)                                               │
│ title: String                                                               │
│ body: String                                                                │
│ link: String?                                                               │
│ readAt: DateTime?                                                           │
│ createdAt: DateTime                                                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          AUDITLOG                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ id: String (PK)                                                            │
│ userId: String (FK → User.id)                                               │
│ action: String                                                              │
│ entity: String                                                              │
│ entityId: String                                                            │
│ metadata: Json?                                                             │
│ createdAt: DateTime                                                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                     PASSWORDRESETTOKEN                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ id: String (PK)                                                            │
│ userId: String (FK → User.id)                                               │
│ token: String (unique)                                                      │
│ expires: DateTime                                                           │
│ createdAt: DateTime                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Key Relationships

1. **User ↔ Internship**: Three possible roles (student, academic supervisor, field supervisor)
2. **TrainingApplication ↔ Internship**: One-to-one via `appliedFromId` (provenance tracking)
3. **Internship ↔ Report/Evaluation**: One-to-many
4. **Conversation ↔ User**: Many-to-many via ConversationParticipant
5. **Report ↔ ReportReview**: One-to-many (multiple supervisors can review)
6. **Evaluation ↔ EvaluationCriterion**: One-to-many (score breakdown)

## Indexes

- `User.email` (unique)
- `TrainingApplication.[studentId, programId]` (composite unique)
- `Internship.appliedFromId` (unique)
- `ConversationParticipant.userId`
- `Message.conversationId`
- `Message.senderId`
- `PasswordResetToken.token` (unique)
