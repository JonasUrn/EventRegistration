from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import get_db
from classes.tournament import Tournament
from classes.tournament_participant import TournamentParticipant
from classes.match import Match
from classes.match_participant import MatchParticipant
from classes.team import Team
from classes.client import Client
from classes.location import Location

class ReportController:
    def __init__(self):
        self.router = APIRouter(prefix="/api/tournaments", tags=["reports"])
        self.router.add_api_route("/{tournament_id}/report", self.generate_report, methods=["GET"])

    def generate_report(self, tournament_id: int, db: Session = Depends(get_db)):
        tournament = db.query(Tournament).filter(Tournament.id_Turnyras == tournament_id).first()
        if not tournament:
            raise HTTPException(status_code=404, detail="Tournament not found")

        matches = db.query(Match).filter(Match.fk_Turnyrasid_Turnyras == tournament_id).all()

        participants = db.query(TournamentParticipant).filter(
            TournamentParticipant.fk_Turnyrasid_Turnyras == tournament_id
        ).all()

        locations = []
        for match in matches:
            location = db.query(Location).filter(Location.fk_Varzybosid_Varzybos == match.id_Varzybos).first()
            if location:
                locations.append({
                    "salis": location.salis,
                    "miestas": location.miestas,
                    "adresas": location.adresas
                })

        point_differences = []
        for match in matches:
            match_participants = db.query(MatchParticipant).filter(
                MatchParticipant.fk_Varzybosid_Varzybos == match.id_Varzybos
            ).all()
            if len(match_participants) >= 2:
                points = [p.taskai for p in match_participants]
                max_points = max(points)
                min_points = min(points)
                point_differences.append(max_points - min_points)

        avg_point_difference = sum(point_differences) / len(point_differences) if point_differences else 0

        team_stats = {}
        for participant in participants:
            if participant.fk_Komandaid_Komanda:
                team = db.query(Team).filter(Team.id_Komanda == participant.fk_Komandaid_Komanda).first()
                if team:
                    team_matches = []
                    for match in matches:
                        match_participants = db.query(MatchParticipant).filter(
                            MatchParticipant.fk_Varzybosid_Varzybos == match.id_Varzybos,
                            MatchParticipant.fk_Turnyro_dalyvisid_Turnyro_dalyvis == participant.id_Turnyro_dalyvis
                        ).all()
                        team_matches.extend(match_participants)

                    wins = len([m for m in team_matches if m.yra_laimėtojas])
                    total_matches = len(team_matches)
                    win_percentage = (wins / total_matches * 100) if total_matches > 0 else 0

                    team_stats[team.pavadinimas] = {
                        "wins": wins,
                        "total_matches": total_matches,
                        "win_percentage": win_percentage
                    }

        player_efficiency = []
        for participant in participants:
            if participant.fk_Klientasid_Klientas:
                client = db.query(Client).filter(Client.id_Klientas == participant.fk_Klientasid_Klientas).first()
                if client:
                    player_matches = []
                    for match in matches:
                        match_participants = db.query(MatchParticipant).filter(
                            MatchParticipant.fk_Varzybosid_Varzybos == match.id_Varzybos,
                            MatchParticipant.fk_Turnyro_dalyvisid_Turnyro_dalyvis == participant.id_Turnyro_dalyvis
                        ).all()
                        player_matches.extend(match_participants)

                    total_points = sum([m.taskai for m in player_matches])
                    wins = len([m for m in player_matches if m.yra_laimėtojas])
                    efficiency = total_points + (wins * 10)

                    player_efficiency.append({
                        "vardas": client.vardas,
                        "pavarde": client.pavarde,
                        "efficiency": efficiency,
                        "total_points": total_points,
                        "wins": wins
                    })

        player_efficiency.sort(key=lambda x: x["efficiency"], reverse=True)
        top_players = player_efficiency[:3]

        return {
            "tournament": {
                "pavadinimas": tournament.pavadinimas,
                "sporto_saka": tournament.sporto_saka,
                "pradzia": str(tournament.pradzia),
                "pabaiga": str(tournament.pabaiga)
            },
            "locations": locations,
            "avg_point_difference": avg_point_difference,
            "team_stats": team_stats,
            "top_players": top_players,
            "total_matches": len(matches),
            "total_participants": len(participants)
        }
