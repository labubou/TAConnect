## Page 1 — Title, Problem, Overview

**TAConnect – Smart Office Hours & Scheduling Platform**

Universities still manage a lot of TA office hours with spreadsheets, ad‑hoc Zoom links, and long queues in crowded hallways. Students struggle to find available times, TAs waste time resolving conflicts manually, and coordinators have little visibility into how office hours are actually used. **TAConnect** is a self‑hostable web application that centralizes office hour scheduling, booking, and analytics so that students can quickly find help, and TAs can run organized, conflict‑free office hours with minimal overhead.

The system provides a modern React frontend and a Django REST backend, backed by a relational database and an email/push notification layer. TAs define recurring office hour slots with policies such as capacity limits, buffer times, and allowed‑student lists; students then book into those slots through a clean, responsive UI. Under the hood, TAConnect enforces conflict‑free bookings, tracks the full lifecycle of each session (pending, confirmed, completed, cancelled), and exposes analytics and CSV exports so TAs and departments can understand demand patterns over time. The entire platform is designed to be deployed on institutional infrastructure using Docker, with no dependency on third‑party SaaS services.

**Logo / Landing Page Image**

- **Insert**: `[[Screenshot of the TAConnect landing page with logo and tagline]]`  
  - Suggested source: `frontend/ta_connect/src/assets/Logo2.png` or the main home/dashboard screen in the running app.

---

## Page 2 — System Architecture

**High‑Level Architecture**

TAConnect follows a classic web client–server architecture:

- **Frontend (React 19 + Vite + Tailwind CSS)**  
  - Implements the student and TA dashboards, booking flows, CSV upload for allowed students, analytics views, notification preferences, and theme toggle.  
  - Talks to the backend exclusively via JSON over HTTPS, using an API client layer and JWT for authentication.

- **Backend (Django 5 + Django REST Framework)**  
  - Exposes REST APIs for authentication, course/section and slot management, bookings, analytics, and notification preferences.  
  - Organized into modular apps: `accounts` (users, roles, email verification), `instructor` (office hours, booking policies, allowed students, analytics), `student` (booking flows, student utilities), `core` (base models), and `utils` (email sending, push notifications, datetime helpers).  
  - Automatically serves Swagger/OpenAPI documentation for all endpoints.

- **Database (PostgreSQL in production, SQLite in development/test)**  
  - Stores all persistent data: users and roles, office hour slots, bookings, allowed‑student lists, notification preferences, and audit timestamps.  
  - Uses indexes to keep booking/slot queries fast, and encrypted fields (e.g. student IDs in `AllowedStudents`) for sensitive attributes.

- **Notification Layer (Email + Web Push)**  
  - Email templates under `backend/ta_connect/templates` handle registration, verification, password reset, booking confirmation/cancellation, and bulk cancellations.  
  - Web push notifications are implemented via service workers in the frontend and a push subsystem in `backend/ta_connect/utils/push_notifications`, using VAPID keys configured via environment variables.

- **Deployment & Self‑Hosting (Docker + Docker Compose)**  
  - A `docker-compose.yml` file plus backend and frontend `Dockerfile`s allow the full stack (frontend, backend, database) to be brought up with a single command.  
  - All environment‑specific configuration (DB credentials, email backend, JWT settings, encryption key, VAPID keys) is provided via `.env` files as documented in `docs/SETUP.md` and `docs/ENVIRONMENT_VARIABLES.md`.

**System Architecture Diagram**

- **Insert**: `[[Custom diagram: Browser (React app) → Django REST API → PostgreSQL DB + Email server + Push service]]`  
  - You can base it on your existing diagrams in `docs/diagrams/` (e.g., package or class diagram) but simplify to highlight:
    - Client (Student, TA) → React SPA  
    - React SPA → Django REST API (JWT)  
    - Django REST API → Database (Users, OfficeHourSlot, Booking, Policies, AllowedStudents)  
    - Django REST API → SMTP email server and Web Push service.

---

## Page 3 — Screenshots of Working Features

For this page, add real screenshots from your running app with short captions.

- **TA dashboard: creating office hours**  
  `[[Screenshot: TA dashboard where an instructor defines a recurring office hour pattern (course, section, day of week, start/end time, duration, location) and saves it]]`  
  In this view, a TA configures an `OfficeHourSlot` by specifying the course, section, day of week, time window, duration per booking, room/meeting link, and active date range. The UI supports recurring weekly slots with buffer times and validates that slots are well‑formed before saving them to the backend.

- **Office hours list and schedule view**  
  `[[Screenshot: List or calendar view showing multiple office hour slots for a TA, with status (active/inactive) and filters by course/section]]`  
  This page lists all the TA’s configured office hours, grouped by course/section. It pulls data from the `OfficeHourSlot` model and uses status flags to highlight which slots are currently active. From here, TAs can quickly enable/disable slots or drill into details for a specific course.

- **Student booking page**  
  `[[Screenshot: Student‑facing booking page showing a calendar, available time slots, and a form to confirm booking details]]`  
  Students see only available slots that they are allowed to book, taking into account capacity limits, allowed‑student restrictions, and existing bookings. The booking form typically includes the time, location/link, and an optional description so the student can indicate what they need help with.

- **Student booking confirmation**  
  `[[Screenshot: Booking confirmation screen/toast showing that a booking has been created, with date/time, course, and instructor name]]`  
  After submitting, the student lands on a confirmation view that summarizes the booking details and status (initially “pending” or “confirmed” depending on the flow). Behind the scenes, the backend creates a `Booking` record linked to the selected `OfficeHourSlot`, and triggers email/push notifications using the appropriate templates.

- **Conflict prevention / validation**  
  `[[Screenshot: Error or warning message shown when the student tries to book an overlapping time or exceed the allowed number of slots]]`  
  TAConnect prevents conflicting bookings by checking existing `Booking` records for overlaps using the slot duration and configured policies (e.g., `set_student_limit`, buffer times, and per‑section rules). The UI surfaces these rules as clear error messages, so students understand why a particular time is not available.

- **API / Swagger documentation**  
  `[[Screenshot: Swagger UI page at /swagger showing grouped endpoints for auth, instructor, and student operations]]`  
  The backend publishes an OpenAPI specification and an interactive Swagger UI, which lists endpoints for authentication, office hour management, bookings, analytics, and more. Developers and integrators can use this page to test endpoints, inspect request/response schemas, and obtain JWT tokens for manual API calls.

---

## Page 4 — Database / UML / Flow Diagram

**Core Data Model**

At the center of TAConnect are a handful of core models:

- **User / Profiles**  
  - `User` extends Django’s `AbstractUser` and adds fields for `user_type` (instructor vs. student) and `email_verify` for verification status.  
  - Each user may have an `InstructorProfile` or `StudentProfile` that stores email‑notification preferences for different booking events.

- **OfficeHourSlot (Instructor side)**  
  - Represents a recurring office hour definition: course name, section, day of week, start/end time, duration per booking, active date range, room/meeting link, and status.  
  - Has a one‑to‑one `BookingPolicy`, which controls per‑slot rules such as whether only specific emails can book and the maximum number of concurrent bookings per student.  
  - `AllowedStudents` records link to `BookingPolicy` and hold an encrypted student ID, name, and email, forming the “whitelist” for restricted sections.

- **Booking (Student side)**  
  - Stores the actual reservations students make against an `OfficeHourSlot`, including student reference, start/end time, date, description, and status (pending, confirmed, cancelled, completed).  
  - Derived helpers ensure that the boolean flags (`is_cancelled`, `is_completed`) and the status field stay consistent, and that end times are automatically computed from the associated slot’s duration when needed.

**Model Relations Diagram**

- **Insert**: `[[Database / UML diagram showing: User 1‑1 InstructorProfile, User 1‑1 StudentProfile, User 1‑* Booking, OfficeHourSlot 1‑* Booking, OfficeHourSlot 1‑1 BookingPolicy, BookingPolicy 1‑* AllowedStudents]]`  
  - You can adapt `docs/diagrams/TAConnect - Class Diagram (Models Only).png` or `docs/diagrams/classes_TAConnect.png` and highlight just the main entities:  
    - `User` → `InstructorProfile` / `StudentProfile`  
    - `User` → `Booking`  
    - `OfficeHourSlot` → `BookingPolicy` → `AllowedStudents`  
    - `OfficeHourSlot` → `Booking`

**Brief Flow Description**

- An instructor creates one or more `OfficeHourSlot` records and, optionally, a `BookingPolicy` with an `AllowedStudents` list (often imported via CSV).  
- Students browse available `OfficeHourSlot`s that match their section and policy and submit bookings.  
- Each booking’s lifecycle is tracked through status transitions (pending → confirmed → completed / cancelled), and the system updates derived flags, enforces time‑based rules, and feeds analytics dashboards with aggregated booking data.

---

## Page 5 — Additional Results (Optional)

Use this page to showcase extra evidence of system completeness.

- **Analytics preview**  
  `[[Screenshot: TA analytics dashboard showing charts or tables of bookings over time, by course/section, with date range filters]]`  
  The analytics views give TAs insight into demand for each course and section, highlighting peak office hour times, cancellation patterns, and usage across the term. Data can be filtered by date range and exported as CSV for further analysis.

- **Email notification example**  
  `[[Screenshot: Booking confirmation or cancellation email as received in a real inbox]]`  
  When a booking is created, updated, or cancelled, the system renders a corresponding HTML email using templates from the backend (`booking_confirmation_email_Student.html`, `booking_cancellation_email_TA.html`, etc.) and sends it through the configured SMTP backend.

- **Push notification example**  
  `[[Screenshot: Browser push notification banner showing a new or updated booking alert]]`  
  For users who opt in, TAConnect sends real‑time browser notifications on key booking events. The frontend service worker (`public/service-worker.js` / `sw.js`) and the backend push subsystem work together to deliver these alerts.

- **Dockerized deployment**  
  `[[Screenshot: Terminal window showing docker compose up with backend, frontend, and database containers running successfully]]`  
  The project ships with `docker-compose.yml` and Dockerfiles for both the backend and frontend, allowing a full environment to be started with a single command. This self‑contained setup makes it easy for institutions to host TAConnect on their own infrastructure without external dependencies.


