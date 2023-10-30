import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    set search_path=invasivesbc,public;
    
    INSERT INTO code
    (code_header_id, code_name, code_description, code_sort_order, valid_from, valid_to, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES(47, '31333', 'Esplanade SC [indaziflam] 31333', 1, now(), null, now(), now(), 1, 1),
    (47, '9516', 'MCPA Amine 500 [dimethylamine salt] 9516', 1, now(), null, now(), now(), 1, 1),
    (47, '9853', 'MCPA Amine Herbicide [dimethylamine salt] 9853', 1, now(), null, now(), now(), 1, 1),
    (47, '34732', 'Procellacor FX [florpyrauxifen] 34732', 1, now(), null, now(), now(), 1, 1),
    (79, 'REC', 'Redcedar Environmental Consulting Inc.', 1, now(), null, now(), now(), 1, 1);

INSERT INTO code
    	(code_header_id, code_name, code_description, code_sort_order, valid_from, valid_to, created_at, updated_at, created_by_user_id, updated_by_user_id)
	SELECT
    	44, 'ECCC', 'Environment and Climate Change Canada', 1, now(), null, now(), now(), 1, 1
	WHERE NOT EXISTS (
    	SELECT 1 FROM code WHERE (code_header_id = 44 and code_name = 'ECCC')
	);

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

  set search_path=invasivesbc,public;
  
  DELETE FROM code
  WHERE (code_header_id = 79
  AND code_name IN ('REC'))
  OR (code_header_id = 44
  AND code_name IN ('ECCC'))
  OR (code_header_id = 47 and code_name in ('31333', '9516', '9853', '34732'));

  UPDATE code AS c
    SET code_sort_order = subquery.row_number
    FROM (
      SELECT code_id, ROW_NUMBER() OVER (PARTITION BY code_header_id ORDER BY code_header_id, code_description) AS row_number
      FROM code
    ) AS subquery
    WHERE c.code_id = subquery.code_id;


  `);
}
