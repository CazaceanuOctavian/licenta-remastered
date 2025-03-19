import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import sys
import getpass

def send_email(recipient_email):
    """
    Send an email with the message 'heeloo' to the specified recipient email address.
    
    Args:
        recipient_email (str): The email address to send the message to
    """
    # Your email credentials
    sender_email = 'productroboot@gmail.com'
    password = 'aeww qits csgu xigu'
    
    # Setup the MIME
    message = MIMEMultipart()
    message['From'] = sender_email
    message['To'] = recipient_email
    message['Subject'] = 'Simple Test Email'
    
    # The body of the email
    body = "heeloo"
    message.attach(MIMEText(body, 'plain'))
    
    try:
        # Create SMTP session
        # This example uses Gmail's SMTP server
        # You may need to adjust the server and port for other email providers
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()  # Secure the connection
        
        # Login to sender email
        server.login(sender_email, password)
        
        # Send email
        text = message.as_string()
        server.sendmail(sender_email, recipient_email, text)
        
        # Close connection
        server.quit()
        print(f"Email successfully sent to {recipient_email}")
        
    except Exception as e:
        print(f"Error sending email: {e}")

if __name__ == "__main__":
    # Check if email address was provided as command line argument
    if len(sys.argv) > 1:
        recipient_email = sys.argv[1]
        send_email(recipient_email)
    else:
        recipient_email = input("Enter recipient email address: ")
        send_email(recipient_email)