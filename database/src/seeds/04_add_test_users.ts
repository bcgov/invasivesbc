import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';

const TestUsers = [
  {
    application_users: {
      email: 'istest1@gov.bc.ca',
      preferred_username: 'istest1@idir',
      first_name: 'Test',
      last_name: 'Idr1'
    },
    user_role: {
      role_code_id: 1
    }
  },
  {
    application_users: {
      email: 'istest2@gov.bc.ca',
      preferred_username: 'istest2@idir',
      first_name: 'Test',
      last_name: 'Idr2'
    },
    user_role: {
      role_code_id: 6
    }
  },
  {
    application_users: {
      email: 'istest3@gov.bc.ca',
      preferred_username: 'istest3@idir',
      first_name: 'Test',
      last_name: 'Idr3'
    },
    user_role: {
      role_code_id: 3
    }
  },
  {
    application_users: {
      email: 'istest4@gov.bc.ca',
      preferred_username: 'istest4@idir',
      first_name: 'Test',
      last_name: 'Idr3'
    },
    user_role: {
      role_code_id: 5
    }
  },
  {
    application_users: {
      email: 'istest5@gov.bc.ca',
      preferred_username: 'istest5@idir',
      first_name: 'Test',
      last_name: 'Idr5'
    },
    user_role: {
      role_code_id: 2
    }
  },
  {
    application_users: {
      email: 'rstens@stens.ca',
      preferred_username: 'postman',
      first_name: 'Postman',
      last_name: 'Newman'
    },
    user_role: {
      role_code_id: 1
    }
  },
];

/**
 * Seed the test users and their roles.
 *
 * @export
 * @param {Knex} knex
 * @return {Promise<void>}
 */
export async function seed(knex: Knex): Promise<void> {
  await clean(knex);

  // Insert the `application_user` records, returning their email and generated `user_id`
  const applicationUserIDs = await knex(`${DB_SCHEMA}.application_user`)
    .insert(TestUsers.map((testUser) => testUser.application_users))
    .returning('user_id');

  const user_roles = applicationUserIDs.map((userId, index) => {
    return {
      user_id: userId,
      role_code_id: TestUsers[index].user_role.role_code_id
    };
  });

  // Insert the `user_roles` records
  await knex(`${DB_SCHEMA}.user_role`).insert(user_roles);
}

/**
 * Clean/reset any previous seed data.
 *
 * @export
 * @param {Knex} knex
 * @return {Promise<void>}
 */
export async function clean(knex: Knex): Promise<void> {
  await knex('application_user').withSchema(DB_SCHEMA).del();
  await knex('user_role').withSchema(DB_SCHEMA).del();

  await knex.raw(`alter sequence ${DB_SCHEMA}.application_user_user_id_seq restart with 1`);
  await knex.raw(`alter sequence ${DB_SCHEMA}.user_role_user_role_id_seq restart with 1`);
}
