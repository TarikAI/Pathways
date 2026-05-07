# Pathways Testing Matrix

## Testing Strategy

Pathways uses a multi-layered testing approach to ensure reliability and quality across the cooperative training platform.

## Test Categories

### 1. Unit Tests

| Component | Coverage | Tools | Status |
|-----------|----------|-------|--------|
| Auth helpers (hash, verify, tokens) | Critical | Jest | Pending |
| Utility functions (cn, formatDate) | High | Jest | Pending |
| Validators (Zod schemas) | High | Jest | Pending |
| DB query helpers | Medium | Jest + Test DB | Pending |

### 2. Integration Tests

| Feature | Endpoints Tested | Tools | Status |
|---------|------------------|-------|--------|
| Authentication flow | POST /api/auth/signin, /api/auth/signup | Jest + MSW | Pending |
| Program CRUD | GET/POST/PATCH/DELETE /api/programs | Jest + Test DB | Pending |
| Application flow | POST /api/applications, PATCH /api/applications/[id] | Jest + Test DB | Pending |
| Report submission | POST /api/reports, /api/reports/[id]/reviews | Jest + Test DB | Pending |
| Evaluation + cosign | POST /api/evaluations, /api/evaluations/[id]/cosign | Jest + Test DB | Pending |
| Messaging | GET/POST /api/conversations/[id]/messages | Jest + Test DB | Pending |
| Notifications | GET/PATCH /api/notifications | Jest + Test DB | Pending |

### 3. E2E Tests (Playwright)

| User Flow | Page | Actions | Status |
|-----------|------|---------|--------|
| Student registration | /register | Fill form, submit, verify redirect | Pending |
| Student login | /login | Enter creds, verify dashboard | Pending |
| Browse programs | /internships | Navigate, view details | Pending |
| Apply to program | /internships/[id]/apply | Submit application | Pending |
| Submit report | /student/reports/new | Create and submit | Pending |
| Supervisor login | /login | Login as supervisor | Pending |
| Review application | /supervisor/applications | Approve with assignment | Pending |
| Submit evaluation | /supervisor/evaluations | Full evaluation flow | Pending |
| Cosign evaluation | /supervisor/students/[id] | Click cosign | Pending |
| Send message | /messages/[id] | Send and verify | Pending |
| View notifications | /notifications | Mark as read | Pending |
| Update profile | /settings | Change name | Pending |
| Change password | /settings | Update password | Pending |
| Forgot password | /forgot-password | Request reset | Pending |
| Admin view users | /admin/users | View list | Pending |
| Admin view audit logs | /admin/audit | Filter and paginate | Pending |

### 4. Manual Testing Checklist

#### Authentication
- [ ] User can register with valid data
- [ ] User cannot register with duplicate email
- [ ] User can login with correct credentials
- [ ] User cannot login with wrong credentials
- [ ] Password reset email is sent
- [ ] Password reset link works
- [ ] Reset link expires after 1 hour
- [ ] Session persists across page reloads
- [ ] User is redirected correctly after login based on role

#### Authorization (Role-Based Access)
- [ ] Student cannot access supervisor pages
- [ ] Supervisor cannot access admin pages
- [ ] Academic supervisor can only access their assigned students
- [ ] Field supervisor can only access their assigned students
- [ ] Admin can access all pages

#### Program Management
- [ ] Academic supervisor can create program
- [ ] Program shows in program list
- [ ] Academic supervisor can edit their own program
- [ ] Academic supervisor cannot delete programs with active internships
- [ ] Admin can view all programs
- [ ] Inactive programs don't show in browse

#### Application Flow
- [ ] Student can apply to program
- [ ] Duplicate application is prevented
- [ ] Cannot apply after deadline
- [ ] Cannot apply when full (no seats)
- [ ] Field supervisor sees pending applications
- [ ] Field supervisor can approve with supervisor assignment
- [ ] Internship is created on approval
- [ ] Conversation is created on approval
- [ ] Notifications are sent on approval/rejection
- [ ] Student cannot apply to same program twice

#### Internship Tracking
- [ ] Internship shows on student dashboard
- [ ] Progress updates correctly
- [ ] Status changes work (active, completed, on hold, terminated)
- [ ] Internship links back to original application

#### Reports
- [ ] Student can create draft report
- [ ] Student can upload attachments
- [ ] Student can submit report
- [ ] Supervisor receives notification
- [ ] Supervisor can view report
- [ ] Supervisor can submit review
- [ ] Report status updates correctly
- [ ] Student receives notification on review
- [ ] Student can view all their reports
- [ ] Supervisor can view assigned reports

#### Evaluations
- [ ] Field supervisor can submit evaluation
- [ ] All criteria are saved
- [ ] Total score calculates correctly
- [ ] Academic supervisor sees pending cosign
- [ ] Academic supervisor can cosign
- [ ] Evaluation shows as cosigned
- [ ] Student receives notification
- [ ] Student can view evaluations with scores

#### Messaging
- [ ] Conversation lists all messages
- [ ] New messages appear (polling)
- [ ] Unread count updates
- [ ] Can send message
- [ ] All participants see message
- [ ] Last message updates
- [ ] Read receipts work

#### Notifications
- [ ] Bell shows unread count
- [ ] Notifications list paginates
- [ ] Clicking notification navigates correctly
- [ ] Mark as read works
- [ ] Mark all as read works
- [ ] Notification types display correctly

#### Settings
- [ ] Can update profile
- [ ] Email validation works
- [ ] Can change password with correct current password
- [ ] Cannot change password with wrong current password
- [ ] New password must be 8+ characters
- [ ] Confirmation password must match

#### Audit Logs
- [ ] Actions are logged
- [ ] Admin can view logs
- [ ] Logs show correct user, action, entity
- [ ] Metadata is captured
- [ ] Filtering works
- [ ] Pagination works

### 5. Performance Testing

| Metric | Target | Tool | Status |
|--------|--------|------|--------|
| Page load (dashboard) | < 2s | Lighthouse | Pending |
| API response (simple GET) | < 200ms | Lighthouse | Pending |
| API response (complex query) | < 500ms | Lighthouse | Pending |
| Database query (indexed) | < 50ms | EXPLAIN | Pending |
| File upload (5MB) | < 10s | Manual | Pending |

### 6. Security Testing

| Test | Description | Tool | Status |
|------|-------------|------|--------|
| SQL Injection | Attempt injection in form fields | Manual | Pending |
| XSS | Attempt script injection in inputs | Manual | Pending |
| CSRF | Verify token validation | Manual | Pending |
| Auth bypass | Attempt to access protected routes | Manual | Pending |
| Password strength | Verify bcrypt cost factor | Manual | ✓ |
| Session security | Verify JWT configuration | Manual | ✓ |

### 7. Browser Compatibility

| Browser | Version Support | Status |
|---------|-----------------|--------|
| Chrome | Latest 2 versions | Pending |
| Firefox | Latest 2 versions | Pending |
| Safari | Latest 2 versions | Pending |
| Edge | Latest 2 versions | Pending |

### 8. Mobile Responsiveness

| Screen Size | Layout | Status |
|-------------|--------|--------|
| Mobile (375px) | Stacked, hamburger | Pending |
| Tablet (768px) | Adaptive, sidebar collapse | Pending |
| Desktop (1024px+) | Full layout | Pending |

## Test Data

### Seed Data Credentials

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Student | student@example.com | password123 |
| Academic Supervisor | academic@example.com | password123 |
| Field Supervisor | field@example.com | password123 |
| Admin | admin@example.com | password123 |

### Test Scenarios

1. **Happy Path Application Flow**
   - Student registers → browses programs → applies → gets approved → internship created

2. **Report Review Flow**
   - Student submits report → supervisor reviews → status updates → student notified

3. **Evaluation Cosign Flow**
   - Field supervisor evaluates → academic supervisor cosigns → student notified

4. **Messaging Flow**
   - Multiple users send messages → all receive → read receipts update

## Running Tests

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage

# Seed test database
npm run seed:test
```

## CI/CD Integration

- Tests run on every PR
- E2E tests run on merge to main
- Coverage threshold: 80%
