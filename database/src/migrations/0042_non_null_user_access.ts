import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Drop all violations
  await knex.raw(`
    DELETE FROM user_access 
    WHERE user_id IS NULL 
      OR role_id IS NULL;
  `);
  // Enforce Constraints to prevent future violations
  await knex.raw(`
    ALTER TABLE user_access
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN role_id SET NOT NULL;
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Drop Constraints
  await knex.raw(`ALTER TABLE user_access ALTER COLUMN role_id DROP NOT NULL;`);
  await knex.raw(`ALTER TABLE user_access ALTER COLUMN user_id DROP NOT NULL;`)
}
