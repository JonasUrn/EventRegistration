from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import get_db
from classes.match_participant import MatchParticipant

class UpdateMatchParticipantRequest(BaseModel):
    taskai: int
    yra_laimėtojas: Optional[bool] = None

class MatchesEditController:
    def __init__(self):
        self.router = APIRouter(prefix="/api/games", tags=["matches-edit"])
        self.router.add_api_route("/participants/{participant_id}", self.update_match_participant, methods=["PUT"])

    def update_match_participant(self, participant_id: int, request: UpdateMatchParticipantRequest, db: Session = Depends(get_db)):
        participant = db.query(MatchParticipant).filter(
            MatchParticipant.id_Varzybu_dalyvis == participant_id
        ).first()

        if not participant:
            raise HTTPException(status_code=404, detail="Participant not found")

        participant.taskai = request.taskai
        participant.yra_laimėtojas = request.yra_laimėtojas

        db.commit()
        db.refresh(participant)

        return {
            "id_Varzybu_dalyvis": participant.id_Varzybu_dalyvis,
            "taskai": participant.taskai,
            "yra_laimėtojas": participant.yra_laimėtojas,
            "fk_Varzybosid_Varzybos": participant.fk_Varzybosid_Varzybos,
            "fk_Turnyro_dalyvisid_Turnyro_dalyvis": participant.fk_Turnyro_dalyvisid_Turnyro_dalyvis
        }
