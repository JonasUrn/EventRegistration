from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timedelta
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import get_db, SMTP_SERVER, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD
from classes.client import Client

verification_codes = {}

class SendCodeRequest(BaseModel):
    el_pastas: str

class VerifyCodeRequest(BaseModel):
    el_pastas: str
    code: str

class EmailVerificationController:
    def __init__(self):
        self.router = APIRouter(prefix="/api/users", tags=["email-verification"])
        self.router.add_api_route("/send-verification-code", self.send_code, methods=["POST"])
        self.router.add_api_route("/verify-code", self.verify_code, methods=["POST"])

    def send_code(self, request: SendCodeRequest, db: Session = Depends(get_db)):
        client = db.query(Client).filter(Client.el_pastas == request.el_pastas).first()
        if not client:
            raise HTTPException(status_code=404, detail="User not found")

        code = str(random.randint(100000, 999999))
        expiry = datetime.utcnow() + timedelta(minutes=10)
        verification_codes[request.el_pastas] = {"code": code, "expiry": expiry}

        if SMTP_USERNAME and SMTP_PASSWORD:
            try:
                msg = MIMEMultipart()
                msg["From"] = SMTP_USERNAME
                msg["To"] = request.el_pastas
                msg["Subject"] = "Email Verification Code"
                body = f"Your verification code is: {code}\nThis code will expire in 10 minutes."
                msg.attach(MIMEText(body, "plain"))

                server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
                server.starttls()
                server.login(SMTP_USERNAME, SMTP_PASSWORD)
                server.send_message(msg)
                server.quit()
                print(f"Email sent successfully to {request.el_pastas}")
            except Exception as e:
                print(f"Email sending failed: {e}")
                print(f"SMTP Config - Server: {SMTP_SERVER}, Port: {SMTP_PORT}, Username: {SMTP_USERNAME[:3]}***")
        else:
            print("Email not configured - SMTP credentials missing")

        return {"message": "Verification code sent", "code": code}

    def verify_code(self, request: VerifyCodeRequest, db: Session = Depends(get_db)):
        if request.el_pastas not in verification_codes:
            raise HTTPException(status_code=400, detail="No verification code found")

        stored = verification_codes[request.el_pastas]
        if datetime.utcnow() > stored["expiry"]:
            del verification_codes[request.el_pastas]
            raise HTTPException(status_code=400, detail="Verification code expired")

        if stored["code"] != request.code:
            raise HTTPException(status_code=400, detail="Invalid verification code")

        client = db.query(Client).filter(Client.el_pastas == request.el_pastas).first()
        if client:
            client.patvirtintas_pastas = True
            db.commit()

        del verification_codes[request.el_pastas]
        return {"message": "Email verified successfully"}
