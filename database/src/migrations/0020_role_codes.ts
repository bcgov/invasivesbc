import { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.raw(`
  INSERT INTO invasivesbc.user_role(role_description, role_name, metabase_group)
  SELECT 
    role_description,
    role_name,
    metabase_group
  FROM 
    (VALUES 
      ('Administrator - Plants Only', 'administrator_plants', 'standard_user'),
      ('Administrator - Animals Only', 'administrator_animals', 'standard_user'),
      ('BC Government Staff User - Animals', 'bcgov_staff_animals', 'standard_user'),
      ('BC Government Staff User - Plants', 'bcgov_staff_plants', 'standard_user'),
      ('BC Government Staff User - Both', 'bcgov_staff_both', 'standard_user'),
      ('Contractor Manager - Animals', 'contractor_manager_animals', 'standard_user'),
      ('Contractor Manager - Plants', 'contractor_manager_plants', 'standard_user'),
      ('Contractor Manager - Both', 'contractor_manager_both', 'standard_user'),
      ('Contractor Staff - Animals', 'contractor_staff_animals', 'standard_user'),
      ('Contractor Staff - Plants', 'contractor_staff_plants', 'standard_user'),
      ('Contractor Staff - Both', 'contractor_staff_both', 'standard_user'),
      ('Non-Provincial Government Manager - Animals', 'indigenous_riso_manager_animals', 'standard_user'),
      ('Non-Provincial Government Manager - Plants', 'indigenous_riso_manager_plants', 'standard_user'),
      ('Non-Provincial Government Manager - Both', 'indigenous_riso_manager_both', 'standard_user'),
      ('Non-Provincial Government Staff - Animals', 'indigenous_riso_staff_animals', 'standard_user'),
      ('Non-Provincial Government Staff - Plants', 'indigenous_riso_staff_plants', 'standard_user'),
      ('Non-Provincial Government Staff - Both', 'indigenous_riso_staff_both', 'standard_user'),
      ('Master Administrator', 'master_administrator', 'master_admin'),
      ('Administrator - Mussels Only', 'administrator_mussels', 'standard_user'),
      ('BC Government Staff User - Mussels', 'bcgov_staff_mussels', 'standard_user'),
      ('Contractor Manager - Mussels', 'contractor_manager_mussels', 'standard_user'),
      ('Contractor Staff - Mussels', 'contractor_staff_mussels', 'standard_user'),
      ('Non-Provincial Government Manager - Mussels', 'indigenous_riso_manager_mussels', 'standard_user'),
      ('Non-Provincial Government Staff - Mussels', 'indigenous_riso_staff_mussels', 'standard_user')
    ) AS new_role(role_description, role_name, metabase_group)
  WHERE NOT EXISTS (
    SELECT 1 
    FROM invasivesbc.user_role existing_role 
    WHERE existing_role.role_description = new_role.role_description
  );
  `);
}

export async function down(knex: Knex) {
  await knex.raw(`
    DELETE FROM
      invasivesbc.user_role
    WHERE
      role_description ILIKE '%MUSSELS%';
  `);
}
