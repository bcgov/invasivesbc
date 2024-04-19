import { Knex } from 'knex';

export async function up(knex: Knex) {
  const insertedHeader = await knex.raw(`
	INSERT INTO invasivesbc.code_header (code_header_id, code_category_id, code_header_name, code_header_title, code_header_description, valid_from, valid_to, created_at, updated_at, created_by_user_id, updated_by_user_id)
	VALUES (DEFAULT, 2, 'decontamination_order_reason', 'decontamination_order_reason', 'Reason for issuing decontamination order', '2023-04-21 04:36:45.63048+08', NULL, '2023-04-21 04:36:45.63048+08', '2023-04-21 04:36:45.63048+08', 1, 1)
	RETURNING code_header_id;
  `);

  const codeHeaderId = insertedHeader.rows[0].code_header_id;

  await knex.raw(`
		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','DCR-1','Inspection/decontamination could not be performed',1,1,1);
		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','DCR-2','No decontamination - non-compliant refusing decontamination',2,1,1);
		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','DCR-3','No decontamination - pressure washer not working',3,1,1);
		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','DCR-4','No decontamination - watercraft too complex',4,1,1);
		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','DCR-5','Partial decontamination only',5,1,1);
  `);
}

export async function down(knex: Knex) {
  const insertedHeader = await knex.raw(`
  	SELECT code_header_id FROM invasivesbc.code_header WHERE code_header_name = 'decontamination_order_reason';
  `);

  const codeHeaderId = insertedHeader.rows[0].code_header_id;

  await knex.raw(`
  	DELETE FROM invasivesbc.code WHERE code_header_id = ${codeHeaderId};
  	DELETE FROM invasivesbc.code_header WHERE code_header_name = 'decontamination_order_reason';
  `);
}
