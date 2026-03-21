import os
import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

def send_email(to_email, subject, html_content):
    """
    Core service to send email via Resend API.
    
    :param to_email: Recipient email address
    :param subject: Email subject
    :param html_content: HTML body of the email
    :return: Response object or None if failed
    """
    api_key = getattr(settings, 'RESEND_API_KEY', None)
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'onboarding@resend.dev')
    
    if not api_key:
        logger.error("RESEND_API_KEY is not configured in settings.")
        return None
        
    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "from": from_email,
        "to": [to_email],
        "subject": subject,
        "html": html_content
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        response.raise_for_status()
        logger.info(f"Email sent successfully to {to_email} via Resend. ID: {response.json().get('id')}")
        return response
    except requests.exceptions.RequestException as e:
        error_msg = f"Failed to send email to {to_email} via Resend: {str(e)}"
        if hasattr(e, 'response') and e.response is not None:
            error_msg += f" | Details: {e.response.text}"
        logger.error(error_msg)
        return None
