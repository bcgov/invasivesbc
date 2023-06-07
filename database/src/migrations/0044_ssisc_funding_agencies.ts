import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    set search_path = invasivesbc,public;

    INSERT INTO code
    (code_header_id, code_name, code_description, code_sort_order, valid_from, valid_to, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES(44, 'SN', 'Squamish Nation', 1, now(), null, now(), now(), 1, 1),
    (44, 'TFN', 'T''it''q''et First Nation', 1, now(), null, now(), now(), 1, 1),
    (44, 'LN', 'Lil''wat Nation', 1, now(), null, now(), now(), 1, 1),
    (44, 'SEP', 'Department of Fisheries and Oceans - Salmon Enhancement Program', 1, now(), null, now(), now(), 1, 1),
    (44, 'INA', 'Innergex - Ashlu', 1, now(), null, now(), now(), 1, 1),
    (44, 'INF', 'Innergex - Fitzsimmons', 1, now(), null, now(), now(), 1, 1),
    (44, 'INR', 'Innergex - Rutherford', 1, now(), null, now(), now(), 1, 1),
    (44, 'INM', 'Innergex - Miller Creek', 1, now(), null, now(), now(), 1, 1),
    (44, 'LCI', 'LaFarge Canada Inc.', 1, now(), null, now(), now(), 1, 1),
    (44, 'PHL', 'Polygon Homes Ltd.', 1, now(), null, now(), now(), 1, 1),
    (44, 'SSE', 'Sea to Sky Energy Solutions', 1, now(), null, now(), now(), 1, 1),
    (44, 'STL', 'Squamish Terminals Ltd.', 1, now(), null, now(), now(), 1, 1),
    (44, 'AP', 'Atlantic Power', 1, now(), null, now(), now(), 1, 1),
    (44, 'CFW', 'Community Foundation of Whistler', 1, now(), null, now(), now(), 1, 1),
    (44, 'HCTF', 'Habitat Conservation Trust Foundation', 1, now(), null, now(), now(), 1, 1),
    (44, 'WBF', 'Whistler Blackcomb Foundation', 1, now(), null, now(), now(), 1, 1),
    (44, 'AEC', 'AECOM', 1, now(), null, now(), now(), 1, 1),
    (79, 'DWB', 'DWB Consulting Services Ltd.', 1, now(), null, now(), now(), 1, 1);
    
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
    AND code_name IN ('SN', 'TFN', 'LN', 'SEP', 'INA', 'INF', 'INR', 'INM', 'LCI', 'PHL', 'SSE', 'STL', 'AP', 'CFW', 'HCTF', 'WBF', 'AEC'))
    or (code_header_id = 79 and code_name = 'DWB');

    UPDATE code AS c
    SET code_sort_order = subquery.row_number
    FROM (
      SELECT code_id, ROW_NUMBER() OVER (PARTITION BY code_header_id ORDER BY code_header_id, code_description) AS row_number
      FROM code
    ) AS subquery
    WHERE c.code_id = subquery.code_id;

  `);
}
