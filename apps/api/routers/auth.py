from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..database import get_db
from ..models import Organization, User, UserRole, UserStatus
from ..auth import get_password_hash, verify_password, create_access_token
from ..deps import get_current_user
from ..audit import log_action
from ..policy import get_or_create_policy, validate_password
from ..schemas import user_out

router = APIRouter(prefix="/auth", tags=["Auth"])


class SignupRequest(BaseModel):
    organization_name: str = Field(min_length=2, max_length=120)
    first_name: str = Field(min_length=1, max_length=80)
    last_name: Optional[str] = Field(default=None, max_length=80)
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ProfileUpdate(BaseModel):
    first_name: Optional[str] = Field(default=None, max_length=80)
    last_name: Optional[str] = Field(default=None, max_length=80)
    display_name: Optional[str] = Field(default=None, max_length=120)
    avatar_url: Optional[str] = None
    recovery_email: Optional[EmailStr] = None
    recovery_phone: Optional[str] = Field(default=None, max_length=32)


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


def _token_response(user: User) -> dict:
    token = create_access_token({"sub": str(user.id), "org": str(user.organization_id), "role": user.role.value})
    return {"access_token": token, "token_type": "bearer", "user": user_out(user)}


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(body: SignupRequest, request: Request, db: AsyncSession = Depends(get_db)):
    email = body.email.lower()
    if (await db.execute(select(User).where(User.email == email))).scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
    validate_password(None, body.password)

    org = Organization(name=body.organization_name.strip())
    db.add(org)
    await db.flush()
    await get_or_create_policy(db, org.id)

    user = User(
        organization_id=org.id,
        email=email,
        hashed_password=get_password_hash(body.password),
        first_name=body.first_name.strip(),
        last_name=(body.last_name or "").strip() or None,
        role=UserRole.SUPER_ADMIN,
        status=UserStatus.ACTIVE,
        last_login_at=datetime.utcnow(),
    )
    db.add(user)
    await db.flush()
    log_action(db, user, "organization.create", target_type="organization", target_id=org.id,
               target_label=org.name, request=request)
    await db.commit()
    await db.refresh(user)
    return _token_response(user)


@router.post("/login")
async def login(body: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    email = body.email.lower()
    user = (await db.execute(select(User).where(User.email == email))).scalars().first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if user.status == UserStatus.SUSPENDED:
        raise HTTPException(status_code=403, detail="Your account has been suspended. Contact your administrator.")
    user.last_login_at = datetime.utcnow()
    log_action(db, user, "auth.login", target_type="user", target_id=user.id, target_label=user.email, request=request)
    await db.commit()
    await db.refresh(user)
    return _token_response(user)


@router.get("/me")
async def me(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    org = await db.get(Organization, user.organization_id)
    data = user_out(user)
    data["organization"] = {"id": str(org.id), "name": org.name, "billing_plan": org.billing_plan.value} if org else None
    return data


@router.patch("/me")
async def update_me(body: ProfileUpdate, request: Request,
                    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    changes = body.model_dump(exclude_unset=True)
    for key, value in changes.items():
        setattr(user, key, value)
    log_action(db, user, "profile.update", target_type="user", target_id=user.id, target_label=user.email,
               details={"fields": list(changes.keys())}, request=request)
    await db.commit()
    await db.refresh(user)
    return user_out(user)


@router.post("/me/password")
async def change_password(body: PasswordChange, request: Request,
                          user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not verify_password(body.current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    policy = await get_or_create_policy(db, user.organization_id)
    validate_password(policy, body.new_password)
    user.hashed_password = get_password_hash(body.new_password)
    log_action(db, user, "profile.password_change", target_type="user", target_id=user.id,
               target_label=user.email, request=request)
    await db.commit()
    return {"status": "ok"}
