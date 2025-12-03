from sqlalchemy import Column, Integer, String, Date, ForeignKey
from config import Base

class Match(Base):
    __tablename__ = "varzybos"

    id_Varzybos = Column("id_Varzybos", Integer, primary_key=True)
    pavadinimas = Column("pavadinimas", String(255), nullable=False)
    pradžia = Column("pradžia", Date, nullable=False)
    pabaiga = Column("pabaiga", Date, nullable=False)
    fk_Turnyrasid_Turnyras = Column("fk_Turnyrasid_Turnyras", Integer, ForeignKey("turnyrai.id_Turnyras"), nullable=False)
