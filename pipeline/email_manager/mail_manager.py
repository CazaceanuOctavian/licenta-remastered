import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class MailManager:
    __server : smtplib.SMTP
    __sender_address : str

    def __init__(self, sender_address, sender_password, smtp_address, smtp_port):
        try:
            self.__sender_address = sender_address

            self.__server = smtplib.SMTP(smtp_address, smtp_port)
            self.__server.starttls()
            self.__server.login(sender_address, sender_password)
        except Exception as e:
            print(e)

    def send_email_to_address(self, mail_subject:str, mail_body:str, recipient_address:str):
        message = MIMEMultipart()
        message['From'] = self.__sender_address
        message['To'] = recipient_address
        message['Subject'] = mail_subject
        message.attach(MIMEText(mail_body, 'plain'))
        try: 
            text = message.as_string()
            self.__server.sendmail(self.__sender_address, recipient_address, text)
        
        except Exception as e:
            print(e)