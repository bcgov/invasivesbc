import { Knex } from 'knex';
const DB_SCHEMA = 'invasivesbc';

export async function up(knex: Knex): Promise<void> {
  const roles = [
    {
      description: 'Administrator - Plants Only',
      name: 'administrator_plants'
    },
    {
      description: 'Administrator - Animals Only',
      name: 'administrator_animals'
    },
    {
      description: 'BC Government Staff User - Animals',
      name: 'bcgov_staff_animals'
    },
    {
      description: 'BC Government Staff User - Plants',
      name: 'bcgov_staff_plants'
    },
    {
      description: 'BC Government Staff User - Both',
      name: 'bcgov_staff_both'
    },
    {
      description: 'Contractor Manager - Animals',
      name: 'contractor_manager_animals'
    },
    {
      description: 'Contractor Manager - Plants',
      name: 'contractor_manager_plants'
    },
    {
      description: 'Contractor Manager - Both',
      name: 'contractor_manager_both'
    },
    {
      description: 'Contractor Staff - Animals',
      name: 'contractor_staff_animals'
    },
    {
      description: 'Contractor Staff - Plants',
      name: 'contractor_staff_plants'
    },
    {
      description: 'Contractor Staff - Both',
      name: 'contractor_staff_both'
    },
    {
      description: 'Indigenous/Local Gov/RISO Manager - Animals',
      name: 'indigenous_riso_manager_animals'
    },
    {
      description: 'Indigenous/Local Gov/RISO Manager - Plants',
      name: 'indigenous_riso_manager_plants'
    },
    {
      description: 'Indigenous/Local Gov/RISO Manager - Both',
      name: 'indigenous_riso_manager_both'
    },
    {
      description: 'Indigenous/Local Gov/RISO Staff - Animals',
      name: 'indigenous_riso_staff_animals'
    },
    {
      description: 'Indigenous/Local Gov/RISO Staff - Plants',
      name: 'indigenous_riso_staff_plants'
    },
    {
      description: 'Indigenous/Local Gov/RISO Staff - Both',
      name: 'indigenous_riso_staff_both'
    },
    {
      description: 'Master Administrator',
      name: 'master_administrator'
    },
    {
      description: 'FREP User',
      name: 'frep'
    }
  ];

  // If the current table has duplicate role entries, delete them
  await knex.raw(`
    set search_path=public,invasivesbc;
    DELETE FROM user_role WHERE role_id > 18;
    `);

  // Check if roles already exist in table
  const existingRoleNames = await knex(`${DB_SCHEMA}.user_role`).select('role_name');
  const rolesToInsert = roles.filter((role) => !existingRoleNames.includes(role.name));

  const user_roles = rolesToInsert.map((role) => {
    return {
      role_description: role.description,
      role_name: role.name
    };
  });

  // insert missing roles
  await knex(`${DB_SCHEMA}.user_role`).insert(user_roles).returning('role_id');
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
        set search_path=public,invasivesbc;
        DELETE FROM user_role;
    `);
}
