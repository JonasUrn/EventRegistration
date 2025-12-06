from sqlalchemy import Column, Integer, String, Date, ForeignKey
from config import Base

class Team(Base):
    __tablename__ = "komandos"

    id_Komanda = Column("id_Komanda", Integer, primary_key=True)
    pavadinimas = Column("pavadinimas", String(255), nullable=False)
    logotipo_nuoroda = Column("logotipo_nuoroda", String(255), nullable=True)
    sukurta = Column("sukurta", Date, nullable=False)
    aprasymas = Column("aprasymas", String(255), nullable=True)
    salis = Column("salis", String(255), nullable=False)
    miestas = Column("miestas", String(255), nullable=False)
    fk_Klientasid_Klientas = Column("fk_Klientasid_Klientas", Integer, ForeignKey("klientai.id_Klientas"), nullable=False)
