import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    set search_path = invasivesbc,public;

    delete from code
    where code_header_id = 44 and code_name in ('INF', 'INR', 'INM')
    
    update code
    set code_name = 'INX',
        code_description = 'Innergex'
    where code_header_id = 44 and code_name = 'INA'
    
    update code
    set code_name = 'DFO',
        code_description = 'Department of Fisheries and Oceans'
    where code_header_id = 44 and code_name = 'SEP'
    
    INSERT INTO code
    (code_header_id, code_name, code_description, code_sort_order, valid_from, valid_to, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES(79, 'PM', 'Pomerleau Inc.', 1, now(), null, now(), now(), 1, 1),
    (79, 'MGP', 'MGP Contracting', 1, now(), null, now(), now(), 1, 1),
    (79, 'DRFN', 'Doig River First Nation', 1, now(), null, now(), now(), 1, 1),
    (44, 'NCM', 'Newcrest Mining Ltd.', 1, now(), null, now(), now(), 1, 1),
    (44, 'NWT', 'Northwestel', 1, now(), null, now(), now(), 1, 1),
    (44, 'DRFN', 'Doig River First Nation', 1, now(), null, now(), now(), 1, 1);
    
    UPDATE code AS c
    SET code_sort_order = subquery.row_number
    FROM (
      SELECT code_id, ROW_NUMBER() OVER (PARTITION BY code_header_id ORDER BY code_header_id, code_description) AS row_number
      FROM code
    ) AS subquery
    WHERE c.code_id = subquery.code_id;
`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path = invasivesbc,public;

    DELETE FROM code
    WHERE (code_header_id = 44
    AND code_name IN ('NCM', 'NWT', 'DRFN'))
    or (code_header_id = 79 and code_name IN ('PM', 'MGP', 'DRFN'));

    update code
    set code_name = 'INA',
        code_description = 'Innergex - Ashlu'
    where code_header_id = 44 and code_name = 'INX'

    INSERT INTO code
    (code_header_id, code_name, code_description, code_sort_order, valid_from, valid_to, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES(44, 'INF', 'Innergex - Fitzsimmons', 1, now(), null, now(), now(), 1, 1),
    (44, 'INR', 'Innergex - Rutherford', 1, now(), null, now(), now(), 1, 1),
    (44, 'INM', 'Innergex - Miller Creek', 1, now(), null, now(), now(), 1, 1);

    UPDATE code AS c
    SET code_sort_order = subquery.row_number
    FROM (
      SELECT code_id, ROW_NUMBER() OVER (PARTITION BY code_header_id ORDER BY code_header_id, code_description) AS row_number
      FROM code
    ) AS subquery
    WHERE c.code_id = subquery.code_id;

  `);
}
