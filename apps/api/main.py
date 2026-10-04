import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from .routers import users, mailboxes, messages, auth
from .routers import admin_domains, admin_users, admin_groups, admin_security, admin_insights

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="RafMail API",
    description="Enterprise Email Platform API",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration
origins = [o.strip() for o in os.getenv("CORS_ORIGINS", os.getenv("FRONTEND_URL", "http://localhost:3000")).split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(mailboxes.router, prefix="/api/v1")
app.include_router(messages.router, prefix="/api/v1")

# Admin Console (all routes require admin role)
ADMIN_PREFIX = "/api/admin/v1"
app.include_router(admin_domains.router, prefix=ADMIN_PREFIX)
app.include_router(admin_users.router, prefix=ADMIN_PREFIX)
app.include_router(admin_groups.router, prefix=ADMIN_PREFIX)
app.include_router(admin_security.router, prefix=ADMIN_PREFIX)
app.include_router(admin_insights.audit_router, prefix=ADMIN_PREFIX)
app.include_router(admin_insights.dashboard_router, prefix=ADMIN_PREFIX)

@app.get("/")
@limiter.limit("5/minute")
async def root(request: Request):
    return {"message": "Welcome to RafMail API", "status": "active"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
