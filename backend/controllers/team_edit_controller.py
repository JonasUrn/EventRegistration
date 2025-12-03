from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import get_db
from classes.team import Team
from classes.team_membership import TeamMembership

class UpdateMemberRoleRequest(BaseModel):
    role: str

class TeamEditController:
    def __init__(self):
        self.router = APIRouter(prefix="/api/teams", tags=["team-edit"])
        self.router.add_api_route("/{team_id}/members/{membership_id}/role", self.update_member_role, methods=["PUT"])

    def update_member_role(self, team_id: int, membership_id: int, request: UpdateMemberRoleRequest, db: Session = Depends(get_db)):
        membership = db.query(TeamMembership).filter(
            TeamMembership.id_Komandos_naryste == membership_id,
            TeamMembership.fk_Komandaid_Komanda == team_id
        ).first()

        if not membership:
            raise HTTPException(status_code=404, detail="Membership not found")

        membership.role = request.role
        db.commit()
        db.refresh(membership)

        return {
            "id_Komandos_naryste": membership.id_Komandos_naryste,
            "role": membership.role,
            "narys_nuo": str(membership.narys_nuo),
            "fk_Komandaid_Komanda": membership.fk_Komandaid_Komanda,
            "fk_Klientasid_Klientas": membership.fk_Klientasid_Klientas
        }
