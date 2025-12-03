from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import get_db
from classes.tournament import Tournament
from classes.tournament_participant import TournamentParticipant

class CreateTournamentRequest(BaseModel):
    pavadinimas: str
    aprasas: str
    sporto_saka: str
    pradzia: str
    pabaiga: str
    minimalus_nariu_skacius: int
    maksimalus_nariu_skaicius: int
    turnyro_formatas: str
    fk_Klientasid_Klientas: int

class RegisterParticipantRequest(BaseModel):
    pozicija: int
    taskai: int
    dalyvio_tipas: str
    fk_Klientasid_Klientas: Optional[int] = None
    fk_Turnyrasid_Turnyras: int
    fk_Komandaid_Komanda: Optional[int] = None

class TournamentController:
    def __init__(self):
        self.router = APIRouter(prefix="/api/tournaments", tags=["tournaments"])
        self.router.add_api_route("", self.get_tournaments, methods=["GET"])
        self.router.add_api_route("/{tournament_id}", self.get_tournament, methods=["GET"])
        self.router.add_api_route("", self.create_tournament, methods=["POST"])
        self.router.add_api_route("/{tournament_id}", self.update_tournament, methods=["PUT"])
        self.router.add_api_route("/{tournament_id}", self.delete_tournament, methods=["DELETE"])
        self.router.add_api_route("/{tournament_id}/participants", self.get_participants, methods=["GET"])
        self.router.add_api_route("/participants", self.register_participant, methods=["POST"])
        self.router.add_api_route("/participants/{participant_id}", self.remove_participant, methods=["DELETE"])

    def get_tournaments(self, db: Session = Depends(get_db)):
        tournaments = db.query(Tournament).all()
        return [self._tournament_to_dict(t) for t in tournaments]

    def get_tournament(self, tournament_id: int, db: Session = Depends(get_db)):
        tournament = db.query(Tournament).filter(Tournament.id_Turnyras == tournament_id).first()
        if not tournament:
            raise HTTPException(status_code=404, detail="Tournament not found")
        return self._tournament_to_dict(tournament)

    def create_tournament(self, request: CreateTournamentRequest, db: Session = Depends(get_db)):
        new_tournament = Tournament(
            pavadinimas=request.pavadinimas,
            aprasas=request.aprasas,
            sporto_saka=request.sporto_saka,
            pradzia=datetime.strptime(request.pradzia, "%Y-%m-%d").date(),
            pabaiga=datetime.strptime(request.pabaiga, "%Y-%m-%d").date(),
            minimalus_nariu_skacius=request.minimalus_nariu_skacius,
            maksimalus_nariu_skaicius=request.maksimalus_nariu_skaicius,
            turnyro_formatas=request.turnyro_formatas,
            fk_Klientasid_Klientas=request.fk_Klientasid_Klientas
        )
        db.add(new_tournament)
        db.commit()
        db.refresh(new_tournament)
        return self._tournament_to_dict(new_tournament)

    def update_tournament(self, tournament_id: int, request: CreateTournamentRequest, db: Session = Depends(get_db)):
        tournament = db.query(Tournament).filter(Tournament.id_Turnyras == tournament_id).first()
        if not tournament:
            raise HTTPException(status_code=404, detail="Tournament not found")

        tournament.pavadinimas = request.pavadinimas
        tournament.aprasas = request.aprasas
        tournament.sporto_saka = request.sporto_saka
        tournament.pradzia = datetime.strptime(request.pradzia, "%Y-%m-%d").date()
        tournament.pabaiga = datetime.strptime(request.pabaiga, "%Y-%m-%d").date()
        tournament.minimalus_nariu_skacius = request.minimalus_nariu_skacius
        tournament.maksimalus_nariu_skaicius = request.maksimalus_nariu_skaicius
        tournament.turnyro_formatas = request.turnyro_formatas

        db.commit()
        db.refresh(tournament)
        return self._tournament_to_dict(tournament)

    def delete_tournament(self, tournament_id: int, db: Session = Depends(get_db)):
        tournament = db.query(Tournament).filter(Tournament.id_Turnyras == tournament_id).first()
        if not tournament:
            raise HTTPException(status_code=404, detail="Tournament not found")

        db.delete(tournament)
        db.commit()
        return {"message": "Tournament deleted successfully"}

    def get_participants(self, tournament_id: int, db: Session = Depends(get_db)):
        participants = db.query(TournamentParticipant).filter(
            TournamentParticipant.fk_Turnyrasid_Turnyras == tournament_id
        ).all()
        return [self._participant_to_dict(p) for p in participants]

    def register_participant(self, request: RegisterParticipantRequest, db: Session = Depends(get_db)):
        new_participant = TournamentParticipant(
            pozicija=request.pozicija,
            taskai=request.taskai,
            prisiregistravimo_data=datetime.utcnow().date(),
            dalyvio_tipas=request.dalyvio_tipas,
            fk_Klientasid_Klientas=request.fk_Klientasid_Klientas,
            fk_Turnyrasid_Turnyras=request.fk_Turnyrasid_Turnyras,
            fk_Komandaid_Komanda=request.fk_Komandaid_Komanda
        )
        db.add(new_participant)
        db.commit()
        db.refresh(new_participant)
        return self._participant_to_dict(new_participant)

    def remove_participant(self, participant_id: int, db: Session = Depends(get_db)):
        participant = db.query(TournamentParticipant).filter(
            TournamentParticipant.id_Turnyro_dalyvis == participant_id
        ).first()
        if not participant:
            raise HTTPException(status_code=404, detail="Participant not found")

        db.delete(participant)
        db.commit()
        return {"message": "Participant removed successfully"}

    def _tournament_to_dict(self, tournament):
        return {
            "id_Turnyras": tournament.id_Turnyras,
            "pavadinimas": tournament.pavadinimas,
            "aprasas": tournament.aprasas,
            "sporto_saka": tournament.sporto_saka,
            "pradzia": str(tournament.pradzia),
            "pabaiga": str(tournament.pabaiga),
            "minimalus_nariu_skacius": tournament.minimalus_nariu_skacius,
            "maksimalus_nariu_skaicius": tournament.maksimalus_nariu_skaicius,
            "turnyro_formatas": tournament.turnyro_formatas,
            "fk_Klientasid_Klientas": tournament.fk_Klientasid_Klientas
        }

    def _participant_to_dict(self, participant):
        return {
            "id_Turnyro_dalyvis": participant.id_Turnyro_dalyvis,
            "pozicija": participant.pozicija,
            "taskai": participant.taskai,
            "prisiregistravimo_data": str(participant.prisiregistravimo_data),
            "dalyvio_tipas": participant.dalyvio_tipas,
            "fk_Klientasid_Klientas": participant.fk_Klientasid_Klientas,
            "fk_Turnyrasid_Turnyras": participant.fk_Turnyrasid_Turnyras,
            "fk_Komandaid_Komanda": participant.fk_Komandaid_Komanda
        }
