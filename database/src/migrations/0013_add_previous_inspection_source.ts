import { Knex } from 'knex';

export async function up(knex: Knex) {
  const insertedHeader = await knex.raw(`
    INSERT INTO invasivesbc.code_header (code_category_id, code_header_name, code_header_title, code_header_description,
                                         valid_from, valid_to, created_at, updated_at, created_by_user_id,
                                         updated_by_user_id)
    VALUES (2, 'previous_inspection_source', 'previous_inspection_source',
            'Previous Inspection and/or Agency Notification Source', '2023-04-21 04:36:45.63048+08', NULL,
            '2023-04-21 04:36:45.63048+08', '2023-04-21 04:36:45.63048+08', 1, 1)
    RETURNING code_header_id;
  `);

  const codeHeaderId = insertedHeader.rows[0].code_header_id;

  await knex.raw(`
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-1', 'Other', 1, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-2', 'Other - BC', 2, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-3', 'Outreach at boat launch - BC', 3, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-4', 'Dawson Creek ', 4, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-5', 'Cutts Hwy 93 ', 5, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-6', 'Golden', 6, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-7', 'Fraser Valley Roving Crew', 7, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-8', 'Mt. Robson', 8, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-9', 'Olsen Hwy 3', 9, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-10', 'Osoyoos', 10, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-11', 'Pacific/Surrey', 11, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-12', 'Penticton Roving Crew', 12, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-13', 'Radium', 13, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-14', 'Yahk', 14, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-15', 'CBSA Referral - Rooseville', 15, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-16', 'CBSA Referral - Kingsgate', 16, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-17', 'CBSA Referral - Rykerts', 17, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-18', 'CBSA Referral - Carson', 18, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-19', 'CBSA Referral - Nelway', 19, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-20', 'CBSA Referral - Cascade', 20, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-21', 'CBSA Referral - Midway', 21, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-22', 'CBSA Referral - Osoyoos', 22, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-23', 'CBSA Referral - Algergrove', 23, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-24', 'CBSA Referral - Abbotsford/Huntington', 24, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-25', 'CBSA Referral - Paterson', 25, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-26', 'CBSA Referral - Waneta', 26, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-27', 'CBSA Referral - Pacific', 27, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-28', 'Dunmore, AB', 28, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-29', 'Coutts, AB', 29, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-30', 'Vermillion, AB', 30, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-31', 'Jumping Pound, AB', 31, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-32', 'Wainwright, AB', 32, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-33', 'Oyen, AB', 33, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-34', 'Cold Lake, AB', 34, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-35', 'Burmis, AB', 35, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-36', 'Lethbridge, AB', 36, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-37', 'Carway, AB', 37, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-38', 'Del Bonita, AB', 38, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-39', 'Alberta', 39, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-40', 'Manitoba*', 40, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-41', 'Ontario*', 41, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-42', 'Quebec*', 42, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-43', 'Saskatchewan*', 43, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-44', 'Alabama*', 44, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-45', 'Arizona*', 45, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-46', 'Arkansas*', 46, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-47', 'California*', 47, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-48', 'Colorado*', 48, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-49', 'Connecticut*', 49, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-50', 'Delaware', 50, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-51', 'Florida*', 51, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-52', 'Georgia*', 52, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-53', 'Idaho', 53, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-54', 'Illinois*', 54, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-55', 'Indiana*', 55, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-56', 'Iowa*', 56, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-57', 'Kansas*', 57, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-58', 'Kentucky*', 58, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-59', 'Louisiana*', 59, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-60', 'Maine*', 60, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-61', 'Maryland*', 61, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-62', 'Massachusetts*', 62, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-63', 'Michigan*', 63, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-64', 'Minnesota*', 64, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-65', 'Missouri*', 65, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-66', 'Mississippi*', 66, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-67', 'Montana*', 67, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-68', 'Nebraska*', 68, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-69', 'Nevada*', 69, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-70', 'New Hampshire*', 70, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-71', 'New Jersey*', 71, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-72', 'New Mexico', 72, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-73', 'New York*', 73, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-74', 'North Carolina*', 74, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-75', 'North Dakota*', 75, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-76', 'Ohio*', 76, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-77', 'Oklahoma*', 77, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-78', 'Oregon', 78, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-79', 'Pennsylvania*', 79, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-80', 'Rhode Island*', 80, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-81', 'South Carolina*', 81, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-82', 'South Dakota*', 82, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-83', 'Tennessee*', 83, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-84', 'Texas*', 84, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-85', 'Utah*', 85, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-86', 'Vermont*', 86, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-87', 'Virginia*', 87, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-88', 'Washington', 88, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-89', 'West Virginia*', 89, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-90', 'Wisconsin*', 90, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-91', 'Wyoming', 91, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-92', 'Jasper National Park', 92, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-93', 'Kootenay National Park', 93, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-94', 'Lake Minnewanka (Banff National Park)', 94, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-95', 'Waterton Lakes National Park', 95, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'PIS-96', 'Yoho National Park', 96, 1, 1);`);
}

export async function down(knex: Knex) {
  const insertedHeader = await knex.raw(`
    SELECT code_header_id
    FROM invasivesbc.code_header
    WHERE code_header_name = 'previous_inspection_source';
  `);

  const codeHeaderId = insertedHeader.rows[0].code_header_id;

  await knex.raw(`
    DELETE
    FROM invasivesbc.code
    WHERE code_header_id = ${codeHeaderId};
    DELETE
    FROM invasivesbc.code_header
    WHERE code_header_name = 'previous_inspection_source';
  `);
}
