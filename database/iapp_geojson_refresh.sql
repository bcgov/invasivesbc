SET search_path=invasivesbc,public;

REFRESH MATERIALIZED VIEW iapp_site_summary;
 
drop materialized view iapp_site_summary_and_geojson;

drop table if exists invasivesbc.iapp_spatial;

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

create materialized view iapp_site_summary_and_geojson as (SELECT
      i.*,
      json_build_object
      (
        'type', 'Feature',
        'properties', json_build_object
        (
          'site_id', i.site_id,
          'species', i.all_species_on_site,
          'has_surveys', i.has_surveys,
          'has_biological_treatments', i.has_biological_treatments,
          'has_biological_monitorings', i.has_biological_treatment_monitorings,
          'has_biological_dispersals', i.has_biological_dispersals,
          'has_chemical_treatments', i.has_chemical_treatments,
          'has_chemical_monitorings', i.has_chemical_treatment_monitorings,
          'has_mechanical_treatments', i.has_mechanical_treatments,
          'has_mechanical_monitorings', i.has_mechanical_treatment_monitorings,
          'earliest_survey', i.min_survey,
          'latest_survey', i.max_survey,
          'earliest_chemical_treatment', i.min_chemical_treatment_dates,
          'latest_chemical_treatment', i.max_chemical_treatment_dates,
          'earliest_chemical_monitoring', i.min_chemical_treatment_monitoring_dates,
          'latest_chemical_monitoring', i.max_chemical_treatment_monitoring_dates,
          'earliest_bio_dispersal', i.min_bio_dispersal_dates,
          'latest_bio_dispersal', i.max_bio_dispersal_dates,
          'earliest_bio_treatment', i.min_bio_treatment_dates,
          'latest_bio_treatment', i.max_bio_treatment_dates,
          'earliest_bio_monitoring', i.min_bio_treatment_monitoring_dates,
          'latest_bio_monitoring', i.max_bio_treatment_monitoring_dates,
          'earliest_mechanical_treatment', i.min_mechanical_treatment_dates,
          'latest_mechanical_treatment', i.max_mechanical_treatment_dates,
          'earliest_mechanical_monitoring', i.min_mechanical_treatment_monitoring_dates,
          'latest_mechanical_monitoring', i.max_mechanical_treatment_monitoring_dates
        ),
        'geometry', public.st_asGeoJSON(s.geog)::jsonb
      ) as "geojson"
    FROM iapp_site_summary i JOIN iapp_spatial s ON i.site_id = s.site_id
    WHERE 1=1);
    
    GRANT SELECT ON iapp_site_summary_and_geojson TO invasivebc;
    
       REFRESH MATERIALIZED VIEW iapp_site_summary_and_geojson;