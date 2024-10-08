import { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.raw(
    //language=PostgreSQL
    `
      set search_path = invasivesbc,public;

      update iapp_invbc_mapping
      set invbc_name       = '',
          iapp_description = 'Nightshade (Solanum spp)',
          comments         = ''
      where char_code = 'NS';

      INSERT INTO invasivesbc.iapp_invbc_mapping
      (char_code, invbc_name, iapp_name, environment, "comments", iapp_description)
      SELECT 'NE',
             'Silverleaf nightshade (Solanum elaeagnifolium)',
             '',
             'T',
             '',
             'Silverleaf nightshade (Solanum elaeagnifolium)'
      WHERE NOT EXISTS (SELECT 1
                        FROM invasivesbc.iapp_invbc_mapping
                        WHERE char_code = 'NE');

    `
  );
}

export async function down(knex: Knex) {
  await knex.raw(
    //language=PostgreSQL
    `
      set search_path to invasivesbc, public;


    `
  );
}
