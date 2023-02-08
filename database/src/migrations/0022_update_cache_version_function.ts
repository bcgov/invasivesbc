import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {

  await knex.raw(`
  set search_path=invasivesbc,public;

  CREATE OR REPLACE FUNCTION invasivesbc.update_cache_version()
  RETURNS trigger
  LANGUAGE plpgsql
 AS $function$
     begin
       set search_path = invasivesbc,public;
         INSERT INTO cache_versions(cache_name, updated_at) values (TG_ARGV[0], current_timestamp)
          on conflict (cache_name) do update set updated_at = current_timestamp;
 
          RETURN NULL;
     END;
     $function$
 ;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path=invasivesbc,public;

    CREATE OR REPLACE FUNCTION invasivesbc.update_cache_version()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
    begin
        INSERT INTO cache_versions(cache_name, updated_at) values (TG_ARGV[0], current_timestamp)
         on conflict (cache_name) do update set updated_at = current_timestamp;

         RETURN NULL;
    END;
    $function$
;
    `);
}
