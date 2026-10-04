# Deployment Guide (deploy.md)
## Project: RafMail (Enterprise Email Platform)

This document outlines the deployment strategy and infrastructure requirements for running RafMail in a production environment, as well as a local development setup.

---

## 1. Prerequisites & Infrastructure Services

To run RafMail in production, you will need the following managed services:
*   **Database:** Managed PostgreSQL 15+ (e.g., AWS RDS, Google Cloud SQL, Supabase).
*   **Cache & Message Broker:** Managed Redis 7+ (e.g., AWS ElastiCache, Upstash).
*   **Object Storage:** S3-compatible storage (e.g., AWS S3, Cloudflare R2, MinIO) for email MIME bodies and attachments.
*   **SMTP Provider:** For outbound email delivery (e.g., Amazon SES, Postmark, Mailgun) or a dedicated Postfix relay.
*   **Domain & DNS:** A primary domain for the application (e.g., `rafmail.com`) and access to manage DNS records.

---

## 2. Environment Variables (`.env`)

Both the Web/Admin and API/Workers will require configuration via environment variables:

```env
# Database & Cache
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/rafmail
REDIS_URL=redis://user:pass@host:6379/0

# Object Storage (S3)
S3_ENDPOINT_URL=https://s3.region.amazonaws.com
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
S3_BUCKET_NAME=rafmail-attachments

# Security & Auth
JWT_SECRET_KEY=super_secure_random_string
JWT_ALGORITHM=HS256
ENCRYPTION_KEY=key_for_encrypting_sensitive_db_fields

# Frontend URLs
NEXT_PUBLIC_API_URL=https://api.rafmail.com
```

---

## 3. Local Development (Docker Compose)

For local development and testing, a `docker-compose.yml` should be used to spin up the required dependencies.

**Services included in `docker-compose.yml`:**
1.  **postgres:** Local PostgreSQL instance.
2.  **redis:** Local Redis instance.
3.  **minio:** Local S3-compatible storage.
4.  **api:** FastAPI backend (hot-reload enabled).
5.  **worker:** Celery worker for background jobs.
6.  **web:** Next.js frontend (hot-reload enabled).

*Command:* `docker-compose up -d --build`

---

## 4. Production Deployment Strategy

RafMail is composed of three distinct deployable units: Frontend, Backend API, and Background Workers.

### 4.1 Frontend (Next.js - Web & Admin)
*   **Platform:** Vercel, AWS Amplify, or Google Cloud Run.
*   **Build Command:** `npm run build`
*   **Routing:** Ensure custom domains are configured correctly. The main app on `mail.yourdomain.com` and admin on `admin.yourdomain.com`.

### 4.2 Backend API (FastAPI)
*   **Platform:** Google Cloud Run, AWS ECS (Fargate), or Kubernetes.
*   **Containerization:** Packaged as a Docker container running Uvicorn/Gunicorn.
*   **Scaling:** Configure auto-scaling based on CPU utilization and HTTP request volume.

### 4.3 Background Workers (Celery)
*   **Platform:** Kubernetes Deployments, AWS ECS, or dedicated VMs.
*   **Role:** Workers continuously pull from RabbitMQ/Redis to process outbound sending and inbound parsing.
*   **Scaling:** Scale based on queue length (e.g., using KEDA in Kubernetes).

---

## 5. CI/CD Pipeline (GitHub Actions)

A standard CI/CD pipeline should be implemented to ensure code quality and seamless deployments:

### Pipeline Stages:
1.  **Linting & Formatting:** Run `eslint`, `prettier` (Frontend) and `ruff`, `black` (Backend).
2.  **Testing:** Run `pytest` for backend unit tests and `playwright` for frontend E2E tests.
3.  **Build:** Build Docker images for API and Workers. Build Next.js static/server assets.
4.  **Push:** Push Docker images to a Container Registry (e.g., GitHub Packages, AWS ECR).
5.  **Deploy:**
    *   Trigger Vercel deployment for Frontend.
    *   Apply new container image tags to Cloud Run / Kubernetes for API and Workers.
    *   Run database migrations (`alembic upgrade head`) automatically during the backend deployment phase.
