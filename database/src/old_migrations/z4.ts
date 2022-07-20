import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';
const NODE_ENV = process.env.NODE_ENV;

export const extract_sql_and_reports = `
  set schema 'invasivesbc';
  set search_path = invasivesbc,public;

  drop table if exists biological_dispersal_extract cascade;
  drop table if exists biological_monitoring_extract;
  drop table if exists biological_treatment_extract;
  drop table if exists chemical_monitoring_extract;
  drop table if exists chemical_treatment_extract;
  drop table if exists invasive_plant_no_treatment_extract;
  drop table if exists mechanical_monitoring_extract;
  drop table if exists mechanical_treatment_extract;
  drop table if exists planning_extract;
  drop table if exists site_selection_extract;
  drop table if exists survey_extract;
  
  
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
    amount_of_undiluted_herbicide_used_liters_litres numeric(8, 4) NULL,
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




  drop materialized view if exists iapp_site_summary;
  drop view if exists iapp_site_summary_slow;
  
  create or replace view iapp_site_summary_slow  as (
  
  with sites_grouped as (
	  select site_id, 
	  all_species_on_site,
	  decimal_longitude,
	  decimal_latitude
	  from site_selection_extract
	  group by site_id, all_species_on_site, decimal_longitude, decimal_latitude 
	  ),
	  date_summary as (
	 
  select sse.site_id
  ,min(se.survey_date) as min_survey
  ,max(se.survey_date) as max_survey
  ,min(cte.treatment_date) as min_chemical_treatment_dates
  ,max(cte.treatment_date) as max_chemical_treatment_dates
  ,min(cme.inspection_date) as min_chemical_treatment_monitoring_dates
  ,max(cme.inspection_date) as max_chemical_treatment_monitoring_dates
  ,min(bde.inspection_date) as min_bio_dispersal_dates
  ,max(bde.inspection_date) as max_bio_dispersal_dates
  ,min(bte.treatment_date) as min_bio_treatment_dates
  ,max(bte.treatment_date) as max_bio_treatment_dates
  ,min(bme.inspection_date) as min_bio_treatment_monitoring_dates
  ,max(bme.inspection_date) as max_bio_treatment_monitoring_dates
  ,min(mte.treatment_date) as min_mechanical_treatment_dates
  ,max(mte.treatment_date) as max_mechanical_treatment_dates
  ,min(mme.inspection_date) as min_mechanical_treatment_monitoring_dates
  ,max(mme.inspection_date) as max_mechanical_treatment_monitoring_dates
  from sites_grouped sse 
  left join survey_extract se on sse.site_id = se.site_id
  left join chemical_treatment_extract cte on sse.site_id = cte.site_id
  left join chemical_monitoring_extract cme on sse.site_id = cme.site_id
  left join biological_dispersal_extract bde on sse.site_id = bde.site_id
  left join biological_treatment_extract bte on sse.site_id = bte.site_id
  left join biological_monitoring_extract bme on sse.site_id = bme.site_id
  left join mechanical_treatment_extract mte on sse.site_id = mte.site_id
  left join mechanical_monitoring_extract mme on sse.site_id = mme.site_id
  
  group by sse.site_id 
  )
  select sse.*
  ,ds.min_survey
  ,ds.max_survey 
  ,ds.min_chemical_treatment_dates
  ,ds.max_chemical_treatment_dates
  ,ds.min_chemical_treatment_monitoring_dates
  ,ds.max_chemical_treatment_monitoring_dates
  ,ds.min_bio_dispersal_dates
  ,ds.max_bio_dispersal_dates
  ,ds.min_bio_treatment_dates
  ,ds.max_bio_treatment_dates
  ,ds.min_bio_treatment_monitoring_dates
  ,ds.max_bio_treatment_monitoring_dates
  ,ds.min_mechanical_treatment_dates
  ,ds.max_mechanical_treatment_dates
  ,ds.min_mechanical_treatment_monitoring_dates
  ,ds.max_mechanical_treatment_monitoring_dates
  ,case when ds.min_survey IS null then false else true end as has_surveys
  ,case when ds.max_survey IS null then false else true end as has_biological_treatment_monitorings
  ,case when ds.max_bio_treatment_dates IS null then false else true end as has_biological_treatments
  ,case when ds.min_bio_dispersal_dates IS null then false else true end as has_biological_dispersals
  ,case when ds.max_chemical_treatment_monitoring_dates IS null then false else true end as has_chemical_treatment_monitorings
  ,case when ds.min_chemical_treatment_dates IS null then false else true end as has_chemical_treatments
  ,case when ds.max_mechanical_treatment_dates IS null then false else true end as has_mechanical_treatments
  ,case when ds.max_mechanical_treatment_monitoring_dates IS null then false else true end as has_mechanical_treatment_monitorings
  from sites_grouped sse 
  join date_summary ds on ds.site_id = sse.site_id
  
  );

  drop materialized view if exists iapp_site_summary;
  create materialized view iapp_site_summary as select * from iapp_site_summary_slow;

  GRANT SELECT ON iapp_site_summary  TO invasivebc;

  create table if not exists invasivesbc.iapp_spatial  (
	  site_id int  not null,
	  geog geography(geometry, 4326) NULL
  );
  delete from invasivesbc.iapp_spatial;
  
  
  with sites_grouped as (
	  select site_id, 
	  all_species_on_site,
	  decimal_longitude,
	  decimal_latitude
	  from site_selection_extract
	  group by site_id, all_species_on_site, decimal_longitude, decimal_latitude 
	  ), iapp_spatial_calculated as (
  select site_id
  ,public.geography( public.ST_Force2D(  
	  public.ST_SetSRID(  
		  public.ST_GeomFromGeoJSON(' { "type": "Point","coordinates": [ ' 
			  || cast(decimal_longitude as text) || ',' 
			  || cast(decimal_latitude as text) || ' ]  }'),  4326  ) ) )
  from sites_grouped
  )
  insert into 
  invasivesbc.iapp_spatial
  select * from iapp_spatial_calculated;

drop view if exists invasivesbc.common_summary;
CREATE VIEW invasivesbc.common_summary as (
  with jurisdiction_array as (
    select 
      activity_incoming_data.activity_incoming_data_id, 
      activity_incoming_data.activity_subtype, 
      deleted_timestamp, 
      created_timestamp, 
      jsonb_array_elements(
        activity_incoming_data.activity_payload #> '{form_data, activity_data, jurisdictions}') as jurisdictions_array
        from 
          activity_incoming_data
      ), 
      jurisdictions_list as (
        select 
          j.activity_incoming_data_id, 
          j.jurisdictions_array #>> '{jurisdiction_code}' as jurisdiction_code,
          jurisdiction_codes.code_description as jurisdiction, 
          j.jurisdictions_array #>> '{percent_covered}' as percent_covered
        from 
          jurisdiction_array j 
          left join code_header jurisdiction_code_header on jurisdiction_code_header.code_header_title = 'jurisdiction_code' 
          and jurisdiction_code_header.valid_to is null 
          left join code jurisdiction_codes on jurisdiction_codes.code_header_id = jurisdiction_code_header.code_header_id 
          and j.jurisdictions_array #>> '{jurisdiction_code}' = jurisdiction_codes.code_name
        where 
          deleted_timestamp is null 
          and created_timestamp > '2022-01-01'
      ), 
      jurisdiction_agg as (
        select 
          j.activity_incoming_data_id, 
          string_agg (
            j.jurisdiction || ' ' || j.percent_covered || '%', 
            ', ' 
            order by 
              j.jurisdiction
          ) jurisdictions 
        from 
          jurisdictions_list j 
        group by 
          j.activity_incoming_data_id
      ), 
      funding_agency_array as (
        select 
          activity_incoming_data_id, 
          convert_string_list_to_array_elements(
            activity_payload #>> '{form_data, activity_data, invasive_species_agency_code}') as funding_list
            from 
              activity_incoming_data 
            where 
              deleted_timestamp is null
          ), 
          funding_agency_select as (
            select 
              f.activity_incoming_data_id, 
              f.funding_list, 
              invasive_species_agency_codes.code_description as funding_agency 
            from 
              funding_agency_array f 
              left join code_header invasive_species_agency_code_header on invasive_species_agency_code_header.code_header_title = 'invasive_species_agency_code' 
              and invasive_species_agency_code_header.valid_to is null 
              left join code invasive_species_agency_codes on invasive_species_agency_codes.code_header_id = invasive_species_agency_code_header.code_header_id 
              and f.funding_list = invasive_species_agency_codes.code_name
          ), 
          funding_agency_agg as (
            select 
              f.activity_incoming_data_id, 
              string_agg(
                f.funding_agency, 
                ', ' 
                order by 
                  f.funding_agency
              ) funding_agency 
            from 
              funding_agency_select f 
            group by 
              f.activity_incoming_data_id
          ) 
        select 
          j.jurisdictions, 
          a.activity_incoming_data_id, 
          a.activity_id, 
          a.activity_payload #>> '{short_id}' as short_id,
          replace(
            translate(
              a.activity_payload #>> '{form_data, activity_data, project_code}', '"[{}]:', '')::text, 'description ', '') AS project_code,
              a.activity_payload #>> '{activity_type}' as activity_type,
              a.activity_payload #>> '{activity_subtype}' as activity_subtype,
              translate(
                a.activity_payload #>> '{form_data, activity_data, activity_date_time}', 'T', ' ') AS activity_date_time,
                a.activity_payload #>> '{form_data, activity_data, utm_zone}' AS utm_zone,
                a.activity_payload #>> '{form_data, activity_data, utm_easting}' AS utm_easting,
                a.activity_payload #>> '{form_data, activity_data, utm_northing}' AS utm_northing,
                a.activity_payload #>> '{form_data, activity_data, latitude}' AS latitude,
                a.activity_payload #>> '{form_data, activity_data, longitude}' AS longitude,
                translate(
                  a.activity_payload #>> '{species_positive}', '[]"', '') as species_positive,
                  jsonb_array_length(
                    a.activity_payload #> '{species_positive}') as positive_species_count,
                    translate(
                      a.activity_payload #>> '{species_negative}', '[]"', '') as species_negative,
                      jsonb_array_length(
                        a.activity_payload #> '{species_negative}') as negative_species_count,
                        a.activity_payload #>> '{form_data, activity_data, reported_area}' AS reported_area_sqm,
                        a.activity_payload #>> '{form_data, activity_type_data, pre_treatment_observation}' AS pre_treatment_observation,
                        replace(
                          translate(
                            a.activity_payload #>> '{form_data, activity_type_data, activity_persons}', '"[{}]:', '')::text, 'person_name ', '') AS observation_person,
                            a.activity_payload #>> '{form_data, activity_data, employer_code}' AS employer_code,
                            employer_codes.code_description as employer_description, 
                            f.funding_agency, 
                            a.activity_payload #>> '{form_data, activity_data, access_description}' AS access_description,
                            a.activity_payload #>> '{form_data, activity_data, location_description}' AS location_description,
                            a.activity_payload #>> '{form_data, activity_data, general_comment}' AS comment,
                            a.elevation, 
                            a.well_proximity, 
                            a.geom, 
                            a.geog, 
                            a.biogeoclimatic_zones, 
                            a.regional_invasive_species_organization_areas, 
                            a.invasive_plant_management_areas, 
                            a.ownership, 
                            a.regional_districts, 
                            a.flnro_districts, 
                            a.moti_districts, 
                            a.media_keys, 
                            a.created_timestamp, 
                            a.received_timestamp, 
                            a.deleted_timestamp 
                            FROM 
                              activity_incoming_data a 
                              inner join activity_current c on c.incoming_data_id = a.activity_incoming_data_id 
                              join jurisdiction_agg j on j.activity_incoming_data_id = a.activity_incoming_data_id 
                              join funding_agency_agg f on f.activity_incoming_data_id = a.activity_incoming_data_id 
                              left join code_header employer_code_header on employer_code_header.code_header_title = 'employer_code' 
                              and employer_code_header.valid_to is null 
                              left join code employer_codes on employer_codes.code_header_id = employer_code_header.code_header_id 
                              and a.activity_payload #>> '{form_data, activity_data, employer_code}' = employer_codes.code_name
                            where 
                              deleted_timestamp is null
                          );
 

                          drop view if exists invasivesbc.observation_terrestrial_plant_summary;
                        create view invasivesbc.observation_terrestrial_plant_summary as (
                          with terrestrial_plant_array as (
                            select 
                              activity_incoming_data.activity_incoming_data_id, 
                              activity_subtype, 
                              deleted_timestamp, 
                              created_timestamp, 
                              jsonb_array_elements(
                                activity_incoming_data.activity_payload #> '{form_data, activity_subtype_data, TerrestrialPlants}') as json_array, 
                                (
                                  activity_incoming_data.activity_payload #> '{form_data, activity_subtype_data, Observation_PlantTerrestrial_Information}') as json_data 
                                  from 
                                    activity_incoming_data
                                ), 
                                specific_use_array as (
                                  select 
                                    activity_incoming_data_id, 
                                    convert_string_list_to_array_elements(
                                      activity_incoming_data.activity_payload #>> '{form_data, activity_subtype_data, Observation_PlantTerrestrial_Information, specific_use_code}') as specific_use_code
                                      from 
                                        activity_incoming_data
                                    ), 
                                    specific_use_array_select as (
                                      select 
                                        activity_incoming_data_id, 
                                        specific_use_code, 
                                        specific_use_codes.code_description as specific_use 
                                      from 
                                        specific_use_array 
                                        left join code_header specific_use_code_header on specific_use_code_header.code_header_title = 'specific_use_code' 
                                        and specific_use_code_header.valid_to is null 
                                        left join code specific_use_codes on specific_use_codes.code_header_id = specific_use_code_header.code_header_id 
                                        and specific_use_code = specific_use_codes.code_name
                                    ), 
                                    specific_use_agg as (
                                      select 
                                        s.activity_incoming_data_id, 
                                        string_agg (
                                          s.specific_use, 
                                          ', ' 
                                          order by 
                                            s.specific_use
                                        ) specific_use 
                                      from 
                                        specific_use_array_select s 
                                      group by 
                                        s.activity_incoming_data_id
                                    ), 
                                    terrestrial_plant_select as (
                                      select 
                                        t.activity_incoming_data_id, 
                                        t.json_data #>> '{soil_texture_code}' as soil_texture_code,
                                        soil_texture_codes.code_description as soil_texture, 
                                        t.json_data #>> '{slope_code}' as slope_code,
                                        slope_codes.code_description as slope, 
                                        t.json_data #>> '{aspect_code}' as aspect_code,
                                        aspect_codes.code_description as aspect, 
                                        t.json_data #>> '{research_detection_ind}' as research_observation,
                                        t.json_data #>> '{well_ind}' as visible_well_nearby,
                                        t.json_data #>> '{suitable_for_biocontrol_agent}' as suitable_for_biocontrol_agent,
                                        t.json_array #>> '{occurrence}' as occurrence,
                                        t.json_array #>> '{edna_sample}' as edna_sample,
                                        t.json_array #>> '{invasive_plant_code}' as invasive_plant_code,
                                        invasive_plant_codes.code_description as invasive_plant, 
                                        t.json_array #>> '{plant_life_stage_code}' as plant_life_stage_code,
                                        plant_life_stage_codes.code_description as plant_life_stage, 
                                        t.json_array #>> '{voucher_specimen_collected}' as voucher_specimen_collected,
                                        t.json_array #>> '{invasive_plant_density_code}' as invasive_plant_density_code,
                                        invasive_plant_density_codes.code_description as invasive_plant_density, 
                                        t.json_array #>> '{invasive_plant_distribution_code}' as invasive_plant_distribution_code,
                                        invasive_plant_distribution_codes.code_description as invasive_plant_distribution, 
                                        t.json_array #>> '{voucher_specimen_collection_information, accession_number}' as accession_number,
                                        t.json_array #>> '{voucher_specimen_collection_information, exact_utm_coords, utm_zone}' as voucher_utm_zone,
                                        t.json_array #>> '{voucher_specimen_collection_information, exact_utm_coords, utm_easting}' as voucher_utm_easting,
                                        t.json_array #>> '{voucher_specimen_collection_information, exact_utm_coords, utm_northing}' as voucher_utm_northing,
                                        t.json_array #>> '{voucher_specimen_collection_information, name_of_herbarium}' as name_of_herbarium,
                                        t.json_array #>> '{voucher_specimen_collection_information, voucher_sample_id}' as voucher_sample_id,
                                        t.json_array #>> '{voucher_specimen_collection_information, date_voucher_verified}' as date_voucher_verified,
                                        t.json_array #>> '{voucher_specimen_collection_information, date_voucher_collected}' as date_voucher_collected,
                                        t.json_array #>> '{voucher_specimen_collection_information, voucher_verification_completed_by, person_name}' as voucher_person_name,
                                        t.json_array #>> '{voucher_specimen_collection_information, voucher_verification_completed_by, organization}' as voucher_organization
                                      from 
                                        terrestrial_plant_array t 
                                        left join code_header soil_texture_code_header on soil_texture_code_header.code_header_title = 'soil_texture_code' 
                                        and soil_texture_code_header.valid_to is null 
                                        left join code soil_texture_codes on soil_texture_codes.code_header_id = soil_texture_code_header.code_header_id 
                                        and t.json_data #>> '{soil_texture_code}' = soil_texture_codes.code_name
                                        left join code_header slope_code_header on slope_code_header.code_header_title = 'slope_code' 
                                        and slope_code_header.valid_to is null 
                                        left join code slope_codes on slope_codes.code_header_id = slope_code_header.code_header_id 
                                        and t.json_data #>> '{slope_code}' = slope_codes.code_name
                                        left join code_header aspect_code_header on aspect_code_header.code_header_title = 'aspect_code' 
                                        and aspect_code_header.valid_to is null 
                                        left join code aspect_codes on aspect_codes.code_header_id = aspect_code_header.code_header_id 
                                        and t.json_data #>> '{aspect_code}' = aspect_codes.code_name
                                        left join code_header plant_life_stage_code_header on plant_life_stage_code_header.code_header_title = 'plant_life_stage_code' 
                                        and plant_life_stage_code_header.valid_to is null 
                                        left join code plant_life_stage_codes on plant_life_stage_codes.code_header_id = plant_life_stage_code_header.code_header_id 
                                        and t.json_array #>> '{plant_life_stage_code}' = plant_life_stage_codes.code_name
                                        left join code_header invasive_plant_density_code_header on invasive_plant_density_code_header.code_header_title = 'invasive_plant_density_code' 
                                        and invasive_plant_density_code_header.valid_to is null 
                                        left join code invasive_plant_density_codes on invasive_plant_density_codes.code_header_id = invasive_plant_density_code_header.code_header_id 
                                        and t.json_array #>> '{invasive_plant_density_code}' = invasive_plant_density_codes.code_name
                                        left join code_header invasive_plant_distribution_code_header on invasive_plant_distribution_code_header.code_header_title = 'invasive_plant_distribution_code' 
                                        and invasive_plant_distribution_code_header.valid_to is null 
                                        left join code invasive_plant_distribution_codes on invasive_plant_distribution_codes.code_header_id = invasive_plant_distribution_code_header.code_header_id 
                                        and t.json_array #>> '{invasive_plant_distribution_code}' = invasive_plant_distribution_codes.code_name
                                        left join code_header invasive_plant_code_header on invasive_plant_code_header.code_header_title = 'invasive_plant_code' 
                                        and invasive_plant_code_header.valid_to is null 
                                        left join code invasive_plant_codes on invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id 
                                        and t.json_array #>> '{invasive_plant_code}' = invasive_plant_codes.code_name
                                        ) 
                                  SELECT 
                                    c.activity_incoming_data_id, 
                                    c.activity_id, 
                                    c.short_id, 
                                    c.project_code, 
                                    c.activity_date_time, 
                                    c.reported_area_sqm, 
                                    c.latitude, 
                                    c.longitude, 
                                    c.utm_zone, 
                                    c.utm_easting, 
                                    c.utm_northing, 
                                    c.employer_description as employer, 
                                    c.funding_agency, 
                                    c.jurisdictions, 
                                    c.access_description, 
                                    c.location_description, 
                                    c.comment, 
                                    c.pre_treatment_observation, 
                                    c.observation_person, 
                                    t.soil_texture, 
                                    s.specific_use, 
                                    t.slope as slope, 
                                    t.aspect as aspect, 
                                    t.research_observation, 
                                    t.visible_well_nearby, 
                                    t.suitable_for_biocontrol_agent, 
                                    t.invasive_plant, 
                                    t.occurrence, 
                                    t.invasive_plant_density as density, 
                                    t.invasive_plant_distribution as distribution, 
                                    t.plant_life_stage as life_stage, 
                                    t.voucher_sample_id, 
                                    t.date_voucher_collected, 
                                    t.date_voucher_verified, 
                                    t.name_of_herbarium, 
                                    t.accession_number, 
                                    t.voucher_person_name, 
                                    t.voucher_organization, 
                                    t.voucher_utm_zone, 
                                    t.voucher_utm_easting, 
                                    t.voucher_utm_northing, 
                                    c.elevation, 
                                    c.well_proximity, 
                                    c.biogeoclimatic_zones, 
                                    c.regional_invasive_species_organization_areas, 
                                    c.invasive_plant_management_areas, 
                                    c.ownership, 
                                    c.regional_districts, 
                                    c.flnro_districts, 
                                    c.moti_districts, 
                                    c.media_keys, 
                                    c.created_timestamp, 
                                    c.received_timestamp, 
                                    c.geom, 
                                    c.geog 
                                  FROM 
                                    invasivesbc.common_summary c 
                                    join terrestrial_plant_select t on t.activity_incoming_data_id = c.activity_incoming_data_id 
                                    join specific_use_agg s on s.activity_incoming_data_id = c.activity_incoming_data_id 
                                  where 
                                    deleted_timestamp is null 
                                    and activity_subtype = 'Activity_Observation_PlantTerrestrial'
                                );
`;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(extract_sql_and_reports);
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
