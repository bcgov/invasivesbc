import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    set search_path = invasivesbc,public;

    DELETE FROM code
    WHERE (code_name = 'ATV')
       OR (code_header_id = 44 AND code_name = 'SOGOV')
       OR (code_header_id = 79 AND code_name = 'SCW');
    
    update code 
    set code_description = 'City of New Westminster'
    where code_name = 'CONEW';
    
    update code 
    set code_name = 'SIGD'
    where code_header_id = 79 and code_name = 'SOGOV';
    
    update code 
    set code_name = 'NRRM'
    where code_header_id = 44 and code_name = 'NOREG';
    
    update code 
    set code_description = 'Fuller''s Teasel (Dipsacus fullonum)'
    where code_header_id = 40 and code_name = 'TS';
    
    update code 
    set code_description = 'North Africa grass (Ventenata dubia)'
    where code_header_id = 40 and code_name = 'NA';

    update code 
    set code_name = 'SCW'
    where code_header_id = 79 and code_name = 'TWU';
    
    INSERT INTO code
    (code_header_id, code_name, code_description, code_sort_order, valid_from, valid_to, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES(79, 'SFF', 'Southern Frontier Forestry Services', 1, now(), null, now(), now(), 1, 1),
    (79, 'IWC', 'Interior Weed Control Ltd.', 1, now(), null, now(), now(), 1, 1),
    (79, 'KWC', 'Kootenay Weed Control', 1, now(), null, now(), now(), 1, 1),
    (79, 'WS', 'Wildsight', 1, now(), null, now(), now(), 1, 1),
    (79, 'DWES', 'Drinkwater Environmental Services', 1, now(), null, now(), now(), 1, 1),
    (79, 'PGEC', 'Pottinger Gaherty Environmental Consultants Ltd.', 1, now(), null, now(), now(), 1, 1),
    (79, 'MCEL', 'McElhanney Ltd.', 1, now(), null, now(), now(), 1, 1),
    (44, 'VFC', 'Vaagen Fibre Canada', 1, now(), null, now(), now(), 1, 1),
    (44, 'WBCF', 'West Boundary Community Forest Inc.', 1, now(), null, now(), now(), 1, 1),
    (44, 'TECK', 'Teck Resources Ltd.', 1, now(), null, now(), now(), 1, 1);
    
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

    INSERT INTO code
    (code_header_id, code_name, code_description, code_sort_order, valid_from, valid_to, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES(37, 'ATV', 'ATV', 1, now(), null, now(), now(), 1, 1),
    (131, 'ATV', 'ATV', 1, now(), null, now(), now(), 1, 1),
    (132, 'ATV', 'ATV', 1, now(), null, now(), now(), 1, 1);

    DELETE FROM code
    WHERE (code_header_id = 79 AND code_name IN ('SFF', 'IWC', 'KWC', 'WS', 'DWES', 'PGEC', 'MCEL'))
    OR (code_header_id = 44 AND code_name IN ('VFC', 'WBCF', 'TECK'));

    update code 
    set code_description = 'City of New Westminister'
    where code_name = 'CONEW';
    
    update code 
    set code_name = 'SOGOV'
    where code_header_id = 79 and code_name = 'SGID';
    
    update code 
    set code_name = 'NOREG'
    where code_header_id = 44 and code_name = 'NRRM';
    
    update code 
    set code_description = 'Fueller''s Teasel (Dipsacus fullonum)'
    where code_header_id = 40 and code_name = 'TS';
    
    update code 
    set code_description = 'North africa grass (Ventenata dubia)'
    where code_header_id = 40 and code_name = 'NA';

    UPDATE code AS c
    SET code_sort_order = subquery.row_number
    FROM (
      SELECT code_id, ROW_NUMBER() OVER (PARTITION BY code_header_id ORDER BY code_header_id, code_description) AS row_number
      FROM code
    ) AS subquery
    WHERE c.code_id = subquery.code_id;

  `);
}
