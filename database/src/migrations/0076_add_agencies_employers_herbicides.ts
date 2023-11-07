import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    set search_path=invasivesbc,public;

    INSERT INTO code
    (code_header_id, code_name, code_description, code_sort_order, valid_from, valid_to, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES(44, 'RMT', 'Rocky Mountain Trench Natural Resources Society', 1, now(), null, now(), now(), 1, 1),
    (44, 'GREP', 'Grassland and Rangeland Enhancement Program', 1, now(), null, now(), now(), 1, 1),
    (44, 'CIRNAC', 'Crown-Indigenous Relations and Northern Affairs Canada', 1, now(), null, now(), now(), 1, 1),
    (44, 'CWS', 'Canadian Wildlife Service', 1, now(), null, now(), now(), 1, 1),
    (44, 'WSS', 'Wild Sheep Society of BC', 1, now(), null, now(), now(), 1, 1),
    (79, 'CCE', 'Chu Cho Environmental', 1, now(), null, now(), now(), 1, 1),
    (79, 'SFC', 'Strathinnes Forestry Consultants', 1, now(), null, now(), now(), 1, 1),  
    (48, '30409', 'Sightline A [aminopyralid/metsulfuron-methyl] 30409', 1, now(), null, now(), now(), 1, 1),
    (47, '30795', 'Sightline B [fluroxypyr] 30795', 1, now(), null, now(), now(), 1, 1);
   
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
  WHERE (code_header_id = 44
  AND code_name IN ('RMT', 'GREP', 'CIRNAC' ,'CWS' ,'WSS'))
  OR (code_header_id = 79
  AND code_name IN ('CCE', 'SFC'))
  OR (code_header_id = 48 and code_name in ('30409'))
  OR (code_header_id = 47 and code_name in ('30795'));
 
 UPDATE code AS c
    SET code_sort_order = subquery.row_number
    FROM (
      SELECT code_id, ROW_NUMBER() OVER (PARTITION BY code_header_id ORDER BY code_header_id, code_description) AS row_number
      FROM code
    ) AS subquery
    WHERE c.code_id = subquery.code_id;
  `);
}
