from sqlalchemy import Column, Integer, String
from config import Base

class Sponsor(Base):
    __tablename__ = "remejai"

    id_Remejas = Column("id_Remejas", Integer, primary_key=True)
    pavadinimas = Column("pavadinimas", String(255), nullable=False)
    el_pastas = Column("el_pastas", String(255), nullable=False)
    el_puslapis = Column("el_puslapis", String(255), nullable=True)
    remejo_klase = Column("remejo_klase", String(10), nullable=False)
