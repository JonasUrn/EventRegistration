from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import math
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import get_db
from classes.match import Match
from classes.match_participant import MatchParticipant
from classes.location import Location

class FindSimilarMatchesRequest(BaseModel):
    match_id: int

class FindSimilarMatchesController:
    def __init__(self):
        self.router = APIRouter(prefix="/api/games", tags=["algorithms"])
        self.router.add_api_route("/find-similar-games", self.find_similar_matches, methods=["POST"])

    def find_similar_matches(self, request: FindSimilarMatchesRequest, db: Session = Depends(get_db)):
        current_match = db.query(Match).filter(Match.id_Varzybos == request.match_id).first()
        if not current_match:
            raise HTTPException(status_code=404, detail="Match not found")

        current_location = db.query(Location).filter(
            Location.fk_Varzybosid_Varzybos == request.match_id
        ).first()

        current_participants = db.query(MatchParticipant).filter(
            MatchParticipant.fk_Varzybosid_Varzybos == request.match_id
        ).all()

        current_total_points = sum([p.taskai for p in current_participants])
        current_avg_points = current_total_points / len(current_participants) if current_participants else 0

        all_matches = db.query(Match).filter(Match.id_Varzybos != request.match_id).all()

        match_scores = []

        for match in all_matches:
            score = 0

            match_participants = db.query(MatchParticipant).filter(
                MatchParticipant.fk_Varzybosid_Varzybos == match.id_Varzybos
            ).all()

            match_total_points = sum([p.taskai for p in match_participants])
            match_avg_points = match_total_points / len(match_participants) if match_participants else 0

            points_diff = abs(current_avg_points - match_avg_points)
            if points_diff <= 5:
                score += 5
            elif points_diff <= 10:
                score += 3
            elif points_diff <= 20:
                score += 1

            match_location = db.query(Location).filter(
                Location.fk_Varzybosid_Varzybos == match.id_Varzybos
            ).first()

            if current_location and match_location:
                try:
                    current_coords = current_location.koordinates.split(",")
                    match_coords = match_location.koordinates.split(",")
                    current_lat = float(current_coords[0])
                    current_lon = float(current_coords[1])
                    match_lat = float(match_coords[0])
                    match_lon = float(match_coords[1])

                    distance = math.sqrt((current_lat - match_lat)**2 + (current_lon - match_lon)**2)

                    if distance < 0.5:
                        score += 10
                    elif distance < 1.0:
                        score += 5
                    elif distance < 2.0:
                        score += 3
                except:
                    pass

            match_scores.append({
                "match": match,
                "score": score
            })

        match_scores.sort(key=lambda x: x["score"], reverse=True)
        top_matches = match_scores[:5]

        return [
            {
                "id_Varzybos": m["match"].id_Varzybos,
                "pavadinimas": m["match"].pavadinimas,
                "pradžia": str(m["match"].pradžia),
                "pabaiga": str(m["match"].pabaiga),
                "fk_Turnyrasid_Turnyras": m["match"].fk_Turnyrasid_Turnyras,
                "score": m["score"]
            }
            for m in top_matches
        ]
