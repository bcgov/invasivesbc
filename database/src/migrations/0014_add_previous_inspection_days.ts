import { Knex } from 'knex';

export async function up(knex: Knex) {
  const insertedHeader = await knex.raw(`
	INSERT INTO invasivesbc.code_header (code_header_id, code_category_id, code_header_name, code_header_title, code_header_description, valid_from, valid_to, created_at, updated_at, created_by_user_id, updated_by_user_id)
	VALUES (nextval('invasivesbc.code_header_code_header_id_seq'), 2, 'previous_inspection_days', 'previous_inspection_days', 'Previous Inspection and/or Agency Notification Number of Days', '2023-04-21 04:36:45.63048+08', NULL, '2023-04-21 04:36:45.63048+08', '2023-04-21 04:36:45.63048+08', 1, 1)
	RETURNING code_header_id;
  `);

  const codeHeaderId = insertedHeader.rows[0].code_header_id;

  await knex.raw(`
    INSERT INTO invasivesbc.code(code_id, code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (nextval('invasivesbc.code_code_id_seq'), ${codeHeaderId}, 'PID-1', '< 30 Days', 1, 1, 1);
    INSERT INTO invasivesbc.code(code_id, code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (nextval('invasivesbc.code_code_id_seq'), ${codeHeaderId}, 'PID-2', '> 1 Year', 2, 1, 1);
    INSERT INTO invasivesbc.code(code_id, code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (nextval('invasivesbc.code_code_id_seq'), ${codeHeaderId}, 'PID-3', '> 30 Days', 3, 1, 1);
    INSERT INTO invasivesbc.code(code_id, code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (nextval('invasivesbc.code_code_id_seq'), ${codeHeaderId}, 'PID-4', 'Same Day', 4, 1, 1);`);
}

export async function down(knex: Knex) {
  const insertedHeader = await knex.raw(`
  	SELECT code_header_id FROM invasivesbc.code_header WHERE code_header_name = 'previous_inspection_days';
  `);

  const codeHeaderId = insertedHeader.rows[0].code_header_id;

  await knex.raw(`
  	DELETE FROM invasivesbc.code WHERE code_header_id = ${codeHeaderId};
  	DELETE FROM invasivesbc.code_header WHERE code_header_name = 'previous_inspection_days';
  `);
}
