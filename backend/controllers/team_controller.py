from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import get_db
from classes.team import Team
from classes.team_membership import TeamMembership

class CreateTeamRequest(BaseModel):
    pavadinimas: str
    logotipo_nuoroda: Optional[str] = None
    aprasymas: Optional[str] = None
    salis: str
    miestas: str
    fk_Klientasid_Klientas: int

class AddMemberRequest(BaseModel):
    fk_Komandaid_Komanda: int
    fk_Klientasid_Klientas: int
    role: str

class TeamController:
    def __init__(self):
        self.router = APIRouter(prefix="/api/teams", tags=["teams"])
        self.router.add_api_route("", self.get_teams, methods=["GET"])
        self.router.add_api_route("/{team_id}", self.get_team, methods=["GET"])
        self.router.add_api_route("", self.create_team, methods=["POST"])
        self.router.add_api_route("/{team_id}", self.update_team, methods=["PUT"])
        self.router.add_api_route("/{team_id}", self.delete_team, methods=["DELETE"])
        self.router.add_api_route("/{team_id}/members", self.get_team_members, methods=["GET"])
        self.router.add_api_route("/members", self.add_member, methods=["POST"])
        self.router.add_api_route("/members/{membership_id}", self.remove_member, methods=["DELETE"])

    def get_teams(self, db: Session = Depends(get_db)):
        teams = db.query(Team).all()
        return [self._team_to_dict(team) for team in teams]

    def get_team(self, team_id: int, db: Session = Depends(get_db)):
        team = db.query(Team).filter(Team.id_Komanda == team_id).first()
        if not team:
            raise HTTPException(status_code=404, detail="Team not found")
        return self._team_to_dict(team)

    def create_team(self, request: CreateTeamRequest, db: Session = Depends(get_db)):
        new_team = Team(
            pavadinimas=request.pavadinimas,
            logotipo_nuoroda=request.logotipo_nuoroda,
            sukurta=datetime.utcnow().date(),
            aprasymas=request.aprasymas,
            salis=request.salis,
            miestas=request.miestas,
            fk_Klientasid_Klientas=request.fk_Klientasid_Klientas
        )
        db.add(new_team)
        db.commit()
        db.refresh(new_team)
        return self._team_to_dict(new_team)

    def update_team(self, team_id: int, request: CreateTeamRequest, db: Session = Depends(get_db)):
        team = db.query(Team).filter(Team.id_Komanda == team_id).first()
        if not team:
            raise HTTPException(status_code=404, detail="Team not found")

        team.pavadinimas = request.pavadinimas
        team.logotipo_nuoroda = request.logotipo_nuoroda
        team.aprasymas = request.aprasymas
        team.salis = request.salis
        team.miestas = request.miestas

        db.commit()
        db.refresh(team)
        return self._team_to_dict(team)

    def delete_team(self, team_id: int, db: Session = Depends(get_db)):
        team = db.query(Team).filter(Team.id_Komanda == team_id).first()
        if not team:
            raise HTTPException(status_code=404, detail="Team not found")

        db.delete(team)
        db.commit()
        return {"message": "Team deleted successfully"}

    def get_team_members(self, team_id: int, db: Session = Depends(get_db)):
        memberships = db.query(TeamMembership).filter(TeamMembership.fk_Komandaid_Komanda == team_id).all()
        return [self._membership_to_dict(m) for m in memberships]

    def add_member(self, request: AddMemberRequest, db: Session = Depends(get_db)):
        new_membership = TeamMembership(
            role=request.role,
            narys_nuo=datetime.utcnow().date(),
            fk_Komandaid_Komanda=request.fk_Komandaid_Komanda,
            fk_Klientasid_Klientas=request.fk_Klientasid_Klientas
        )
        db.add(new_membership)
        db.commit()
        db.refresh(new_membership)
        return self._membership_to_dict(new_membership)

    def remove_member(self, membership_id: int, db: Session = Depends(get_db)):
        membership = db.query(TeamMembership).filter(TeamMembership.id_Komandos_naryste == membership_id).first()
        if not membership:
            raise HTTPException(status_code=404, detail="Membership not found")

        db.delete(membership)
        db.commit()
        return {"message": "Member removed successfully"}

    def _team_to_dict(self, team):
        return {
            "id_Komanda": team.id_Komanda,
            "pavadinimas": team.pavadinimas,
            "logotipo_nuoroda": team.logotipo_nuoroda,
            "sukurta": str(team.sukurta),
            "aprasymas": team.aprasymas,
            "salis": team.salis,
            "miestas": team.miestas,
            "fk_Klientasid_Klientas": team.fk_Klientasid_Klientas
        }

    def _membership_to_dict(self, membership):
        return {
            "id_Komandos_naryste": membership.id_Komandos_naryste,
            "role": membership.role,
            "narys_nuo": str(membership.narys_nuo),
            "fk_Komandaid_Komanda": membership.fk_Komandaid_Komanda,
            "fk_Klientasid_Klientas": membership.fk_Klientasid_Klientas
        }
