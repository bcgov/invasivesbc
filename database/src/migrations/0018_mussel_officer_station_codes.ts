import { Knex } from 'knex';

export async function up(knex: Knex) {
  const insertedHeader = await knex.raw(`
    INSERT INTO invasivesbc.code_header (code_category_id, code_header_name, code_header_title, code_header_description,
                                         valid_from, valid_to, created_at, updated_at, created_by_user_id,
                                         updated_by_user_id)
    VALUES (2, 'inspect_officer_station', 'inspect_officer_station', 'Complexity of watercraft in blow-by',
            '2023-04-21 04:36:45.63048+08', NULL, '2023-04-21 04:36:45.63048+08', '2023-04-21 04:36:45.63048+08', 1, 1)
    RETURNING code_header_id;
  `);

  const codeHeaderId = insertedHeader.rows[0].code_header_id;

  await knex.raw(`
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'IOS-1', 'Cascade', 1, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'IOS-2', 'Cutts (Hwy 93)', 2, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'IOS-3', 'Dawson Creek', 3, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'IOS-4', 'Fraser Valley Roving', 4, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'IOS-5', 'Golden', 5, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'IOS-6', 'Keremeos (Hwy 3)', 6, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'IOS-7', 'Kootenay Sgt', 7, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'IOS-8', 'Midway', 8, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'IOS-9', 'Mt. Robson', 9, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'IOS-10', 'Olsen (Hwy 3)', 10, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'IOS-11', 'Okanagan Sgt', 11, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'IOS-12', 'Osoyoos', 12, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'IOS-13', 'Other', 13, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'IOS-14', 'Pacific Border', 14, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'IOS-15', 'Penticton Roving', 15, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'IOS-16', 'Radium', 16, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'IOS-17', 'Rocky Mountain Sgt', 17, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'IOS-18', 'Scheduled Inspection (AB notification)', 18, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'IOS-19', 'Scheduled Inspection (CBSA notification)', 19, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'IOS-20', 'Scheduled Inspection (New boat)', 20, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'IOS-21', 'Scheduled Inspection (other notification)', 21, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'IOS-22', 'Scheduled Inspection (RAPP notification)', 22, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'IOS-23', 'Sumas Border', 23, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'IOS-24', 'Valemount', 24, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'IOS-25', 'Yahk', 25, 1, 1);
  `);
}

export async function down(knex: Knex) {
  const insertedHeader = await knex.raw(`
    SELECT code_header_id
    FROM invasivesbc.code_header
    WHERE code_header_name = 'inspect_officer_station';
  `);

  const codeHeaderId = insertedHeader.rows[0].code_header_id;

  await knex.raw(`
    DELETE
    FROM invasivesbc.code
    WHERE code_header_id = ${codeHeaderId};
    DELETE
    FROM invasivesbc.code_header
    WHERE code_header_name = 'inspect_officer_station';
  `);
}
