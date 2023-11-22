import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
   
    set search_path=invasivesbc,public;
    ALTER TABLE invasivesbc.activity_incoming_data add if not exists iscurrent boolean NOT NULL DEFAULT true;

    CREATE OR REPLACE FUNCTION invasivesbc.current_activity_function()
    RETURNS trigger
     LANGUAGE plpgsql
   AS $function$
     BEGIN
             update invasivesbc.activity_incoming_data
             set iscurrent = false
             where activity_id = new.activity_id
             and activity_incoming_data_id != new.activity_incoming_data_id
             and new.deleted_timestamp is null;
            
             update invasivesbc.activity_incoming_data
             set deleted_timestamp = NOW()
             where activity_id = new.activity_id
             and activity_incoming_data_id != new.activity_incoming_data_id
             and deleted_timestamp is null;
            
             RETURN NEW;
   
     END;
   $function$
   ;
   
   create or replace trigger update_activity_current after
   insert
       on
       invasivesbc.activity_incoming_data for each row execute function invasivesbc.current_activity_function() ;


       update invasivesbc.activity_incoming_data 
       set iscurrent = false ,
       deleted_timestamp = NOW()
       where activity_incoming_data_id not in (select incoming_data_id from activity_current);

       CREATE  INDEX if not exists activity_incoming_data_activity_id_and_current_idx ON invasivesbc.activity_incoming_data (activity_id,iscurrent);
       create   index if not exists  activity_incoming_data_iscurrent_idx ON invasivesbc.activity_incoming_data (iscurrent);
       CREATE INDEX if not exists activity_incoming_data_form_status_idx ON invasivesbc.activity_incoming_data (form_status);
`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
  

  `);
}
