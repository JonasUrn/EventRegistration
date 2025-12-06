from sqlalchemy import Column, Integer, String, ForeignKey
from config import Base

class Referee(Base):
    __tablename__ = "teisejai"

    id_Teisejas = Column("id_Teisejas", Integer, primary_key=True)
    vardas = Column("vardas", String(255), nullable=False)
    pavarde = Column("pavarde", String(255), nullable=False)
    el_pastas = Column("el_pastas", String(255), nullable=False)
    salis = Column("salis", String(255), nullable=False)
    miestas = Column("miestas", String(255), nullable=False)
    licenzijos_id = Column("licenzijos_id", String(255), nullable=False)
    tel_numeris = Column("tel_numeris", String(255), nullable=False)
    fk_Varzybosid_Varzybos = Column("fk_Varzybosid_Varzybos", Integer, ForeignKey("varzybos.id_Varzybos"), nullable=False)
