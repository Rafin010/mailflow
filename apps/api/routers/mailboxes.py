from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db
from ..models import Mailbox, Message
from pydantic import BaseModel

router = APIRouter(prefix="/mailboxes", tags=["Mailboxes"])

class MailboxCreate(BaseModel):
    primary_address: str
    organization_id: str

@router.post("/")
async def create_mailbox(mailbox: MailboxCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Mailbox).where(Mailbox.primary_address == mailbox.primary_address))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Mailbox address already in use")
        
    new_mailbox = Mailbox(
        primary_address=mailbox.primary_address,
        organization_id=mailbox.organization_id
    )
    db.add(new_mailbox)
    await db.commit()
    await db.refresh(new_mailbox)
    return {"id": new_mailbox.id, "primary_address": new_mailbox.primary_address}

@router.get("/{mailbox_id}/messages")
async def get_mailbox_messages(mailbox_id: str, limit: int = 50, offset: int = 0, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Message)
        .where(Message.mailbox_id == mailbox_id)
        .order_by(Message.received_at.desc())
        .limit(limit)
        .offset(offset)
    )
    messages = result.scalars().all()
    return messages
