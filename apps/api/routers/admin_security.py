from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..database import get_db
from ..models import MailFilterRule, FilterRuleType, User
from ..deps import require_admin, parse_uuid
from ..audit import log_action
from ..policy import get_or_create_policy
from ..schemas import policy_out, rule_out
from ..dns_service import is_valid_domain
import ipaddress
import re

router = APIRouter(prefix="/security", tags=["Admin: Security"])


class PolicyUpdate(BaseModel):
    password_min_length: Optional[int] = Field(default=None, ge=6, le=64)
    password_require_uppercase: Optional[bool] = None
    password_require_number: Optional[bool] = None
    password_require_symbol: Optional[bool] = None
    enforce_mfa: Optional[bool] = None
    session_timeout_minutes: Optional[int] = Field(default=None, ge=5, le=60 * 24 * 30)
    allow_external_forwarding: Optional[bool] = None


class RuleCreate(BaseModel):
    rule_type: FilterRuleType
    value: str = Field(min_length=1, max_length=255)
    note: Optional[str] = Field(default=None, max_length=255)


EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _valid_rule_value(value: str) -> bool:
    if EMAIL_RE.match(value) or is_valid_domain(value):
        return True
    try:
        ipaddress.ip_network(value, strict=False)
        return True
    except ValueError:
        return False


@router.get("/policy")
async def get_policy(admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    policy = await get_or_create_policy(db, admin.organization_id)
    await db.commit()
    return policy_out(policy)


@router.put("/policy")
async def update_policy(body: PolicyUpdate, request: Request,
                        admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    policy = await get_or_create_policy(db, admin.organization_id)
    changes = body.model_dump(exclude_unset=True, exclude_none=True)
    for key, value in changes.items():
        setattr(policy, key, value)
    log_action(db, admin, "security.policy_update", target_type="policy", details=changes, request=request)
    await db.commit()
    await db.refresh(policy)
    return policy_out(policy)


@router.get("/rules")
async def list_rules(admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    rules = (await db.execute(
        select(MailFilterRule).where(MailFilterRule.organization_id == admin.organization_id)
        .order_by(MailFilterRule.created_at.desc())
    )).scalars().all()
    return [rule_out(r) for r in rules]


@router.post("/rules", status_code=status.HTTP_201_CREATED)
async def add_rule(body: RuleCreate, request: Request,
                   admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    value = body.value.strip().lower()
    if not _valid_rule_value(value):
        raise HTTPException(status_code=422, detail="Enter a valid email address, domain, or IP/CIDR")
    duplicate = (await db.execute(
        select(MailFilterRule).where(MailFilterRule.organization_id == admin.organization_id,
                                     MailFilterRule.value == value)
    )).scalars().first()
    if duplicate:
        raise HTTPException(status_code=400, detail=f"{value} is already on the {duplicate.rule_type.value} list")
    rule = MailFilterRule(organization_id=admin.organization_id, rule_type=body.rule_type, value=value, note=body.note)
    db.add(rule)
    await db.flush()
    log_action(db, admin, f"security.{body.rule_type.value}_add", target_type="rule", target_id=rule.id,
               target_label=value, request=request)
    await db.commit()
    return rule_out(rule)


@router.delete("/rules/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_rule(rule_id: str, request: Request,
                      admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    rule = (await db.execute(
        select(MailFilterRule).where(MailFilterRule.id == parse_uuid(rule_id, "rule id"),
                                     MailFilterRule.organization_id == admin.organization_id)
    )).scalars().first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    log_action(db, admin, f"security.{rule.rule_type.value}_remove", target_type="rule", target_id=rule.id,
               target_label=rule.value, request=request)
    await db.delete(rule)
    await db.commit()
