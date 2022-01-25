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
      roles: [1, 2]
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
      roles: [1, 2]
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
      roles: [1, 2]
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
      roles: [1, 2]
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
      roles: [1, 2]
    }
  },
  {
    application_users: {
      email: 'sawarren@gov.bc.ca',
      preferred_username: 'sawarren@idir',
      first_name: 'Sam',
      last_name: 'Warren'
    },
    user_role: {
      roles: [1, 2, 3, 4, 5]
    }
  },
  {
    application_users: {
      email: 'hryhorii.pertaia@gov.bc.ca',
      preferred_username: 'hpertaia@idir',
      first_name: 'Hryhorii',
      last_name: 'Pertaia',
      idir_userid: '293C3914BCDA483E8F3BD91AFCE8E884'
    },
    user_role: {
      roles: [18]
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
      roles: [1, 2]
    }
  }
];

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
  }
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
  const user_roles = roles.map((role) => {
    return {
      role_description: role.description,
      role_name: role.name
    };
  });
  // Insert the `user_role` records
  await knex(`${DB_SCHEMA}.user_role`).insert(user_roles).returning('role_id');

  // Create test users
  const applicationUserIDs = await knex(`${DB_SCHEMA}.application_user`)
    .insert(TestUsers.map((testUser) => testUser.application_users))
    .returning('user_id');

  // Pair user with their role(s)
  applicationUserIDs.map(async (userId, index) => {
    const user = TestUsers[index];
    for (const role of user.user_role.roles) {
      await knex(`${DB_SCHEMA}.user_access`).insert({ user_id: userId, role_id: role });
    }
  });
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
  await knex('user_access').withSchema(DB_SCHEMA).del();
  // await knex('user_role').withSchema(DB_SCHEMA).del();
  await knex.raw(`alter sequence ${DB_SCHEMA}.application_user_user_id_seq restart with 1`);
  await knex.raw(`alter sequence ${DB_SCHEMA}.user_access_access_id_seq restart with 1`);
  // await knex.raw(`alter sequence ${DB_SCHEMA}.user_role_user_role_id_seq restart with 1`);
}
