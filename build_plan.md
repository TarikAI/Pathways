# Pathways - Cooperative Training Management Platform
## Build Plan

### Phase 1: Planning and UI Design (Google Stitch)
1.  **Project Initialization**: Create a new project in Google Stitch named "Pathways".
2.  **Design System Setup**: 
    *   Create a design system utilizing the provided color palette:
        *   Navy: `#2F4156` (Primary)
        *   Teal: `#567C8D` (Secondary)
        *   Sky Blue: `#C8D9E6` (Accent/Background)
        *   Beige: `#F5EFEB` (Background/Surface)
        *   White: `#FFFFFF` (Surface/Text)
    *   Set typography to a clean, professional sans-serif font (e.g., Inter or Roboto).
3.  **Screen Generation (Stitch)**: Generate the following core screens based on the requirements:
    *   **Landing Page**: Introduction to Pathways, login/register CTA.
    *   **Login/Registration Page**: Role selection (Student, Academic Supervisor, Field Supervisor).
    *   **Student Dashboard**: Overview of internship status, quick links to reports, progress tracking, and notifications.
    *   **Supervisor Dashboard (Academic & Field)**: List of assigned students, pending report approvals, and messaging alerts.
    *   **Report Submission/Review**: Interface for students to upload reports and supervisors to review/approve them.
    *   **Messaging System**: Internal chat interface for communication between students and supervisors.

### Phase 2: Frontend Development (Local Build)
1.  **Project Setup**: Initialize a modern React application (Next.js recommended for professional, scalable structure) in the local workspace.
2.  **Architecture & Scaffolding**: 
    *   Set up routing for different user roles (Student, Academic Supervisor, Field Supervisor).
    *   Create reusable UI components (Buttons, Cards, Modals, Forms) adhering to the design system.
3.  **Implementation**: Translate the generated Stitch UI into working React components.
4.  **Mock Data Integration**: Wire up the front end with mock data to demonstrate functionality (authentication flow, report submission, messaging) since this is a prototype/frontend focus for now.

### Phase 3: Version Control & Deployment
1.  **Git Initialization**: Initialize a Git repository in the local workspace.
2.  **Commit**: Stage and commit all source code with clear, descriptive commit messages.
3.  **Push to GitHub**: Add the remote repository (`https://github.com/TarikAI/Pathways`) and push the main branch to GitHub.
