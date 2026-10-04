# Technical Requirements Document (TRD): Enterprise Email Platform (RafMail)

## 1. System Architecture Overview

The system follows a modular monolith approach for the backend API, paired with decoupled background workers for mail processing and a Next.js frontend.

```mermaid
flowchart TD
    Client[Web/Mobile Client] -->|HTTPS / WSS| LoadBalancer[Load Balancer / WAF]
    LoadBalancer --> Frontend[Next.js App Router]
    LoadBalancer --> API[FastAPI Backend]
    
    API -->|Read/Write| DB[(PostgreSQL)]
    API -->|Session/Cache/Rate Limit| Cache[(Redis)]
    API -->|Enqueue Jobs| Queue[RabbitMQ]
    
    Queue --> DeliveryWorker[Delivery Worker (Celery)]
    Queue --> InboundWorker[Inbound Processing Worker]
    Queue --> IndexWorker[Search Indexing Worker]
    
    InboundWorker -->|Save Attachments/MIME| S3[(S3 Object Storage)]
    InboundWorker -->|Save Metadata| DB
    
    DeliveryWorker -->|SMTP Auth| Provider[Managed Email Provider / SMTP]
    Provider --> Internet((External Mail Servers))
    
    Internet -->|MX Records| InboundGateway[Inbound Mail Gateway]
    InboundGateway -->|Webhook/Queue| InboundWorker
```

## 2. Technology Stack Specifications

### 2.1 Frontend (Web Client & Admin Console)
*   **Framework:** Next.js (App Router), React 18+
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **UI Components:** shadcn/ui (Radix UI primitives)
*   **State & Data Fetching:** TanStack Query (React Query) v5
*   **Form Handling:** React Hook Form + Zod validation
*   **Rich Text Editor:** Tiptap or ProseMirror (headless, safe HTML rendering)

### 2.2 Backend (API)
*   **Framework:** FastAPI
*   **Language:** Python 3.11+
*   **Data Validation:** Pydantic v2
*   **ORM:** SQLAlchemy 2.0 (AsyncIO support)
*   **Migrations:** Alembic
*   **Authentication:** OAuth2 with JWT, integrated with Keycloak/OIDC provider

### 2.3 Data Storage & Infrastructure
*   **Relational Database:** PostgreSQL 15+ (Handles all structured metadata)
*   **Object Storage:** AWS S3 or MinIO (For attachments and raw MIME bodies)
*   **Caching & Coordination:** Redis 7+
*   **Message Broker:** RabbitMQ
*   **Background Tasks:** Celery (Python workers)

## 3. Database Schema Design (PostgreSQL)

*All tables must implement Tenant Isolation (e.g., `organization_id`) for B2B SaaS security.*

### Core Tables:
1.  **`organizations`**
    *   `id` (UUID, PK), `name` (String), `billing_plan` (Enum), `created_at`
2.  **`domains`**
    *   `id` (UUID, PK), `organization_id` (FK), `domain_name` (String, Unique)
    *   `is_verified` (Bool), `mx_status`, `spf_status`, `dkim_status`
3.  **`users`**
    *   `id` (UUID, PK), `organization_id` (FK), `email` (String, Unique)
    *   `password_hash` (String), `is_active` (Bool), `mfa_enabled` (Bool)
4.  **`mailboxes`**
    *   `id` (UUID, PK), `organization_id` (FK), `primary_address` (String)
    *   `quota_bytes` (BigInt), `used_bytes` (BigInt)
5.  **`folders`**
    *   `id` (UUID, PK), `mailbox_id` (FK), `name` (String), `type` (Enum: INBOX, SENT, TRASH, CUSTOM)
6.  **`messages`**
    *   `id` (UUID, PK), `mailbox_id` (FK), `folder_id` (FK)
    *   `thread_id` (UUID)
    *   `sender_email` (String), `subject` (String), `snippet` (String)
    *   `body_s3_key` (String) - *Reference to object storage*
    *   `is_read` (Bool), `is_starred` (Bool)
    *   `received_at` (Timestamp)
7.  **`attachments`**
    *   `id` (UUID, PK), `message_id` (FK), `filename` (String)
    *   `content_type` (String), `size_bytes` (Int), `s3_key` (String)

## 4. API Design & Integration

### RESTful Endpoints (FastAPI)
*   `POST /api/v1/auth/login` -> JWT Token
*   `GET /api/v1/mailboxes/{id}/messages` -> List messages (pagination, filtering)
*   `POST /api/v1/mailboxes/{id}/messages/send` -> Enqueue outbound mail
*   `PATCH /api/v1/messages/{id}/state` -> Update read/starred/folder status
*   `GET /api/v1/messages/{id}/attachments/{att_id}/download` -> Generate S3 Presigned URL
*   `POST /api/admin/v1/domains` -> Register a new tenant domain

### Realtime Updates (WebSocket/SSE)
*   Endpoint: `WS /api/v1/realtime?token={jwt}`
*   Pushes events: `new_message`, `message_read`, `folder_updated` to keep the UI synced without polling.

## 5. Mail Engine Implementation Details

### 5.1 Outbound Delivery (Worker)
1.  API receives send request, validates user quota and permissions.
2.  MIME structure is built programmatically.
3.  Task enqueued to `outbound_queue`.
4.  Celery worker picks up task, connects to SMTP relay (e.g., SendGrid, Postmark, or custom Postfix relay).
5.  Worker handles retries on transient errors (4xx codes) and marks as failed on hard bounces (5xx codes).

### 5.2 Inbound Processing (Worker/Webhook)
1.  MX records point to an Inbound Gateway (e.g., Postfix + SpamAssassin/Rspamd).
2.  Gateway parses incoming SMTP, runs spam/virus checks.
3.  Gateway triggers a Webhook to the FastAPI app OR directly drops raw MIME into S3 and enqueues an `inbound_queue` task.
4.  Inbound worker parses the MIME, extracts attachments, determines the target `mailbox_id`, and writes metadata to the `messages` table.

## 6. Security & Compliance

### Data Protection
*   **At Rest:** S3 buckets must use AES-256 server-side encryption. PostgreSQL must use encrypted EBS volumes.
*   **In Transit:** All API traffic strictly HTTPS/TLS 1.3.

### Anti-Abuse & Rate Limiting (Redis)
*   **Login attempts:** Max 5 failed attempts per 15 mins.
*   **Outbound limits:** Rate limit emails sent per hour/day based on tenant billing plan to prevent spam outbound.

### Email Authentication
*   System must auto-generate DKIM keys for new domains.
*   Provide users with explicit DNS records (TXT for SPF, CNAME/TXT for DKIM, TXT for DMARC) in the Admin UI.

## 7. Infrastructure & Deployment

*   **Containerization:** Docker for all services (Web, API, Workers).
*   **Orchestration:** Kubernetes or Managed Container Services (like AWS ECS / Google Cloud Run).
*   **CI/CD:** GitHub Actions or GitLab CI.
    *   Stages: Lint (Ruff/ESLint), Test (Pytest), Build Docker Image, Push to Registry, Deploy to Staging/Prod.
*   **Observability:** 
    *   Logs: Structured JSON logs via stdout, collected by Promtail/Loki.
    *   Metrics: Prometheus endpoints on FastAPI and Celery workers.
    *   Tracing: OpenTelemetry for tracing API requests through to database and worker queues.
