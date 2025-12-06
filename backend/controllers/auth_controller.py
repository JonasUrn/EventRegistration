from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field, field_validator
from datetime import date
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import get_db, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from classes.client import Client

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class RegisterRequest(BaseModel):
    vardas: str
    pavarde: str
    el_pastas: str
    tel_numeris: str
    gimimo_data: str
    lytis: str
    slapyvardis: str
    slaptazodis: str = Field(..., max_length=72)
    salis: str
    miestas: str
    organizatorius: bool = False

class LoginRequest(BaseModel):
    slapyvardis: str
    slaptazodis: str = Field(..., max_length=72)

class AuthController:
    def __init__(self):
        self.router = APIRouter(prefix="/api/users", tags=["auth"])
        self.router.add_api_route("/register", self.register, methods=["POST"])
        self.router.add_api_route("/login", self.login, methods=["POST"])

    def register(self, request: RegisterRequest, db: Session = Depends(get_db)):
        existing = db.query(Client).filter(Client.slapyvardis == request.slapyvardis).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username already exists")

        existing_email = db.query(Client).filter(Client.el_pastas == request.el_pastas).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already exists")

        password_to_hash = request.slaptazodis[:72] if len(request.slaptazodis.encode('utf-8')) > 72 else request.slaptazodis
        hashed_password = pwd_context.hash(password_to_hash)

        new_client = Client(
            vardas=request.vardas,
            pavarde=request.pavarde,
            el_pastas=request.el_pastas,
            tel_numeris=request.tel_numeris,
            gimimo_data=datetime.strptime(request.gimimo_data, "%Y-%m-%d").date(),
            lytis=request.lytis,
            slapyvardis=request.slapyvardis,
            slaptazodis=hashed_password,
            salis=request.salis,
            miestas=request.miestas,
            organizatorius=request.organizatorius,
            administratorius=False,
            patvirtintas_pastas=False
        )

        db.add(new_client)
        db.commit()
        db.refresh(new_client)

        return {"message": "User registered successfully", "user_id": new_client.id_Klientas}

    def login(self, request: LoginRequest, db: Session = Depends(get_db)):
        client = db.query(Client).filter(Client.slapyvardis == request.slapyvardis).first()
        password_to_verify = request.slaptazodis[:72] if len(request.slaptazodis.encode('utf-8')) > 72 else request.slaptazodis
        if not client or not pwd_context.verify(password_to_verify, client.slaptazodis):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = jwt.encode(
            {"sub": str(client.id_Klientas), "exp": datetime.utcnow() + access_token_expires},
            SECRET_KEY,
            algorithm=ALGORITHM
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": client.id_Klientas,
                "slapyvardis": client.slapyvardis,
                "el_pastas": client.el_pastas,
                "vardas": client.vardas,
                "pavarde": client.pavarde,
                "organizatorius": client.organizatorius,
                "administratorius": client.administratorius
            }
        }
