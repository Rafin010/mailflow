from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db
from ..models import Message, Mailbox
from ..email_service import schedule_email
from ..security import sanitize_html
from pydantic import BaseModel

router = APIRouter(prefix="/messages", tags=["Messages"])

class SendEmailRequest(BaseModel):
    mailbox_id: str
    to_email: str
    subject: str
    content: str

@router.post("/send")
async def send_email(request: SendEmailRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    # 1. Verify mailbox exists
    result = await db.execute(select(Mailbox).where(Mailbox.id == request.mailbox_id))
    mailbox = result.scalars().first()
    
    if not mailbox:
        raise HTTPException(status_code=404, detail="Mailbox not found")
        
    # Sanitize the rich text HTML content to prevent XSS
    safe_content = sanitize_html(request.content)
        
    # 2. Save message to database (Outbox/Sent)
    new_message = Message(
        mailbox_id=mailbox.id,
        sender_email=mailbox.primary_address,
        subject=request.subject,
        snippet=safe_content[:100] + "..." if len(safe_content) > 100 else safe_content,
        is_read=True  # Sent messages are already read
    )
    db.add(new_message)
    await db.commit()
    
    # 3. Schedule SendGrid background task
    schedule_email(
        background_tasks=background_tasks,
        to_email=request.to_email,
        subject=request.subject,
        content=safe_content,
        from_email=mailbox.primary_address
    )
    
    return {"message": "Email queued for delivery successfully", "message_id": new_message.id}

from fastapi import Form
from typing import Optional

@router.post("/inbound")
async def receive_inbound_email(
    to: str = Form(...),
    sender: str = Form(alias="from"),
    subject: Optional[str] = Form(None),
    text: Optional[str] = Form(None),
    html: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Webhook endpoint for SendGrid Inbound Parse.
    SendGrid will POST multipart/form-data here when an email arrives.
    """
    # Clean the 'to' address (SendGrid might send "Name <email@domain.com>")
    to_email_clean = to.split('<')[-1].strip('>') if '<' in to else to.strip()
    
    # Find the mailbox for this recipient
    result = await db.execute(select(Mailbox).where(Mailbox.primary_address == to_email_clean))
    mailbox = result.scalars().first()
    
    if not mailbox:
        # Mailbox doesn't exist on our platform, ignore or handle bounce
        return {"status": "ignored", "reason": "mailbox not found"}
        
    # Prefer HTML, fallback to text
    raw_content = html if html else text or ""
    safe_content = sanitize_html(raw_content)
    
    new_message = Message(
        mailbox_id=mailbox.id,
        sender_email=sender,
        subject=subject or "(No Subject)",
        snippet=safe_content[:100] + "..." if len(safe_content) > 100 else safe_content,
        is_read=False
    )
    db.add(new_message)
    await db.commit()
    
    # In a real app, you would also trigger a WebSocket event here to update the UI
    
    return {"status": "success"}
