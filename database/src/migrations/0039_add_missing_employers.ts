import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    set search_path = invasivesbc,public;

update code 
set code_name = 'BC HYDRO 105-0988-22/27',
    code_description = 'BC HYDRO PMP 105-0988-22/27 [ROWs/Corridors]'
where code_id = 12;

update code 
set code_description = 'MECIJAN [Mecinus janthiniformis]'
where code_id = 751;

INSERT INTO code
(code_header_id, code_name, code_description, code_sort_order, valid_from, valid_to, created_at, updated_at, created_by_user_id, updated_by_user_id)
VALUES(79, 'SKC', 'Selkirk College', 1, now(), null, now(), now(), 1, 1),
(79, 'FWCP', 'Fish and Wildlife Compensation Program - Columbia Basin', 1, now(), null, now(), now(), 1, 1),
(79, 'ATCO', 'ATCO Wood Products Ltd.', 1, now(), null, now(), now(), 1, 1),
(79, 'DRFN', 'Doig River First Nation', 1, now(), null, now(), now(), 1, 1),
(79, 'VRS', 'Vast Resource Solutions Inc.', 1, now(), null, now(), now(), 1, 1),
(79, 'AVCS', 'Ace Vegetation Control Service Ltd.', 1, now(), null, now(), now(), 1, 1),
(79, 'HAA', 'Huu-ay-aht First Nations', 1, now(), null, now(), now(), 1, 1),
(79, 'CRM', 'Cabin Resource Management', 1, now(), null, now(), now(), 1, 1),
(79, 'SHR', 'Sellentin''s Habitat Restoration', 1, now(), null, now(), now(), 1, 1),
(79, 'LGL', 'LGL Ltd.', 1, now(), null, now(), now(), 1, 1),
(79, 'YRL', 'Yendor Logging', 1, now(), null, now(), now(), 1, 1),
(79, 'TDB', 'TDB Consultants Inc.', 1, now(), null, now(), now(), 1, 1),
(79, 'TECK', 'Teck Resources Ltd.', 1, now(), null, now(), now(), 1, 1),
(79, 'WFRM', 'West Fork Resource Management Ltd.', 1, now(), null, now(), now(), 1, 1),
(79, 'EDI', 'Environment Dynamics Inc.', 1, now(), null, now(), now(), 1, 1),
(79, 'STAN', 'Stantec', 1, now(), null, now(), now(), 1, 1),
(79, 'TWU', 'Scw''exmx Tribal Council', 1, now(), null, now(), now(), 1, 1),
(79, 'SCW', 'Environment Dynamics Inc.', 1, now(), null, now(), now(), 1, 1),
(21, 'NA', 'Not Applicable', 1, now(), null, now(), now(), 1, 1);

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

    update code 
    set code_name = 'BC HYDRO 105-0982-16/21',
        code_description = 'BC HYDRO PMP 105-0982-16/21 [ROWs/Corridors]'
    where code_id = 12;
    
    update code 
    set code_description = 'MECIJAN [Mecinus janthinus]'
    where code_id = 751;
    
    delete from code
    where code_header_id =  79 
    and code_name in ('SKC', 'FWCP', 'ATCO', 'DRFN', 'VRS', 'AVCS', 'HAA', 'CRM', 'SHR', 'LGL', 'YRL', 'TDB', 'TECK', 'WFRM', 'EDI', 'STAN', 'TWU', 'SCW')

    UPDATE code AS c
    SET code_sort_order = subquery.row_number
    FROM (
      SELECT code_id, ROW_NUMBER() OVER (PARTITION BY code_header_id ORDER BY code_id) AS row_number
      FROM code
    ) AS subquery
    WHERE c.code_id = subquery.code_id;
    

  `);
}
