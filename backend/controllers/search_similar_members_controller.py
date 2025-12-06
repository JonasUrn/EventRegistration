from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import get_db
from classes.client import Client
from classes.team import Team
from classes.team_membership import TeamMembership
from classes.match_participant import MatchParticipant
from classes.tournament_participant import TournamentParticipant

class OfferMembersRequest(BaseModel):
    team_id: int

class SearchSimilarMembersController:
    def __init__(self):
        self.router = APIRouter(prefix="/api/teams", tags=["algorithms"])
        self.router.add_api_route("/offer-members", self.offer_members, methods=["POST"])

    def offer_members(self, request: OfferMembersRequest, db: Session = Depends(get_db)):
        team = db.query(Team).filter(Team.id_Komanda == request.team_id).first()
        if not team:
            raise HTTPException(status_code=404, detail="Team not found")

        current_members = db.query(TeamMembership).filter(
            TeamMembership.fk_Komandaid_Komanda == request.team_id
        ).all()
        current_member_ids = [m.fk_Klientasid_Klientas for m in current_members]

        all_clients = db.query(Client).filter(
            Client.id_Klientas.notin_(current_member_ids) if current_member_ids else True
        ).all()

        candidate_scores = []

        for candidate in all_clients:
            score = 0

            if candidate.miestas == team.miestas:
                score += 3
            if candidate.salis == team.salis:
                score += 2

            if current_members:
                avg_birth_year = sum([
                    db.query(Client).filter(Client.id_Klientas == m.fk_Klientasid_Klientas).first().gimimo_data.year
                    for m in current_members
                ]) / len(current_members)

                birth_year_diff = abs(candidate.gimimo_data.year - avg_birth_year)
                if birth_year_diff <= 2:
                    score += 3
                elif birth_year_diff <= 5:
                    score += 2
                elif birth_year_diff <= 10:
                    score += 1

            tournament_participations = db.query(TournamentParticipant).filter(
                TournamentParticipant.fk_Klientasid_Klientas == candidate.id_Klientas
            ).all()

            total_points = sum([p.taskai for p in tournament_participations])
            avg_position = sum([p.pozicija for p in tournament_participations]) / len(tournament_participations) if tournament_participations else 0

            if total_points > 100:
                score += 5
            elif total_points > 50:
                score += 3
            elif total_points > 20:
                score += 2

            if avg_position > 0:
                if avg_position <= 3:
                    score += 5
                elif avg_position <= 10:
                    score += 3

            candidate_scores.append({
                "candidate": candidate,
                "score": score
            })

        candidate_scores.sort(key=lambda x: x["score"], reverse=True)
        top_candidates = candidate_scores[:5]

        return [
            {
                "id_Klientas": c["candidate"].id_Klientas,
                "vardas": c["candidate"].vardas,
                "pavarde": c["candidate"].pavarde,
                "el_pastas": c["candidate"].el_pastas,
                "salis": c["candidate"].salis,
                "miestas": c["candidate"].miestas,
                "gimimo_data": str(c["candidate"].gimimo_data),
                "score": c["score"]
            }
            for c in top_candidates
        ]
