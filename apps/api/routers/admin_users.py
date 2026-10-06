from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status, Query
from pydantic import BaseModel, Field
from sqlalchemy import func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from ..database import get_db
from ..models import User, UserRole, UserStatus, EmailAlias, Mailbox, Domain, GroupMember
from ..deps import require_admin, parse_uuid
from ..auth import get_password_hash
from ..audit import log_action
from ..policy import get_or_create_policy, validate_password
import re
from ..addressing import require_org_address
from ..schemas import user_out, alias_out
from ..rate_limit import limiter

router = APIRouter(prefix="/users", tags=["Admin: Users"])


class UserCreate(BaseModel):
    email: str
    first_name: str = Field(min_length=1, max_length=80)
    last_name: Optional[str] = Field(default=None, max_length=80)
    display_name: Optional[str] = Field(default=None, max_length=120)
    password: str
    role: UserRole = UserRole.MEMBER
    storage_quota_mb: int = Field(default=5120, ge=100, le=1024 * 1024)


class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(default=None, max_length=80)
    last_name: Optional[str] = Field(default=None, max_length=80)
    display_name: Optional[str] = Field(default=None, max_length=120)
    storage_quota_mb: Optional[int] = Field(default=None, ge=100, le=1024 * 1024)
    recovery_email: Optional[str] = None
    recovery_phone: Optional[str] = Field(default=None, max_length=32)


class RoleChange(BaseModel):
    role: UserRole


class PasswordReset(BaseModel):
    new_password: str


class AliasCreate(BaseModel):
    address: str


async def _get_user(db: AsyncSession, admin: User, user_id: str) -> User:
    user = (await db.execute(
        select(User).options(selectinload(User.aliases))
        .where(User.id == parse_uuid(user_id, "user id"), User.organization_id == admin.organization_id)
    )).scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def _ensure_can_manage(admin: User, target: User) -> None:
    """Regular admins cannot modify super admins."""
    if target.role == UserRole.SUPER_ADMIN and admin.role != UserRole.SUPER_ADMIN and admin.id != target.id:
        raise HTTPException(status_code=403, detail="Only a super admin can modify a super admin")


async def _super_admin_count(db: AsyncSession, org_id) -> int:
    return (await db.execute(
        select(func.count(User.id)).where(User.organization_id == org_id, User.role == UserRole.SUPER_ADMIN)
    )).scalar_one()


@router.get("")
async def list_users(
    q: Optional[str] = None,
    role: Optional[UserRole] = None,
    status_filter: Optional[UserStatus] = Query(default=None, alias="status"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=200),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(User).where(User.organization_id == admin.organization_id)
    if q:
        like = f"%{q.lower()}%"
        stmt = stmt.where(or_(
            func.lower(User.email).like(like),
            func.lower(User.first_name).like(like),
            func.lower(User.last_name).like(like),
            func.lower(User.display_name).like(like),
        ))
    if role:
        stmt = stmt.where(User.role == role)
    if status_filter:
        stmt = stmt.where(User.status == status_filter)

    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()
    users = (await db.execute(
        stmt.options(selectinload(User.aliases)).order_by(User.created_at.desc())
        .offset((page - 1) * page_size).limit(page_size)
    )).scalars().all()
    return {"items": [user_out(u, include_aliases=True) for u in users], "total": total,
            "page": page, "page_size": page_size}


@router.post("", status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
async def create_user(body: UserCreate, request: Request,
                      admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    if body.role != UserRole.MEMBER and admin.role != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Only a super admin can create administrators")
        
    local_part = body.email.split("@")[0] if "@" in body.email else body.email
    if not re.match(r"^[a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?$", local_part):
        raise HTTPException(status_code=400, detail="Invalid email username. It must not start or end with a dot or hyphen, and can only contain letters, numbers, dots, hyphens, and underscores.")
        
    email = await require_org_address(db, admin.organization_id, body.email)
    policy = await get_or_create_policy(db, admin.organization_id)
    validate_password(policy, body.password)

    user = User(
        organization_id=admin.organization_id,
        email=email,
        hashed_password=get_password_hash(body.password),
        first_name=body.first_name.strip(),
        last_name=(body.last_name or "").strip() or None,
        display_name=(body.display_name or "").strip() or None,
        role=body.role,
        storage_quota_mb=body.storage_quota_mb,
    )
    db.add(user)
    await db.flush()
    db.add(Mailbox(organization_id=admin.organization_id, user_id=user.id, primary_address=email))
    log_action(db, admin, "user.create", target_type="user", target_id=user.id, target_label=email,
               details={"role": body.role.value}, request=request)
    await db.commit()
    return user_out(await _get_user(db, admin, str(user.id)), include_aliases=True)


@router.get("/{user_id}")
async def get_user(user_id: str, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    user = await _get_user(db, admin, user_id)
    data = user_out(user, include_aliases=True)
    groups = (await db.execute(
        select(GroupMember).options(selectinload(GroupMember.group)).where(GroupMember.user_id == user.id)
    )).scalars().all()
    data["groups"] = [{"id": str(m.group.id), "name": m.group.name, "email": m.group.email,
                       "role": m.role.value} for m in groups]
    return data


@router.patch("/{user_id}")
async def update_user(user_id: str, body: UserUpdate, request: Request,
                      admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    user = await _get_user(db, admin, user_id)
    _ensure_can_manage(admin, user)
    changes = body.model_dump(exclude_unset=True)
    for key, value in changes.items():
        setattr(user, key, value.strip() if isinstance(value, str) else value)
    log_action(db, admin, "user.update", target_type="user", target_id=user.id, target_label=user.email,
               details={"fields": list(changes.keys())}, request=request)
    await db.commit()
    return user_out(await _get_user(db, admin, user_id), include_aliases=True)


@router.post("/{user_id}/role")
async def change_role(user_id: str, body: RoleChange, request: Request,
                      admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    if admin.role != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Only a super admin can change roles")
    user = await _get_user(db, admin, user_id)
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="You cannot change your own role")
    if user.role == UserRole.SUPER_ADMIN and body.role != UserRole.SUPER_ADMIN \
            and await _super_admin_count(db, admin.organization_id) <= 1:
        raise HTTPException(status_code=400, detail="An organization must keep at least one super admin")
    old = user.role.value
    user.role = body.role
    log_action(db, admin, "user.role_change", target_type="user", target_id=user.id, target_label=user.email,
               details={"from": old, "to": body.role.value}, request=request)
    await db.commit()
    return user_out(await _get_user(db, admin, user_id), include_aliases=True)


async def _set_status(user_id: str, new_status: UserStatus, request: Request, admin: User, db: AsyncSession):
    user = await _get_user(db, admin, user_id)
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="You cannot change your own account status")
    _ensure_can_manage(admin, user)
    user.status = new_status
    user.is_active = new_status == UserStatus.ACTIVE
    action = "user.suspend" if new_status == UserStatus.SUSPENDED else "user.activate"
    log_action(db, admin, action, target_type="user", target_id=user.id, target_label=user.email, request=request)
    await db.commit()
    return user_out(await _get_user(db, admin, user_id), include_aliases=True)


@router.post("/{user_id}/suspend")
async def suspend_user(user_id: str, request: Request,
                       admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    return await _set_status(user_id, UserStatus.SUSPENDED, request, admin, db)


@router.post("/{user_id}/activate")
async def activate_user(user_id: str, request: Request,
                        admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    return await _set_status(user_id, UserStatus.ACTIVE, request, admin, db)


@router.post("/{user_id}/reset-password")
async def reset_password(user_id: str, body: PasswordReset, request: Request,
                         admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    user = await _get_user(db, admin, user_id)
    _ensure_can_manage(admin, user)
    validate_password(await get_or_create_policy(db, admin.organization_id), body.new_password)
    user.hashed_password = get_password_hash(body.new_password)
    log_action(db, admin, "user.reset_password", target_type="user", target_id=user.id,
               target_label=user.email, request=request)
    await db.commit()
    return {"status": "ok"}


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str, request: Request,
                      admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    user = await _get_user(db, admin, user_id)
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account")
    _ensure_can_manage(admin, user)
    if user.role == UserRole.SUPER_ADMIN and await _super_admin_count(db, admin.organization_id) <= 1:
        raise HTTPException(status_code=400, detail="An organization must keep at least one super admin")

    # Clear catch-all references and detach mailbox
    domains = (await db.execute(
        select(Domain).where(Domain.organization_id == admin.organization_id, Domain.catch_all_address == user.email)
    )).scalars().all()
    for d in domains:
        d.catch_all_address = None
    mailboxes = (await db.execute(select(Mailbox).where(Mailbox.user_id == user.id))).scalars().all()
    for mb in mailboxes:
        await db.delete(mb)

    log_action(db, admin, "user.delete", target_type="user", target_id=user.id, target_label=user.email, request=request)
    await db.delete(user)
    await db.commit()


# ---- Aliases ----

@router.get("/{user_id}/aliases")
async def list_aliases(user_id: str, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    user = await _get_user(db, admin, user_id)
    return [alias_out(a) for a in user.aliases]


@router.post("/{user_id}/aliases", status_code=status.HTTP_201_CREATED)
async def add_alias(user_id: str, body: AliasCreate, request: Request,
                    admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    user = await _get_user(db, admin, user_id)
    _ensure_can_manage(admin, user)
    address = await require_org_address(db, admin.organization_id, body.address)
    alias = EmailAlias(user_id=user.id, address=address)
    db.add(alias)
    await db.flush()
    log_action(db, admin, "alias.add", target_type="user", target_id=user.id, target_label=user.email,
               details={"alias": address}, request=request)
    await db.commit()
    return alias_out(alias)


@router.delete("/{user_id}/aliases/{alias_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_alias(user_id: str, alias_id: str, request: Request,
                       admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    user = await _get_user(db, admin, user_id)
    _ensure_can_manage(admin, user)
    alias = next((a for a in user.aliases if str(a.id) == alias_id), None)
    if not alias:
        raise HTTPException(status_code=404, detail="Alias not found")
    log_action(db, admin, "alias.remove", target_type="user", target_id=user.id, target_label=user.email,
               details={"alias": alias.address}, request=request)
    await db.delete(alias)
    await db.commit()
