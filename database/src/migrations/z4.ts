import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';
const NODE_ENV = process.env.NODE_ENV;

export async function up(knex: Knex): Promise<void> {
  const sql = `
  set schema 'invasivesbc';
  set search_path = invasivesbc,public;

  drop table biological_dispersal_extract cascade;
  drop table biological_monitoring_extract;
  drop table biological_treatment_extract;
  drop table chemical_monitoring_extract;
  drop table chemical_treatment_extract;
  drop table invasive_plant_no_treatment_extract;
  drop table mechanical_monitoring_extract;
  drop table mechanical_treatment_extract;
  drop table planning_extract;
  drop table site_selection_extract;
  drop table survey_extract;
  
  
  CREATE TABLE invasivesbc.Survey_Extract (
    surveyid serial4,
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
    estimated_area_hectares numeric(10, 4) NULL,
    distribution varchar(120) NULL,
    density varchar(120) NULL,
    survey_agency varchar(120) NOT NULL,
    primary_surveyor varchar(120) NULL,
    survey_comments varchar(2000) NULL,
    site_location varchar(2000) NULL,
    site_comments varchar(2000) NULL,
          regional_district varchar(200) NULL,
          regional_invasive_species_organization varchar(200) NULL
  
  );
  
  
  
  CREATE TABLE invasivesbc.Site_Selection_Extract (
    siteselectionid serial4,
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
    estimated_area_hectares numeric(10, 4) NULL,
    distribution varchar(120) NULL,
    slope_percent int4 NULL,
    aspect int4 NULL,
    elevation int4 NULL,
    treatment_date date NULL,
    treatment_type varchar(120) NULL,
    all_species_on_site varchar(3000) NOT NULL,
    site_location varchar(2000) NULL,
    site_comments varchar(2000) NULL,
          regional_district varchar(200) NULL,
          regional_invasive_species_organization varchar(200) NULL
  
  );
  
  
  
  CREATE TABLE invasivesbc.Chemical_Treatment_Extract (
    chemicaltreatmentid serial4,
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
    method varchar(120) NOT NULL,
    area_treated_hectares numeric(10, 4) NULL,
    amount_of_mix_used_litres numeric(10, 5) NULL,
    application_rate_litres_per_hectare numeric(6, 2) NULL,
    delivery_rate_litres_per_hectare int4 NULL,
    dilution_percent numeric(8, 4) NULL,
    amount_of_undiluted_herbicide_used_litres numeric(8, 4) NULL,
    tank_mix varchar(3) NULL,
    employer varchar(120) NULL,
    primary_applicator varchar(120) NOT NULL,
    site_location varchar(2000) NULL,
    site_comments varchar(2000) NULL,
          regional_district varchar(200) NULL,
          regional_invasive_species_organization varchar(200) NULL
  );
  
  
  
  CREATE TABLE invasivesbc.Mechanical_Treatment_Extract (
    mechanicaltreatmentid serial4,
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
    estimated_area_hectares numeric(10, 4) NOT NULL,
    employer varchar(120) NULL,
    primary_applicator varchar(120) NOT NULL,
    site_location varchar(2000) NULL,
    site_comments varchar(2000) NULL,
          regional_district varchar(200) NULL,
          regional_invasive_species_organization varchar(200) NULL
  
  );
  
  
  
  CREATE TABLE invasivesbc.Invasive_Plant_No_Treatment_Extract (
    invasiveplantnotreatmentid serial4,
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
    survey_paper_file_id varchar(22) NULL,
    estimated_area_hectares numeric(10, 4) NULL,
    distribution varchar(120) NULL,
    density varchar(120) NULL,
    survey_agency varchar(120) NOT NULL,
    primary_surveyor varchar(120) NULL,
    site_location varchar(2000) NULL,
    site_comments varchar(2000) NULL,
          regional_district varchar(200) NULL,
          regional_invasive_species_organization varchar(200) NULL
  
  );
  
  
  
  CREATE TABLE invasivesbc.Planning_Extract (
    planningid serial4,
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
    activity varchar(120) NULL,
    agent_or_herbicide varchar(120) NULL,
          slope_percent int4 NULL,
    elevation int4 NULL, 	
    estimated_area_hectares numeric(10, 4) NULL,
    distribution varchar(120) NULL,
    density varchar(120) NULL,
    survey_type varchar(120) NOT NULL,
    plan_date date NOT NULL,
    agency varchar(120) NOT NULL,
    planned_activity_month varchar(120) NOT NULL,
    site_location varchar(2000) NULL,
    site_comments varchar(2000) NULL,
          regional_district varchar(200) NULL,
          regional_invasive_species_organization varchar(200) NULL
  
  );
  
  
  
  CREATE TABLE invasivesbc.Biological_Dispersal_Extract (
    biologicaldispersalid serial4,
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
    dispersal_agency varchar(1000) null,
    inspection_date date NULL,
    foliar_feeding_damage varchar(1) NOT NULL,
    rootfeeding_damage varchar(1) NOT NULL,
    seedfeeding_damage varchar(1) NOT NULL,
    oviposition_marks varchar(1) NOT NULL,
    eggs_present varchar(1) NOT NULL,
    larvae_present varchar(1) NOT NULL,
    pupae_present varchar(1) NOT NULL,
    adults_present varchar(1) NOT NULL,
    tunnels_present varchar(1) NOT NULL,
    primary_surveyor varchar(120) NOT NULL,
    estimated_area_hectares numeric(10, 4) NULL,
    distribution varchar(120) NULL,
    density varchar(120) NULL,
    site_location varchar(2000) NULL,
    site_comments varchar(2000) NULL,
          regional_district varchar(200) NULL,
          regional_invasive_species_organization varchar(200) NULL
  
  );
  
  
  
  
  CREATE TABLE invasivesbc.Biological_Monitoring_Extract (
    biologicalmonitoringid serial4,
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
    pupae_present varchar(1) NOT NULL,
    adults_present varchar(1) NOT NULL,
    tunnels_present varchar(1) NOT NULL,
    invasive_plant varchar(100) NOT NULL,
    estimated_area_hectares numeric(10, 4) NULL,
    distribution varchar(120) NULL,
    density varchar(120) NULL,
    site_location varchar(2000) NULL,
    site_comments varchar(2000) NULL,
          regional_district varchar(200) NULL,
          regional_invasive_species_organization varchar(200) NULL
  
  );
  
  
  
  CREATE TABLE invasivesbc.Biological_Treatment_Extract (
    biotreatmentid serial4,
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
    estimated_area_hectares numeric(10, 4) NOT NULL,
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
    site_comments varchar(2000) NULL,
          regional_district varchar(200) NULL,
          regional_invasive_species_organization varchar(200) NULL
  );
  
  
  
  CREATE TABLE invasivesbc.Mechanical_Monitoring_Extract (
    mechmonitoringid serial4,
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
    estimated_area_hectares numeric(10, 4) NULL,
    distribution varchar(120) NULL,
    density varchar(120) NULL,
    site_location varchar(2000) NULL,
    site_comments varchar(2000) NULL,
          regional_district varchar(200) NULL,
          regional_invasive_species_organization varchar(200) NULL
  
  );
  
  
  
  
  CREATE TABLE invasivesbc.Chemical_Monitoring_Extract (
    chemicalmonitoringid serial4,
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
    estimated_area_hectares numeric(10, 4) NOT NULL,
    distribution varchar(120) NULL,
    density varchar(120) NULL,
    site_location varchar(2000) NULL,
    site_comments varchar(2000) NULL,
          regional_district varchar(200) NULL,
          regional_invasive_species_organization varchar(200) NULL
  
  );
  );
  `;

  await knex.raw(sql);
}

/**
 * Drop the `application_user` table.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    drop view if exists invasivesbc.activity_current;
  `);
}
