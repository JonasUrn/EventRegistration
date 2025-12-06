from sqlalchemy import Column, Integer, String, Date, ForeignKey
from config import Base

class Tournament(Base):
    __tablename__ = "turnyrai"

    id_Turnyras = Column("id_Turnyras", Integer, primary_key=True)
    pavadinimas = Column("pavadinimas", String(255), nullable=False)
    aprasas = Column("aprasas", String(255), nullable=False)
    sporto_saka = Column("sporto_saka", String(255), nullable=False)
    pradzia = Column("pradzia", Date, nullable=False)
    pabaiga = Column("pabaiga", Date, nullable=False)
    minimalus_nariu_skacius = Column("minimalus_nariu_skacius", Integer, nullable=False)
    maksimalus_nariu_skaicius = Column("maksimalus_nariu_skaicius", Integer, nullable=False)
    turnyro_formatas = Column("turnyro_formatas", String(14), nullable=False)
    fk_Klientasid_Klientas = Column("fk_Klientasid_Klientas", Integer, ForeignKey("klientai.id_Klientas"), nullable=False)
