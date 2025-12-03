from sqlalchemy import Column, Integer, String, Date, Boolean
from config import Base

class Client(Base):
    __tablename__ = "klientai"

    id_Klientas = Column("id_Klientas", Integer, primary_key=True)
    vardas = Column("vardas", String(255), nullable=False)
    pavarde = Column("pavarde", String(255), nullable=False)
    el_pastas = Column("el_pastas", String(255), nullable=False)
    tel_numeris = Column("tel_numeris", String(255), nullable=False)
    gimimo_data = Column("gimimo_data", Date, nullable=False)
    lytis = Column("lytis", String(255), nullable=False)
    slapyvardis = Column("slapyvardis", String(255), nullable=False)
    slaptazodis = Column("slaptazodis", String(255), nullable=False)
    salis = Column("salis", String(255), nullable=False)
    miestas = Column("miestas", String(255), nullable=False)
    organizatorius = Column("organizatorius", Boolean, nullable=False)
    administratorius = Column("administratorius", Boolean, nullable=False)
    patvirtintas_pastas = Column("patvirtintas pastas", Boolean, nullable=False)
