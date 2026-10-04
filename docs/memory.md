# Project Memory & Context (memory.md)

## 1. Project Overview
*   **Project Name:** RafMail
*   **Goal:** Build a comprehensive, enterprise-grade SaaS email platform (similar to Zoho Mail/Gmail).
*   **Core Audience:** Businesses wanting to host email on their custom domains, managed by IT admins.

## 2. Current Status
*   **Phase:** Planning & Architecture Design (Complete).
*   **Documents Created:**
    *   `PRD.md` (Product Requirements Document)
    *   `TRD.md` (Technical Requirements Document)
    *   `SRS.md` (Software Requirements Specification)
    *   `deploy.md` (Deployment Strategy & Guide)

## 3. Tech Stack Summary
*   **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui.
*   **Backend:** FastAPI, Python, Pydantic, SQLAlchemy 2, Alembic.
*   **Database:** PostgreSQL (Primary Metadata), Redis (Cache/Broker), S3 (File/MIME Storage).
*   **Async Processing:** Celery + RabbitMQ/Redis.

## 4. Key Architectural Decisions
1.  **Metadata vs. Body:** Email metadata (sender, subject, read status) lives in PostgreSQL for fast querying and indexing. The raw MIME body and attachments live in encrypted S3 object storage.
2.  **Tenant Isolation:** Row-Level Security (RLS) or strict ORM scoping using `organization_id` will be used across all PostgreSQL tables to prevent data leaks between businesses.
3.  **Mail Routing:** Inbound routing will utilize a Mail Gateway (like Postfix) that triggers Webhooks/Workers to parse and store the email. Outbound will use Celery workers to relay through an SMTP provider.
4.  **Monorepo:** The codebase will be structured as a monorepo containing `apps/web`, `apps/admin`, `apps/api`, and `workers/`.

## 5. Next Steps (Action Items)
1.  Initialize the Monorepo structure.
2.  Set up `docker-compose.yml` with PostgreSQL, Redis, and MinIO for local development.
3.  Initialize the FastAPI backend project and setup SQLAlchemy + Alembic.
4.  Initialize the Next.js frontend project and configure Tailwind + shadcn/ui.
5.  Design and implement the initial Database Models (Users, Organizations, Mailboxes).
