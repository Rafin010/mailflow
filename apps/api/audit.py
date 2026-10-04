import json
from typing import Any, Optional
from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession
from .models import AuditLog, User


def log_action(
    db: AsyncSession,
    actor: Optional[User],
    action: str,
    *,
    organization_id=None,
    target_type: Optional[str] = None,
    target_id: Any = None,
    target_label: Optional[str] = None,
    details: Optional[dict] = None,
    request: Optional[Request] = None,
) -> None:
    """Queue an audit entry on the session. Caller is responsible for commit."""
    db.add(AuditLog(
        organization_id=organization_id or (actor.organization_id if actor else None),
        actor_id=actor.id if actor else None,
        actor_email=actor.email if actor else None,
        action=action,
        target_type=target_type,
        target_id=str(target_id) if target_id is not None else None,
        target_label=target_label,
        details=json.dumps(details, default=str) if details else None,
        ip_address=request.client.host if request and request.client else None,
    ))
