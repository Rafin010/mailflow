from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from .models import User, EmailAlias, Group, Domain


async def address_in_use(db: AsyncSession, address: str) -> bool:
    address = address.lower()
    for model, col in ((User, User.email), (EmailAlias, EmailAlias.address), (Group, Group.email)):
        if (await db.execute(select(model).where(col == address))).scalars().first():
            return True
    return False


async def require_org_address(db: AsyncSession, organization_id, address: str) -> str:
    """Validate an address belongs to a verified domain of this org and is free. Returns normalized address."""
    address = address.strip().lower()
    if address.count("@") != 1 or not address.split("@")[0]:
        raise HTTPException(status_code=422, detail="Enter a valid email address")
    domain_name = address.split("@")[1]
    domain = (await db.execute(
        select(Domain).where(Domain.domain_name == domain_name, Domain.organization_id == organization_id)
    )).scalars().first()
    if not domain:
        raise HTTPException(status_code=400, detail=f"{domain_name} is not a domain of your organization")
    if not domain.is_verified:
        raise HTTPException(status_code=400, detail=f"Verify {domain_name} before creating addresses on it")
    if await address_in_use(db, address):
        raise HTTPException(status_code=400, detail=f"{address} is already in use")
    return address
