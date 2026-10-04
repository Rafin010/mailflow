from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..database import get_db
from ..models import Domain, User
from ..deps import require_admin, parse_uuid
from ..audit import log_action
from ..schemas import domain_out
from .. import dns_service

router = APIRouter(prefix="/domains", tags=["Admin: Domains"])


class DomainCreate(BaseModel):
    domain_name: str


class DomainUpdate(BaseModel):
    is_primary: Optional[bool] = None
    catch_all_address: Optional[str] = None


async def _get_domain(db: AsyncSession, admin: User, domain_id: str) -> Domain:
    domain = (await db.execute(
        select(Domain).where(Domain.id == parse_uuid(domain_id, "domain id"),
                             Domain.organization_id == admin.organization_id)
    )).scalars().first()
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")
    return domain


async def _user_count(db: AsyncSession, admin: User, domain_name: str) -> int:
    return (await db.execute(
        select(func.count(User.id)).where(User.organization_id == admin.organization_id,
                                          User.email.like(f"%@{domain_name}"))
    )).scalar_one()


@router.get("")
async def list_domains(admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    domains = (await db.execute(
        select(Domain).where(Domain.organization_id == admin.organization_id)
        .order_by(Domain.is_primary.desc(), Domain.created_at)
    )).scalars().all()
    return [domain_out(d, await _user_count(db, admin, d.domain_name)) for d in domains]


@router.post("", status_code=status.HTTP_201_CREATED)
async def add_domain(body: DomainCreate, request: Request,
                     admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    name = dns_service.normalize_domain(body.domain_name)
    if not dns_service.is_valid_domain(name):
        raise HTTPException(status_code=422, detail="Enter a valid domain name, e.g. company.com")
    if (await db.execute(select(Domain).where(Domain.domain_name == name))).scalars().first():
        raise HTTPException(status_code=400, detail="This domain is already registered")

    has_any = (await db.execute(
        select(func.count(Domain.id)).where(Domain.organization_id == admin.organization_id)
    )).scalar_one()
    private_pem, public_b64 = dns_service.generate_dkim_keypair()
    domain = Domain(
        organization_id=admin.organization_id,
        domain_name=name,
        verification_token=dns_service.new_verification_token(),
        is_primary=has_any == 0,
        dkim_private_key=private_pem,
        dkim_public_key=public_b64,
    )
    db.add(domain)
    await db.flush()
    log_action(db, admin, "domain.add", target_type="domain", target_id=domain.id, target_label=name, request=request)
    await db.commit()
    await db.refresh(domain)
    return domain_out(domain, 0)


@router.get("/{domain_id}")
async def get_domain(domain_id: str, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    domain = await _get_domain(db, admin, domain_id)
    data = domain_out(domain, await _user_count(db, admin, domain.domain_name))
    data["dns_records"] = dns_service.expected_records(domain)
    return data


@router.post("/{domain_id}/verify")
async def verify_domain(domain_id: str, request: Request,
                        admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    domain = await _get_domain(db, admin, domain_id)
    ok = await dns_service.check_verification(domain)
    domain.last_checked_at = datetime.utcnow()
    if ok and not domain.is_verified:
        domain.is_verified = True
        domain.verified_at = datetime.utcnow()
        log_action(db, admin, "domain.verify", target_type="domain", target_id=domain.id,
                   target_label=domain.domain_name, request=request)
    await db.commit()
    await db.refresh(domain)
    if not ok:
        raise HTTPException(
            status_code=400,
            detail="Verification TXT record not found yet. DNS changes can take up to 48 hours to propagate.",
        )
    return domain_out(domain)


@router.post("/{domain_id}/check-dns")
async def check_dns(domain_id: str, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    domain = await _get_domain(db, admin, domain_id)
    domain.mx_status = await dns_service.check_mx(domain)
    domain.spf_status = await dns_service.check_spf(domain)
    domain.dkim_status = await dns_service.check_dkim(domain)
    domain.dmarc_status = await dns_service.check_dmarc(domain)
    if not domain.is_verified and await dns_service.check_verification(domain):
        domain.is_verified = True
        domain.verified_at = datetime.utcnow()
    domain.last_checked_at = datetime.utcnow()
    await db.commit()
    await db.refresh(domain)
    data = domain_out(domain)
    data["dns_records"] = dns_service.expected_records(domain)
    return data


@router.patch("/{domain_id}")
async def update_domain(domain_id: str, body: DomainUpdate, request: Request,
                        admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    domain = await _get_domain(db, admin, domain_id)
    changes = body.model_dump(exclude_unset=True)

    if changes.get("is_primary"):
        if not domain.is_verified:
            raise HTTPException(status_code=400, detail="Only a verified domain can be made primary")
        others = (await db.execute(
            select(Domain).where(Domain.organization_id == admin.organization_id, Domain.id != domain.id)
        )).scalars().all()
        for other in others:
            other.is_primary = False
        domain.is_primary = True

    if "catch_all_address" in changes:
        addr = (changes["catch_all_address"] or "").strip().lower() or None
        if addr:
            target = (await db.execute(
                select(User).where(User.email == addr, User.organization_id == admin.organization_id)
            )).scalars().first()
            if not target:
                raise HTTPException(status_code=400, detail="Catch-all address must be an existing user in your organization")
        domain.catch_all_address = addr

    log_action(db, admin, "domain.update", target_type="domain", target_id=domain.id,
               target_label=domain.domain_name, details=changes, request=request)
    await db.commit()
    await db.refresh(domain)
    return domain_out(domain)


@router.delete("/{domain_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_domain(domain_id: str, request: Request,
                        admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    domain = await _get_domain(db, admin, domain_id)
    if await _user_count(db, admin, domain.domain_name) > 0:
        raise HTTPException(status_code=400, detail="Remove or move all users on this domain before deleting it")
    if domain.is_primary:
        others = (await db.execute(
            select(func.count(Domain.id)).where(Domain.organization_id == admin.organization_id, Domain.id != domain.id)
        )).scalar_one()
        if others:
            raise HTTPException(status_code=400, detail="Make another domain primary before deleting this one")
    log_action(db, admin, "domain.delete", target_type="domain", target_id=domain.id,
               target_label=domain.domain_name, request=request)
    await db.delete(domain)
    await db.commit()
