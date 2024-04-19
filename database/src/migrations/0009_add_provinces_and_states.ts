import { Knex } from 'knex';

export async function up(knex: Knex) {
  const insertedHeader = await knex.raw(`
	INSERT INTO invasivesbc.code_header (code_header_id, code_category_id, code_header_name, code_header_title, code_header_description, valid_from, valid_to, created_at, updated_at, created_by_user_id, updated_by_user_id)
	VALUES (DEFAULT, 2, 'province_state_name', 'province_state_name', 'Name of the province/state', '2023-04-21 04:36:45.63048+08', NULL, '2023-04-21 04:36:45.63048+08', '2023-04-21 04:36:45.63048+08', 1, 1)
	RETURNING code_header_id;
  `);

  const codeHeaderId = insertedHeader.rows[0].code_header_id;

  await knex.raw(`
		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','1-prov','British Columbia',1,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','2-prov','Alberta',2,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','3-prov','Saskatchewan',3,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','4-prov','Manitoba',4,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','5-prov','Ontario',5,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','6-prov','Quebec',6,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','7-prov','New Brunswick',7,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','8-prov','Nova Scotia',8,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','9-prov','Prince Edward Island',9,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','10-prov','Newfoundland and Labrador',10,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','11-prov','Yukon',11,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','12-prov','Northwest Territories',12,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','13-prov','Nunavut',13,1,1);

		
		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','14-state','Alabama',14,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','15-state','Alaska',15,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','16-state','Arizona',16,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','17-state','Arkansas',17,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','18-state','California',18,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','19-state','Colorado',19,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','20-state','Connecticut',20,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','21-state','Delaware',21,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','22-state','Florida',22,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','23-state','Georgia',23,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','24-state','Hawaii',24,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','25-state','Idaho',25,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','26-state','Illinois',26,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','27-state','Indiana',27,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','28-state','Iowa',28,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','29-state','Kansas',29,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','30-state','Kentucky',30,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','31-state','Louisiana',31,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','32-state','Maine',32,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','33-state','Maryland',33,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','34-state','Massachusetts',34,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','35-state','Michigan',35,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','36-state','Minnesota',36,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','37-state','Mississippi',37,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','38-state','Missouri',38,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','39-state','Montana',39,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','40-state','Nebraska',40,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','41-state','Nevada',41,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','42-state','New Hampshire',42,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','43-state','New Jersey',43,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','44-state','New Mexico',44,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','45-state','New York',45,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','46-state','North Carolina',46,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','47-state','North Dakota',47,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','48-state','Ohio',48,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','49-state','Oklahoma',49,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','50-state','Oregon',50,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','51-state','Pennsylvania',51,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','52-state','Rhode Island',52,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','53-state','South Carolina',53,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','54-state','South Dakota',54,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','55-state','Tennessee',55,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','56-state','Texas',56,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','57-state','Utah',57,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','58-state','Vermont',58,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','59-state','Virginia',59,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','60-state','Washington',60,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','61-state','West Virginia',61,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','62-state','Wisconsin',62,1,1);

		INSERT INTO invasivesbc.code(code_id,code_header_id,code_name,code_description,code_sort_order,created_by_user_id,updated_by_user_id) VALUES (DEFAULT,'${codeHeaderId}','63-state','Wyoming',63,1,1);
	`);
}

export async function down(knex: Knex) {
  const insertedHeader = await knex.raw(`
  	SELECT code_header_id FROM invasivesbc.code_header WHERE code_header_name = 'province_state_name';
  `);

  const codeHeaderId = insertedHeader.rows[0].code_header_id;

  await knex.raw(`
  	DELETE FROM invasivesbc.code WHERE code_header_id = ${codeHeaderId};
  	DELETE FROM invasivesbc.code_header WHERE code_header_name = 'province_state_name';
  `);
}
