"""Legacy user endpoints. Kept for backward compatibility; now admin-only and org-scoped.
Prefer /api/admin/v1/users for all user management."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db
from ..models import User
from ..deps import require_admin

router = APIRouter(prefix="/users", tags=["Users (legacy)"])


@router.get("/")
async def get_users(admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.organization_id == admin.organization_id))
    users = result.scalars().all()
    return [{"id": u.id, "email": u.email, "is_active": u.is_active} for u in users]
