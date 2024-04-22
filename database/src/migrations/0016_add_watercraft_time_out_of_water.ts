import { Knex } from 'knex';

export async function up(knex: Knex) {
  const insertedHeader = await knex.raw(`
	INSERT INTO invasivesbc.code_header (code_category_id, code_header_name, code_header_title, code_header_description, valid_from, valid_to, created_at, updated_at, created_by_user_id, updated_by_user_id)
	VALUES (2, 'time_out_of_waterbody', 'time_out_of_waterbody', 'Time spent out of previous waterbody', '2023-04-21 04:36:45.63048+08', NULL, '2023-04-21 04:36:45.63048+08', '2023-04-21 04:36:45.63048+08', 1, 1)
	RETURNING code_header_id;
  `);

  const codeHeaderId = insertedHeader.rows[0].code_header_id;

  await knex.raw(`
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'TOOWB-1', '0-10 Days', 1, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'TOOWB-2', '11-20 Days', 2, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'TOOWB-3', '21-30 Days', 3, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'TOOWB-4', '30 days to 6 months', 4, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'TOOWB-5', '6 months to 1 year', 5, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'TOOWB-6', '> 1 year', 6, 1, 1);
    `);
}

export async function down(knex: Knex) {
  const insertedHeader = await knex.raw(`
  	SELECT code_header_id FROM invasivesbc.code_header WHERE code_header_name = 'time_out_of_waterbody';
  `);

  const codeHeaderId = insertedHeader.rows[0].code_header_id;

  await knex.raw(`
  	DELETE FROM invasivesbc.code WHERE code_header_id = ${codeHeaderId};
  	DELETE FROM invasivesbc.code_header WHERE code_header_name = 'time_out_of_waterbody';
  `);
}
