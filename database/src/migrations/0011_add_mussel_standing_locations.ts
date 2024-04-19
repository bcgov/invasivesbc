import { Knex } from 'knex';

export async function up(knex: Knex) {
  const insertedHeader = await knex.raw(`
	INSERT INTO invasivesbc.code_header (code_category_id, code_header_name, code_header_title, code_header_description, valid_from, valid_to, created_at, updated_at, created_by_user_id, updated_by_user_id)
	VALUES (2, 'watercraft_locations', 'watercraft_locations', 'Location on watercraft where standing water / mussels were found', '2023-04-21 04:36:45.63048+08', NULL, '2023-04-21 04:36:45.63048+08', '2023-04-21 04:36:45.63048+08', 1, 1)
	RETURNING code_header_id;
  `);

  const codeHeaderId = insertedHeader.rows[0].code_header_id;

  await knex.raw(`
		INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (${codeHeaderId},'SWMF-1','Hull',1,1,1);
		INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (${codeHeaderId},'SWMF-2','Trim Tabs',2,1,1);
		INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (${codeHeaderId},'SWMF-3','Transom',3,1,1);
		INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (${codeHeaderId},'SWMF-4','Pitot Tubes/transducer/depth sounder',4,1,1);
		INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (${codeHeaderId},'SWMF-5','Through hull fittings',5,1,1);
    INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (${codeHeaderId},'SWMF-6','Lower engine unit',6,1,1);
    INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (${codeHeaderId},'SWMF-7','Engine intake',7,1,1);
    INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (${codeHeaderId},'SWMF-8','Seastrainer',8,1,1);
    INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (${codeHeaderId},'SWMF-9','Propeller Shaft/Assembly/Support',9,1,1);
    INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (${codeHeaderId},'SWMF-10','Gimbal Area',10,1,1);
    INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (${codeHeaderId},'SWMF-11','Bait and Live wells ',11,1,1);
    INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (${codeHeaderId},'SWMF-12','Ballast tanks',12,1,1);
    INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (${codeHeaderId},'SWMF-13','Trailer ',13,1,1);
    INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (${codeHeaderId},'SWMF-14','Anchor/Ropes/Chains/fenders',14,1,1);
    INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (${codeHeaderId},'SWMF-15','Equipment lockers',15,1,1);
    INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (${codeHeaderId},'SWMF-16','Other',16,1,1);
    INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (${codeHeaderId},'SWMF-17','Bilge',17,1,1); 
  `);
}

export async function down(knex: Knex) {
  const insertedHeader = await knex.raw(`
  	SELECT code_header_id FROM invasivesbc.code_header WHERE code_header_name = 'watercraft_locations';
  `);

  const codeHeaderId = insertedHeader.rows[0].code_header_id;

  await knex.raw(`
  	DELETE FROM invasivesbc.code WHERE code_header_id = ${codeHeaderId};
  	DELETE FROM invasivesbc.code_header WHERE code_header_name = 'watercraft_locations';
  `);
}
