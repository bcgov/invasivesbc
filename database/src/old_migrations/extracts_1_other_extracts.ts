import * as Knex from 'knex';
//For now moving to one consolidated migration for plant reporting.

//Why:  Knex silently failing on view create, making troubleshooting which of the 10+ plant views is failing.
//      Deploying plant views then becomes a process of manually pasting the sql to the db.
//      Having one consolidated file allows for quick troubleshooting and deployments.
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  	set search_path=invasivesbc,public;
    -- invasivesbc.site_selection_extract definition

-- Drop table

-- DROP TABLE invasivesbc.site_selection_extract;

CREATE TABLE if not exists invasivesbc.site_selection_extract (
	siteselectionid serial4 NOT NULL,
	site_id int4 NOT NULL,
	site_paper_file_id varchar(20) NULL,
	district_lot_number varchar(6) NULL,
	jurisdictions varchar(1000) NOT NULL,
	site_created_date date NOT NULL,
	mapsheet varchar(10) NOT NULL,
	utm_zone int4 NOT NULL,
	utm_easting int4 NOT NULL,
	utm_northing int4 NOT NULL,
	decimal_latitude numeric(7, 5) NULL,
	decimal_longitude numeric(8, 5) NULL,
	biogeoclimatic_zone varchar(5) NOT NULL,
	sub_zone varchar(5) NOT NULL,
	variant int4 NULL,
	phase varchar(5) NULL,
	site_series varchar(5) NULL,
	soil_texture varchar(120) NULL,
	site_specific_use varchar(120) NOT NULL,
	survey_paper_file_id varchar(22) NULL,
	invasive_plant varchar(100) NOT NULL,
	last_surveyed_date date NOT NULL,
	primary_surveyor varchar(120) NULL,
	estimated_area numeric(10, 4) NULL,
	distribution varchar(120) NULL,
	slope int4 NULL,
	aspect int4 NULL,
	elevation int4 NULL,
	treatment_date date NULL,
	treatment_type varchar(120) NULL,
	all_species_on_site varchar(3000) NOT NULL,
	site_location varchar(2000) NULL,
	site_comments varchar(2000) NULL
);

-- invasivesbc.biological_dispersal_extract definition

-- Drop table

-- DROP TABLE invasivesbc.biological_dispersal_extract;

CREATE TABLE if not exists invasivesbc.biological_dispersal_extract (
	biologicaldispersalid serial4 NOT NULL,
	site_id int4 NOT NULL,
	site_paper_file_id varchar(120) NULL,
	district_lot_number varchar(6) NULL,
	jurisdictions varchar(1000) NOT NULL,
	site_created_date date NOT NULL,
	mapsheet varchar(10) NOT NULL,
	utm_zone int4 NOT NULL,
	utm_easting int4 NOT NULL,
	utm_northing int4 NOT NULL,
	decimal_latitude numeric(7, 5) NULL,
	decimal_longitude numeric(8, 5) NULL,
	biogeoclimatic_zone varchar(5) NOT NULL,
	sub_zone varchar(5) NOT NULL,
	variant int4 NULL,
	phase varchar(5) NULL,
	site_series varchar(5) NULL,
	soil_texture varchar(120) NULL,
	site_specific_use varchar(120) NOT NULL,
	invasive_plant varchar(100) NOT NULL,
	biological_agent varchar(20) NOT NULL,
	dispersal_paper_file_id varchar(120) NULL,
	dispersal_agency varchar(1000) NULL,
	inspection_date date NULL,
	foliar_feeding_damage varchar(1) NOT NULL,
	rootfeeding_damage varchar(1) NOT NULL,
	seedfeeding_damage varchar(1) NOT NULL,
	oviposition_marks varchar(1) NOT NULL,
	eggs_present varchar(1) NOT NULL,
	larvae_present varchar(1) NOT NULL,
	pupea_present varchar(1) NOT NULL,
	adults_present varchar(1) NOT NULL,
	tunnels_present varchar(1) NOT NULL,
	primary_surveyor varchar(120) NOT NULL,
	estimated_area numeric(10, 4) NULL,
	distribution varchar(120) NULL,
	density varchar(120) NULL,
	site_location varchar(2000) NULL,
	site_comments varchar(2000) NULL
);
CREATE INDEX if not exists biological_disperal_date_idx ON invasivesbc.biological_dispersal_extract USING btree (inspection_date);
CREATE INDEX  if not exists biological_disperal_site_id_idx ON invasivesbc.biological_dispersal_extract USING btree (site_id);


-- invasivesbc.biological_monitoring_extract definition

-- Drop table

-- DROP TABLE invasivesbc.biological_monitoring_extract;

CREATE TABLE if not exists invasivesbc.biological_monitoring_extract (
	biologicalmonitoringid serial4 NOT NULL,
	site_id int4 NOT NULL,
	site_paper_file_id varchar(120) NULL,
	district_lot_number varchar(6) NULL,
	jurisdictions varchar(1000) NOT NULL,
	site_created_date date NOT NULL,
	mapsheet varchar(10) NOT NULL,
	utm_zone int4 NOT NULL,
	utm_easting int4 NOT NULL,
	utm_northing int4 NOT NULL,
	decimal_latitude numeric(7, 5) NULL,
	decimal_longitude numeric(8, 5) NULL,
	biogeoclimatic_zone varchar(5) NOT NULL,
	sub_zone varchar(5) NOT NULL,
	variant int4 NULL,
	phase varchar(5) NULL,
	site_series varchar(5) NULL,
	soil_texture varchar(120) NULL,
	site_specific_use varchar(120) NOT NULL,
	biological_agent varchar(20) NOT NULL,
	treatment_date date NULL,
	treatment_paper_file_id varchar(22) NULL,
	treatment_agency varchar(120) NULL,
	treatment_comments varchar(2000) NULL,
	monitoring_paper_file_id varchar(22) NULL,
	monitoring_agency varchar(120) NOT NULL,
	inspection_date date NULL,
	primary_surveyor varchar(120) NOT NULL,
	legacy_presence varchar(1) NOT NULL,
	foliar_feeding_damage varchar(1) NOT NULL,
	rootfeeding_damage varchar(1) NOT NULL,
	seedfeeding_damage varchar(1) NOT NULL,
	oviposition_marks varchar(1) NOT NULL,
	eggs_present varchar(1) NOT NULL,
	larvae_present varchar(1) NOT NULL,
	pupea_present varchar(1) NOT NULL,
	adults_present varchar(1) NOT NULL,
	tunnels_present varchar(1) NOT NULL,
	invasive_plant varchar(100) NOT NULL,
	estimated_area numeric(10, 4) NULL,
	distribution varchar(120) NULL,
	density varchar(120) NULL,
	site_location varchar(2000) NULL,
	site_comments varchar(2000) NULL
);
CREATE INDEX if not exists biological_monitoring_date_idx ON invasivesbc.biological_monitoring_extract USING btree (inspection_date);
CREATE INDEX if not exists biological_monitoring_extract_idx ON invasivesbc.biological_monitoring_extract USING btree (inspection_date);
CREATE INDEX if not exists biological_monitoring_site_id_idx ON invasivesbc.biological_monitoring_extract USING btree (site_id);


-- invasivesbc.biological_treatment_extract definition

-- Drop table

-- DROP TABLE invasivesbc.biological_treatment_extract;

CREATE TABLE if not exists invasivesbc.biological_treatment_extract (
	biotreatmentid serial4 NOT NULL,
	site_id int4 NOT NULL,
	site_paper_file_id varchar(20) NULL,
	district_lot_number varchar(6) NULL,
	jurisdictions varchar(1000) NOT NULL,
	site_created_date date NOT NULL,
	mapsheet varchar(10) NOT NULL,
	utm_zone int4 NOT NULL,
	utm_easting int4 NOT NULL,
	utm_northing int4 NOT NULL,
	decimal_latitude numeric(7, 5) NULL,
	decimal_longitude numeric(8, 5) NULL,
	biogeoclimatic_zone varchar(5) NOT NULL,
	sub_zone varchar(5) NOT NULL,
	variant int4 NULL,
	phase varchar(5) NULL,
	site_series varchar(5) NULL,
	soil_texture varchar(120) NULL,
	site_specific_use varchar(120) NOT NULL,
	invasive_plant varchar(100) NOT NULL,
	estimated_area numeric(10, 4) NOT NULL,
	distribution varchar(120) NULL,
	density varchar(120) NULL,
	treatment_date date NULL,
	treatment_paper_file_id varchar(22) NULL,
	treatment_agency varchar(120) NOT NULL,
	treatment_comments varchar(2000) NULL,
	release_quantity int4 NOT NULL,
	bioagent_source varchar(120) NULL,
	biological_agent varchar(120) NOT NULL,
	employer varchar(120) NULL,
	primary_applicator varchar(120) NOT NULL,
	site_location varchar(2000) NULL,
	site_comments varchar(2000) NULL
);
CREATE INDEX if not exists biological_treatment_date_idx ON invasivesbc.biological_treatment_extract USING btree (treatment_date);
CREATE INDEX if not exists biological_treatment_extract_idx ON invasivesbc.biological_treatment_extract USING btree (treatment_date);
CREATE INDEX if not exists biological_treatment_site_id_idx ON invasivesbc.biological_treatment_extract USING btree (site_id);


-- invasivesbc.chemical_monitoring_extract definition

-- Drop table

-- DROP TABLE invasivesbc.chemical_monitoring_extract;

CREATE TABLE if not exists invasivesbc.chemical_monitoring_extract (
	chemicalmonitoringid serial4 NOT NULL,
	site_id int4 NOT NULL,
	site_paper_file_id varchar(120) NULL,
	district_lot_number varchar(6) NULL,
	jurisdictions varchar(1000) NOT NULL,
	site_created_date date NOT NULL,
	mapsheet varchar(10) NOT NULL,
	utm_zone int4 NOT NULL,
	utm_easting int4 NOT NULL,
	utm_northing int4 NOT NULL,
	decimal_latitude numeric(7, 5) NULL,
	decimal_longitude numeric(8, 5) NULL,
	biogeoclimatic_zone varchar(5) NOT NULL,
	sub_zone varchar(5) NOT NULL,
	variant int4 NULL,
	phase varchar(5) NULL,
	site_series varchar(5) NULL,
	soil_texture varchar(120) NULL,
	site_specific_use varchar(120) NOT NULL,
	service_licence_number varchar(25) NULL,
	pmp_number varchar(120) NOT NULL,
	pup_number varchar(25) NULL,
	invasive_plant varchar(100) NOT NULL,
	herbicide varchar(120) NOT NULL,
	treatment_method varchar(120) NOT NULL,
	treatment_date date NULL,
	treatment_paper_file_id varchar(22) NULL,
	treatment_comments varchar(2000) NULL,
	monitoring_paper_file_id varchar(120) NULL,
	monitoring_agency varchar(120) NOT NULL,
	inspection_date date NOT NULL,
	primary_surveyor varchar(120) NULL,
	efficacy_rating varchar(120) NOT NULL,
	estimated_area numeric(10, 4) NOT NULL,
	distribution varchar(120) NULL,
	density varchar(120) NULL,
	site_location varchar(2000) NULL,
	site_comments varchar(2000) NULL
);
CREATE INDEX if not exists  chemical_monitoring_date_idx ON invasivesbc.chemical_monitoring_extract USING btree (inspection_date);
CREATE INDEX if not exists chemical_monitoring_site_id_idx ON invasivesbc.chemical_monitoring_extract USING btree (site_id);


-- invasivesbc.chemical_treatment_extract definition

-- Drop table

-- DROP TABLE invasivesbc.chemical_treatment_extract;

CREATE TABLE if not exists invasivesbc.chemical_treatment_extract (
	chemicaltreatmentid serial4 NOT NULL,
	site_id int4 NOT NULL,
	site_paper_file_id varchar(20) NULL,
	district_lot_number varchar(6) NULL,
	jurisdictions varchar(1000) NOT NULL,
	site_created_date date NOT NULL,
	mapsheet varchar(10) NOT NULL,
	utm_zone int4 NOT NULL,
	utm_easting int4 NOT NULL,
	utm_northing int4 NOT NULL,
	decimal_latitude numeric(7, 5) NULL,
	decimal_longitude numeric(8, 5) NULL,
	biogeoclimatic_zone varchar(5) NOT NULL,
	sub_zone varchar(5) NOT NULL,
	variant int4 NULL,
	phase varchar(5) NULL,
	site_series varchar(5) NULL,
	soil_texture varchar(120) NULL,
	site_specific_use varchar(120) NOT NULL,
	service_licence_number varchar(25) NULL,
	pmp_number varchar(120) NOT NULL,
	pup_number varchar(25) NULL,
	invasive_plant varchar(100) NOT NULL,
	treatment_date date NULL,
	treatment_paper_file_id varchar(22) NULL,
	treatment_agency varchar(120) NOT NULL,
	treatment_comments varchar(2000) NULL,
	herbicide varchar(120) NOT NULL,
	"method" varchar(120) NOT NULL,
	area_treated numeric(10, 4) NULL,
	amount_of_mix_used numeric(10, 5) NULL,
	application_rate numeric(6, 2) NULL,
	delivery_rate int4 NULL,
	dilution_percent numeric(8, 4) NULL,
	amount_of_undiluted_herbicide_used_liters numeric(8, 4) NULL,
	tank_mix varchar(3) NULL,
	employer varchar(120) NULL,
	primary_applicator varchar(120) NOT NULL,
	site_location varchar(2000) NULL,
	site_comments varchar(2000) NULL
);
CREATE INDEX if not exists chemical_treatment_date_idx ON invasivesbc.chemical_treatment_extract USING btree (treatment_date);
CREATE INDEX if not exists chemical_treatment_site_id_idx ON invasivesbc.chemical_treatment_extract USING btree (site_id);


-- invasivesbc.mechanical_monitoring_extract definition

-- Drop table

-- DROP TABLE invasivesbc.mechanical_monitoring_extract;

CREATE TABLE if not exists invasivesbc.mechanical_monitoring_extract (
	mechmonitoringid serial4 NOT NULL,
	site_id int4 NOT NULL,
	site_paper_file_id varchar(120) NULL,
	district_lot_number varchar(6) NULL,
	jurisdictions varchar(1000) NOT NULL,
	site_created_date date NOT NULL,
	mapsheet varchar(10) NOT NULL,
	utm_zone int4 NOT NULL,
	utm_easting int4 NOT NULL,
	utm_northing int4 NOT NULL,
	decimal_latitude numeric(7, 5) NULL,
	decimal_longitude numeric(8, 5) NULL,
	biogeoclimatic_zone varchar(5) NOT NULL,
	sub_zone varchar(5) NOT NULL,
	variant int4 NULL,
	phase varchar(5) NULL,
	site_series varchar(5) NULL,
	soil_texture varchar(120) NULL,
	site_specific_use varchar(120) NOT NULL,
	invasive_plant varchar(100) NOT NULL,
	treatment_method varchar(120) NOT NULL,
	treatment_date date NULL,
	treatment_paper_file_id varchar(22) NULL,
	treatment_comments varchar(2000) NULL,
	monitoring_paper_file_id varchar(22) NULL,
	monitoring_agency varchar(120) NOT NULL,
	inspection_date date NOT NULL,
	primary_surveyor varchar(120) NULL,
	efficacy_rating varchar(120) NOT NULL,
	estimated_area numeric(10, 4) NULL,
	distribution varchar(120) NULL,
	density varchar(120) NULL,
	site_location varchar(2000) NULL,
	site_comments varchar(2000) NULL
);
CREATE INDEX if not exists mechanical_monitoring_date_idx ON invasivesbc.mechanical_monitoring_extract USING btree (inspection_date);
CREATE INDEX if not exists mechanical_monitoring_site_id_idx ON invasivesbc.mechanical_monitoring_extract USING btree (site_id);


-- invasivesbc.mechanical_treatment_extract definition

-- Drop table

-- DROP TABLE invasivesbc.mechanical_treatment_extract;

CREATE TABLE  if not exists invasivesbc.mechanical_treatment_extract (
	mechanicaltreatmentid serial4 NOT NULL,
	site_id int4 NOT NULL,
	site_paper_file_id varchar(20) NULL,
	district_lot_number varchar(6) NULL,
	jurisdictions varchar(1000) NOT NULL,
	site_created_date date NOT NULL,
	mapsheet varchar(10) NOT NULL,
	utm_zone int4 NOT NULL,
	utm_easting int4 NOT NULL,
	utm_northing int4 NOT NULL,
	decimal_latitude numeric(7, 5) NULL,
	decimal_longitude numeric(8, 5) NULL,
	biogeoclimatic_zone varchar(5) NOT NULL,
	sub_zone varchar(5) NOT NULL,
	variant int4 NULL,
	phase varchar(5) NULL,
	site_series varchar(5) NULL,
	soil_texture varchar(120) NULL,
	site_specific_use varchar(120) NOT NULL,
	invasive_plant varchar(100) NOT NULL,
	treatment_date date NULL,
	treatment_paper_file_id varchar(22) NULL,
	treatment_agency varchar(120) NOT NULL,
	treatment_comments varchar(2000) NULL,
	treatment_method varchar(120) NOT NULL,
	estimated_area numeric(10, 4) NOT NULL,
	employer varchar(120) NULL,
	primary_applicator varchar(120) NOT NULL,
	site_location varchar(2000) NULL,
	site_comments varchar(2000) NULL
);
CREATE INDEX  if not exists mechanical_treatment_date_idx ON invasivesbc.mechanical_treatment_extract USING btree (treatment_date);
CREATE INDEX  if not exists mechanical_treatment_site_id_idx ON invasivesbc.mechanical_treatment_extract USING btree (site_id);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
  set search_path=invasivesbc,public;
  drop table if exists invasivesbc.site_selection_extract;
	DROP TABLE invasivesbc.biological_dispersal_extract;
	DROP TABLE invasivesbc.biological_monitoring_extract;
	DROP TABLE invasivesbc.biological_treatment_extract;
	DROP TABLE invasivesbc.chemical_monitoring_extract;
	DROP TABLE invasivesbc.chemical_treatment_extract;
	DROP TABLE invasivesbc.mechanical_monitoring_extract
	DROP TABLE invasivesbc.mechanical_treatment_extract;
`);
}
