import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    //language=PostgreSQL
    `
      set search_path = invasivesbc,public;
      DELETE
      FROM user_access
      WHERE user_id IS NULL
         OR role_id IS NULL; -- delete all violations

      ALTER TABLE user_access
        ALTER COLUMN user_id SET NOT NULL,
        ALTER COLUMN role_id SET NOT NULL;
    `
  );
}

export async function down(knex: Knex): Promise<void> {
  // Drop Constraints
  await knex.raw(
    //language=PostgreSQL
    `
    set search_path = invasivesbc,public;
    ALTER TABLE user_access ALTER COLUMN role_id DROP NOT NULL;
    ALTER TABLE user_access ALTER COLUMN user_id DROP NOT NULL;
    `
  );
}
