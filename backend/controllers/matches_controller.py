from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import get_db
from classes.match import Match
from classes.match_participant import MatchParticipant
from classes.location import Location
from classes.referee import Referee
from classes.sponsor import Sponsor
from classes.match_sponsor import MatchSponsor

class CreateMatchRequest(BaseModel):
    pavadinimas: str
    pradžia: str
    pabaiga: str
    fk_Turnyrasid_Turnyras: int

class AddMatchParticipantRequest(BaseModel):
    taskai: int
    yra_laimėtojas: Optional[bool] = None
    fk_Varzybosid_Varzybos: int
    fk_Turnyro_dalyvisid_Turnyro_dalyvis: int

class AddLocationRequest(BaseModel):
    salis: Optional[str] = None
    miestas: Optional[str] = None
    adresas: Optional[str] = None
    koordinates: Optional[str] = None
    vietu_skaicius: Optional[str] = None
    patalpos_tipas: Optional[str] = None
    aprasymas: Optional[str] = None
    fk_Varzybosid_Varzybos: int
    id_Vieta: Optional[int] = None

class AddRefereeRequest(BaseModel):
    vardas: Optional[str] = None
    pavarde: Optional[str] = None
    el_pastas: Optional[str] = None
    salis: Optional[str] = None
    miestas: Optional[str] = None
    licenzijos_id: Optional[str] = None
    tel_numeris: Optional[str] = None
    fk_Varzybosid_Varzybos: int
    id_Teisejas: Optional[int] = None

class CreateSponsorRequest(BaseModel):
    pavadinimas: str
    el_pastas: str
    el_puslapis: Optional[str] = None
    remejo_klase: str

class AddMatchSponsorRequest(BaseModel):
    fk_Varzybosid_Varzybos: int
    fk_Remejasid_Remejas: int

class LinkRefereeRequest(BaseModel):
    fk_Varzybosid_Varzybos: int
    fk_Teisejasid_Teisejas: int

class LinkLocationRequest(BaseModel):
    fk_Varzybosid_Varzybos: int
    fk_Vietaid_Vieta: int

class MatchesController:
    def __init__(self):
        self.router = APIRouter(prefix="/api/games", tags=["matches"])
        self.router.add_api_route("", self.get_matches, methods=["GET"])
        self.router.add_api_route("", self.create_match, methods=["POST"])
        self.router.add_api_route("/all-referees", self.get_all_referees, methods=["GET"])
        self.router.add_api_route("/all-locations", self.get_all_locations, methods=["GET"])
        self.router.add_api_route("/sponsors", self.get_all_sponsors, methods=["GET"])
        self.router.add_api_route("/sponsors", self.create_sponsor, methods=["POST"])
        self.router.add_api_route("/participants", self.add_match_participant, methods=["POST"])
        self.router.add_api_route("/participants/{participant_id}", self.remove_match_participant, methods=["DELETE"])
        self.router.add_api_route("/locations", self.add_location, methods=["POST"])
        self.router.add_api_route("/link-location", self.link_location, methods=["POST"])
        self.router.add_api_route("/referees", self.add_referee, methods=["POST"])
        self.router.add_api_route("/link-referee", self.link_referee, methods=["POST"])
        self.router.add_api_route("/match-sponsors", self.add_match_sponsor, methods=["POST"])
        self.router.add_api_route("/{match_id}", self.get_match, methods=["GET"])
        self.router.add_api_route("/{match_id}", self.update_match, methods=["PUT"])
        self.router.add_api_route("/{match_id}", self.delete_match, methods=["DELETE"])
        self.router.add_api_route("/{match_id}/participants", self.get_match_participants, methods=["GET"])
        self.router.add_api_route("/{match_id}/referees", self.get_match_referees, methods=["GET"])
        self.router.add_api_route("/{match_id}/sponsors", self.get_match_sponsors, methods=["GET"])

    def get_matches(self, db: Session = Depends(get_db)):
        matches = db.query(Match).all()
        return [self._match_to_dict(m) for m in matches]

    def get_match(self, match_id: int, db: Session = Depends(get_db)):
        match = db.query(Match).filter(Match.id_Varzybos == match_id).first()
        if not match:
            raise HTTPException(status_code=404, detail="Match not found")
        return self._match_to_dict(match)

    def create_match(self, request: CreateMatchRequest, db: Session = Depends(get_db)):
        new_match = Match(
            pavadinimas=request.pavadinimas,
            pradžia=datetime.strptime(request.pradžia, "%Y-%m-%d").date(),
            pabaiga=datetime.strptime(request.pabaiga, "%Y-%m-%d").date(),
            fk_Turnyrasid_Turnyras=request.fk_Turnyrasid_Turnyras
        )
        db.add(new_match)
        db.commit()
        db.refresh(new_match)
        return self._match_to_dict(new_match)

    def update_match(self, match_id: int, request: CreateMatchRequest, db: Session = Depends(get_db)):
        match = db.query(Match).filter(Match.id_Varzybos == match_id).first()
        if not match:
            raise HTTPException(status_code=404, detail="Match not found")

        match.pavadinimas = request.pavadinimas
        match.pradžia = datetime.strptime(request.pradžia, "%Y-%m-%d").date()
        match.pabaiga = datetime.strptime(request.pabaiga, "%Y-%m-%d").date()
        match.fk_Turnyrasid_Turnyras = request.fk_Turnyrasid_Turnyras

        db.commit()
        db.refresh(match)
        return self._match_to_dict(match)

    def delete_match(self, match_id: int, db: Session = Depends(get_db)):
        match = db.query(Match).filter(Match.id_Varzybos == match_id).first()
        if not match:
            raise HTTPException(status_code=404, detail="Match not found")

        # Delete all related records first to avoid foreign key constraint violations

        # Delete match participants
        db.query(MatchParticipant).filter(
            MatchParticipant.fk_Varzybosid_Varzybos == match_id
        ).delete()

        # Delete referees
        db.query(Referee).filter(
            Referee.fk_Varzybosid_Varzybos == match_id
        ).delete()

        # Delete locations
        db.query(Location).filter(
            Location.fk_Varzybosid_Varzybos == match_id
        ).delete()

        # Delete match sponsors
        db.query(MatchSponsor).filter(
            MatchSponsor.fk_Varzybosid_Varzybos == match_id
        ).delete()

        # Now delete the match itself
        db.delete(match)
        db.commit()
        return {"message": "Match deleted successfully"}

    def get_match_participants(self, match_id: int, db: Session = Depends(get_db)):
        participants = db.query(MatchParticipant).filter(
            MatchParticipant.fk_Varzybosid_Varzybos == match_id
        ).all()
        return [self._match_participant_to_dict(p) for p in participants]

    def add_match_participant(self, request: AddMatchParticipantRequest, db: Session = Depends(get_db)):
        new_participant = MatchParticipant(
            taskai=request.taskai,
            yra_laimėtojas=request.yra_laimėtojas,
            fk_Varzybosid_Varzybos=request.fk_Varzybosid_Varzybos,
            fk_Turnyro_dalyvisid_Turnyro_dalyvis=request.fk_Turnyro_dalyvisid_Turnyro_dalyvis
        )
        db.add(new_participant)
        db.commit()
        db.refresh(new_participant)
        return self._match_participant_to_dict(new_participant)

    def remove_match_participant(self, participant_id: int, db: Session = Depends(get_db)):
        participant = db.query(MatchParticipant).filter(
            MatchParticipant.id_Varzybu_dalyvis == participant_id
        ).first()
        if not participant:
            raise HTTPException(status_code=404, detail="Participant not found")

        db.delete(participant)
        db.commit()
        return {"message": "Participant removed successfully"}

    def add_location(self, request: AddLocationRequest, db: Session = Depends(get_db)):
        if request.id_Vieta:
            existing_location = db.query(Location).filter(Location.id_Vieta == request.id_Vieta).first()
            if not existing_location:
                raise HTTPException(status_code=404, detail="Location not found")
            new_location = Location(
                salis=existing_location.salis,
                miestas=existing_location.miestas,
                adresas=existing_location.adresas,
                koordinates=existing_location.koordinates,
                vietu_skaicius=existing_location.vietu_skaicius,
                patalpos_tipas=existing_location.patalpos_tipas,
                aprasymas=existing_location.aprasymas,
                fk_Varzybosid_Varzybos=request.fk_Varzybosid_Varzybos
            )
        else:
            new_location = Location(
                salis=request.salis,
                miestas=request.miestas,
                adresas=request.adresas,
                koordinates=request.koordinates,
                vietu_skaicius=request.vietu_skaicius,
                patalpos_tipas=request.patalpos_tipas,
                aprasymas=request.aprasymas,
                fk_Varzybosid_Varzybos=request.fk_Varzybosid_Varzybos
            )
        db.add(new_location)
        db.commit()
        db.refresh(new_location)
        return self._location_to_dict(new_location)

    def add_referee(self, request: AddRefereeRequest, db: Session = Depends(get_db)):
        if request.id_Teisejas:
            existing_referee = db.query(Referee).filter(Referee.id_Teisejas == request.id_Teisejas).first()
            if not existing_referee:
                raise HTTPException(status_code=404, detail="Referee not found")
            new_referee = Referee(
                vardas=existing_referee.vardas,
                pavarde=existing_referee.pavarde,
                el_pastas=existing_referee.el_pastas,
                salis=existing_referee.salis,
                miestas=existing_referee.miestas,
                licenzijos_id=existing_referee.licenzijos_id,
                tel_numeris=existing_referee.tel_numeris,
                fk_Varzybosid_Varzybos=request.fk_Varzybosid_Varzybos
            )
        else:
            new_referee = Referee(
                vardas=request.vardas,
                pavarde=request.pavarde,
                el_pastas=request.el_pastas,
                salis=request.salis,
                miestas=request.miestas,
                licenzijos_id=request.licenzijos_id,
                tel_numeris=request.tel_numeris,
                fk_Varzybosid_Varzybos=request.fk_Varzybosid_Varzybos
            )
        db.add(new_referee)
        db.commit()
        db.refresh(new_referee)
        return self._referee_to_dict(new_referee)

    def link_referee(self, request: LinkRefereeRequest, db: Session = Depends(get_db)):
        # Find the referee to link
        referee = db.query(Referee).filter(Referee.id_Teisejas == request.fk_Teisejasid_Teisejas).first()
        if not referee:
            raise HTTPException(status_code=404, detail="Referee not found")

        # Update the referee to link to the new match
        referee.fk_Varzybosid_Varzybos = request.fk_Varzybosid_Varzybos
        db.commit()
        db.refresh(referee)
        return self._referee_to_dict(referee)

    def link_location(self, request: LinkLocationRequest, db: Session = Depends(get_db)):
        # Find the location to link
        location = db.query(Location).filter(Location.id_Vieta == request.fk_Vietaid_Vieta).first()
        if not location:
            raise HTTPException(status_code=404, detail="Location not found")

        # Update the location to link to the new match
        location.fk_Varzybosid_Varzybos = request.fk_Varzybosid_Varzybos
        db.commit()
        db.refresh(location)
        return self._location_to_dict(location)

    def _match_to_dict(self, match):
        return {
            "id_Varzybos": match.id_Varzybos,
            "pavadinimas": match.pavadinimas,
            "pradžia": str(match.pradžia),
            "pabaiga": str(match.pabaiga),
            "fk_Turnyrasid_Turnyras": match.fk_Turnyrasid_Turnyras
        }

    def _match_participant_to_dict(self, participant):
        return {
            "id_Varzybu_dalyvis": participant.id_Varzybu_dalyvis,
            "taskai": participant.taskai,
            "yra_laimėtojas": participant.yra_laimėtojas,
            "fk_Varzybosid_Varzybos": participant.fk_Varzybosid_Varzybos,
            "fk_Turnyro_dalyvisid_Turnyro_dalyvis": participant.fk_Turnyro_dalyvisid_Turnyro_dalyvis
        }

    def _location_to_dict(self, location):
        return {
            "id_Vieta": location.id_Vieta,
            "salis": location.salis,
            "miestas": location.miestas,
            "adresas": location.adresas,
            "koordinates": location.koordinates,
            "vietu_skaicius": location.vietu_skaicius,
            "patalpos_tipas": location.patalpos_tipas,
            "aprasymas": location.aprasymas,
            "fk_Varzybosid_Varzybos": location.fk_Varzybosid_Varzybos
        }

    def _referee_to_dict(self, referee):
        return {
            "id_Teisejas": referee.id_Teisejas,
            "vardas": referee.vardas,
            "pavarde": referee.pavarde,
            "el_pastas": referee.el_pastas,
            "salis": referee.salis,
            "miestas": referee.miestas,
            "licenzijos_id": referee.licenzijos_id,
            "tel_numeris": referee.tel_numeris,
            "fk_Varzybosid_Varzybos": referee.fk_Varzybosid_Varzybos
        }

    def get_match_referees(self, match_id: int, db: Session = Depends(get_db)):
        referees = db.query(Referee).filter(
            Referee.fk_Varzybosid_Varzybos == match_id
        ).all()
        return [self._referee_to_dict(r) for r in referees]

    def get_all_referees(self, db: Session = Depends(get_db)):
        referees = db.query(Referee).all()
        return [self._referee_to_dict(r) for r in referees]

    def get_all_locations(self, db: Session = Depends(get_db)):
        locations = db.query(Location).all()
        return [self._location_to_dict(l) for l in locations]

    def get_all_sponsors(self, db: Session = Depends(get_db)):
        sponsors = db.query(Sponsor).all()
        return [self._sponsor_to_dict(s) for s in sponsors]

    def create_sponsor(self, request: CreateSponsorRequest, db: Session = Depends(get_db)):
        new_sponsor = Sponsor(
            pavadinimas=request.pavadinimas,
            el_pastas=request.el_pastas,
            el_puslapis=request.el_puslapis,
            remejo_klase=request.remejo_klase
        )
        db.add(new_sponsor)
        db.commit()
        db.refresh(new_sponsor)
        return self._sponsor_to_dict(new_sponsor)

    def add_match_sponsor(self, request: AddMatchSponsorRequest, db: Session = Depends(get_db)):
        new_match_sponsor = MatchSponsor(
            fk_Varzybosid_Varzybos=request.fk_Varzybosid_Varzybos,
            fk_Remejasid_Remejas=request.fk_Remejasid_Remejas
        )
        db.add(new_match_sponsor)
        db.commit()
        return {"message": "Sponsor added to match successfully"}

    def get_match_sponsors(self, match_id: int, db: Session = Depends(get_db)):
        match_sponsors = db.query(MatchSponsor).filter(
            MatchSponsor.fk_Varzybosid_Varzybos == match_id
        ).all()

        sponsors = []
        for ms in match_sponsors:
            sponsor = db.query(Sponsor).filter(
                Sponsor.id_Remejas == ms.fk_Remejasid_Remejas
            ).first()
            if sponsor:
                sponsors.append(self._sponsor_to_dict(sponsor))

        return sponsors

    def _sponsor_to_dict(self, sponsor):
        return {
            "id_Remejas": sponsor.id_Remejas,
            "pavadinimas": sponsor.pavadinimas,
            "el_pastas": sponsor.el_pastas,
            "el_puslapis": sponsor.el_puslapis,
            "remejo_klase": sponsor.remejo_klase
        }
