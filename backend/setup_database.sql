DROP DATABASE IF EXISTS game_portal;
CREATE DATABASE game_portal;
USE game_portal;

DROP TABLE IF EXISTS vietos;
DROP TABLE IF EXISTS varzybuRemejai;
DROP TABLE IF EXISTS varzybuDalyviai;
DROP TABLE IF EXISTS teisejai;
DROP TABLE IF EXISTS varzybos;
DROP TABLE IF EXISTS turnyroDalyviai;
DROP TABLE IF EXISTS komandosNarystes;
DROP TABLE IF EXISTS turnyrai;
DROP TABLE IF EXISTS remejai;
DROP TABLE IF EXISTS komandos;
DROP TABLE IF EXISTS tipai;
DROP TABLE IF EXISTS remejoKlases;
DROP TABLE IF EXISTS formatai;
DROP TABLE IF EXISTS klientai;

CREATE TABLE klientai
(
	id_Klientas integer NOT NULL AUTO_INCREMENT,
	vardas varchar (255) NOT NULL,
	pavarde varchar (255) NOT NULL,
	el_pastas varchar (255) NOT NULL,
	tel_numeris varchar (255) NOT NULL,
	gimimo_data date NOT NULL,
	lytis varchar (255) NOT NULL,
	slapyvardis varchar (255) NOT NULL,
	slaptazodis varchar (255) NOT NULL,
	salis varchar (255) NOT NULL,
	miestas varchar (255) NOT NULL,
	organizatorius boolean NOT NULL,
	administratorius boolean NOT NULL,
	`patvirtintas pastas` boolean NOT NULL,
	PRIMARY KEY(id_Klientas)
);

CREATE TABLE formatai
(
	id_Formatas integer AUTO_INCREMENT,
	name char (14) NOT NULL,
	PRIMARY KEY(id_Formatas)
);
INSERT INTO formatai(id_Formatas, name) VALUES(1, 'atkrintamosios');
INSERT INTO formatai(id_Formatas, name) VALUES(2, 'paprastas');
INSERT INTO formatai(id_Formatas, name) VALUES(3, 'finalai');

CREATE TABLE remejoKlases
(
	`id_Rėmėjo klasė` integer AUTO_INCREMENT,
	name char (10) NOT NULL,
	PRIMARY KEY(`id_Rėmėjo klasė`)
);
INSERT INTO remejoKlases(`id_Rėmėjo klasė`, name) VALUES(1, 'Auksinis');
INSERT INTO remejoKlases(`id_Rėmėjo klasė`, name) VALUES(2, 'Sidabrinis');
INSERT INTO remejoKlases(`id_Rėmėjo klasė`, name) VALUES(3, 'Bronzinis');

CREATE TABLE tipai
(
	id_Tipas integer AUTO_INCREMENT,
	name char (7) NOT NULL,
	PRIMARY KEY(id_Tipas)
);
INSERT INTO tipai(id_Tipas, name) VALUES(1, 'komanda');
INSERT INTO tipai(id_Tipas, name) VALUES(2, 'narys');

CREATE TABLE komandos
(
	id_Komanda integer NOT NULL AUTO_INCREMENT,
	pavadinimas varchar (255) NOT NULL,
	logotipo_nuoroda varchar (255) NULL,
	sukurta date NOT NULL,
	aprasymas varchar (255) NULL,
	salis varchar (255) NOT NULL,
	miestas varchar (255) NOT NULL,
	fk_Klientasid_Klientas integer NOT NULL,
	PRIMARY KEY(id_Komanda),
	CONSTRAINT sukuria FOREIGN KEY(fk_Klientasid_Klientas) REFERENCES klientai (id_Klientas)
);

CREATE TABLE remejai
(
	id_Remejas integer NOT NULL AUTO_INCREMENT,
	pavadinimas varchar (255) NOT NULL,
	el_pastas varchar (255) NOT NULL,
	el_puslapis varchar (255) NULL,
	remejo_klase char (10) NOT NULL,
	PRIMARY KEY(id_Remejas)
);

CREATE TABLE turnyrai
(
	id_Turnyras integer NOT NULL AUTO_INCREMENT,
	pavadinimas varchar (255) NOT NULL,
	aprasas varchar (255) NOT NULL,
	sporto_saka varchar (255) NOT NULL,
	pradzia date NOT NULL,
	pabaiga date NOT NULL,
	minimalus_nariu_skacius integer NOT NULL,
	maksimalus_nariu_skaicius integer NOT NULL,
	turnyro_formatas char (14) NOT NULL,
	fk_Klientasid_Klientas integer NOT NULL,
	PRIMARY KEY(id_Turnyras),
	CONSTRAINT sukuria_turnyra FOREIGN KEY(fk_Klientasid_Klientas) REFERENCES klientai (id_Klientas)
);

CREATE TABLE komandosNarystes
(
	id_Komandos_naryste integer NOT NULL AUTO_INCREMENT,
	role varchar (255) NOT NULL,
	narys_nuo date NOT NULL,
	fk_Komandaid_Komanda integer NOT NULL,
	fk_Klientasid_Klientas integer NOT NULL,
	PRIMARY KEY(id_Komandos_naryste),
	CONSTRAINT priskiria FOREIGN KEY(fk_Komandaid_Komanda) REFERENCES komandos (id_Komanda),
	CONSTRAINT priklauso FOREIGN KEY(fk_Klientasid_Klientas) REFERENCES klientai (id_Klientas)
);

CREATE TABLE turnyroDalyviai
(
	id_Turnyro_dalyvis integer NOT NULL AUTO_INCREMENT,
	pozicija integer NOT NULL,
	taskai integer NOT NULL,
	prisiregistravimo_data date NOT NULL,
	dalyvio_tipas char (7) NOT NULL,
	fk_Klientasid_Klientas integer NULL,
	fk_Turnyrasid_Turnyras integer NOT NULL,
	fk_Komandaid_Komanda integer NULL,
	PRIMARY KEY(id_Turnyro_dalyvis),
	CONSTRAINT tampa FOREIGN KEY(fk_Klientasid_Klientas) REFERENCES klientai (id_Klientas),
	CONSTRAINT sukuria_dalyvavima FOREIGN KEY(fk_Turnyrasid_Turnyras) REFERENCES turnyrai (id_Turnyras),
	CONSTRAINT yra FOREIGN KEY(fk_Komandaid_Komanda) REFERENCES komandos (id_Komanda)
);

CREATE TABLE varzybos
(
	id_Varzybos integer NOT NULL AUTO_INCREMENT,
	pavadinimas varchar (255) NOT NULL,
	pradžia date NOT NULL,
	pabaiga date NOT NULL,
	fk_Turnyrasid_Turnyras integer NOT NULL,
	PRIMARY KEY(id_Varzybos),
	CONSTRAINT turi FOREIGN KEY(fk_Turnyrasid_Turnyras) REFERENCES turnyrai (id_Turnyras)
);

CREATE TABLE teisejai
(
	id_Teisejas integer NOT NULL AUTO_INCREMENT,
	vardas varchar (255) NOT NULL,
	pavarde varchar (255) NOT NULL,
	el_pastas varchar (255) NOT NULL,
	salis varchar (255) NOT NULL,
	miestas varchar (255) NOT NULL,
	licenzijos_id varchar (255) NOT NULL,
	tel_numeris varchar (255) NOT NULL,
	fk_Varzybosid_Varzybos integer NOT NULL,
	PRIMARY KEY(id_Teisejas),
	CONSTRAINT priziuri FOREIGN KEY(fk_Varzybosid_Varzybos) REFERENCES varzybos (id_Varzybos)
);

CREATE TABLE varzybuDalyviai
(
	id_Varzybu_dalyvis integer NOT NULL AUTO_INCREMENT,
	taskai integer NOT NULL,
	yra_laimėtojas boolean NULL,
	fk_Varzybosid_Varzybos integer NOT NULL,
	fk_Turnyro_dalyvisid_Turnyro_dalyvis integer NOT NULL,
	PRIMARY KEY(id_Varzybu_dalyvis),
	CONSTRAINT turi_dalyvius FOREIGN KEY(fk_Varzybosid_Varzybos) REFERENCES varzybos (id_Varzybos),
	CONSTRAINT yra_dalyvis FOREIGN KEY(fk_Turnyro_dalyvisid_Turnyro_dalyvis) REFERENCES turnyroDalyviai (id_Turnyro_dalyvis)
);

CREATE TABLE varzybuRemejai
(
	fk_Varzybosid_Varzybos integer NOT NULL,
	fk_Remejasid_Remejas integer NOT NULL,
	PRIMARY KEY(fk_Varzybosid_Varzybos, fk_Remejasid_Remejas),
	CONSTRAINT remia FOREIGN KEY(fk_Varzybosid_Varzybos) REFERENCES varzybos (id_Varzybos)
);

CREATE TABLE vietos
(
	id_Vieta integer NOT NULL AUTO_INCREMENT,
	salis varchar (255) NOT NULL,
	miestas varchar (255) NOT NULL,
	adresas varchar (255) NOT NULL,
	koordinates varchar (255) NOT NULL,
	vietu_skaicius varchar (255) NOT NULL,
	patalpos_tipas varchar (255) NOT NULL,
	aprasymas varchar (255) NOT NULL,
	fk_Varzybosid_Varzybos integer NOT NULL,
	PRIMARY KEY(id_Vieta),
	CONSTRAINT vyksta FOREIGN KEY(fk_Varzybosid_Varzybos) REFERENCES varzybos (id_Varzybos)
);
