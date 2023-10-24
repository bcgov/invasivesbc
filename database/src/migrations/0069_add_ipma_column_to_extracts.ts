import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    set search_path=invasivesbc,public;

    alter table site_selection_extract add column if not exists invasive_plant_management_area varchar(200);
    alter table survey_extract add column if not exists invasive_plant_management_area varchar(200);
    alter table biological_dispersal_extract add column if not exists invasive_plant_management_area varchar(200);
    alter table biological_monitoring_extract add column if not exists invasive_plant_management_area varchar(200);
    alter table biological_treatment_extract add column if not exists invasive_plant_management_area varchar(200);
    alter table chemical_monitoring_extract add column if not exists invasive_plant_management_area varchar(200);
    alter table chemical_treatment_extract add column if not exists invasive_plant_management_area varchar(200);
    alter table invasive_plant_no_treatment_extract add column if not exists invasive_plant_management_area varchar(200);
    alter table mechanical_monitoring_extract add column if not exists invasive_plant_management_area varchar(200);
    alter table mechanical_treatment_extract add column if not exists invasive_plant_management_area varchar(200);
    alter table planning_extract add column if not exists invasive_plant_management_area varchar(200);
    
    update site_selection_extract as s
    set invasive_plant_management_area = r.dropdown_n
    from (
    select i.site_id, r.dropdown_n from iapp_spatial i 
    join invasive_plant_management_areas r on st_intersects(i.geog, r.geog)
    ) r 
    where r.site_id = s.site_id;
    
    UPDATE survey_extract AS x
    SET invasive_plant_management_area = s.invasive_plant_management_area
    FROM site_selection_extract s
    WHERE x.site_id = s.site_id;
    
    UPDATE biological_dispersal_extract AS x
    SET invasive_plant_management_area = s.invasive_plant_management_area
    FROM site_selection_extract s
    WHERE x.site_id = s.site_id;
    
    UPDATE biological_monitoring_extract AS x
    SET invasive_plant_management_area = s.invasive_plant_management_area
    FROM site_selection_extract s
    WHERE x.site_id = s.site_id;
    
    UPDATE biological_treatment_extract AS x
    SET invasive_plant_management_area = s.invasive_plant_management_area
    FROM site_selection_extract s
    WHERE x.site_id = s.site_id;
    
    UPDATE chemical_monitoring_extract AS x
    SET invasive_plant_management_area = s.invasive_plant_management_area
    FROM site_selection_extract s
    WHERE x.site_id = s.site_id;
    
    UPDATE chemical_treatment_extract AS x
    SET invasive_plant_management_area = s.invasive_plant_management_area
    FROM site_selection_extract s
    WHERE x.site_id = s.site_id;
    
    UPDATE invasive_plant_no_treatment_extract AS x
    SET invasive_plant_management_area = s.invasive_plant_management_area
    FROM site_selection_extract s
    WHERE x.site_id = s.site_id;
    
    UPDATE mechanical_monitoring_extract AS x
    SET invasive_plant_management_area = s.invasive_plant_management_area
    FROM site_selection_extract s
    WHERE x.site_id = s.site_id;
    
    UPDATE mechanical_treatment_extract AS x
    SET invasive_plant_management_area = s.invasive_plant_management_area
    FROM site_selection_extract s
    WHERE x.site_id = s.site_id;
    
    UPDATE planning_extract AS x
    SET invasive_plant_management_area = s.invasive_plant_management_area
    FROM site_selection_extract s
    WHERE x.site_id = s.site_id;
`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`

  set search_path='invasivesbc';



  `);
}
