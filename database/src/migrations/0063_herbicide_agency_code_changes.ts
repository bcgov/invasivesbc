import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    set search_path = invasivesbc,public;

	INSERT INTO code
    	(code_header_id, code_name, code_description, code_sort_order, valid_from, valid_to, created_at, updated_at, created_by_user_id, updated_by_user_id)
	SELECT
    	44, 'WLCF', 'Williams Lake Community Forest', 1, now(), null, now(), now(), 1, 1
	WHERE NOT EXISTS (
    	SELECT 1 FROM code WHERE code_name = 'WLCF'
	);

    INSERT INTO code
    (code_header_id, code_name, code_description, code_sort_order, valid_from, valid_to, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES(47, '32795', 'Lontrel XC [clopyralid] 32795', 1, now(), null, now(), now(), 1, 1);

    
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

  set search_path='invasivesbc';

  DELETE FROM code
  WHERE (code_header_id = 44
  AND code_name IN ('WLCF'))
  OR (code_header_id = 47 and code_name in ('32795'));
  
     UPDATE code AS c
    SET code_sort_order = subquery.row_number
    FROM (
      SELECT code_id, ROW_NUMBER() OVER (PARTITION BY code_header_id ORDER BY code_header_id, code_description) AS row_number
      FROM code
    ) AS subquery
    WHERE c.code_id = subquery.code_id;

  `);
}
