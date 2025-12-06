from sqlalchemy import Column, Integer, String, Date, ForeignKey
from config import Base

class TeamMembership(Base):
    __tablename__ = "komandosNarystes"

    id_Komandos_naryste = Column("id_Komandos_naryste", Integer, primary_key=True)
    role = Column("role", String(255), nullable=False)
    narys_nuo = Column("narys_nuo", Date, nullable=False)
    fk_Komandaid_Komanda = Column("fk_Komandaid_Komanda", Integer, ForeignKey("komandos.id_Komanda"), nullable=False)
    fk_Klientasid_Klientas = Column("fk_Klientasid_Klientas", Integer, ForeignKey("klientai.id_Klientas"), nullable=False)
