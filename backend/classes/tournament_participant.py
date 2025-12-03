from sqlalchemy import Column, Integer, String, Date, ForeignKey
from config import Base

class TournamentParticipant(Base):
    __tablename__ = "turnyroDalyviai"

    id_Turnyro_dalyvis = Column("id_Turnyro_dalyvis", Integer, primary_key=True)
    pozicija = Column("pozicija", Integer, nullable=False)
    taskai = Column("taskai", Integer, nullable=False)
    prisiregistravimo_data = Column("prisiregistravimo_data", Date, nullable=False)
    dalyvio_tipas = Column("dalyvio_tipas", String(7), nullable=False)
    fk_Klientasid_Klientas = Column("fk_Klientasid_Klientas", Integer, ForeignKey("klientai.id_Klientas"), nullable=True)
    fk_Turnyrasid_Turnyras = Column("fk_Turnyrasid_Turnyras", Integer, ForeignKey("turnyrai.id_Turnyras"), nullable=False)
    fk_Komandaid_Komanda = Column("fk_Komandaid_Komanda", Integer, ForeignKey("komandos.id_Komanda"), nullable=True)
