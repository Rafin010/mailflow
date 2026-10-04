# Software Requirements Specification (SRS)
## Project Name: RafMail (Enterprise Email Platform)

---

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to specify the software requirements for **RafMail**, a SaaS-based enterprise email platform designed to function similarly to Zoho Mail. It provides a complete webmail client for end-users and an administration console for IT managers to configure custom domains, user accounts, and security policies.

### 1.2 Scope
RafMail will allow businesses to host their email infrastructure. The system includes:
*   A responsive webmail client for reading, sending, and organizing emails.
*   An admin console for domain management, user provisioning, and policy enforcement.
*   Backend mail processing engines for handling inbound and outbound SMTP traffic.
*   A scalable API and database architecture to ensure data isolation across multiple tenant organizations.

### 1.3 Definitions, Acronyms, and Abbreviations
*   **SaaS:** Software as a Service.
*   **Tenant:** An organization or company using the platform.
*   **MTA / SMTP:** Mail Transfer Agent / Simple Mail Transfer Protocol (used for routing emails).
*   **SPF, DKIM, DMARC:** Email authentication protocols to prevent spoofing and ensure deliverability.
*   **MIME:** Multipurpose Internet Mail Extensions (format for formatting non-ASCII messages and attachments).

---

## 2. Overall Description

### 2.1 Product Perspective
RafMail is an independent SaaS application. It interacts with external Mail Transfer Agents (MTAs) across the internet to send and receive emails. It utilizes third-party storage (S3-compatible) for files and managed databases (PostgreSQL, Redis) for state and configuration.

### 2.2 User Classes and Characteristics
1.  **Standard User:** Employees within a tenant organization. They need an intuitive, fast web interface to manage their daily communications.
2.  **Organization Admin:** IT personnel who manage the tenant's domain, billing, and user accounts. They require dashboards, audit logs, and configuration tools.
3.  **Super Admin (Platform Owner):** System operators who monitor the overall health, handle global billing, and manage infrastructure.

### 2.3 Operating Environment
*   **Client Side:** Modern web browsers (Chrome, Firefox, Safari, Edge) on Desktop and Mobile.
*   **Server Side:** Linux-based containerized environments (Docker/Kubernetes).
*   **Database:** PostgreSQL (Relational Data), Redis (Cache/Broker).

---

## 3. System Features & Functional Requirements

### 3.1 Authentication and Identity Management
*   **FR-1.1:** The system shall allow users to log in using their email address and password.
*   **FR-1.2:** The system shall support Multi-Factor Authentication (MFA) via TOTP (Authenticator apps).
*   **FR-1.3:** The system shall allow Organization Admins to enforce MFA for all users in their tenant.
*   **FR-1.4:** The system shall manage secure sessions and allow users to revoke active sessions remotely.

### 3.2 Webmail Client (End-User Features)
*   **FR-2.1 (Inbox & Folders):** Users shall be able to view emails in Inbox, Sent, Drafts, Spam, and Trash.
*   **FR-2.2 (Compose & Send):** Users shall be able to compose rich-text emails, attach files, and send them.
*   **FR-2.3 (Receive & Read):** Users shall receive incoming emails in real-time and read them safely (sanitized HTML).
*   **FR-2.4 (Organization):** Users shall be able to create custom folders and apply labels to emails.
*   **FR-2.5 (Search):** Users shall be able to search emails by sender, subject, date, and keywords.
*   **FR-2.6 (Drafts):** The system shall automatically save drafts while the user is composing an email.

### 3.3 Admin Console (Tenant Management)
*   **FR-3.1 (Domain Management):** Admins shall be able to add custom domains and view DNS verification status (TXT, MX, SPF, DKIM).
*   **FR-3.2 (User Provisioning):** Admins shall be able to create, suspend, and delete user mailboxes.
*   **FR-3.3 (Aliases & Groups):** Admins shall be able to create email aliases (e.g., `info@`) and distribution groups.
*   **FR-3.4 (Usage Monitoring):** Admins shall be able to view storage usage and email delivery logs for their organization.

### 3.4 Mail Engine (Backend Processing)
*   **FR-4.1 (Inbound Routing):** The system shall accept incoming SMTP traffic, verify recipient validity, and route to the correct mailbox.
*   **FR-4.2 (Spam/Malware Check):** The system shall scan incoming emails for spam and malicious attachments before inbox placement.
*   **FR-4.3 (Outbound Delivery):** The system shall queue outbound emails and attempt delivery via external MTAs, handling retries for soft bounces.

---

## 4. External Interface Requirements

### 4.1 User Interfaces
*   **Webmail UI:** Must follow a 3-panel layout (Sidebar, Message List, Reading Pane) optimized for desktop screens with a responsive fallback for mobile.
*   **Admin UI:** Dashboard-style interface with data tables, configuration forms, and status indicators for DNS and user states.

### 4.2 Software Interfaces
*   **S3-Compatible Storage API:** For uploading and retrieving email attachments and raw MIME bodies.
*   **SMTP Provider / Postfix:** Interface for relaying outbound emails to the internet.
*   **DNS Provider API (Optional):** To programmatically check DNS records during domain verification.

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements
*   **NFR-1 (Load Time):** The webmail inbox should load within 2 seconds under normal network conditions.
*   **NFR-2 (Real-time Delivery):** Internal routing of emails should happen within 5 seconds of receipt by the inbound gateway.
*   **NFR-3 (Search):** Full-text search queries should return results within 1 second for mailboxes up to 10GB.

### 5.2 Security Requirements
*   **NFR-4 (Tenant Isolation):** Data must be strictly isolated at the database query level to prevent cross-tenant data leakage.
*   **NFR-5 (Encryption):** All data in transit must be encrypted via TLS 1.2+. Passwords must be hashed using Argon2 or Bcrypt. Attachments must be encrypted at rest.
*   **NFR-6 (Sanitization):** All HTML email bodies must be sanitized before rendering in the browser to prevent XSS attacks.

### 5.3 Reliability and Availability
*   **NFR-7 (Uptime):** The system shall aim for 99.9% uptime for mail delivery and client access.
*   **NFR-8 (Data Durability):** Emails and attachments must be durably stored and backed up to prevent data loss in case of hardware failure.

### 5.4 Scalability
*   **NFR-9:** The API and background worker architecture must be horizontally scalable. Adding more Celery workers should linearly increase the system's capacity to process inbound/outbound emails.

---

## 6. Constraints & Assumptions
*   **Assumption:** Outbound email deliverability depends heavily on the reputation of the sending IP addresses and the correct configuration of SPF/DKIM/DMARC by the tenant admin.
*   **Constraint:** Maximum attachment size is capped at 25MB per email (standard email limitation).
