import { Knex } from 'knex';

export async function up(knex: Knex) {
  const insertedHeader = await knex.raw(`
	INSERT INTO invasivesbc.code_header (code_category_id, code_header_name, code_header_title, code_header_description, valid_from, valid_to, created_at, updated_at, created_by_user_id, updated_by_user_id)
	VALUES (2, 'previous_ais_knowledge_source', 'previous_ais_knowledge_source', 'Source of Previous AIS Knowledge or Clean, Drain, Dry', '2023-04-21 04:36:45.63048+08', NULL, '2023-04-21 04:36:45.63048+08', '2023-04-21 04:36:45.63048+08', 1, 1)
	RETURNING code_header_id;
  `);

  const codeHeaderId = insertedHeader.rows[0].code_header_id;

  await knex.raw(`
		INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES ('${codeHeaderId}','PAKS-1','Other',1,1,1);
		INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES ('${codeHeaderId}','PAKS-2','Brochures',2,1,1);
		INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES ('${codeHeaderId}','PAKS-3','Highway Inspection Signs',3,1,1);
		INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES ('${codeHeaderId}','PAKS-4','Highway Billboard Signs',4,1,1);
		INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES ('${codeHeaderId}','PAKS-5','Internet',5,1,1);
    INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES ('${codeHeaderId}','PAKS-6','Invasive Species Council of BC',6,1,1);
    INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES ('${codeHeaderId}','PAKS-7','Local Government',7,1,1);
    INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES ('${codeHeaderId}','PAKS-8','Magazines',8,1,1);
    INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES ('${codeHeaderId}','PAKS-9','Newspaper',9,1,1);
    INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES ('${codeHeaderId}','PAKS-10','Provincial Government',10,1,1);
    INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES ('${codeHeaderId}','PAKS-11','Radio',11,1,1);
    INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES ('${codeHeaderId}','PAKS-12','Regional Invasive Species Group',12,1,1);
    INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES ('${codeHeaderId}','PAKS-13','Signs at Boat Launches',13,1,1);
    INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES ('${codeHeaderId}','PAKS-14','Social Media',14,1,1);
    INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES ('${codeHeaderId}','PAKS-15','TV Advertising/ News',15,1,1);
    INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES ('${codeHeaderId}','PAKS-16','Word of Mouth',16,1,1);
    INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES ('${codeHeaderId}','PAKS-17','Personal Experience',17,1,1);
    INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES ('${codeHeaderId}','PAKS-18','Previous Inspection in BC',18,1,1);
    INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES ('${codeHeaderId}','PAKS-19','Previous Inspection in AB',19,1,1);
    INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES ('${codeHeaderId}','PAKS-20','Previous Inspection (other)',20,1,1);
    INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES ('${codeHeaderId}','PAKS-21','US/Canada Border Inspection',21,1,1);
    INSERT INTO invasivesbc.code(code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES ('${codeHeaderId}','PAKS-22','Parks Canada',22,1,1); 
  `);
}

export async function down(knex: Knex) {
  const insertedHeader = await knex.raw(`
  	SELECT code_header_id FROM invasivesbc.code_header WHERE code_header_name = 'previous_ais_knowledge_source';
  `);

  const codeHeaderId = insertedHeader.rows[0].code_header_id;

  await knex.raw(`
  	DELETE FROM invasivesbc.code WHERE code_header_id = ${codeHeaderId};
  	DELETE FROM invasivesbc.code_header WHERE code_header_name = 'previous_ais_knowledge_source';
  `);
}
