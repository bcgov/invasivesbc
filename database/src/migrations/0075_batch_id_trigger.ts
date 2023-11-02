import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    set 
    search_path = invasivesbc, 
    public;
  CREATE 
  OR REPLACE FUNCTION invasivesbc.batch_and_row_id_autofill() RETURNS trigger LANGUAGE plpgsql AS $function$
  
  
  
  
  
  begin if(new.batch_id is null) then 
  
  
  new.batch_id := (
    select 
      batch_id 
    from 
      invasivesbc.activity_incoming_data 
    where 
      batch_id is not null 
      and activity_id = new.activity_id 
    limit 
      1
  ) ;end if;
  if(new.row_number is null) then new.row_number := (
    select 
      row_number 
    from 
      invasivesbc.activity_incoming_data 
    where 
      row_number is not null 
      and activity_id = new.activity_id 
    limit 
      1
  ) ;end if;
  return new;
  END;
  $function$ ;
  
  
  
  CREATE TRIGGER maintain_batch_and_row_id BEFORE INSERT 
  OR 
  UPDATE 
    ON invasivesbc.activity_incoming_data 
   FOR EACH ROW EXECUTE procedure batch_and_row_id_autofill();
  
`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`

  set search_path='invasivesbc';



  `);
}
