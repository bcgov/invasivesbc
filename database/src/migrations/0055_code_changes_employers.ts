import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    set search_path = invasivesbc,public;

    INSERT INTO code
    (code_header_id, code_name, code_description, code_sort_order, valid_from, valid_to, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES(79, 'USL', 'Urban Systems Ltd.', 1, now(), null, now(), now(), 1, 1),
    (79, 'DHC', 'Diamond Head Consulting Ltd.', 1, now(), null, now(), now(), 1, 1),
    (79, 'KLC', 'Kalesnikoff Lumber Co. Ltd.', 1, now(), null, now(), now(), 1, 1),
    (79, 'ARM', 'A.R.M. Contractors', 1, now(), null, now(), now(), 1, 1),
    (79, 'SOL', 'Sterling Operations Ltd.', 1, now(), null, now(), now(), 1, 1),
    (79, 'CEL', 'Current Environmental Ltd.', 1, now(), null, now(), now(), 1, 1),
    (79, 'TIC', 'Triton Environmental Consultants Ltd.', 1, now(), null, now(), now(), 1, 1);
    
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
  WHERE (code_header_id = 79
  AND code_name IN ('USL','DHC', 'KLC', 'ARM', 'SOL', 'CEL', 'TIC'));

 
  UPDATE code AS c
  SET code_sort_order = subquery.row_number
  FROM (
    SELECT code_id, ROW_NUMBER() OVER (PARTITION BY code_header_id ORDER BY code_header_id, code_description) AS row_number
    FROM code
  ) AS subquery
  WHERE c.code_id = subquery.code_id;

  `);
}
