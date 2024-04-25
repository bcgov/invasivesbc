import { Knex } from 'knex';

export async function up(knex: Knex) {

  await knex.raw(
    //language=PostgreSQL
    `
    set search_path = invasivesbc,public;

    ALTER TABLE invasivesbc.activity_incoming_data ADD COLUMN centroid GEOMETRY;
    UPDATE invasivesbc.activity_incoming_data SET centroid = st_centroid(st_multi(geog::geometry));
    

    CREATE OR REPLACE FUNCTION update_centroid()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.centroid = st_centroid(st_multi(NEW.geog::geometry));
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    
   
    create or replace trigger update_centroid_trigger
    before update
    on invasivesbc.activity_incoming_data
    for each row

    execute function update_centroid();
    




    `);

}

export async function down(knex: Knex) {
  await knex.raw(
    //language=PostgreSQL
    `
        set search_path to invasivesbc, public;


    `);
}
