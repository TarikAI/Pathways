# Pathways — Improvements Plan

This document is the authoritative plan to take the current Pathways prototype to a clean, defensible graduation-project state. It is prescriptive: every section is meant to be executed, not debated. Treat it as the work order for the implementation agent.

## 1. Current State Audit

The repo has the foundation in place: Next.js 15 App Router, Prisma schema for all entities, Auth.js v5 credentials login, role-based register flow, brand-themed shell (sidebar + topbar), and a few placeholder pages (student dashboard, reports list, supervisor dashboard, messages skeleton, admin users table). It does **not** yet form a working system.

### 1.1 Functional gaps blocking the demo

1. **Reports — submission is fake.** `app/(app)/student/reports/new/page.tsx` simulates a 1s delay and redirects. There is no `POST /api/reports` route, no Vercel Blob upload, no link from `internship → report`. A demo cannot show the report flow.
2. **Messages — read-only stub.** `app/(app)/messages/page.tsx` lists conversations but clicking them does nothing. No `[conversationId]` page, no thread view, no composer, no `POST /api/conversations/.../messages`. Field/academic supervisors and students cannot communicate inside the app.
3. **Internships — students cannot join, supervisors cannot create, field supervisors cannot assign.** This is the core workflow the user called out and it is entirely missing. There is no listings page, no application form, no review queue, no assignment UI.
4. **Evaluations — not implemented at all.** Schema exists; no UI, no API, no cosign flow.
5. **Notifications — not implemented.** No bell, no list, no `createNotification()` helper, no Resend wiring.
6. **Settings — read-only.** Cannot edit profile, change password, or toggle notification preferences.
7. **Admin — table-only.** No create/edit/disable user, no programs management, no audit log view.
8. **Auth flow gaps.** No `forgot-password` / `reset-password` pages despite `PasswordResetToken` model existing. `requireSession` and `requireRole` throw raw `Error` (which Next.js renders as a 500) instead of redirecting to `/login` or `/403`.
9. **Spec routes missing.** Per `BUILD_PROMPT.md` §3 these pages are absent: `/student/internship`, `/student/reports/[id]`, `/student/evaluations`, `/supervisor/students`, `/supervisor/students/[id]`, `/supervisor/reports`, `/supervisor/reports/[id]`, `/supervisor/evaluations`, `/supervisor/evaluations/[id]`, `/notifications`, `/admin/programs`, `/admin/audit`, both forgot/reset password pages.
10. **APIs.** Only `/api/auth/register` and `/api/auth/[...nextauth]` exist. The spec calls for ~20 endpoints — none of the resource APIs are present.
11. **Seed data is too thin.** Spec requires 2 academic supervisors, 2 field supervisors, 4 students, 2 programs, multiple reports in mixed states, evaluations, conversations, notifications. Current seed has 1 of most things and only one report.
12. **Email — Resend never wired.** `lib/email.ts` does not exist.
13. **File uploads — Vercel Blob never wired.** `lib/blob.ts` does not exist.

### 1.2 Code-quality issues that look AI-generated

These violate the anti-marker rules in `BUILD_PROMPT.md` §8 and must be fixed before submission. The graduation committee will read the code.

- **Dead-giveaway comment.** `app/(app)/student/reports/new/page.tsx:13`: `// Dummy submit logic since no backend endpoint for report creation was explicitly requested, but we need the form.` Delete it and ship the real endpoint.
- **`as any` casts on `session.user`** in five places (`app/(app)/layout.tsx:10`, `app/(app)/settings/page.tsx:22`, `lib/auth.ts:44/51-53`, etc.). These exist only because NextAuth types aren't augmented. Add a `types/next-auth.d.ts` declaration that extends `Session["user"]` and `User` with `id`, `role`, `fullName`, `avatarUrl` — then delete every cast.
- **Banner-style inline section comments** in `prisma/seed.ts` (`// Users`, `// Programs`, `// Internship`, `// Report`). Delete; the variable names are self-documenting.
- **Empty catch with no logging** in `app/api/auth/register/route.ts:61` (`} catch {`). Either log `error` to a structured logger or rethrow — never silently eat a 500.
- **Plain `<a href="/login">`** in `app/(auth)/register/page.tsx:192`. Use `next/link`.
- **`<img>` instead of `next/image`** in `register/page.tsx:84`. Triggers an ESLint warning and is a real LCP regression.
- **Dead code in `register/page.tsx:149-155`** — destructures `Icon` from each role but never renders it.
- **`auth.config.ts:7`** uses `auth: any, request: { nextUrl: URL }`. Type it properly with `NextAuthConfig` from `next-auth`.
- **Two `auth` configurations** (`lib/auth.ts` and `auth.config.ts`) is the documented Auth.js v5 split, but the providers array in `auth.config.ts` is empty and the `authorized` callback is the only logic. Keep the split, but move the redirect-after-login map into a typed helper `roleHomePath(role: Role)` in `lib/auth-guards.ts` so it's used by both middleware and the post-login redirect.
- **Missing strict mode evidence.** `tsconfig.json` should be checked: `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride` all on. Same for `eslint.config.js`: `@typescript-eslint/no-explicit-any` should be **error**, not warn.
- **Two `bcryptjs` callsites with hardcoded cost 12.** Extract `BCRYPT_COST = 12` into `lib/auth.ts` once.
- **Inconsistent string quoting** between files (mix of `"` and `'`). Run Prettier with a fixed `singleQuote` choice and reformat.
- **Hardcoded class strings** like `bg-green-100 text-green-800` in `student/reports/page.tsx`. Replace with a tiny `statusBadgeClass(status)` helper in `lib/utils.ts` so the same mapping is used by report list, supervisor review, and admin views.
- **`await db.report.findMany({ where: { internshipId: { in: internshipIds } } })`** after a separate `findMany` of internships. One query with a relation filter `where: { internship: { studentId } }` is clearer and one round-trip cheaper.
- **No `unstable_noStore` / `revalidatePath`** anywhere. Server pages will be statically cached at build and stale forever in production. Add `export const dynamic = 'force-dynamic'` (or `unstable_noStore()`) on every authenticated page, or migrate reads to Server Actions called from the page.

## 2. Proposed Workflow (the missing core)

The screenshots describe the goals at a high level. The plan below makes the actor responsibilities concrete and unambiguous.

### 2.1 Roles and what each one does

| Role | Responsibility |
|---|---|
| **Admin** | Manage users; manage `TrainingProgram` master list; view audit log. |
| **Academic Supervisor** | Publish internship openings (programs) for their department; review weekly reports; submit final evaluation; cosign field-supervisor evaluations. |
| **Field Supervisor** | Receive student applications; **assign each accepted student to one Academic Supervisor**, materialising an `Internship`; supervise day-to-day; submit weekly evaluations. |
| **Student** | Browse open programs; apply (with cover note); after acceptance and assignment, see their Internship workspace; submit weekly reports; read evaluations; chat with both supervisors. |

### 2.2 End-to-end flow

```
[Academic Supervisor]            [Student]                [Field Supervisor]            [Admin]
  publish program  ─────►   browse /internships
                            apply (TrainingApplication, PENDING)
                                       │
                                       ▼
                                                       review queue
                                                       approve/reject
                                                       on approve: pick academic
                                                       supervisor → create
                                                       Internship (ACTIVE)
                                       │
                                       ▼
                            internship workspace unlocks
                            submit weekly Reports ───► reviewed by Academic Sup
                                                       weekly Evaluation by Field Sup
                                                       cosigned by Academic Sup
                                       ▼
                            internship marked COMPLETED       audit log entries
```

### 2.3 Schema deltas required to support the flow

The current schema is 90% sufficient. Add only what the workflow strictly needs:

1. `TrainingProgram` — add `seats Int`, `applicationDeadline DateTime?`, `createdById String` (the academic supervisor who published it). Index `createdById`.
2. `TrainingApplication` — already has `decidedById`. Add `coverLetter String? @db.Text` (the application narrative; `message` is fine to keep but rename in a single migration to `coverLetter` for clarity, or keep `message` and document it).
3. **No new tables needed** — assignment is the act of inserting an `Internship` row referencing the `TrainingApplication.programId`, the student, the chosen academic supervisor, and the assigning field supervisor.
4. Add an `appliedFromId String?` FK on `Internship → TrainingApplication.id` so we can trace which application produced which internship (audit + analytics). Optional, single index.

Run a single named Prisma migration: `add_program_seats_and_internship_provenance`.

### 2.4 Page additions for the workflow

| Path | Role | Purpose |
|---|---|---|
| `/internships` (under `(app)`) | STUDENT | Browse active programs with seats remaining; "Apply" CTA. |
| `/student/applications` | STUDENT | Status of submitted applications. |
| `/student/internship` | STUDENT | Active internship dashboard (already in spec). |
| `/supervisor/programs` | ACADEMIC_SUPERVISOR | List + create programs ("Publish opening"). |
| `/supervisor/programs/[id]` | ACADEMIC_SUPERVISOR | Program detail + applicant list (read-only — assignment happens at field-sup level). |
| `/field/applications` | FIELD_SUPERVISOR | Review queue. Approve → opens an "Assign academic supervisor" dialog. |
| `/field/students` | FIELD_SUPERVISOR | Currently-assigned students. |

### 2.5 API endpoints to ship

POST `/api/programs`, GET `/api/programs`, GET `/api/programs/:id`
POST `/api/applications`, GET `/api/applications`, PATCH `/api/applications/:id` (decide + assign)
POST `/api/reports`, GET `/api/reports`, GET `/api/reports/:id`, POST `/api/reports/:id/reviews`
POST `/api/uploads` (Blob signed URL)
GET/POST `/api/conversations`, GET/POST `/api/conversations/:id/messages`, POST `/api/conversations/:id/read`
POST `/api/evaluations`, POST `/api/evaluations/:id/cosign`
GET `/api/notifications`, POST `/api/notifications/:id/read`

Every handler: parse with the matching Zod schema in `lib/validators/<resource>.ts`, call `requireRole`, write through Prisma, append an `AuditLog` row for state-changing routes, fan out a `Notification` where relevant.

## 3. Chat — Concrete Improvements

Today the chat is one column showing names. The deliverable for the demo:

1. **People discovery.** Add `/api/users/search?q=` returning users in the same internship graph (a student can DM their two supervisors; a supervisor can DM their assigned students; admins can DM anyone). Render this as a "New conversation" dialog with a debounced search.
2. **Two-pane thread view.** Build `app/(app)/messages/[conversationId]/page.tsx` with the conversation list on the left (preserving the current layout) and a `MessageThread` + `MessageComposer` on the right.
3. **Read receipts** using the existing `ConversationParticipant.lastReadAt`. On thread mount, `POST /api/conversations/:id/read`. In the list, show an unread dot per conversation when `lastMessageAt > lastReadAt`.
4. **Live updates.** No websockets — use `useSWR` with `refreshInterval: 4000` against `/api/conversations` and the active thread. Document this choice in `docs/architecture.md`; it is honest and adequate for a graduation demo.
5. **Attachments.** Re-use the Blob upload route. `MessageAttachment` already exists.
6. **Presence (optional polish).** A `lastSeenAt` column on `User` updated on every authed request via a Server Action; render a green dot if `< 2 min`. Keep this off the critical path.
7. **Auto-create supervisor↔student conversations** when an `Internship` is created (in the same transaction). Eliminates the empty-state dead end.

## 4. Code-Cleanliness Pass (must run before submission)

Run as a single discrete commit titled `clean up casts, comments, and lints`.

1. Add `types/next-auth.d.ts`, delete every `as any` on `session.user`.
2. Replace the throw in `requireSession`/`requireRole` with `redirect('/login')` / `redirect('/403')` (use `next/navigation`).
3. Delete the "Dummy submit logic" comment and ship a real `POST /api/reports`.
4. Replace `<a>` with `Link` and `<img>` with `next/image` in `register/page.tsx`.
5. Remove banner comments from `seed.ts` (`// Users`, `// Programs`, …).
6. Make `eslint.config.js` strict: `@typescript-eslint/no-explicit-any: error`, `@typescript-eslint/no-unused-vars: error`, `react/jsx-no-target-blank: error`. Run `pnpm lint` clean.
7. Run `pnpm format` (not just `format:check`) to normalise quoting.
8. Add `lib/utils.ts` with `cn()`, `formatDate()`, `statusBadgeClass()`. Replace inline class branches.
9. Tighten `tsconfig.json`: `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`. Fix the small fallout (mostly `?.` adjustments).
10. Confirm `pnpm typecheck && pnpm lint && pnpm build` is clean before each commit.

## 5. Documentation & Presentation Deliverables

These are graded artefacts. Produce them as part of the same branch.

1. **`docs/architecture.md`** — one diagram (Mermaid), data-flow narrative, list of trade-offs (polling vs WebSocket, JWT vs DB sessions, MySQL vs Postgres). One page.
2. **`docs/database-erd.md`** — Mermaid ER diagram generated from the Prisma schema. Run `prisma generate` then a manual translation; do not auto-tool a half-broken graph.
3. **`docs/user-guide.md`** — screenshots for each role's golden path: register → land on dashboard → core action. Eight images max.
4. **`docs/testing.md`** — manual test matrix: 4 roles × 6 flows = 24 rows, pass/fail column.
5. **README.md updates** — add the workflow diagram from §2.2, the seeded test credentials, and a "Demo script" section with the eight steps to demo end-to-end in 5 minutes.
6. **Slide deck `docs/presentation/Pathways.pptx`** — built from the `pptx` skill, ~14 slides, mapped to the chapters in `docs/build_plan.md` (Problem, Objectives, Scope, Solution, Architecture, Workflow, Schema, Tech Stack, Walkthrough screenshots, Limitations, Future Work, Q&A). No emoji, brand colours from `app/globals.css`.
7. **Final report `docs/Pathways-Final-Report.docx`** — built from the `docx` skill, follows the structure from the screenshots: Introduction, Problem, Objectives, Scope, Proposed Solution, Main Features, Tools & Technologies, Expected Outcomes, Methodology, Architecture, Implementation, Testing, Conclusion. Insert the Mermaid diagrams as PNGs (export with `mmdc` or screenshot).

## 6. Build Sequence (the order to actually do this in)

Each numbered item is one commit. Subjects are written as the agent should commit them.

1. `tighten tsconfig and eslint to strict, fix fallout`
2. `add next-auth types module, drop session as-any casts`
3. `redirect on auth-guard failures instead of throwing`
4. `extract status badge helper and date utils`
5. `add program seats and internship provenance migration`
6. `expand seed data to spec (2/2/4, 2 programs, mixed reports, conversations)`
7. `programs api and academic supervisor publish flow`
8. `student internships browse and apply flow`
9. `field supervisor application review and assign-academic flow`
10. `report submission api with blob upload`
11. `report detail page and academic supervisor review`
12. `weekly evaluation form and cosign flow`
13. `messages thread page composer and polling with read receipts`
14. `notifications fan-out helper and bell + list page`
15. `forgot password and reset password flows with resend`
16. `settings: edit profile change password notification prefs`
17. `admin programs page and audit log viewer`
18. `landing page polish and screenshots`
19. `architecture, ERD, user guide, testing matrix docs`
20. `presentation deck and final report`

## 7. Definition of Done

The branch is ready for the committee when **all** of these are true:

- `pnpm install && pnpm prisma migrate dev && pnpm db:seed && pnpm build` succeeds with zero warnings.
- `pnpm lint` and `pnpm typecheck` are clean.
- Logging in as each of the four seeded roles lands on a non-empty dashboard.
- A student can apply to a program, a field supervisor can approve and assign an academic supervisor, and the resulting internship is visible to all three users.
- A student can submit a report with a PDF attachment; the academic supervisor can review and approve it; the student receives a notification.
- A field supervisor can submit a weekly evaluation; the academic supervisor can cosign it.
- Every pair (student↔academic, student↔field, academic↔field for the same internship) has a pre-seeded conversation; messages send and appear within the polling interval; unread badges clear on read.
- No `as any`, no banner comments, no "Dummy"/"TODO"/"AI" markers, no `<a>` for internal nav, no `<img>` for managed images.
- `docs/` contains architecture, ERD, user guide, testing matrix, presentation, final report.
- README screenshots match the deployed UI.

When all of the above hold, push the branch, deploy to Vercel with `prisma migrate deploy`, and add the production URL plus the four test credentials to the README.
