from sqlalchemy import Column, Integer, String, ForeignKey
from config import Base

class Location(Base):
    __tablename__ = "vietos"

    id_Vieta = Column("id_Vieta", Integer, primary_key=True)
    salis = Column("salis", String(255), nullable=False)
    miestas = Column("miestas", String(255), nullable=False)
    adresas = Column("adresas", String(255), nullable=False)
    koordinates = Column("koordinates", String(255), nullable=False)
    vietu_skaicius = Column("vietu_skaicius", String(255), nullable=False)
    patalpos_tipas = Column("patalpos_tipas", String(255), nullable=False)
    aprasymas = Column("aprasymas", String(255), nullable=False)
    fk_Varzybosid_Varzybos = Column("fk_Varzybosid_Varzybos", Integer, ForeignKey("varzybos.id_Varzybos"), nullable=False)
