from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..database import get_db
from ..models import AuditLog, User, UserStatus, UserRole, Domain, Group, EmailAlias
from ..deps import require_admin
from ..schemas import audit_out, domain_out

audit_router = APIRouter(prefix="/audit-logs", tags=["Admin: Audit Logs"])
dashboard_router = APIRouter(prefix="/dashboard", tags=["Admin: Dashboard"])


@audit_router.get("")
async def list_audit_logs(
    q: Optional[str] = None,
    action: Optional[str] = None,
    days: Optional[int] = Query(default=None, ge=1, le=365),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(AuditLog).where(AuditLog.organization_id == admin.organization_id)
    if q:
        like = f"%{q.lower()}%"
        stmt = stmt.where(or_(func.lower(AuditLog.actor_email).like(like),
                              func.lower(AuditLog.target_label).like(like)))
    if action:
        stmt = stmt.where(AuditLog.action.like(f"{action}%"))
    if days:
        stmt = stmt.where(AuditLog.created_at >= datetime.utcnow() - timedelta(days=days))
    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()
    logs = (await db.execute(
        stmt.order_by(AuditLog.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    )).scalars().all()
    return {"items": [audit_out(l) for l in logs], "total": total, "page": page, "page_size": page_size}


@dashboard_router.get("")
async def dashboard(admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    org_id = admin.organization_id

    async def count(stmt):
        return (await db.execute(stmt)).scalar_one()

    users_total = await count(select(func.count(User.id)).where(User.organization_id == org_id))
    users_active = await count(select(func.count(User.id)).where(User.organization_id == org_id,
                                                                  User.status == UserStatus.ACTIVE))
    admins = await count(select(func.count(User.id)).where(User.organization_id == org_id,
                                                            User.role.in_([UserRole.ADMIN, UserRole.SUPER_ADMIN])))
    groups = await count(select(func.count(Group.id)).where(Group.organization_id == org_id))
    aliases = await count(select(func.count(EmailAlias.id)).select_from(EmailAlias)
                          .join(User, User.id == EmailAlias.user_id).where(User.organization_id == org_id))
    storage_used, storage_quota = (await db.execute(
        select(func.coalesce(func.sum(User.storage_used_mb), 0), func.coalesce(func.sum(User.storage_quota_mb), 0))
        .where(User.organization_id == org_id)
    )).one()

    domains = (await db.execute(select(Domain).where(Domain.organization_id == org_id))).scalars().all()
    domain_issues = [
        domain_out(d) for d in domains
        if not d.is_verified or any(s != "ok" for s in (d.mx_status, d.spf_status, d.dkim_status, d.dmarc_status))
    ]
    recent = (await db.execute(
        select(AuditLog).where(AuditLog.organization_id == org_id).order_by(AuditLog.created_at.desc()).limit(8)
    )).scalars().all()

    return {
        "users": {"total": users_total, "active": users_active, "suspended": users_total - users_active,
                  "admins": admins},
        "groups": groups,
        "aliases": aliases,
        "domains": {"total": len(domains), "verified": sum(1 for d in domains if d.is_verified),
                    "with_issues": len(domain_issues)},
        "storage": {"used_mb": int(storage_used), "quota_mb": int(storage_quota)},
        "domain_issues": domain_issues,
        "recent_activity": [audit_out(l) for l in recent],
    }
