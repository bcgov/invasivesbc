import * as Knex from 'knex';
const DB_SCHEMA = 'invasivesbc';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path=invasivesbc,public;

    alter table user_role add column metabase_group varchar(100) null;
`);

  const metabaseUserRoles = [
    'administrator_plants',
    'administrator_animals',
    'bcgov_staff_animals',
    'bcgov_staff_plants',
    'bcgov_staff_both',
    'contractor_manager_animals',
    'contractor_manager_plants',
    'contractor_manager_both',
    'contractor_staff_animals',
    'contractor_staff_plants',
    'contractor_staff_both',
    'indigenous_riso_manager_animals',
    'indigenous_riso_manager_plants',
    'indigenous_riso_manager_both',
    'indigenous_riso_staff_animals',
    'indigenous_riso_staff_plants',
    'indigenous_riso_staff_both'
  ];
  const metabaseAdminRoles = ['master_administrator'];

  await knex(`${DB_SCHEMA}.user_role`)
    .update({ metabase_group: 'standard_user' })
    .whereIn('role_name', metabaseUserRoles);
  await knex(`${DB_SCHEMA}.user_role`)
    .update({ metabase_group: 'master_admin' })
    .whereIn('role_name', metabaseAdminRoles);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path=invasivesbc,public;

    alter table user_role drop column metabase_group;
`);
}
