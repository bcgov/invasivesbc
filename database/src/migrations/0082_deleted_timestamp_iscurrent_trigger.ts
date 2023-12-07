import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    set search_path=invasivesbc,public;
 
create or replace function update_iscurrent()
returns trigger as $$
begin
  if new.deleted_timestamp is not null then
    new.iscurrent = false;
  end if;
  return new;
end;
$$ language plpgsql;


create or replace trigger update_iscurrent_trigger
before update on activity_incoming_data
for each row
execute function update_iscurrent();
`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
  
  set search_path = invasivesbc,public;

  `);
}
