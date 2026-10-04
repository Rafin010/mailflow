import os
import sendgrid
from sendgrid.helpers.mail import Mail, Email, To, Content
from fastapi import BackgroundTasks

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "system@rafmail.com")

sg = sendgrid.SendGridAPIClient(api_key=SENDGRID_API_KEY) if SENDGRID_API_KEY else None

def send_email_task(to_email: str, subject: str, content: str, from_email: str = None):
    """
    Background task to send email via SendGrid.
    """
    if not sg:
        print(f"MOCK SEND EMAIL: To: {to_email}, Subject: {subject}")
        return
        
    sender = from_email or DEFAULT_FROM_EMAIL
    message = Mail(
        from_email=Email(sender),
        to_emails=To(to_email),
        subject=subject,
        html_content=Content("text/html", content)
    )
    
    try:
        response = sg.client.mail.send.post(request_body=message.get())
        print(f"Email sent to {to_email}. Status code: {response.status_code}")
    except Exception as e:
        print(f"Failed to send email to {to_email}. Error: {str(e)}")

def schedule_email(background_tasks: BackgroundTasks, to_email: str, subject: str, content: str, from_email: str = None):
    """
    Helper function to enqueue the email task.
    """
    background_tasks.add_task(send_email_task, to_email, subject, content, from_email)
