from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field, field_validator
from datetime import date
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from sqlalchemy.exc import IntegrityError
from sqlalchemy import text
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
        self.router.add_api_route("/delete", self.delete_account, methods=["DELETE"])

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

    def delete_account(self, authorization: str = Header(None), db: Session = Depends(get_db)):
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        token = authorization.replace("Bearer ", "")
        
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = int(payload.get("sub"))
            if not user_id:
                raise HTTPException(status_code=401, detail="Invalid token")
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        client = db.query(Client).filter(Client.id_Klientas == user_id).first()
        if not client:
            raise HTTPException(status_code=404, detail="User not found")
        
        try:
            # Get team and tournament IDs created by user
            user_team_ids = db.execute(
                text("SELECT id_Komanda FROM komandos WHERE fk_Klientasid_Klientas = :user_id"),
                {"user_id": user_id}
            ).fetchall()
            team_ids = [row[0] for row in user_team_ids]
            
            user_tournament_ids = db.execute(
                text("SELECT id_Turnyras FROM turnyrai WHERE fk_Klientasid_Klientas = :user_id"),
                {"user_id": user_id}
            ).fetchall()
            tournament_ids = [row[0] for row in user_tournament_ids]
            
            # Delete in correct order based on foreign key constraints:
            
            # 1-5. Delete game-related data for user's tournaments
            if tournament_ids:
                for tid in tournament_ids:
                    db.execute(text("DELETE FROM vietos WHERE fk_Varzybosid_Varzybos IN (SELECT id_Varzybos FROM varzybos WHERE fk_Turnyrasid_Turnyras = :tid)"), {"tid": tid})
                    db.execute(text("DELETE FROM teisejai WHERE fk_Varzybosid_Varzybos IN (SELECT id_Varzybos FROM varzybos WHERE fk_Turnyrasid_Turnyras = :tid)"), {"tid": tid})
                    db.execute(text("DELETE FROM varzybuRemejai WHERE fk_Varzybosid_Varzybos IN (SELECT id_Varzybos FROM varzybos WHERE fk_Turnyrasid_Turnyras = :tid)"), {"tid": tid})
                    db.execute(text("DELETE FROM varzybuDalyviai WHERE fk_Varzybosid_Varzybos IN (SELECT id_Varzybos FROM varzybos WHERE fk_Turnyrasid_Turnyras = :tid)"), {"tid": tid})
                    db.execute(text("DELETE FROM varzybos WHERE fk_Turnyrasid_Turnyras = :tid"), {"tid": tid})
            
            # 6. Delete turnyroDalyviai where user is participant
            db.execute(
                text("DELETE FROM turnyroDalyviai WHERE fk_Klientasid_Klientas = :user_id"),
                {"user_id": user_id}
            )
            
            # 7. Delete turnyroDalyviai for user's teams
            if team_ids:
                for tid in team_ids:
                    db.execute(text("DELETE FROM turnyroDalyviai WHERE fk_Komandaid_Komanda = :tid"), {"tid": tid})
            
            # 8. Delete turnyrai (tournaments)
            if tournament_ids:
                for tid in tournament_ids:
                    db.execute(text("DELETE FROM turnyrai WHERE id_Turnyras = :tid"), {"tid": tid})
            
            # 9. Delete komandosNarystes for user's teams
            if team_ids:
                for tid in team_ids:
                    db.execute(text("DELETE FROM komandosNarystes WHERE fk_Komandaid_Komanda = :tid"), {"tid": tid})
            
            # 10. Delete komandosNarystes where user is member
            db.execute(
                text("DELETE FROM komandosNarystes WHERE fk_Klientasid_Klientas = :user_id"),
                {"user_id": user_id}
            )
            
            # 11. Delete komandos (teams)
            if team_ids:
                for tid in team_ids:
                    db.execute(text("DELETE FROM komandos WHERE id_Komanda = :tid"), {"tid": tid})
            
            # 12. Finally delete klientai (user)
            db.execute(
                text("DELETE FROM klientai WHERE id_Klientas = :user_id"),
                {"user_id": user_id}
            )
            
            db.commit()
        except IntegrityError as e:
            db.rollback()
            raise HTTPException(
                status_code=400, 
                detail=f"Cannot delete account due to database constraints: {str(e)}"
            )
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while deleting account: {str(e)}"
            )
        
        return {"message": "Account deleted successfully"}
