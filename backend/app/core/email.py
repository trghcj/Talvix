import os
import resend

resend.api_key = os.environ.get("RESEND_API_KEY")

def send_email_background(to_email: str, subject: str, html_body: str):
    """
    Sends an email using Resend.
    If RESEND_API_KEY is not set, it will print the email to the console instead.
    """
    if not resend.api_key:
        print(f"--- EMAIL SKIPPED (RESEND_API_KEY not set) ---")
        print(f"To: {to_email}")
        print(f"Subject: {subject}")
        print(f"Body: {html_body}")
        print(f"------------------------------------------------")
        return
        
    try:
        # Resend provides a testing domain `onboarding@resend.dev` that only works when sending to your verified email
        # For production, you would verify a custom domain and use it here (e.g., "no-reply@talvix.com")
        params = {
            "from": "Talvix <onboarding@resend.dev>",
            "to": [to_email],
            "subject": subject,
            "html": html_body,
        }
        response = resend.Emails.send(params)
        print(f"Email sent successfully to {to_email}. ID: {response.get('id')}")
        return response
    except Exception as e:
        print(f"Failed to send email to {to_email}: {str(e)}")
