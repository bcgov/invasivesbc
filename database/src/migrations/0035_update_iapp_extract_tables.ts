import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    SET search_path=invasivesbc,public;

drop table if exists site_selection_extract cascade;
drop table if exists survey_extract cascade;
drop table if exists biological_dispersal_extract;
drop table if exists biological_monitoring_extract;
drop table if exists biological_treatment_extract;
drop table if exists chemical_monitoring_extract;
drop table if exists chemical_treatment_extract;
drop table if exists invasive_plant_no_treatment_extract;
drop table if exists mechanical_monitoring_extract;
drop table if exists mechanical_treatment_extract;
drop table if exists planning_extract;


    CREATE TABLE invasivesbc.biological_dispersal_extract (
      biologicaldispersalid int4 NOT NULL,
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
      agent_count int4 null,
      plant_count int4 null,
      count_duration int4 null,
      foliar_feeding_damage varchar(1) NOT NULL,
      rootfeeding_damage varchar(1) NOT NULL,
      seedfeeding_damage varchar(1) NOT NULL,
      oviposition_marks varchar(1) NOT NULL,
      eggs_present varchar(1) NOT NULL,
      larvae_present varchar(1) NOT NULL,
      pupae_present varchar(1) NOT NULL,
      adults_present varchar(1) NOT NULL,
      tunnels_present varchar(1) NOT NULL,
      primary_surveyor varchar(120) NULL,
      other_surveyors varchar(1000) null,
      dispersal_utm_zone int4 null,
      dispersal_utm_easting int null,
      dispersal_utm_northing int4 null,
      estimated_area_hectares numeric(10, 4) NULL,
      distribution varchar(120) NULL,
      density varchar(120) NULL,
      monitoring_comments varchar(2000) NULL,
      site_location varchar(2000) NULL,
      site_comments varchar(2000) NULL,
      entered_by varchar(100) not null,
      date_entered date not null,
      updated_by varchar(100) not null,
      date_updated date not null,
      regional_district varchar(200) NULL,
      regional_invasive_species_organization varchar(200) NULL
    );

    CREATE TABLE invasivesbc.biological_monitoring_extract (
      biologicalmonitoringid int4 NOT NULL,
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
      primary_surveyor varchar(120) NULL,
      other_surveyors varchar(1000) null,
      agent_count int4 null,
      plant_count int4 null,
      count_duration int null,
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
      monitoring_comments varchar(2000) NULL,
      site_location varchar(2000) NULL,
      site_comments varchar(2000) NULL,
      entered_by varchar(100) not null,
      date_entered date not null,
      updated_by varchar(100) not null,
      date_updated date not null,
      regional_district varchar(200) NULL,
      regional_invasive_species_organization varchar(200) NULL
    );

    CREATE TABLE invasivesbc.biological_treatment_extract (
      biotreatmentid int4 NOT NULL,
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
      collection_date date null,
      agent_life_stage varchar(10) null,
      release_time time null,
      primary_applicator varchar(120) NOT NULL,
      other_applicators varchar(1000) null,
      release_utm_zone int4 null,
      release_utm_easting int4 null,
      release_utm_northing int4 null,
      site_location varchar(2000) NULL,
      site_comments varchar(2000) NULL,
      entered_by varchar(100) not null,
      date_entered date not null,
      updated_by varchar(100) not null,
      date_updated date not null,
      regional_district varchar(200) NULL,
      regional_invasive_species_organization varchar(200) NULL
    );

    CREATE TABLE invasivesbc.chemical_monitoring_extract (
      chemicalmonitoringid int4 NOT NULL,
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
      other_surveyors varchar(1000) null,
      efficacy_rating varchar(120) NOT NULL,
      estimated_area_hectares numeric(10, 4) NOT NULL,
      distribution varchar(120) NULL,
      density varchar(120) NULL,
      monitoring_comments varchar(2000) NULL,
      site_location varchar(2000) NULL,
      site_comments varchar(2000) NULL,
      entered_by varchar(100) not null,
      date_entered date not null,
      updated_by varchar(100) not null,
      date_updated date not null,
      regional_district varchar(200) NULL,
      regional_invasive_species_organization varchar(200) NULL
    );

    CREATE TABLE invasivesbc.chemical_treatment_extract (
      chemicaltreatmentid int4 NOT NULL,
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
      area_treated_hectares numeric(10, 4) NULL,
      amount_of_mix_used_litres numeric(10, 5) NULL,
      application_rate_litres_per_hectare numeric(6, 2) NULL,
      delivery_rate_litres_per_hectare int4 NULL,
      dilution_percent numeric(8, 4) NULL,
      amount_of_undiluted_herbicide_used_litres numeric(8, 4) NULL,
      tank_mix varchar(3) NULL,
      application_time time null,
      temperature int4 null,
      wind_speed int4 null,
      wind_direction int4 null, 
      humidity int4 null,
      employer varchar(120) NULL,
      primary_applicator varchar(120) NOT NULL,
      other_applicators varchar(1000) NOT NULL,
      site_location varchar(2000) NULL,
      site_comments varchar(2000) NULL,
      entered_by varchar(100) not null,
      date_entered date not null,
      updated_by varchar(100) not null,
      date_updated date not null,
      regional_district varchar(200) NULL,
      regional_invasive_species_organization varchar(200) NULL
    );

    CREATE TABLE invasivesbc.invasive_plant_no_treatment_extract (
      invasiveplantnotreatmentid int4 NOT NULL,
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
      last_surveyed_date date null,
      survey_agency varchar(120) NOT NULL,
      primary_surveyor varchar(120) NULL,
      other_surveyors varchar(1000) null,
      site_location varchar(2000) NULL,
      site_comments varchar(2000) NULL,
      entered_by varchar(100) not null,
      date_entered date not null,
      updated_by varchar(100) not null,
      date_updated date not null,
      regional_district varchar(200) NULL,
      regional_invasive_species_organization varchar(200) NULL
    );

    CREATE TABLE invasivesbc.mechanical_monitoring_extract (
      mechmonitoringid int4 NOT NULL,
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
      other_surveyors varchar(1000) null,
      efficacy_rating varchar(120) NOT NULL,
      estimated_area_hectares numeric(10, 4) NULL,
      distribution varchar(120) NULL,
      density varchar(120) NULL,
      monitoring_comments varchar(2000) NULL,
      site_location varchar(2000) NULL,
      site_comments varchar(2000) NULL,
      entered_by varchar(100) not null,
      date_entered date not null,
      updated_by varchar(100) not null,
      date_updated date not null,
      regional_district varchar(200) NULL,
      regional_invasive_species_organization varchar(200) NULL
    );

    CREATE TABLE invasivesbc.mechanical_treatment_extract (
      mechanicaltreatmentid int4 NOT NULL,
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
      other_applicators varchar(1000),
      site_location varchar(2000) NULL,
      site_comments varchar(2000) NULL,
      entered_by varchar(100) not null,
      date_entered date not null,
      updated_by varchar(100) not null,
      date_updated date not null,
      regional_district varchar(200) NULL,
      regional_invasive_species_organization varchar(200) NULL
    );

    CREATE TABLE invasivesbc.planning_extract (
      planningid int4 NOT NULL,
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
      entered_by varchar(100) not null,
      date_entered date not null,
      updated_by varchar(100) not null,
      date_updated date not null,
      regional_district varchar(200) NULL,
      regional_invasive_species_organization varchar(200) NULL
    );
   
    CREATE TABLE invasivesbc.site_selection_extract (
      siteselectionid int4 NOT NULL,
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
      other_surveyors varchar(1000) null,
      estimated_area_hectares numeric(10, 4) NULL,
      distribution varchar(120) NULL,
      density varchar(120) null,
      slope_percent int4 NULL,
      aspect int4 NULL,
      elevation int4 NULL,
      treatment_date date NULL,
      treatment_type varchar(120) NULL,
      all_species_on_site varchar(2000) NOT NULL,
      site_location varchar(2000) NULL,
      site_comments varchar(2000) NULL,
      entered_by varchar(100) not null,
      date_entered date not null,
      updated_by varchar(100) not null,
      date_updated date not null,
      regional_district varchar(200) NULL,
      regional_invasive_species_organization varchar(200) NULL
    );

    CREATE TABLE invasivesbc.survey_extract (
      surveyid int4 NOT NULL,
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
      survey_type varchar(20) null,
      estimated_area_hectares numeric(10, 4) NULL,
      distribution varchar(120) NULL,
      density varchar(120) NULL,
      survey_agency varchar(120) NOT NULL,
      employer varchar(120) null,
      primary_surveyor varchar(120) NULL,
      other_surveyors varchar(1000) null,
      survey_comments varchar(2000) NULL,
      site_location varchar(2000) NULL,
      site_comments varchar(2000) NULL,
      entered_by varchar(100) not null,
      date_entered date not null,
      updated_by varchar(100) not null,
      date_updated date not null,
      regional_district varchar(200) NULL,
      regional_invasive_species_organization varchar(200) NULL
    );

   CREATE OR REPLACE VIEW invasivesbc.iapp_species_status
    AS WITH most_recent_positive_occurences AS (
            SELECT se.site_id,
                max(se.survey_date) AS positive_occurrence_date,
                se.invasive_plant
              FROM invasivesbc.survey_extract se
              WHERE se.estimated_area_hectares > 0::numeric
              GROUP BY se.site_id, se.invasive_plant
            ), most_recent_negative_occurrences AS (
            SELECT se.site_id,
                max(se.survey_date) AS negative_occurrence_date,
                se.invasive_plant
              FROM invasivesbc.survey_extract se
              WHERE se.estimated_area_hectares = 0::numeric
              GROUP BY se.site_id, se.invasive_plant
            ), most_recent_both AS (
            SELECT a.site_id,
                a.invasive_plant,
                a.positive_occurrence_date,
                b.negative_occurrence_date
              FROM most_recent_positive_occurences a
                LEFT JOIN most_recent_negative_occurrences b ON a.site_id = b.site_id AND a.invasive_plant::text = b.invasive_plant::text
            ), site_species_status AS (
            SELECT most_recent_both.site_id,
                most_recent_both.invasive_plant,
                    CASE
                        WHEN most_recent_both.positive_occurrence_date > most_recent_both.negative_occurrence_date OR most_recent_both.positive_occurrence_date IS NOT NULL AND most_recent_both.negative_occurrence_date IS NULL THEN true
                        ELSE false
                    END AS is_species_positive,
                    CASE
                        WHEN most_recent_both.negative_occurrence_date > most_recent_both.positive_occurrence_date OR most_recent_both.negative_occurrence_date IS NOT NULL AND most_recent_both.positive_occurrence_date IS NULL THEN true
                        ELSE false
                    END AS is_species_negative
              FROM most_recent_both
            )
    SELECT site_species_status.site_id,
        site_species_status.invasive_plant,
        site_species_status.is_species_positive,
        site_species_status.is_species_negative
      FROM site_species_status
      ORDER BY site_species_status.is_species_negative DESC;
   
    create materialized view invasivesbc.iapp_imported_images_map as
        select i.id as imported_image_id,
           coalesce(nullif(i.site_id, 0),
                    mte.site_id,
                    bte.site_id,
                    cte.site_id,
                    cme.site_id,
                    bme.site_id,
                    mme.site_id,
                    bde.site_id,
                    se.site_id,
                    sse.site_id,
                    ipnte.site_id) as mapped_site_id
    from iapp_imported_images as i
             left outer join mechanical_treatment_extract mte on i.treatment_id = mte.mechanicaltreatmentid
             left outer join biological_treatment_extract bte on i.treatment_id = bte.biotreatmentid
             left outer join chemical_treatment_extract cte on i.treatment_id = cte.chemicaltreatmentid
             left outer join chemical_monitoring_extract cme on i.treatment_id = cme.chemicalmonitoringid
             left outer join biological_monitoring_extract bme on i.treatment_id = bme.biologicalmonitoringid
             left outer join mechanical_monitoring_extract mme on i.treatment_id = mme.mechmonitoringid
             left outer join biological_dispersal_extract bde on i.treatment_id = bde.biologicaldispersalid
             left outer join survey_extract se on i.treatment_id = se.site_id
             left outer join site_selection_extract sse on sse.siteselectionid = i.treatment_id
             left outer join invasive_plant_no_treatment_extract ipnte
                             on i.treatment_id = ipnte.invasiveplantnotreatmentid;
      
         CREATE OR REPLACE VIEW invasivesbc.iapp_site_summary_slow
    AS WITH sites_grouped AS (
            SELECT site_selection_extract.site_id,
                site_selection_extract.all_species_on_site,
                site_selection_extract.decimal_longitude,
                site_selection_extract.decimal_latitude
              FROM invasivesbc.site_selection_extract
              GROUP BY site_selection_extract.site_id, site_selection_extract.all_species_on_site, site_selection_extract.decimal_longitude, site_selection_extract.decimal_latitude
            ), date_summary AS (
            SELECT sse_1.site_id,
                min(se.survey_date) AS min_survey,
                max(se.survey_date) AS max_survey,
                min(cte.treatment_date) AS min_chemical_treatment_dates,
                max(cte.treatment_date) AS max_chemical_treatment_dates,
                min(cme.inspection_date) AS min_chemical_treatment_monitoring_dates,
                max(cme.inspection_date) AS max_chemical_treatment_monitoring_dates,
                min(bde.inspection_date) AS min_bio_dispersal_dates,
                max(bde.inspection_date) AS max_bio_dispersal_dates,
                min(bte.treatment_date) AS min_bio_treatment_dates,
                max(bte.treatment_date) AS max_bio_treatment_dates,
                min(bme.inspection_date) AS min_bio_treatment_monitoring_dates,
                max(bme.inspection_date) AS max_bio_treatment_monitoring_dates,
                min(mte.treatment_date) AS min_mechanical_treatment_dates,
                max(mte.treatment_date) AS max_mechanical_treatment_dates,
                min(mme.inspection_date) AS min_mechanical_treatment_monitoring_dates,
                max(mme.inspection_date) AS max_mechanical_treatment_monitoring_dates
              FROM sites_grouped sse_1
                LEFT JOIN invasivesbc.survey_extract se ON sse_1.site_id = se.site_id
                LEFT JOIN invasivesbc.chemical_treatment_extract cte ON sse_1.site_id = cte.site_id
                LEFT JOIN invasivesbc.chemical_monitoring_extract cme ON sse_1.site_id = cme.site_id
                LEFT JOIN invasivesbc.biological_dispersal_extract bde ON sse_1.site_id = bde.site_id
                LEFT JOIN invasivesbc.biological_treatment_extract bte ON sse_1.site_id = bte.site_id
                LEFT JOIN invasivesbc.biological_monitoring_extract bme ON sse_1.site_id = bme.site_id
                LEFT JOIN invasivesbc.mechanical_treatment_extract mte ON sse_1.site_id = mte.site_id
                LEFT JOIN invasivesbc.mechanical_monitoring_extract mme ON sse_1.site_id = mme.site_id
              GROUP BY sse_1.site_id
            )
    SELECT sse.site_id,
        sse.all_species_on_site,
        sse.decimal_longitude,
        sse.decimal_latitude,
        ds.min_survey,
        ds.max_survey,
        ds.min_chemical_treatment_dates,
        ds.max_chemical_treatment_dates,
        ds.min_chemical_treatment_monitoring_dates,
        ds.max_chemical_treatment_monitoring_dates,
        ds.min_bio_dispersal_dates,
        ds.max_bio_dispersal_dates,
        ds.min_bio_treatment_dates,
        ds.max_bio_treatment_dates,
        ds.min_bio_treatment_monitoring_dates,
        ds.max_bio_treatment_monitoring_dates,
        ds.min_mechanical_treatment_dates,
        ds.max_mechanical_treatment_dates,
        ds.min_mechanical_treatment_monitoring_dates,
        ds.max_mechanical_treatment_monitoring_dates,
            CASE
                WHEN ds.min_survey IS NULL THEN false
                ELSE true
            END AS has_surveys,
            CASE
                WHEN ds.max_survey IS NULL THEN false
                ELSE true
            END AS has_biological_treatment_monitorings,
            CASE
                WHEN ds.max_bio_treatment_dates IS NULL THEN false
                ELSE true
            END AS has_biological_treatments,
            CASE
                WHEN ds.min_bio_dispersal_dates IS NULL THEN false
                ELSE true
            END AS has_biological_dispersals,
            CASE
                WHEN ds.max_chemical_treatment_monitoring_dates IS NULL THEN false
                ELSE true
            END AS has_chemical_treatment_monitorings,
            CASE
                WHEN ds.min_chemical_treatment_dates IS NULL THEN false
                ELSE true
            END AS has_chemical_treatments,
            CASE
                WHEN ds.max_mechanical_treatment_dates IS NULL THEN false
                ELSE true
            END AS has_mechanical_treatments,
            CASE
                WHEN ds.max_mechanical_treatment_monitoring_dates IS NULL THEN false
                ELSE true
            END AS has_mechanical_treatment_monitorings
      FROM sites_grouped sse
        JOIN date_summary ds ON ds.site_id = sse.site_id;

    CREATE MATERIALIZED VIEW invasivesbc.iapp_site_summary
      TABLESPACE pg_default
      AS WITH jurisdiction_data AS (
              SELECT DISTINCT regexp_split_to_array(survey_extract.jurisdictions::text, '($1<=)(, )'::text) AS jurisdictions,
                  survey_extract.site_id
                FROM invasivesbc.survey_extract
              ),
      paper_file_list AS (SELECT DISTINCT(se.site_paper_file_id), se.site_id 
	  	FROM survey_extract se 
	  	GROUP BY se.site_id, se.site_paper_file_id),
	  agencies AS (SELECT sea.site_id, string_agg(DISTINCT(sea.survey_agency), ', ') AS agency_agg
	  	FROM survey_extract sea 
	  	GROUP BY sea.site_id),
	  areas AS (SELECT DISTINCT ON(z.site_id) z.site_id, z.estimated_area_hectares, z.survey_date 
	    FROM invasivesbc.survey_extract z
	    ORDER BY z.site_id, z.survey_date DESC)
      SELECT i.site_id,
          i.all_species_on_site,
          i.decimal_longitude,
          i.decimal_latitude,
          i.min_survey,
          i.max_survey,
          i.min_chemical_treatment_dates,
          i.max_chemical_treatment_dates,
          i.min_chemical_treatment_monitoring_dates,
          i.max_chemical_treatment_monitoring_dates,
          i.min_bio_dispersal_dates,
          i.max_bio_dispersal_dates,
          i.min_bio_treatment_dates,
          i.max_bio_treatment_dates,
          i.min_bio_treatment_monitoring_dates,
          i.max_bio_treatment_monitoring_dates,
          i.min_mechanical_treatment_dates,
          i.max_mechanical_treatment_dates,
          i.min_mechanical_treatment_monitoring_dates,
          i.max_mechanical_treatment_monitoring_dates,
          i.has_surveys,
          i.has_biological_treatment_monitorings,
          i.has_biological_treatments,
          i.has_biological_dispersals,
          i.has_chemical_treatment_monitorings,
          i.has_chemical_treatments,
          i.has_mechanical_treatments,
          i.has_mechanical_treatment_monitorings,
          jd.jurisdictions,
          z.estimated_area_hectares AS reported_area,
          string_to_array(i.all_species_on_site::text, ', '::text) AS all_species_on_site_as_array,
          p.site_paper_file_id,
          a.agency_agg AS agencies
        FROM invasivesbc.iapp_site_summary_slow i
          JOIN jurisdiction_data jd ON i.site_id = jd.site_id
          JOIN paper_file_list p ON jd.site_id = p.site_id
          JOIN agencies a ON p.site_id = a.site_id
          JOIN areas z ON a.site_id = z.site_id
        WHERE 1 = 1
      WITH DATA;
      
      CREATE MATERIALIZED VIEW invasivesbc.iapp_site_summary_and_geojson
      TABLESPACE pg_default
      AS SELECT i.site_id,
          i.all_species_on_site,
          i.decimal_longitude,
          i.decimal_latitude,
          i.min_survey,
          i.max_survey,
          i.min_chemical_treatment_dates,
          i.max_chemical_treatment_dates,
          i.min_chemical_treatment_monitoring_dates,
          i.max_chemical_treatment_monitoring_dates,
          i.min_bio_dispersal_dates,
          i.max_bio_dispersal_dates,
          i.min_bio_treatment_dates,
          i.max_bio_treatment_dates,
          i.min_bio_treatment_monitoring_dates,
          i.max_bio_treatment_monitoring_dates,
          i.min_mechanical_treatment_dates,
          i.max_mechanical_treatment_dates,
          i.min_mechanical_treatment_monitoring_dates,
          i.max_mechanical_treatment_monitoring_dates,
          i.has_surveys,
          i.has_biological_treatment_monitorings,
          i.has_biological_treatments,
          i.has_biological_dispersals,
          i.has_chemical_treatment_monitorings,
          i.has_chemical_treatments,
          i.has_mechanical_treatments,
          i.has_mechanical_treatment_monitorings,
          i.jurisdictions,
          i.reported_area,
          i.all_species_on_site_as_array,
          i.site_paper_file_id,
          i.agencies,
          CASE WHEN (i.has_biological_treatment_monitorings OR 
              i.has_chemical_treatment_monitorings OR
              i.has_mechanical_treatment_monitorings) 
            THEN 'Yes' 
            ELSE 'No' 
          END AS monitored,
          json_build_object('type', 'Feature', 'properties', json_build_object('site_id', i.site_id, 'species', i.all_species_on_site, 'has_surveys', i.has_surveys, 'has_biological_treatments', i.has_biological_treatments, 'has_biological_monitorings', i.has_biological_treatment_monitorings, 'has_biological_dispersals', i.has_biological_dispersals, 'has_chemical_treatments', i.has_chemical_treatments, 'has_chemical_monitorings', i.has_chemical_treatment_monitorings, 'has_mechanical_treatments', i.has_mechanical_treatments, 'has_mechanical_monitorings', i.has_mechanical_treatment_monitorings, 'earliest_survey', i.min_survey, 'latest_survey', i.max_survey, 'earliest_chemical_treatment', i.min_chemical_treatment_dates, 'latest_chemical_treatment', i.max_chemical_treatment_dates, 'earliest_chemical_monitoring', i.min_chemical_treatment_monitoring_dates, 'latest_chemical_monitoring', i.max_chemical_treatment_monitoring_dates, 'earliest_bio_dispersal', i.min_bio_dispersal_dates, 'latest_bio_dispersal', i.max_bio_dispersal_dates, 'earliest_bio_treatment', i.min_bio_treatment_dates, 'latest_bio_treatment', i.max_bio_treatment_dates, 'earliest_bio_monitoring', i.min_bio_treatment_monitoring_dates, 'latest_bio_monitoring', i.max_bio_treatment_monitoring_dates, 'earliest_mechanical_treatment', i.min_mechanical_treatment_dates, 'latest_mechanical_treatment', i.max_mechanical_treatment_dates, 'earliest_mechanical_monitoring', i.min_mechanical_treatment_monitoring_dates, 'latest_mechanical_monitoring', i.max_mechanical_treatment_monitoring_dates, 'reported_area', i.reported_area, 'jurisdictions', i.jurisdictions), 'geometry', st_asgeojson(s.geog)::jsonb) AS geojson
        FROM invasivesbc.iapp_site_summary i
          JOIN invasivesbc.iapp_spatial s ON i.site_id = s.site_id
        WHERE 1 = 1
      WITH DATA;

`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path = invasivesbc,public;

    drop table if exists site_selection_extract cascade;
    drop table if exists survey_extract cascade;
    drop table if exists biological_dispersal_extract;
    drop table if exists biological_monitoring_extract;
    drop table if exists biological_treatment_extract;
    drop table if exists chemical_monitoring_extract;
    drop table if exists chemical_treatment_extract;
    drop table if exists invasive_plant_no_treatment_extract;
    drop table if exists mechanical_monitoring_extract;
    drop table if exists mechanical_treatment_extract;
    drop table if exists planning_extract;
  `);
}
