import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    set search_path = invasivesbc,public;

    create materialized view iapp_imported_images_map as
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
`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path = invasivesbc,public;

    drop materialized view if exists iapp_imported_images_map;
  `);
}
