import * as Knex from 'knex';
//For now moving to one consolidated migration for plant reporting.

//Why:  Knex silently failing on view create, making troubleshooting which of the 10+ plant views is failing.
//      Deploying plant views then becomes a process of manually pasting the sql to the db.
//      Having one consolidated file allows for quick troubleshooting and deployments.
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  	set search_path=invasivesbc,public;
    -- invasivesbc.survey_extract definition

-- Drop table

-- DROP TABLE invasivesbc.survey_extract;

CREATE TABLE if not exists invasivesbc.survey_extract (
	surveyid serial4 NOT NULL,
	site_id int4 NOT NULL,
	site_paper_file_id varchar(20) NULL,
	district_lot_number varchar(6) NULL,
	jurisdictions varchar(1000) NOT NULL,
	site_created_date date NULL,
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
	survey_paper_file_id varchar(22) NULL,
	survey_date date NOT NULL,
	estimated_area numeric(10, 4) NULL,
	distribution varchar(120) NULL,
	density varchar(120) NULL,
	survey_agency varchar(120) NOT NULL,
	primary_surveyor varchar(120) NULL,
	survey_comments varchar(2000) NULL,
	site_location varchar(2000) NULL,
	site_comments varchar(2000) NULL
);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
  set search_path=invasivesbc,public;
  drop table if exists invasivesbc.survey_extract;
`);
}
