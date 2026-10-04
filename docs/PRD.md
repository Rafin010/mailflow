# Product Requirements Document (PRD): Enterprise Email Platform (RafMail)

## 1. Overview
RafMail is a comprehensive, enterprise-grade SaaS email platform designed similarly to Zoho Mail. It provides a complete solution for businesses to host email on their custom domains, manage users and organizational policies, and offers a robust, modern webmail client for daily communication.

## 2. Core Components
The system is divided into three primary pillars:
1.  **Mail Workspace (Core Product):** Web interface for users to read, send, and organize emails.
2.  **Admin Console (Business SaaS):** Dashboard for IT administrators to manage domains, users, security, and billing.
3.  **Security & Settings:** Deep user-level configurations for account security, email filtering, and personal preferences.

## 3. UI / UX Design & Workflows
The UI will feature a clean, premium, enterprise-style interface with a focus on productivity and clear visual hierarchy.

### 3.1 Main Inbox (Desktop Layout)
A classic 3-panel workflow similar to modern enterprise clients.
*   **Top Navigation (60-68 px):** Search bar, quick actions, user profile.
*   **Left Sidebar (220-250 px):** Compose button, Folders (Inbox, Sent, Drafts, Spam, Trash), Custom Labels.
*   **Message List (320-400 px):** List of emails in the selected folder/label with snippets.
*   **Reading Pane (Remaining space):** Full email content, reply/forward actions.

### 3.2 Compose Window
*   Recipients (To, CC, BCC) with autocomplete.
*   Subject line and Rich-text editor (Bold, italic, lists, links, inline images).
*   File attachments with upload progress and size limits.
*   Signature selector.
*   Draft autosave and send status.
*   Scheduled send functionality.
*   *Note: Emails are sent via backend API requests, not direct SMTP connections from the frontend.*

### 3.3 Settings & Account Management
Categorized configurations for individual users:
*   **General:** Language, theme, timezone, UI density.
*   **Accounts:** Display name, reply-to addresses, aliases.
*   **Mail:** Reading pane preferences, conversation view, default reply behavior.
*   **Signatures:** Personal and company signatures.
*   **Filters:** Automatic folder/label assignment based on rules.
*   **Forwarding:** Address verification and forwarding setup.
*   **Security:** MFA, active sessions, app passwords.
*   **Notifications:** Desktop, browser, mobile alerts.
*   **Storage:** Mailbox quota usage and attachment management.

### 3.4 Admin Console (`/admin`)
Dedicated portal for organization management:
*   **Overview:** Total users, active mailboxes, storage, delivery status.
*   **Domains:** Domain verification (TXT), DNS configuration checks (MX, SPF, DKIM).
*   **Users:** Create, suspend, delete, and reset accounts.
*   **Groups:** Shared addresses (e.g., support@, sales@).
*   **Aliases:** Multiple addresses mapping to a single mailbox.
*   **Mail Policies:** Attachment rules, access restrictions, forwarding limits.
*   **Security:** Enforce MFA, monitor login events, revoke sessions.
*   **Reports & Audit:** Delivery errors, spam metrics, storage usage, admin audit logs.
*   **Billing:** Subscription plans and invoices.

## 4. Technical Architecture

### 4.1 Tech Stack
*   **Frontend (Web & Admin):** Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form, Zod.
*   **Backend (API):** FastAPI, Python, Pydantic, SQLAlchemy 2, Alembic (for async endpoints and structured logging).
*   **Primary Database:** PostgreSQL (Relational schema, tenant isolation).
*   **Cache:** Redis (Rate limiting, short-lived cache, job coordination).
*   **File Storage:** S3-compatible object storage (MIME content, attachments, encrypted private buckets).
*   **Background Jobs:** Celery + RabbitMQ (Outbound delivery, indexing, notifications, retries).
*   **Search:** PostgreSQL Full-Text Search (initially) -> OpenSearch (for scaling).
*   **Realtime:** WebSockets or Server-Sent Events (SSE).
*   **Authentication:** OIDC/OAuth 2.0 (e.g., Keycloak) + MFA.

### 4.2 Mail Engine Architecture
*   **Outbound Flow:** 
    1. User clicks send -> Frontend calls Backend API.
    2. Backend validates permissions, quotas, and policies.
    3. Message metadata saved in DB, job pushed to Queue.
    4. Worker picks up job -> Connects to Mail Provider / SMTP outbound service.
    5. Delivery events (bounce/success) update message state via webhooks.
*   **Inbound Flow:**
    1. External sender routes email via DNS MX records.
    2. Inbound Gateway receives message, applies Spam/Malware scanning.
    3. Verifies SPF, DKIM, DMARC.
    4. Routes to correct tenant/mailbox.
    5. Saves MIME/Attachments to Object Storage and metadata to PostgreSQL.
    6. Triggers real-time notification to the user.

### 4.3 Domain Setup Workflow
1.  **Add Domain:** Input domain and verify ownership via DNS TXT record.
2.  **Configure DNS:** Set up required MX, SPF, DKIM, and DMARC records.
3.  **Create Mailboxes:** Provision user addresses, quotas, and permissions.
4.  **Test Delivery:** Validate inbound/outbound flow and spam placement.

## 5. Database Schema (Logical Layout)
*   `organizations`: Tenants and billing plans.
*   `domains`: Verified domains and DNS statuses.
*   `users`: Identity and profile info.
*   `mailboxes`: Addresses and quota settings.
*   `mailbox_memberships`: Access controls linking users to mailboxes.
*   `messages`: Metadata (sender, subject, timestamps, delivery state, storage keys).
*   `folders` & `message_folder_state`: Mailbox organization and read/unread flags.
*   `recipients`: To, CC, BCC lists.
*   `attachments`: Storage references, MIME types, sizes.
*   `aliases_groups`: Distribution lists and alternate addresses.
*   `sessions_audit`: Security and administrative logs.

## 6. Security Architecture
*   **Authentication:** MFA, WebAuthn/Passkeys, secure cookies.
*   **Data Protection:** TLS in transit, DB encryption at rest, S3 encryption via KMS.
*   **Anti-Abuse:** Rate limits, outbound quotas, spam scoring, suspicious login detection.
*   **Attachment Safety:** ClamAV / Managed Malware scanning, HTML sanitization, remote image privacy blocks.

## 7. Project Structure (Monorepo)
```text
rafmail/
├── apps/
│   ├── web/          # Next.js webmail application
│   ├── admin/        # Next.js admin console
│   └── api/          # FastAPI backend application
├── workers/
│   ├── delivery/     # Outbound SMTP delivery jobs
│   ├── inbound/      # Inbound email processing
│   ├── indexing/     # Search index synchronization
│   └── notifications/# WebSocket/SSE realtime updates
├── packages/
│   ├── ui/           # Shared React components (shadcn)
│   ├── types/        # Shared TypeScript/Pydantic models
│   └── email-renderer/ # Safe HTML rendering logic
├── infrastructure/   # Docker, Terraform, CI/CD, DNS docs
├── tests/            # e2e, integration, and security tests
└── docs/             # Architecture, threat models, API specs
```
