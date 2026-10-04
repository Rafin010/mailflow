import re
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from .models import OrgPolicy


async def get_or_create_policy(db: AsyncSession, organization_id) -> OrgPolicy:
    policy = (await db.execute(
        select(OrgPolicy).where(OrgPolicy.organization_id == organization_id)
    )).scalars().first()
    if not policy:
        policy = OrgPolicy(organization_id=organization_id)
        db.add(policy)
        await db.flush()
    return policy


def validate_password(policy: OrgPolicy | None, password: str) -> None:
    """Raise 422 with a human message if password violates org policy."""
    min_len = policy.password_min_length if policy else 8
    errors = []
    if len(password) < min_len:
        errors.append(f"at least {min_len} characters")
    if (policy is None or policy.password_require_uppercase) and not re.search(r"[A-Z]", password):
        errors.append("an uppercase letter")
    if (policy is None or policy.password_require_number) and not re.search(r"\d", password):
        errors.append("a number")
    if policy is not None and policy.password_require_symbol and not re.search(r"[^A-Za-z0-9]", password):
        errors.append("a symbol")
    if errors:
        raise HTTPException(status_code=422, detail="Password must contain " + ", ".join(errors) + ".")
