from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from jose import jwt, JWTError
from datetime import datetime
from typing import Optional
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import get_db, SECRET_KEY, ALGORITHM
from classes.client import Client

class UpdateAccountRequest(BaseModel):
    vardas: Optional[str] = None
    pavarde: Optional[str] = None
    tel_numeris: Optional[str] = None
    salis: Optional[str] = None
    miestas: Optional[str] = None

class AccountController:
    def __init__(self):
        self.router = APIRouter(prefix="/api/users", tags=["account"])
        self.router.add_api_route("/me", self.get_current_user, methods=["GET"])
        self.router.add_api_route("/me", self.update_account, methods=["PUT"])
        self.router.add_api_route("/search/username/{username}", self.search_by_username, methods=["GET"])
        self.router.add_api_route("/{user_id}", self.get_user, methods=["GET"])

    def get_current_user_id(self, authorization: str = Header(None)):
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Not authenticated")

        token = authorization.replace("Bearer ", "")
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")
            if user_id is None:
                raise HTTPException(status_code=401, detail="Invalid token")
            return int(user_id)
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")

    def get_current_user(self, authorization: str = Header(None), db: Session = Depends(get_db)):
        user_id = self.get_current_user_id(authorization)
        client = db.query(Client).filter(Client.id_Klientas == user_id).first()
        if not client:
            raise HTTPException(status_code=404, detail="User not found")
        return self._client_to_dict(client)

    def get_user(self, user_id: int, db: Session = Depends(get_db)):
        client = db.query(Client).filter(Client.id_Klientas == user_id).first()
        if not client:
            raise HTTPException(status_code=404, detail="User not found")
        return self._client_to_dict(client)

    def search_by_username(self, username: str, db: Session = Depends(get_db)):
        client = db.query(Client).filter(Client.slapyvardis == username).first()
        if not client:
            raise HTTPException(status_code=404, detail="User not found")
        return self._client_to_dict(client)

    def update_account(self, request: UpdateAccountRequest, authorization: str = Header(None), db: Session = Depends(get_db)):
        user_id = self.get_current_user_id(authorization)
        client = db.query(Client).filter(Client.id_Klientas == user_id).first()
        if not client:
            raise HTTPException(status_code=404, detail="User not found")

        if request.vardas is not None:
            client.vardas = request.vardas
        if request.pavarde is not None:
            client.pavarde = request.pavarde
        if request.tel_numeris is not None:
            client.tel_numeris = request.tel_numeris
        if request.salis is not None:
            client.salis = request.salis
        if request.miestas is not None:
            client.miestas = request.miestas

        db.commit()
        db.refresh(client)
        return self._client_to_dict(client)

    def _client_to_dict(self, client):
        return {
            "id_Klientas": client.id_Klientas,
            "vardas": client.vardas,
            "pavarde": client.pavarde,
            "el_pastas": client.el_pastas,
            "tel_numeris": client.tel_numeris,
            "gimimo_data": str(client.gimimo_data),
            "lytis": client.lytis,
            "slapyvardis": client.slapyvardis,
            "salis": client.salis,
            "miestas": client.miestas,
            "organizatorius": client.organizatorius,
            "administratorius": client.administratorius,
            "patvirtintas_pastas": client.patvirtintas_pastas
        }
