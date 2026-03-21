import os
import sys
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.html import strip_tags

# Add backend to path to ensure services can be imported if needed, 
# though normally Django handles this if it's a module.
sys.path.append(os.path.join(settings.BASE_DIR))
from services.email_service import send_email as send_resend_email

def send_platform_email(subject, template_name, context, recipient_list, from_email=None):
    """
    Centralized email service to send branded HTML emails.
    Integrated with Resend with safe fallback to Django SMTP.
    """
    if not recipient_list:
        return False
        
    try:
        from_email = from_email or settings.DEFAULT_FROM_EMAIL
        
        # Render the HTML template
        html_content = render_to_string(f'emails/{template_name}', context)
        
        # Try Resend first
        resend_success = False
        if getattr(settings, 'RESEND_API_KEY', None):
            # Resend takes a single recipient in our service implementation, 
            # so we loop if there are multiple, or just send to the first for now.
            # Most platform emails are single recipient.
            for recipient in recipient_list:
                response = send_resend_email(recipient, subject, html_content)
                if response:
                    resend_success = True
            
            if resend_success:
                return True

        # Fallback to Django Default (SMTP/Console)
        text_content = strip_tags(html_content)
        msg = EmailMultiAlternatives(subject, text_content, from_email, recipient_list)
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        return True
    except Exception as e:
        print(f"Failed to send email to {recipient_list}. Error: {e}")
        return False
