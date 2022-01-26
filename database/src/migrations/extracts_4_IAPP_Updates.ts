import * as Knex from 'knex';
//For now moving to one consolidated migration for plant reporting.

//Why:  Knex silently failing on view create, making troubleshooting which of the 10+ plant views is failing.
//      Deploying plant views then becomes a process of manually pasting the sql to the db.
//      Having one consolidated file allows for quick troubleshooting and deployments.
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  set search_path=invasivesbc,public;

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





  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
  set search_path=invasivesbc,public;
drop index if exists point_of_interest_survey_date_idx;
drop index if exists point_of_interest_chemical_treatment_date_idx;
drop index if exists point_of_interest_chemical_monitoring_date_idx;
drop index if exists point_of_interest_biological_dispersal_date_idx;
drop index if exists point_of_interest_biological_treatment_date_idx;
drop index if exists point_of_interest_biological_treatment_monitoring_date_idx;
drop index if exists point_of_interest_mechanical_treatment_date_idx;
drop index if exists point_of_interest_mechanical_treatment_monitoring_date_idx;
drop view if exists IAPP_SITE_SUMMARY_slow cascade;
drop materialized view if exists iapp_site_summary;
`);
}
