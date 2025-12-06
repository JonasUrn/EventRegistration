from sqlalchemy import Column, Integer, Boolean, ForeignKey
from config import Base

class MatchParticipant(Base):
    __tablename__ = "varzybuDalyviai"

    id_Varzybu_dalyvis = Column("id_Varzybu_dalyvis", Integer, primary_key=True)
    taskai = Column("taskai", Integer, nullable=False)
    yra_laimėtojas = Column("yra_laimėtojas", Boolean, nullable=True)
    fk_Varzybosid_Varzybos = Column("fk_Varzybosid_Varzybos", Integer, ForeignKey("varzybos.id_Varzybos"), nullable=False)
    fk_Turnyro_dalyvisid_Turnyro_dalyvis = Column("fk_Turnyro_dalyvisid_Turnyro_dalyvis", Integer, ForeignKey("turnyroDalyviai.id_Turnyro_dalyvis"), nullable=False)
