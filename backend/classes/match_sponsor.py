from sqlalchemy import Column, Integer, ForeignKey
from config import Base

class MatchSponsor(Base):
    __tablename__ = "varzybuRemejai"

    fk_Varzybosid_Varzybos = Column("fk_Varzybosid_Varzybos", Integer, ForeignKey("varzybos.id_Varzybos"), primary_key=True)
    fk_Remejasid_Remejas = Column("fk_Remejasid_Remejas", Integer, ForeignKey("remejai.id_Remejas"), primary_key=True)
