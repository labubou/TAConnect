### 3. SPECIFICATIONS AND REQUIREMENTS

This section specifies the functional and non-functional requirements of the TAConnect system in an IEEE-style Software Requirements Specification (SRS) format. It assumes that the project overview, definitions, and general descriptions are covered in Sections 1 and 2 of the SRS.

---

### 3.1 Product Perspective

**3.1.1 System Context**  
- The system is a web-based client–server application.  
- The frontend (React) communicates with the backend (Django REST API) over HTTP(S).  
- The backend persists data in a relational database (PostgreSQL in production; SQLite in test).  
- The system is intended to be fully self-hostable using Docker and Docker Compose, deployed on institutional or cloud infrastructure controlled by the institution.

**3.1.2 Major System Components**  
- Web frontend (student and TA user interfaces).  
- RESTful backend API (authentication, course/section management, scheduling, booking, analytics).  
- Database (users, roles, courses, sections, slots, bookings, notification preferences).  
- Email and push-notification subsystems.  
- Administrative interface (Django Admin).

---

### 3.2 Product Functions (High-Level)

At a high level, the system shall provide the following capabilities:

- **User account and access**  
  - User registration, authentication, and account management.  
  - Role-based access for Students, TAs (Instructors), and Administrators.  

- **Academic structure and scheduling**  
  - Course and section management for TAs.  
  - Time-slot creation, recurrence, and schedule management for office hours.  

- **Booking and communication**  
  - Conflict-free booking, rescheduling, and cancellation by students.  
  - Notifications (email and push) for booking-related events.  

- **Analytics and deployment**  
  - Analytics dashboards and exportable reports for TAs.  
  - Self-hosting and configuration via environment variables and Docker.  

---

### 3.3 User Characteristics

- **Students**  
  - Undergraduate or graduate students with basic web and email usage skills.  
  - Expected to access the system via modern desktop or mobile web browsers.

- **TAs (Instructors)**  
  - Teaching Assistants or instructors familiar with course administration.  
  - Expected to manage schedules, bookings, and analyze usage through dashboards.

- **Administrators**  
  - Technical or academic staff responsible for deployment, configuration, and high-level oversight.  
  - Expected to be familiar with server administration, Docker, and Django admin interfaces.

---

### 3.4 Constraints

- The system shall be deployable without reliance on proprietary third-party SaaS services (self-hostable requirement).  
- The system shall operate using HTTP(S) on standard web ports (80/443) or institution-defined alternatives.  
- All configuration specific to deployment environments shall be performed via environment variables (`.env` files).  
- The system shall respect institutional privacy and data-protection policies (no mandatory external tracking/analytics).

---

### 3.5 Assumptions and Dependencies

- Assumes availability of an SMTP-compatible email service (self-hosted or institution-provided) for sending email notifications.  
- Assumes modern browser support for service workers and Web Push API where push notifications are enabled.  
- Assumes institutional identity/email policies (e.g., allowed email domains) are enforced via configuration or custom validations.  
- Assumes the hosting environment can provide TLS/SSL termination for secure HTTPS access.

---

### 3.6 Functional Requirements

#### 3.6.1 Authentication and User Account Management

- **FR-1**: The system shall allow users (Students and TAs) to register using a valid email address and password.  
- **FR-2**: The system shall send an email verification link to newly registered users and shall require verification before granting full access.  
- **FR-3**: The system shall provide secure login using JWT-based authentication, issuing access and refresh tokens upon successful login.  
- **FR-4**: The system shall allow users to log out, invalidating client-side tokens.  
- **FR-5**: The system shall provide a mechanism to initiate password reset via email and to set a new password securely.  
- **FR-6**: The system shall allow users to view and update their profile information (e.g., name, display name, profile-related fields).  
- **FR-7**: The system shall allow users to request deletion of their accounts and shall remove or anonymize related data in accordance with configured policies.  

#### 3.6.2 Roles and Permissions

- **FR-8**: The system shall support distinct roles: Student, TA (Instructor), and Administrator.  
- **FR-9**: The system shall restrict access to operations based on role:  
  - Only Students may create bookings for office-hour slots.  
  - Only TAs may create and manage courses, sections, office-hour slots, and allowed-student lists.  
  - Only Administrators may access the Django admin interface and perform high-privilege maintenance operations.  
- **FR-10**: The system shall ensure that each HTTP API endpoint enforces the appropriate permissions.

#### 3.6.3 Course and Section Management

- **FR-11**: The system shall allow TAs to create, view, update, and delete courses (e.g., course code, title, description).  
- **FR-12**: The system shall allow TAs to create, view, update, and delete sections associated with a course.  
- **FR-13**: For each section, the system shall allow configuration of:  
  - Maximum number of simultaneously active bookings per student (`max_slots_per_student`).  
  - Whether bookings are restricted to a defined allowed-student list (`restrict_to_section`).  

#### 3.6.4 Allowed-Student Management via CSV

- **FR-14**: The system shall allow TAs to upload CSV files to define or update the set of allowed students for a given section.  
- **FR-15**: The system shall validate uploaded CSV files, including:  
  - Syntax/format validation.  
  - Detection of invalid or malformed email identifiers.  
  - Detection and reporting of duplicates.  
- **FR-16**: The system shall present a summary of the CSV import result, including counts of valid, invalid, and duplicate entries.  
- **FR-17**: The system shall allow TAs to view, add, edit, and remove allowed students for a section through the interface.

#### 3.6.5 Time Slot and Schedule Management

- **FR-18**: The system shall allow TAs to create office-hour time slots, specifying at minimum:  
  - Date and start/end times.  
  - Location or meeting link.  
  - Associated course/section.  
  - Maximum capacity (max number of students for the slot).  
- **FR-19**: The system shall support creation of recurring time slots (e.g., weekly office hours over a defined date range).  
- **FR-20**: The system shall enforce buffer times between consecutive slots as configured by the TA, preventing overlaps that violate buffer requirements.  
- **FR-21**: The system shall prevent overlapping or conflicting time slots for the same TA.  
- **FR-22**: The system shall allow TAs to edit or cancel existing slots; if a slot has associated bookings, the system shall handle those bookings according to defined rules (e.g., notify affected students, cancel bookings).  
- **FR-23**: The system shall provide a calendar-based interface to visualize and manage time slots.

#### 3.6.6 Booking Creation and Management

- **FR-24**: The system shall allow Students to view available office-hour slots for a given TA or section via:  
  - A public shareable schedule link, and/or  
  - The authenticated student interface.  
- **FR-25**: The system shall allow Students to create bookings for available slots subject to:  
  - Remaining capacity in the slot.  
  - `max_slots_per_student` rules for the relevant time interval.  
  - Membership in the allowed-student list when `restrict_to_section` is enabled.  
- **FR-26**: The system shall prevent the creation of bookings that violate capacity, conflict, or access-control rules.  
- **FR-27**: The system shall allow Students to view their existing bookings with status (e.g., pending, confirmed, cancelled).  
- **FR-28**: The system shall allow Students to cancel or reschedule their bookings within the constraints configured by the TA or institution (e.g., cutoff time before the session).  
- **FR-29**: The system shall allow TAs to view bookings for their slots, including relevant student details and booking status.  
- **FR-30**: The system shall allow TAs to confirm, reject, or cancel bookings individually.  
- **FR-31**: The system shall allow TAs to perform bulk actions on bookings (e.g., cancel all bookings for a given date range or slot set), triggering appropriate notifications.  
- **FR-32**: The system shall maintain a history of state changes for each booking (e.g., created, confirmed, cancelled) for auditing and analytics.

#### 3.6.7 Notifications

- **FR-33**: The system shall send email notifications to relevant parties when:  
  - A booking is created.  
  - A booking is confirmed, rejected, or modified.  
  - A booking is cancelled by either party or via bulk operations.  
  - Account-related events occur (registration, email verification, password reset).  
- **FR-34**: The system shall support web push notifications (where enabled by the user) for events such as booking confirmations, updates, cancellations, and reminders.  
- **FR-35**: The system shall allow users to configure their notification preferences (e.g., enable/disable certain email and push notifications) within reasonable constraints set by the institution.

#### 3.6.8 Analytics and Reporting

- **FR-36**: The system shall provide analytics views for TAs showing booking-related statistics for each course and section, including at minimum:  
  - Number of bookings over time.  
  - Trends in cancellations and attendance (where tracked).  
  - Peak usage periods by day and time.  
- **FR-37**: The system shall allow TAs to filter analytics by date range, course, section, and booking state where applicable.  
- **FR-38**: The system shall allow TAs to export booking data (for a given course/section and date range) as a CSV file.

#### 3.6.9 API and Self-Hosting

- **FR-39**: The system shall expose its core functionality via a RESTful API documented through an automatically generated Swagger/OpenAPI specification.  
- **FR-40**: The system shall provide a browsable Swagger UI at a configurable endpoint (default `/swagger/`).  
- **FR-41**: The system shall support deployment using Docker and Docker Compose, with container images and configuration files included in the project.  
- **FR-42**: The system shall read configuration values (database connection, email backend, JWT settings, encryption key, VAPID keys, etc.) from environment variables defined in `.env` files as documented.

---

### 3.7 External Interface Requirements

#### 3.7.1 User Interfaces

- Web-based UI for Students and TAs, implemented using React, Vite, and Tailwind CSS.  
- Calendar-based components to visualize time slots and bookings.  
- Forms and dialogs for registration, login, course management, slot creation, booking, CSV upload, and analytics filters.  
- Dark mode and light mode, with a user-accessible toggle.

#### 3.7.2 Hardware Interfaces

- The system is accessed via standard computing devices (desktops, laptops, tablets, smartphones).  
- No special hardware interfaces are required beyond standard web browser and network connectivity.

#### 3.7.3 Software Interfaces

- Relational database (PostgreSQL or other compatible RDBMS) accessed via Django’s ORM.  
- Email server accessed via SMTP or equivalent backend configured in Django.  
- Optional integration with Web Push services through VAPID keys and service workers in the frontend.

#### 3.7.4 Communications Interfaces

- HTTP/HTTPS for communication between frontend and backend.  
- HTTPS is required for production deployments to protect credentials and JWT tokens in transit.

---

### 3.8 Non-Functional Requirements

#### 3.8.1 Performance Requirements

- **NFR-1**: Under typical institutional loads (hundreds of students, dozens of TAs), the system should respond to standard API requests within 500 ms on average, excluding external network latency.  
- **NFR-2**: The system shall support concurrent booking operations without generating inconsistent or conflicting booking records, using appropriate transaction handling and locking mechanisms.  
- **NFR-3**: Endpoints that return large datasets (e.g., booking lists, analytics) shall implement pagination and efficient querying (indexes as needed).

#### 3.8.2 Security Requirements

- **NFR-4**: All authenticated API requests shall require valid JWT access tokens and shall enforce role-based authorization checks.  
- **NFR-5**: User passwords shall be stored using strong one-way hashing as provided by the Django framework.  
- **NFR-6**: Sensitive fields (as configured) shall be encrypted at rest using an encryption key specified by `FIELD_ENCRYPTION_KEY`.  
- **NFR-7**: The system shall support HTTPS in production, typically via a reverse proxy or load balancer providing TLS termination.  
- **NFR-8**: The system shall validate and sanitize all file uploads (CSV) and user inputs to mitigate common vulnerabilities (e.g., injection, malformed files).  
- **NFR-9**: The system shall not transmit user data or tracking information to third-party analytics services by default.

#### 3.8.3 Reliability and Availability Requirements

- **NFR-10**: All booking creation, modification, and cancellation operations shall be performed within database transactions to ensure atomicity and consistency.  
- **NFR-11**: The system shall continue to record bookings and state changes even if email or push-notification services are temporarily unavailable; notifications may be queued or skipped, but core data must remain consistent.  
- **NFR-12**: The system shall log critical events (e.g., logins, failed logins, booking operations, CSV imports) for troubleshooting and audit.

#### 3.8.4 Usability Requirements

- **NFR-13**: The UI shall be responsive and usable on desktop, tablet, and mobile devices with commonly used viewport sizes.  
- **NFR-14**: The system shall provide clear feedback on user actions (e.g., input validation errors, loading indicators, success and error messages).  
- **NFR-15**: The system shall implement reasonable accessibility practices (color contrast, keyboard navigation, focus visibility, basic ARIA attributes on critical components).

#### 3.8.5 Maintainability and Support Requirements

- **NFR-16**: The backend codebase shall be organized into modular Django apps (`accounts`, `instructor`, `student`, `core`, `utils`) with well-defined responsibilities.  
- **NFR-17**: The project shall maintain an automated test suite (unit and integration tests) that can be executed via documented commands (e.g., Docker-based test runs).  
- **NFR-18**: The project shall provide developer documentation covering setup, environment configuration, folder structure, testing, and contribution guidelines in accompanying markdown files.  
- **NFR-19**: The system shall use version control (e.g., Git) and support standard branching workflows for feature development and releases.


