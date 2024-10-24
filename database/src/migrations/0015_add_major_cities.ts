import { Knex } from 'knex';

export async function up(knex: Knex) {
  const insertedHeader = await knex.raw(`
    INSERT INTO invasivesbc.code_header (code_category_id, code_header_name, code_header_title, code_header_description,
                                         valid_from, valid_to, created_at, updated_at, created_by_user_id,
                                         updated_by_user_id)
    VALUES (2, 'major_cities', 'major_cities', 'Major city name', '2023-04-21 04:36:45.63048+08', NULL,
            '2023-04-21 04:36:45.63048+08', '2023-04-21 04:36:45.63048+08', 1, 1)
    RETURNING code_header_id;
  `);

  const codeHeaderId = insertedHeader.rows[0].code_header_id;

  await knex.raw(`
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1', 'Airdrie', 1, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-2', 'Athabasca', 2, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-3', 'Banff', 3, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-4', 'Barrhead', 4, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-5', 'Bonnyville', 5, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-6', 'Brooks', 6, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-7', 'Calgary', 7, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-8', 'Camrose', 8, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-9', 'Cardston', 9, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-10', 'Claresholm', 10, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-11', 'Cold Lake', 11, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-12', 'Crowsnest Pass', 12, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-13', 'Drayton Valley', 13, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-14', 'Drumheller', 14, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-15', 'Edmonton', 15, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-16', 'Edson', 16, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-17', 'Fairview', 17, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-18', 'Fort Chipewyan', 18, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-19', 'Fort Macleod', 19, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-20', 'Fort McMurray', 20, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-21', 'Fort Vermilion', 21, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-22', 'Fox Creek', 22, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-23', 'Fox Lake', 23, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-24', 'Grande Cache', 24, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-25', 'Grande Prairie', 25, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-26', 'Hanna', 26, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-27', 'High Level', 27, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-28', 'High Prairie', 28, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-29', 'High River', 29, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-30', 'Hinton', 30, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-31', 'Innisfail', 31, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-32', 'Jasper', 32, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-33', 'La Crete', 33, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-34', 'Lac La Biche', 34, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-35', 'Lacombe', 35, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-36', 'Leduc', 36, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-37', 'Lethbridge', 37, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-38', 'Lloydminster', 38, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-39', 'Manning', 39, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-40', 'Medicine Hat', 40, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-41', 'Milk River', 41, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-42', 'Oyen', 42, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-43', 'Peace River', 43, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-44', 'Pincher Creek', 44, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-45', 'Ponoka', 45, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-46', 'Provost', 46, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-47', 'Rainbow Lake', 47, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-48', 'Red Deer', 48, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-49', 'Rocky Mountain House', 49, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-50', 'Slave Lake', 50, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-51', 'St Paul', 51, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-52', 'Stettler', 52, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-53', 'Swan Hills', 53, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-54', 'Taber', 54, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-55', 'Valleyview', 55, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-56', 'Vegreville', 56, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-57', 'Vermilion', 57, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-58', 'Wabasca', 58, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-59', 'Wainwright', 59, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-60', 'Westlock', 60, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-61', 'Wetaskiwin', 61, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-62', 'Whitecourt', 62, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-63', '100 Mile House', 63, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-64', 'Abbotsford', 64, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-65', 'Alert Bay', 65, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-66', 'Anmore', 66, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-67', 'Armstrong', 67, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-68', 'Ashcroft', 68, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-69', 'Barriere', 69, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-70', 'Belcarra', 70, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-71', 'Bowen Island', 71, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-72', 'Burnaby', 72, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-73', 'Burns Lake', 73, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-74', 'Cache Creek', 74, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-75', 'Campbell River', 75, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-76', 'Canal Flats', 76, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-77', 'Castlegar', 77, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-78', 'Central Saanich', 78, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-79', 'Chase', 79, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-80', 'Chetwynd', 80, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-81', 'Chilliwack', 81, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-82', 'Clearwater', 82, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-83', 'Clinton', 83, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-84', 'Coldstream', 84, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-85', 'Colwood', 85, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-86', 'Comox', 86, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-87', 'Coquitlam', 87, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-88', 'Courtenay', 88, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-89', 'Cranbrook', 89, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-90', 'Creston', 90, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-91', 'Cumberland', 91, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-92', 'Dawson Creek', 92, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-93', 'Digby', 93, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-94', 'Delta', 94, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-95', 'Duncan', 95, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-96', 'Elkford', 96, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-97', 'Enderby', 97, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-98', 'Esquimalt', 98, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-99', 'Fernie', 99, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-100', 'Fort St James', 100, 1, 1);
  `);
  await knex.raw(`
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-101', 'Fort St John', 101, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-102', 'Fraser Lake', 102, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-103', 'Fruitvale', 103, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-104', 'Gibsons', 104, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-105', 'Gold River', 105, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-106', 'Golden', 106, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-107', 'Grand Forks', 107, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-108', 'Granisle', 108, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-109', 'Greenwood', 109, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-110', 'Harrison Hot Springs', 110, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-111', 'Hazelton', 111, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-112', 'Highlands', 112, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-113', 'Hope', 113, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-114', 'Houston', 114, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-115', 'Hudsons Hope', 115, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-116', 'Invermere', 116, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-117', 'Kamloops', 117, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-118', 'Kaslo', 118, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-119', 'Kelowna', 119, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-120', 'Kent', 120, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-121', 'Keremeos', 121, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-122', 'Kimberley', 122, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-123', 'Kitimat', 123, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-124', 'Ladysmith', 124, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-125', 'Lake Country', 125, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-126', 'Lake Cowichan', 126, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-127', 'Langford', 127, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-128', 'Langley', 128, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-129', 'Langley', 129, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-130', 'Lantzville', 130, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-131', 'Lillooet', 131, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-132', 'Lions Bay', 132, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-133', 'Logan Lake', 133, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-134', 'Lumby', 134, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-135', 'Lytton', 135, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-136', 'Mackenzie', 136, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-137', 'Maple Ridge', 137, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-138', 'Masset', 138, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-139', 'McBride', 139, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-140', 'Merritt', 140, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-141', 'Metchosin', 141, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-142', 'Midway', 142, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-143', 'Mission', 143, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-144', 'Montrose', 144, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-145', 'Nakusp', 145, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-146', 'Nanaimo', 146, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-147', 'Nelson', 147, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-148', 'New Denver', 148, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-149', 'New Hazelton', 149, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-150', 'New Westminster', 150, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-151', 'North Cowichan', 151, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-152', 'North Saanich', 152, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-153', 'North Vancouver', 153, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-154', 'North Vancouver', 154, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-155', 'Northern Rockies Regional Municipality', 155, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-156', 'Oak Bay', 156, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-157', 'Oliver', 157, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-158', 'Osoyoos', 158, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-159', 'Parksville', 159, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-160', 'Peachland', 160, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-161', 'Pemberton', 161, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-162', 'Penticton', 162, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-163', 'Pitt Meadows', 163, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-164', 'Port Alberni', 164, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-165', 'Port Alice', 165, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-166', 'Port Clements', 166, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-167', 'Port Coquitlam', 167, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-168', 'Port Edward', 168, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-169', 'Port Hardy', 169, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-170', 'Port McNeill', 170, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-171', 'Port Moody', 171, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-172', 'Pouce Coupe', 172, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-173', 'Powell River', 173, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-174', 'Prince George', 174, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-175', 'Prince Rupert', 175, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-176', 'Princeton', 176, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-177', 'Qualicum Beach', 177, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-178', 'Queen Charlotte Village of', 178, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-179', 'Quesnel', 179, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-180', 'Radium Hot Springs', 180, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-181', 'Revelstoke', 181, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-182', 'Richmond', 182, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-183', 'Rossland', 183, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-184', 'Saanich', 184, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-185', 'Salmo', 185, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-186', 'Salmon Arm', 186, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-187', 'Sayward', 187, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-188', 'Sechelt', 188, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-189', 'Sicamous', 189, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-190', 'Sidney', 190, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-191', 'Silverton', 191, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-192', 'Slocan', 192, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-193', 'Smithers', 193, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-194', 'Sooke', 194, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-195', 'Spallumcheen', 195, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-196', 'Sparwood', 196, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-197', 'Squamish', 197, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-198', 'Stewart', 198, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-199', 'Summerland', 199, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-200', 'Surrey', 200, 1, 1);
  `);
  await knex.raw(`
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-201', 'Tahsis', 201, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-202', 'Taylor', 202, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-203', 'Telkwa', 203, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-204', 'Terrace', 204, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-205', 'Tofino', 205, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-206', 'Trail', 206, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-207', 'Tumbler Ridge', 207, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-208', 'Ucluelet', 208, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-209', 'Valemount', 209, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-210', 'Vancouver', 210, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-211', 'Vanderhoof', 211, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-212', 'Vernon', 212, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-213', 'Victoria', 213, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-214', 'View Royal', 214, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-215', 'Warfield', 215, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-216', 'West Kelowna City of', 216, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-217', 'West Vancouver', 217, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-218', 'White Rock', 218, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-219', 'Williams Lake', 219, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-220', 'Zeballos', 220, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-221', 'Ashern', 221, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-222', 'Beausejour', 222, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-223', 'Berens River', 223, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-224', 'Bloodvein', 224, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-225', 'Brandon', 225, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-226', 'Brochet', 226, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-227', 'Churchill', 227, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-228', 'Cranberry Portage', 228, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-229', 'Cross Lake', 229, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-230', 'Dauphin', 230, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-231', 'Emerson', 231, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-232', 'Flin Flon', 232, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-233', 'Fort Alexander', 233, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-234', 'Garden Hill', 234, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-235', 'Gillam', 235, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-236', 'Gimli', 236, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-237', 'Gods Lake Narrows', 237, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-238', 'Grand Rapids', 238, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-239', 'Killarney', 239, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-240', 'Lac Brochet', 240, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-241', 'Leaf Rapids', 241, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-242', 'Little Grand Rapids', 242, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-243', 'Lynn Lake', 243, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-244', 'Melita', 244, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-245', 'Minnedosa', 245, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-246', 'Morden', 246, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-247', 'Neepawa', 247, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-248', 'Nelson House', 248, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-249', 'Norway House', 249, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-250', 'Oxford House', 250, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-251', 'Poplar River', 251, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-252', 'Portage la Prairie', 252, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-253', 'Pukatawagan', 253, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-254', 'Roblin', 254, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-255', 'Russell', 255, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-256', 'Selkirk', 256, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-257', 'Shamattawa', 257, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-258', 'Snow Lake', 258, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-259', 'Souris', 259, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-260', 'South Indian Lake', 260, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-261', 'Split Lake', 261, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-262', 'Steinbach', 262, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-263', 'Swan River', 263, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-264', 'The Pas', 264, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-265', 'Thompson', 265, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-266', 'Virden', 266, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-267', 'Winkler', 267, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-268', 'Winnipeg', 268, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-269', 'Winnipegosis', 269, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-270', 'Bathurst', 270, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-271', 'Campbellton', 271, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-272', 'Caraquet', 272, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-273', 'Dalhousie', 273, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-274', 'Edmundston', 274, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-275', 'Fredericton', 275, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-276', 'Grand Falls Grand Sault', 276, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-277', 'Miramichi', 277, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-278', 'Moncton', 278, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-279', 'Saint John', 279, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-280', 'St Stephen', 280, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-281', 'Sussex', 281, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-282', 'Tracadie Sheila', 282, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-283', 'Baie Verte', 283, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-284', 'Bishops Falls', 284, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-285', 'Bonavista', 285, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-286', 'Buchans', 286, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-287', 'Burgeo', 287, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-288', 'Carbonear', 288, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-289', 'Cartwright', 289, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-290', 'Channel Port aux Basques', 290, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-291', 'Churchill Falls', 291, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-292', 'Clarenville', 292, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-293', 'Corner Brook', 293, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-294', 'Deer Lake', 294, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-295', 'Gander', 295, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-296', 'Grand Bank', 296, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-297', 'Grand Falls Windsor', 297, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-298', 'Happy Valley Goose Bay', 298, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-299', 'Harbour Breton', 299, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-300', 'Hopedale', 300, 1, 1);
  `);
  await knex.raw(`
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-301', 'Labrador City', 301, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-302', 'Lewisporte', 302, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-303', 'Makkovik', 303, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-304', 'Marystown', 304, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-305', 'Nain', 305, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-306', 'Natuashish', 306, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-307', 'Placentia', 307, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-308', 'Port Hope Simpson', 308, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-309', 'Rigolet', 309, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-310', 'Rocky Harbour', 310, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-311', 'Roddickton', 311, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-312', 'Springdale', 312, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-313', 'St Anthony', 313, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-314', 'St Georges', 314, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-315', 'St Johns', 315, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-316', 'Stephenville', 316, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-317', 'Trepassey', 317, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-318', 'Twillingate', 318, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-319', 'Wabush', 319, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-320', 'Aklavik', 320, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-321', 'Colville Lake', 321, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-322', 'Deline', 322, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-323', 'Fort Good Hope', 323, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-324', 'Fort Liard', 324, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-325', 'Fort McPherson', 325, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-326', 'Fort Providence', 326, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-327', 'Fort Resolution', 327, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-328', 'Fort Simpson', 328, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-329', 'Fort Smith', 329, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-330', 'Hay River', 330, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-331', 'Holman', 331, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-332', 'Inuvik', 332, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-333', 'Lutselke', 333, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-334', 'Norman Wells', 334, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-335', 'Paulatuk', 335, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-336', 'Rae Edzo', 336, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-337', 'Rae Lakes', 337, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-338', 'Sachs Harbour', 338, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-339', 'Tsiigehtchic', 339, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-340', 'Tuktoyaktuk', 340, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-341', 'Tulita', 341, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-342', 'Wekweti', 342, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-343', 'Wha Ti', 343, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-344', 'Wrigley', 344, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-345', 'Yellowknife', 345, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-346', 'Amherst', 346, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-347', 'Antigonish', 347, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-348', 'Bridgewater', 348, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-349', 'Canso', 349, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-350', 'Cape Breton', 350, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-351', 'Cheticamp', 351, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-352', 'Halifax', 352, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-353', 'Inverness', 353, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-354', 'Kentville', 354, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-355', 'Middleton', 355, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-356', 'New Glasgow', 356, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-357', 'Port Hawkesbury', 357, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-358', 'Shelburne', 358, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-359', 'Truro', 359, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-360', 'Yarmouth', 360, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-361', 'Arctic Bay', 361, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-362', 'Arviat', 362, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-363', 'Baker Lake', 363, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-364', 'Bathurst Inlet', 364, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-365', 'Cambridge Bay', 365, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-366', 'Cape Dorset', 366, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-367', 'Chesterfield Inlet', 367, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-368', 'Clyde River', 368, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-369', 'Coral Harbour', 369, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-370', 'Gjoa Haven', 370, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-371', 'Hall Beach', 371, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-372', 'Igloolik', 372, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-373', 'Iqaluit', 373, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-374', 'Kimmirut', 374, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-375', 'Kugaaruk', 375, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-376', 'Kugluktuk', 376, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-377', 'Nanisivik', 377, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-378', 'Pangnirtung', 378, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-379', 'Pond Inlet', 379, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-380', 'Qikiqtarjuaq', 380, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-381', 'Rankin Inlet', 381, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-382', 'Repulse Bay', 382, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-383', 'Sanikiluaq', 383, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-384', 'Taloyoak', 384, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-385', 'Whale Cove', 385, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-386', 'Armstrong', 386, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-387', 'Atikokan', 387, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-388', 'Attawapiskat', 388, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-389', 'Barrie', 389, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-390', 'Bearskin Lake', 390, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-391', 'Belleville', 391, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-392', 'Big Trout Lake', 392, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-393', 'Blind River', 393, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-394', 'Bracebridge', 394, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-395', 'Brockville', 395, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-396', 'Chapleau', 396, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-397', 'Chatham Kent', 397, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-398', 'Cochrane', 398, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-399', 'Collingwood', 399, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-400', 'Cornwall', 400, 1, 1);
  `);
  await knex.raw(`
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-401', 'Deer Lake', 401, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-402', 'Dryden', 402, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-403', 'Dubreuilville', 403, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-404', 'Ear Falls', 404, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-405', 'Elliot Lake', 405, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-406', 'Englehart', 406, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-407', 'Espanola', 407, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-408', 'Foleyet', 408, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-409', 'Fort Albany', 409, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-410', 'Fort Frances', 410, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-411', 'Fort Hope', 411, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-412', 'Fort Severn', 412, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-413', 'Geraldton', 413, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-414', 'Goderich', 414, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-415', 'Gogama', 415, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-416', 'Greater Sudbury', 416, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-417', 'Guelph', 417, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-418', 'Haileybury', 418, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-419', 'Hamilton', 419, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-420', 'Hearst', 420, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-421', 'Hornepayne', 421, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-422', 'Huntsville', 422, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-423', 'Iroquois Falls', 423, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-424', 'Kapuskasing', 424, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-425', 'Kasabonika', 425, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-426', 'Kenora', 426, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-427', 'Kincardine', 427, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-428', 'Kingston', 428, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-429', 'Kirkland Lake', 429, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-430', 'Kitchener', 430, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-431', 'Lansdowne House', 431, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-432', 'Little Current', 432, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-433', 'London', 433, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-434', 'Longlac', 434, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-435', 'Manitouwadge', 435, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-436', 'Marathon', 436, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-437', 'Mattawa', 437, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-438', 'Midland', 438, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-439', 'Moosonee', 439, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-440', 'Nakina', 440, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-441', 'New Liskeard', 441, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-442', 'Niagara Falls', 442, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-443', 'Nipigon', 443, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-444', 'North Bay', 444, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-445', 'Orillia', 445, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-446', 'Oshawa', 446, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-447', 'Osnaburgh House', 447, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-448', 'Ottawa', 448, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-449', 'Owen Sound', 449, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-450', 'Parry Sound', 450, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-451', 'Peawanuck', 451, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-452', 'Pembroke', 452, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-453', 'Petawawa', 453, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-454', 'Peterborough', 454, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-455', 'Pikangikum', 455, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-456', 'Quinte West', 456, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-457', 'Rainy River', 457, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-458', 'Red Lake', 458, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-459', 'Renfrew', 459, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-460', 'Sandy Lake', 460, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-461', 'Sarnia', 461, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-462', 'Sault Ste Marie', 462, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-463', 'Sioux Lookout', 463, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-464', 'Smiths Falls', 464, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-465', 'Smooth Rock Falls', 465, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-466', 'St Catharines', 466, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-467', 'Terrace Bay', 467, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-468', 'Thessalon', 468, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-469', 'Thunder Bay', 469, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-470', 'Timmins', 470, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-471', 'Toronto', 471, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-472', 'Wawa', 472, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-473', 'Weagamow Lake', 473, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-474', 'Webequie', 474, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-475', 'White River', 475, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-476', 'Windsor', 476, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-477', 'Charlottetown', 477, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-478', 'Summerside', 478, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-479', 'Akulivik', 479, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-480', 'Alma', 480, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-481', 'Amos', 481, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-482', 'Amqui', 482, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-483', 'Baie Comeau', 483, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-484', 'Baie Saint Paul', 484, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-485', 'Blanc Sablon', 485, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-486', 'Cabano', 486, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-487', 'Cap aux Meules', 487, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-488', 'Chapais', 488, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-489', 'Chibougamau', 489, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-490', 'Chisasibi', 490, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-491', 'Dolbeau Mistassini', 491, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-492', 'Drummondville', 492, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-493', 'Eastmain', 493, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-494', 'Fermont', 494, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-495', 'Forestville', 495, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-496', 'Gaspe', 496, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-497', 'Gatineau', 497, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-498', 'Granby', 498, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-499', 'Havre Saint Pierre', 499, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-500', 'Inukjuak', 500, 1, 1);
  `);
  await knex.raw(`
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-501', 'Ivujivik', 501, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-502', 'Joliette', 502, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-503', 'Joutel', 503, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-504', 'Kangiqsualujjuaq', 504, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-505', 'Kangiqsujuaq', 505, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-506', 'Kangirsuk', 506, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-507', 'Kuujjuaq', 507, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-508', 'Kuujjuarapik', 508, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-509', 'La Malbaie', 509, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-510', 'La Pocatiere', 510, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-511', 'La Sarre', 511, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-512', 'La Tabatiere', 512, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-513', 'La Tuque', 513, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-514', 'Lebel sur Quevillon', 514, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-515', 'Levis', 515, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-516', 'Maniwaki', 516, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-517', 'Matagami', 517, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-518', 'Matane', 518, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-519', 'Mistissini', 519, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-520', 'Mont Joli', 520, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-521', 'Mont Laurier', 521, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-522', 'Montmagny', 522, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-523', 'Montreal', 523, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-524', 'Natashquan', 524, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-525', 'Nemiscau', 525, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-526', 'New Richmond', 526, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-527', 'Parent', 527, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-528', 'Perce', 528, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-529', 'Port Cartier', 529, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-530', 'Puvirnituq', 530, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-531', 'Quaqtaq', 531, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-532', 'Quebec', 532, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-533', 'Radisson', 533, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-534', 'Rimouski', 534, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-535', 'Riviere du Loup', 535, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-536', 'Roberval', 536, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-537', 'Rouyn Noranda', 537, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-538', 'Saguenay', 538, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-539', 'Saint Augustin', 539, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-540', 'Saint Felicien', 540, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-541', 'Saint Georges', 541, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-542', 'Sainte Anne des Monts', 542, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-543', 'Salaberry de Valleyfield', 543, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-544', 'Salluit', 544, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-545', 'Schefferville', 545, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-546', 'Senneterre', 546, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-547', 'Sept Iles', 547, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-548', 'Shawinigan', 548, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-549', 'Sherbrooke', 549, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-550', 'Sorel Tracy', 550, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-551', 'Temiscaming', 551, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-552', 'Thetford Mines', 552, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-553', 'Trois Rivieres', 553, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-554', 'Umiujaq', 554, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-555', 'Val dOr', 555, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-556', 'Victoriaville', 556, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-557', 'Ville Marie', 557, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-558', 'Waskaganish', 558, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-559', 'Wemindji', 559, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-560', 'Assiniboia', 560, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-561', 'Biggar', 561, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-562', 'Buffalo Narrows', 562, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-563', 'Canora', 563, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-564', 'Carlyle', 564, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-565', 'Coronach', 565, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-566', 'Cumberland House', 566, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-567', 'Davidson', 567, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-568', 'Deschambault Lake', 568, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-569', 'Esterhazy', 569, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-570', 'Estevan', 570, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-571', 'Fond du Lac', 571, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-572', 'Fort QuAppelle', 572, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-573', 'Gravelbourg', 573, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-574', 'Gull Lake', 574, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-575', 'Hudson Bay', 575, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-576', 'Humboldt', 576, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-577', 'Ile a la Crosse', 577, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-578', 'Indian Head', 578, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-579', 'Kamsack', 579, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-580', 'Kerrobert', 580, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-581', 'Kindersley', 581, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-582', 'La Loche', 582, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-583', 'La Ronge', 583, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-584', 'Leader', 584, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-585', 'Maple Creek', 585, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-586', 'Meadow Lake', 586, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-587', 'Melfort', 587, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-588', 'Melville', 588, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-589', 'Moose Jaw', 589, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-590', 'Moosomin', 590, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-591', 'Nipawin', 591, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-592', 'North Battleford', 592, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-593', 'Outlook', 593, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-594', 'Patuanak', 594, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-595', 'Pelican Narrows', 595, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-596', 'Pinehouse Lake', 596, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-597', 'Prince Albert', 597, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-598', 'Regina', 598, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-599', 'Rosetown', 599, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-600', 'Rosthern', 600, 1, 1);
    `);
  await knex.raw(`
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-601', 'Sandy Bay', 601, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-602', 'Saskatoon', 602, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-603', 'Shaunavon', 603, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-604', 'Southend Reindeer', 604, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-605', 'Stanley Mission', 605, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-606', 'Stony Rapids', 606, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-607', 'Swift Current', 607, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-608', 'Tisdale', 608, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-609', 'Unity', 609, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-610', 'Wadena', 610, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-611', 'Watrous', 611, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-612', 'Weyburn', 612, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-613', 'Wollaston Lake', 613, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-614', 'Wynyard', 614, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-615', 'Yorkton', 615, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-616', 'Beaver Creek', 616, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-617', 'Carmacks', 617, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-618', 'Dawson', 618, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-619', 'Faro', 619, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-620', 'Haines Junction', 620, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-621', 'Mayo', 621, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-622', 'Old Crow', 622, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-623', 'Pelly Crossing', 623, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-624', 'Ross River', 624, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-625', 'Teslin', 625, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-626', 'Watson Lake', 626, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-627', 'Whitehorse', 627, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-628', 'Aguascalientes', 628, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-629', 'Ensenada', 629, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-630', 'Mexicali', 630, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-631', 'San Felipe', 631, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-632', 'San Quintin', 632, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-633', 'Tecate', 633, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-634', 'Tijuana', 634, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-635', 'Ciudad Constitucion', 635, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-636', 'Ejido Insurgentes', 636, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-637', 'La Paz', 637, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-638', 'Loreto', 638, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-639', 'San Jose del Cabo', 639, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-640', 'San Lucas', 640, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-641', 'Santa Rosalia', 641, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-642', 'Todos Santos', 642, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-643', 'Campeche', 643, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-644', 'Champoton', 644, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-645', 'Ciudad del Carmen', 645, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-646', 'Escarcega', 646, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-647', 'Hopelchen', 647, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-648', 'Arriaga', 648, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-649', 'Comitan', 649, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-650', 'Escuintla', 650, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-651', 'Huixtla', 651, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-652', 'Ocosingo', 652, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-653', 'Palenque', 653, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-654', 'Pijijiapan', 654, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-655', 'San Cristobal de las Casas', 655, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-656', 'Tapachula', 656, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-657', 'Tonala', 657, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-658', 'Tuxtla Gutierrez', 658, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-659', 'Bueneventura', 659, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-660', 'Chihuahua', 660, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-661', 'Ciudad Camargo', 661, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-662', 'Ciudad Juarez', 662, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-663', 'Cuauhtemoc', 663, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-664', 'Delicias', 664, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-665', 'Hidalgo del Parral', 665, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-666', 'Jimenez', 666, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-667', 'Nuevo Casas Grandes', 667, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-668', 'Ojinaga', 668, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-669', 'San Juanito', 669, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-670', 'Villa Ahumada', 670, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-671', 'Allende', 671, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-672', 'Ciudad Acuna', 672, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-673', 'Cuatro Cienegas', 673, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-674', 'Matamoros', 674, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-675', 'Melchor Muzquiz', 675, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-676', 'Monclova', 676, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-677', 'Nueva Rosita', 677, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-678', 'Parras', 678, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-679', 'Piedras Negras', 679, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-680', 'Sabinas', 680, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-681', 'Saltillo', 681, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-682', 'San Pedro de las Colonias', 682, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-683', 'Torreon', 683, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-684', 'Colima', 684, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-685', 'Manzanillo', 685, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-686', 'Tecoman', 686, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-687', 'Canatlan', 687, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-688', 'Durango', 688, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-689', 'El Salto', 689, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-690', 'Gomez Palacio', 690, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-691', 'Santiago Papasquiaro', 691, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-692', 'Tepehuanes', 692, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-693', 'Acambaro', 693, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-694', 'Celaya', 694, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-695', 'Guanajuato', 695, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-696', 'Irapuato', 696, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-697', 'Leon', 697, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-698', 'Salamanca', 698, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-699', 'San Miguel de Allende', 699, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-700', 'Acapulco', 700, 1, 1);
    `);
  await knex.raw(`
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-701', 'Chilpancingo', 701, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-702', 'Ciudad Altamirano', 702, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-703', 'Iguala', 703, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-704', 'San Marcos', 704, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-705', 'Taxco', 705, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-706', 'Tecpan', 706, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-707', 'Zihuatanejo', 707, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-708', 'Actopan', 708, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-709', 'Huejutla', 709, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-710', 'Pachuca', 710, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-711', 'Tulancingo', 711, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-712', 'Ameca', 712, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-713', 'Autlan', 713, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-714', 'Ciudad Guzman', 714, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-715', 'Guadalajara', 715, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-716', 'La Barca', 716, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-717', 'Lagos de Moreno', 717, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-718', 'Ocotlan', 718, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-719', 'Puerto Vallarta', 719, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-720', 'San Juan de los Lagos', 720, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-721', 'Sayula', 721, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-722', 'Tamazula', 722, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-723', 'Tepatitlan', 723, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-724', 'Tequila', 724, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-725', 'Tuxpan', 725, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-726', 'Mexico', 726, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-727', 'Toluca', 727, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-728', 'Aguililla', 728, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-729', 'Apatzingan', 729, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-730', 'La Piedad', 730, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-731', 'Lazaro Cardenas', 731, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-732', 'Los Reyes', 732, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-733', 'Morelia', 733, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-734', 'Patzcuaro', 734, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-735', 'Sahuayo', 735, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-736', 'Uruapan', 736, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-737', 'Zacapu', 737, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-738', 'Zamora', 738, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-739', 'Cuautla', 739, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-740', 'Cuernavaca', 740, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-741', 'Acaponeta', 741, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-742', 'Compostela', 742, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-743', 'Ixtlan del Rio', 743, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-744', 'Santiago Ixcuintla', 744, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-745', 'Tepic', 745, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-746', 'Tuxpan', 746, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-747', 'China', 747, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-748', 'Ciudad Anahuac', 748, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-749', 'Linares', 749, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-750', 'Montemorelos', 750, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-751', 'Monterrey', 751, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-752', 'Sabinas Hildalgo', 752, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-753', 'Huajuapan', 753, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-754', 'Juchitan', 754, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-755', 'Matias Romero', 755, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-756', 'Miahuatlan', 756, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-757', 'Oaxaca', 757, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-758', 'Pinotepa Nacional', 758, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-759', 'Puerto Escondido', 759, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-760', 'Salina Cruz', 760, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-761', 'Tehuantepec', 761, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-762', 'Tuxtepec', 762, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-763', 'Acatlan', 763, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-764', 'Atlixco', 764, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-765', 'Izucar de Matamoros', 765, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-766', 'Orizaba', 766, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-767', 'Puebla', 767, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-768', 'Tehuacan', 768, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-769', 'Teziutlan', 769, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-770', 'Queretaro', 770, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-771', 'San Juan del Rio', 771, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-772', 'Cancun', 772, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-773', 'Chetumal', 773, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-774', 'Cozumel', 774, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-775', 'Felipe Carrillo Puerto', 775, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-776', 'Cardenas', 776, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-777', 'Cerritos', 777, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-778', 'Ciudad Valles', 778, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-779', 'Ebano', 779, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-780', 'Matehuala', 780, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-781', 'Rioverde', 781, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-782', 'San Luis Potosi', 782, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-783', 'Tamazunchale', 783, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-784', 'Culiacan', 784, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-785', 'El Dorado', 785, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-786', 'El Fuerte', 786, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-787', 'Escuinapa', 787, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-788', 'Guamuchil', 788, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-789', 'Guasave', 789, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-790', 'La Cruz', 790, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-791', 'Los Mochis', 791, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-792', 'Mazatlan', 792, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-793', 'Rosario', 793, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-794', 'Agua Prieta', 794, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-795', 'Benjamin Hill', 795, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-796', 'Caborca', 796, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-797', 'Cananea', 797, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-798', 'Ciudad Obregon', 798, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-799', 'Empalme', 799, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-800', 'Guaymas', 800, 1, 1);
  `);
  await knex.raw(`
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-801', 'Hermosillo', 801, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-802', 'Huatabampo', 802, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-803', 'Magdalena', 803, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-804', 'Nacozari de Garcia', 804, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-805', 'Navojoa', 805, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-806', 'Nogales', 806, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-807', 'Puerto Penasco', 807, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-808', 'San Luis Rio Colorado', 808, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-809', 'Sonoyta', 809, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-810', 'Cardenas', 810, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-811', 'Comalcalco', 811, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-812', 'Emiliano Zapata', 812, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-813', 'Frontera', 813, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-814', 'Teapa', 814, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-815', 'Tenosique', 815, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-816', 'Villahermosa', 816, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-817', 'Ciudad Madero', 817, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-818', 'Ciudad Mante', 818, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-819', 'Ciudad Victoria', 819, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-820', 'Matamoros', 820, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-821', 'Nuevo Laredo', 821, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-822', 'Reynosa', 822, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-823', 'Rio Bravo', 823, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-824', 'San Fernando', 824, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-825', 'Valle Hermoso', 825, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-826', 'Apizaco', 826, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-827', 'Tlaxcala', 827, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-828', 'Acayucan', 828, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-829', 'Alvarado', 829, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-830', 'Cerro Azul', 830, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-831', 'Coatzacoalcos', 831, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-832', 'Cordoba', 832, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-833', 'Cosamaloapan', 833, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-834', 'Jesus Carranza', 834, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-835', 'Martinez de la Torre', 835, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-836', 'Minatitlan', 836, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-837', 'Naranjos', 837, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-838', 'Papantla', 838, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-839', 'Poza Rica', 839, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-840', 'San Andres Tuxtla', 840, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-841', 'Tampico', 841, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-842', 'Tantoyuca', 842, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-843', 'Tierra Blanca', 843, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-844', 'Tuxpan', 844, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-845', 'Veracruz', 845, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-846', 'Xalapa', 846, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-847', 'Hunucma', 847, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-848', 'Merida', 848, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-849', 'Motul', 849, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-850', 'Progreso', 850, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-851', 'Tekax', 851, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-852', 'Ticul', 852, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-853', 'Tizimin', 853, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-854', 'Valladolid', 854, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-855', 'Concepcion del Oro', 855, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-856', 'Fresnillo', 856, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-857', 'Jerez de Garcia Salinas', 857, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-858', 'Juan Aldama', 858, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-859', 'Rio Grande', 859, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-860', 'Sombrerete', 860, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-861', 'Zacatecas', 861, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-862', 'Andalusia', 862, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-863', 'Anniston', 863, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-864', 'Atmore', 864, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-865', 'Auburn', 865, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-866', 'Birmingham', 866, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-867', 'Decatur', 867, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-868', 'Dothan', 868, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-869', 'Florence', 869, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-870', 'Gadsden', 870, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-871', 'Greenville', 871, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-872', 'Huntsville', 872, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-873', 'Jasper', 873, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-874', 'Mobile', 874, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-875', 'Montgomery', 875, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-876', 'Selma', 876, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-877', 'Troy', 877, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-878', 'Tuscaloosa', 878, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-879', 'Akutan', 879, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-880', 'Alakanuk', 880, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-881', 'Anchorage', 881, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-882', 'Angoon', 882, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-883', 'Arctic Village', 883, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-884', 'Barrow', 884, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-885', 'Bethel', 885, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-886', 'Chignik', 886, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-887', 'Circle', 887, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-888', 'Cold Bay', 888, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-889', 'Cordova', 889, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-890', 'Delta Junction', 890, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-891', 'Dillingham', 891, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-892', 'Emmonak', 892, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-893', 'Fairbanks', 893, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-894', 'False Pass', 894, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-895', 'Fort Yukon', 895, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-896', 'Galena', 896, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-897', 'Glennallen', 897, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-898', 'Haines', 898, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-899', 'Holy Cross', 899, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-900', 'Homer', 900, 1, 1);
  `);
  await knex.raw(`
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-901', 'Hoonah', 901, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-902', 'Hooper Bay', 902, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-903', 'Juneau', 903, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-904', 'Kenai', 904, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-905', 'Ketchikan', 905, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-906', 'King Salmon', 906, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-907', 'Kodiak', 907, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-908', 'Kotzebue', 908, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-909', 'McGrath', 909, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-910', 'Mountain Village', 910, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-911', 'Naknek', 911, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-912', 'Nenana', 912, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-913', 'Nikiski', 913, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-914', 'Noatak', 914, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-915', 'Nome', 915, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-916', 'Palmer', 916, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-917', 'Petersburg', 917, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-918', 'Point Hope', 918, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-919', 'Prudhoe Bay', 919, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-920', 'Sand Point', 920, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-921', 'Selawik', 921, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-922', 'Seldovia', 922, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-923', 'Seward', 923, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-924', 'Sitka', 924, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-925', 'Skagway', 925, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-926', 'Sleetmute', 926, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-927', 'Soldotna', 927, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-928', 'Tanana', 928, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-929', 'Togiak', 929, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-930', 'Tok', 930, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-931', 'Unalakleet', 931, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-932', 'Unalaska', 932, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-933', 'Valdez', 933, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-934', 'Wainwright', 934, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-935', 'Wasilla', 935, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-936', 'Whittier', 936, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-937', 'Wrangell', 937, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-938', 'Yakutat', 938, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-939', 'Ajo', 939, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-940', 'Bullhead City', 940, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-941', 'Casa Grande', 941, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-942', 'Douglas', 942, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-943', 'Eloy', 943, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-944', 'Flagstaff', 944, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-945', 'Gila Bend', 945, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-946', 'Globe', 946, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-947', 'Holbrook', 947, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-948', 'Kingman', 948, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-949', 'Lake Havasu City', 949, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-950', 'Mesa', 950, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-951', 'Page', 951, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-952', 'Payson', 952, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-953', 'Phoenix', 953, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-954', 'Prescott', 954, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-955', 'Safford', 955, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-956', 'Sedona', 956, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-957', 'Show Low', 957, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-958', 'Sierra Vista', 958, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-959', 'Tucson', 959, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-960', 'Wickenburg', 960, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-961', 'Willcox', 961, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-962', 'Williams', 962, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-963', 'Yuma', 963, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-964', 'Arkadelphia', 964, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-965', 'Batesville', 965, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-966', 'Camden', 966, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-967', 'Conway', 967, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-968', 'El Dorado', 968, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-969', 'Fayetteville', 969, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-970', 'Fort Smith', 970, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-971', 'Hope', 971, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-972', 'Hot Springs', 972, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-973', 'Jonesboro', 973, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-974', 'Little Rock', 974, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-975', 'Magnolia', 975, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-976', 'Pine Bluff', 976, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-977', 'Searcy', 977, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-978', 'Stuttgart', 978, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-979', 'Alturas', 979, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-980', 'Anaheim', 980, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-981', 'Bakersfield', 981, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-982', 'Barstow', 982, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-983', 'Berkeley', 983, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-984', 'Bishop', 984, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-985', 'Blythe', 985, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-986', 'Chico', 986, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-987', 'Concord', 987, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-988', 'Crescent City', 988, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-989', 'Delano', 989, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-990', 'El Centro', 990, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-991', 'Escondido', 991, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-992', 'Eureka', 992, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-993', 'Fremont', 993, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-994', 'Fresno', 994, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-995', 'Glendale', 995, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-996', 'Hanford', 996, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-997', 'Lancaster', 997, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-998', 'Lompoc', 998, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-999', 'Long Beach', 999, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1000', 'Los Angeles', 1000, 1, 1);
    `);
  await knex.raw(`
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1001', 'Merced', 1001, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1002', 'Modesto', 1002, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1003', 'Monterey', 1003, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1004', 'Napa', 1004, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1005', 'Needles', 1005, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1006', 'Oakland', 1006, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1007', 'Oceanside', 1007, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1008', 'Ontario', 1008, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1009', 'Oxnard', 1009, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1010', 'Palm Springs', 1010, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1011', 'Paradise', 1011, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1012', 'Pasadena', 1012, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1013', 'Porterville', 1013, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1014', 'Red Bluff', 1014, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1015', 'Redding', 1015, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1016', 'Ridgecrest', 1016, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1017', 'Riverside', 1017, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1018', 'Sacramento', 1018, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1019', 'Salinas', 1019, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1020', 'San Bernardino', 1020, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1021', 'San Diego', 1021, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1022', 'San Francisco', 1022, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1023', 'San Jose', 1023, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1024', 'San Luis Obispo', 1024, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1025', 'Santa Ana', 1025, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1026', 'Santa Barbara', 1026, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1027', 'Santa Cruz', 1027, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1028', 'Santa Maria', 1028, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1029', 'Santa Rosa', 1029, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1030', 'South Lake Tahoe', 1030, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1031', 'Stockton', 1031, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1032', 'Sunnyvale', 1032, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1033', 'Susanville', 1033, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1034', 'Ukiah', 1034, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1035', 'Visalia', 1035, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1036', 'Weed', 1036, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1037', 'Yreka', 1037, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1038', 'Yuba City', 1038, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1039', 'Alamosa', 1039, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1040', 'Aspen', 1040, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1041', 'Boulder', 1041, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1042', 'Burlington', 1042, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1043', 'Colorado Springs', 1043, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1044', 'Cortez', 1044, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1045', 'Craig', 1045, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1046', 'Denver', 1046, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1047', 'Durango', 1047, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1048', 'Fort Collins', 1048, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1049', 'Fort Morgan', 1049, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1050', 'Glenwood Springs', 1050, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1051', 'Grand Junction', 1051, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1052', 'Greeley', 1052, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1053', 'Gunnison', 1053, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1054', 'La Junta', 1054, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1055', 'Lamar', 1055, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1056', 'Leadville', 1056, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1057', 'Limon', 1057, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1058', 'Longmont', 1058, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1059', 'Montrose', 1059, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1060', 'Pagosa Springs', 1060, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1061', 'Pueblo', 1061, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1062', 'Salida', 1062, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1063', 'Steamboat Springs', 1063, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1064', 'Sterling', 1064, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1065', 'Trinidad', 1065, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1066', 'Vail', 1066, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1067', 'Walsenburg', 1067, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1068', 'Bridgeport', 1068, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1069', 'Hartford', 1069, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1070', 'New Haven', 1070, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1071', 'New London', 1071, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1072', 'Waterbury', 1072, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1073', 'Dover', 1073, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1074', 'Wilmington', 1074, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1075', 'Boca Raton', 1075, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1076', 'Clearwater', 1076, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1077', 'Daytona Beach', 1077, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1078', 'Deltona', 1078, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1079', 'Fort Lauderdale', 1079, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1080', 'Fort Myers', 1080, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1081', 'Fort Pierce', 1081, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1082', 'Gainesville', 1082, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1083', 'Hialeah', 1083, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1084', 'Jacksonville', 1084, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1085', 'Key Largo', 1085, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1086', 'Key West', 1086, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1087', 'Lake City', 1087, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1088', 'Melbourne', 1088, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1089', 'Miami', 1089, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1090', 'Naples', 1090, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1091', 'Ocala', 1091, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1092', 'Orlando', 1092, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1093', 'Panama City', 1093, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1094', 'Pensacola', 1094, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1095', 'Port Charlotte', 1095, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1096', 'Port St Lucie', 1096, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1097', 'Sarasota', 1097, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1098', 'Sebring', 1098, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1099', 'St Augustine', 1099, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1100', 'St Petersburg', 1100, 1, 1);
    `);
  await knex.raw(`
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1101', 'Tallahassee', 1101, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1102', 'Tampa', 1102, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1103', 'Titusville', 1103, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1104', 'West Palm Beach', 1104, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1105', 'Winter Haven', 1105, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1106', 'Albany', 1106, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1107', 'Americus', 1107, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1108', 'Athens', 1108, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1109', 'Atlanta', 1109, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1110', 'Augusta', 1110, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1111', 'Brunswick', 1111, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1112', 'Columbus', 1112, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1113', 'Dalton', 1113, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1114', 'Douglas', 1114, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1115', 'Gainesville', 1115, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1116', 'Griffin', 1116, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1117', 'Hinesville', 1117, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1118', 'Jesup', 1118, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1119', 'La Grange', 1119, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1120', 'Macon', 1120, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1121', 'Marietta', 1121, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1122', 'Rome', 1122, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1123', 'Savannah', 1123, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1124', 'Statesboro', 1124, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1125', 'Tifton', 1125, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1126', 'Valdosta', 1126, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1127', 'Warner Robins', 1127, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1128', 'Waycross', 1128, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1129', 'Hilo', 1129, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1130', 'Honolulu', 1130, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1131', 'Kailua', 1131, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1132', 'Lihue', 1132, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1133', 'Boise', 1133, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1134', 'Caldwell', 1134, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1135', 'Coeur dAlene', 1135, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1136', 'Grangeville', 1136, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1137', 'Idaho Falls', 1137, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1138', 'Kellogg', 1138, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1139', 'Ketchum', 1139, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1140', 'Lewiston', 1140, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1141', 'Moscow', 1141, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1142', 'Mountain Home', 1142, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1143', 'Nampa', 1143, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1144', 'Payette', 1144, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1145', 'Pocatello', 1145, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1146', 'Rexburg', 1146, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1147', 'Salmon', 1147, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1148', 'Sandpoint', 1148, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1149', 'Soda Springs', 1149, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1150', 'Twin Falls', 1150, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1151', 'Alton', 1151, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1152', 'Aurora', 1152, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1153', 'Bloomington', 1153, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1154', 'Carbondale', 1154, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1155', 'Champaign', 1155, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1156', 'Chicago', 1156, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1157', 'Decatur', 1157, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1158', 'Effingham', 1158, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1159', 'Elgin', 1159, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1160', 'Joliet', 1160, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1161', 'Kankakee', 1161, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1162', 'Mount Vernon', 1162, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1163', 'Peoria', 1163, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1164', 'Quincy', 1164, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1165', 'Rockford', 1165, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1166', 'Springfield', 1166, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1167', 'Urbana', 1167, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1168', 'Bloomington', 1168, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1169', 'Columbus', 1169, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1170', 'Evansville', 1170, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1171', 'Fort Wayne', 1171, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1172', 'Gary', 1172, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1173', 'Indianapolis', 1173, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1174', 'Kokomo', 1174, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1175', 'Lafayette', 1175, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1176', 'Marion', 1176, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1177', 'Muncie', 1177, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1178', 'South Bend', 1178, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1179', 'Terre Haute', 1179, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1180', 'Vincennes', 1180, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1181', 'Ames', 1181, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1182', 'Burlington', 1182, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1183', 'Cedar Rapids', 1183, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1184', 'Charles City', 1184, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1185', 'Council Bluffs', 1185, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1186', 'Davenport', 1186, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1187', 'Decorah', 1187, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1188', 'Des Moines', 1188, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1189', 'Dubuque', 1189, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1190', 'Fort Dodge', 1190, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1191', 'Iowa City', 1191, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1192', 'Marshalltown', 1192, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1193', 'Mason City', 1193, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1194', 'Ottumwa', 1194, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1195', 'Sioux City', 1195, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1196', 'Spencer', 1196, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1197', 'Storm Lake', 1197, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1198', 'Waterloo', 1198, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1199', 'Arkansas City', 1199, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1200', 'Atchison', 1200, 1, 1);
  `);
  await knex.raw(`
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1201', 'Coffeyville', 1201, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1202', 'Colby', 1202, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1203', 'Dodge City', 1203, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1204', 'El Dorado', 1204, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1205', 'Emporia', 1205, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1206', 'Garden City', 1206, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1207', 'Great Bend', 1207, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1208', 'Hays', 1208, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1209', 'Hutchinson', 1209, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1210', 'Kansas City', 1210, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1211', 'Lawrence', 1211, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1212', 'Leavenworth', 1212, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1213', 'Liberal', 1213, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1214', 'Manhattan', 1214, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1215', 'Marysville', 1215, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1216', 'McPherson', 1216, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1217', 'Oberlin', 1217, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1218', 'Ottawa', 1218, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1219', 'Phillipsburg', 1219, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1220', 'Pittsburg', 1220, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1221', 'Pratt', 1221, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1222', 'Salina', 1222, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1223', 'Scott City', 1223, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1224', 'Topeka', 1224, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1225', 'Wichita', 1225, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1226', 'Ashland', 1226, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1227', 'Bowling Green', 1227, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1228', 'Cairo', 1228, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1229', 'Frankfort', 1229, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1230', 'Hazard', 1230, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1231', 'Lexington', 1231, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1232', 'Louisville', 1232, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1233', 'Madison', 1233, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1234', 'Madisonville', 1234, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1235', 'Middlesboro', 1235, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1236', 'Owensboro', 1236, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1237', 'Paducah', 1237, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1238', 'Richmond', 1238, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1239', 'Somerset', 1239, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1240', 'Alexandria', 1240, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1241', 'Baton Rouge', 1241, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1242', 'De Ridder', 1242, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1243', 'Houma', 1243, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1244', 'Lafayette', 1244, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1245', 'Lake Charles', 1245, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1246', 'Monroe', 1246, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1247', 'Morgan City', 1247, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1248', 'New Iberia', 1248, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1249', 'New Orleans', 1249, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1250', 'Shreveport', 1250, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1251', 'Tallulah', 1251, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1252', 'Augusta', 1252, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1253', 'Bangor', 1253, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1254', 'Belfast', 1254, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1255', 'Biddeford', 1255, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1256', 'Calais', 1256, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1257', 'Houlton', 1257, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1258', 'Lewiston', 1258, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1259', 'Portland', 1259, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1260', 'Presque Isle', 1260, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1261', 'Skowhegan', 1261, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1262', 'Waterville', 1262, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1263', 'Annapolis', 1263, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1264', 'Baltimore', 1264, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1265', 'Frederick', 1265, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1266', 'Hagerstown', 1266, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1267', 'Washington', 1267, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1268', 'Boston', 1268, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1269', 'Fall River', 1269, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1270', 'Lowell', 1270, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1271', 'New Bedford', 1271, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1272', 'Springfield', 1272, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1273', 'Worcester', 1273, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1274', 'Alpena', 1274, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1275', 'Ann Arbor', 1275, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1276', 'Bay City', 1276, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1277', 'Detroit', 1277, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1278', 'Escanaba', 1278, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1279', 'Flint', 1279, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1280', 'Grand Rapids', 1280, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1281', 'Houghton', 1281, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1282', 'Iron Mountain', 1282, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1283', 'Ironwood', 1283, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1284', 'Jackson', 1284, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1285', 'Kalamazoo', 1285, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1286', 'Lansing', 1286, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1287', 'Ludington', 1287, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1288', 'Marquette', 1288, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1289', 'Midland', 1289, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1290', 'Muskegon', 1290, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1291', 'Petoskey', 1291, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1292', 'Pontiac', 1292, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1293', 'Port Huron', 1293, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1294', 'Saginaw', 1294, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1295', 'Sault Ste Marie', 1295, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1296', 'Traverse City', 1296, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1297', 'Albert Lea', 1297, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1298', 'Bemidji', 1298, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1299', 'Brainerd', 1299, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1300', 'Crookston', 1300, 1, 1);
    `);
  await knex.raw(`
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1301', 'Duluth', 1301, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1302', 'Ely', 1302, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1303', 'Fairmont', 1303, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1304', 'Faribault', 1304, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1305', 'Fergus Falls', 1305, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1306', 'Grand Marais', 1306, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1307', 'Grand Rapids', 1307, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1308', 'Hibbing', 1308, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1309', 'International Falls', 1309, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1310', 'Little Falls', 1310, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1311', 'Mankato', 1311, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1312', 'Marshall', 1312, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1313', 'Minneapolis', 1313, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1314', 'Moorhead', 1314, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1315', 'Rochester', 1315, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1316', 'St Cloud', 1316, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1317', 'St Paul', 1317, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1318', 'Thief River Falls', 1318, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1319', 'Willmar', 1319, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1320', 'Winona', 1320, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1321', 'Worthington', 1321, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1322', 'Biloxi', 1322, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1323', 'Brookhaven', 1323, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1324', 'Cleveland', 1324, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1325', 'Columbus', 1325, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1326', 'Corinth', 1326, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1327', 'Greenville', 1327, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1328', 'Grenada', 1328, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1329', 'Gulfport', 1329, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1330', 'Hattiesburg', 1330, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1331', 'Jackson', 1331, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1332', 'Laurel', 1332, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1333', 'McComb', 1333, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1334', 'Meridian', 1334, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1335', 'Natchez', 1335, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1336', 'Oxford', 1336, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1337', 'Pascagoula', 1337, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1338', 'Starkville', 1338, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1339', 'Tupelo', 1339, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1340', 'Vicksburg', 1340, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1341', 'Branson', 1341, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1342', 'Cape Girardeau', 1342, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1343', 'Columbia', 1343, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1344', 'Farmington', 1344, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1345', 'Fulton', 1345, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1346', 'Hannibal', 1346, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1347', 'Jefferson City', 1347, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1348', 'Joplin', 1348, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1349', 'Kansas City', 1349, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1350', 'Kirksville', 1350, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1351', 'Lebanon', 1351, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1352', 'Maryville', 1352, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1353', 'Nevada', 1353, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1354', 'Poplar Bluff', 1354, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1355', 'Rolla', 1355, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1356', 'Sikeston', 1356, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1357', 'Springfield', 1357, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1358', 'St Joseph', 1358, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1359', 'St Louis', 1359, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1360', 'Anaconda', 1360, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1361', 'Billings', 1361, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1362', 'Bozeman', 1362, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1363', 'Butte', 1363, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1364', 'Deer Lodge', 1364, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1365', 'Dillon', 1365, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1366', 'Glasgow', 1366, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1367', 'Glendive', 1367, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1368', 'Great Falls', 1368, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1369', 'Hamilton', 1369, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1370', 'Havre', 1370, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1371', 'Helena', 1371, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1372', 'Kalispell', 1372, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1373', 'Lewistown', 1373, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1374', 'Libby', 1374, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1375', 'Livingston', 1375, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1376', 'Malta', 1376, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1377', 'Miles City', 1377, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1378', 'Missoula', 1378, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1379', 'Red Lodge', 1379, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1380', 'Shelby', 1380, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1381', 'Sidney', 1381, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1382', 'Wolf Point', 1382, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1383', 'Alliance', 1383, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1384', 'Beatrice', 1384, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1385', 'Broken Bow', 1385, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1386', 'Chadron', 1386, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1387', 'Falls City', 1387, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1388', 'Fremont', 1388, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1389', 'Grand Island', 1389, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1390', 'Hastings', 1390, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1391', 'Holdrege', 1391, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1392', 'Kearney', 1392, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1393', 'Kimball', 1393, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1394', 'Lincoln', 1394, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1395', 'McCook', 1395, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1396', 'Nebraska City', 1396, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1397', 'Norfolk', 1397, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1398', 'North Platte', 1398, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1399', 'Ogallala', 1399, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1400', 'Omaha', 1400, 1, 1);
  `);
  await knex.raw(`
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1401', 'ONeill', 1401, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1402', 'Scottsbluff', 1402, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1403', 'Valentine', 1403, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1404', 'Carson City', 1404, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1405', 'Elko', 1405, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1406', 'Ely', 1406, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1407', 'Fallon', 1407, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1408', 'Henderson', 1408, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1409', 'Las Vegas', 1409, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1410', 'Reno', 1410, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1411', 'Tonopah', 1411, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1412', 'Wells', 1412, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1413', 'Winnemucca', 1413, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1414', 'Berlin', 1414, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1415', 'Concord', 1415, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1416', 'Manchester', 1416, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1417', 'Portsmouth', 1417, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1418', 'Atlantic City', 1418, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1419', 'Newark', 1419, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1420', 'Paterson', 1420, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1421', 'Trenton', 1421, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1422', 'Vineland', 1422, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1423', 'Alamagordo', 1423, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1424', 'Albuquerque', 1424, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1425', 'Artesia', 1425, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1426', 'Carlsbad', 1426, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1427', 'Carrizozo', 1427, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1428', 'Clayton', 1428, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1429', 'Clovis', 1429, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1430', 'Deming', 1430, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1431', 'Farmington', 1431, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1432', 'Fort Sumner', 1432, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1433', 'Gallup', 1433, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1434', 'Grants', 1434, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1435', 'Hobbs', 1435, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1436', 'Las Cruces', 1436, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1437', 'Las Vegas', 1437, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1438', 'Lordsburg', 1438, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1439', 'Los Alamos', 1439, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1440', 'Raton', 1440, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1441', 'Roswell', 1441, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1442', 'Santa Fe', 1442, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1443', 'Santa Rosa', 1443, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1444', 'Silver City', 1444, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1445', 'Socorro', 1445, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1446', 'Springer', 1446, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1447', 'Taos', 1447, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1448', 'Truth or Consequences', 1448, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1449', 'Tucumcari', 1449, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1450', 'Albany', 1450, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1451', 'Auburn', 1451, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1452', 'Binghamton', 1452, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1453', 'Buffalo', 1453, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1454', 'Elmira', 1454, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1455', 'Ithaca', 1455, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1456', 'Jamestown', 1456, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1457', 'New York', 1457, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1458', 'Newburgh', 1458, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1459', 'Niagara Falls', 1459, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1460', 'Ogdensburg', 1460, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1461', 'Plattsburgh', 1461, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1462', 'Rochester', 1462, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1463', 'Rome', 1463, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1464', 'Saranac Lake', 1464, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1465', 'Saratoga Springs', 1465, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1466', 'Schenectady', 1466, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1467', 'Syracuse', 1467, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1468', 'Troy', 1468, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1469', 'Utica', 1469, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1470', 'Watertown', 1470, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1471', 'Asheville', 1471, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1472', 'Charlotte', 1472, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1473', 'Durham', 1473, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1474', 'Elizabeth City', 1474, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1475', 'Fayetteville', 1475, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1476', 'Gastonia', 1476, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1477', 'Goldsboro', 1477, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1478', 'Greensboro', 1478, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1479', 'Greenville', 1479, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1480', 'Hickory', 1480, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1481', 'High Point', 1481, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1482', 'Jacksonville', 1482, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1483', 'New Bern', 1483, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1484', 'Raleigh', 1484, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1485', 'Rocky Mount', 1485, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1486', 'Wilmington', 1486, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1487', 'Winston Salem', 1487, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1488', 'Bismarck', 1488, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1489', 'Bottineau', 1489, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1490', 'Bowman', 1490, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1491', 'Carrington', 1491, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1492', 'Devils Lake', 1492, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1493', 'Dickinson', 1493, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1494', 'Ellendale', 1494, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1495', 'Fargo', 1495, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1496', 'Garrison', 1496, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1497', 'Grafton', 1497, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1498', 'Grand Forks', 1498, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1499', 'Harvey', 1499, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1500', 'Jamestown', 1500, 1, 1);
    `);
  await knex.raw(`
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1501', 'Mandan', 1501, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1502', 'Minot', 1502, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1503', 'Rugby', 1503, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1504', 'Wahpeton', 1504, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1505', 'Williston', 1505, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1506', 'Akron', 1506, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1507', 'Ashtabula', 1507, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1508', 'Canton', 1508, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1509', 'Chillicothe', 1509, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1510', 'Cincinnati', 1510, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1511', 'Cleveland', 1511, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1512', 'Columbus', 1512, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1513', 'Dayton', 1513, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1514', 'Findlay', 1514, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1515', 'Hamilton', 1515, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1516', 'Lancaster', 1516, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1517', 'Lima', 1517, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1518', 'Mansfield', 1518, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1519', 'Marion', 1519, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1520', 'Portsmouth', 1520, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1521', 'Springfield', 1521, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1522', 'Toledo', 1522, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1523', 'Youngstown', 1523, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1524', 'Ada', 1524, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1525', 'Altus', 1525, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1526', 'Alva', 1526, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1527', 'Ardmore', 1527, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1528', 'Bartlesville', 1528, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1529', 'Durant', 1529, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1530', 'Enid', 1530, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1531', 'Guymon', 1531, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1532', 'Idabel', 1532, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1533', 'Lawton', 1533, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1534', 'McAlester', 1534, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1535', 'Miami', 1535, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1536', 'Muskogee', 1536, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1537', 'Norman', 1537, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1538', 'Oklahoma City', 1538, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1539', 'Pauls Valley', 1539, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1540', 'Ponca City', 1540, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1541', 'Shawnee', 1541, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1542', 'Stillwater', 1542, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1543', 'Tulsa', 1543, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1544', 'Woodward', 1544, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1545', 'Albany', 1545, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1546', 'Ashland', 1546, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1547', 'Astoria', 1547, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1548', 'Baker City', 1548, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1549', 'Bend', 1549, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1550', 'Brookings', 1550, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1551', 'Burns', 1551, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1552', 'Coos Bay', 1552, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1553', 'Corvallis', 1553, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1554', 'Eugene', 1554, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1555', 'Florence', 1555, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1556', 'Grants Pass', 1556, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1557', 'John Day', 1557, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1558', 'Klamath Falls', 1558, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1559', 'La Grande', 1559, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1560', 'Lakeview', 1560, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1561', 'McMinnville', 1561, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1562', 'Medford', 1562, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1563', 'Newport', 1563, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1564', 'Ontario', 1564, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1565', 'Pendleton', 1565, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1566', 'Portland', 1566, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1567', 'Redmond', 1567, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1568', 'Roseburg', 1568, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1569', 'Salem', 1569, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1570', 'The Dalles', 1570, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1571', 'Tillamook', 1571, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1572', 'Allentown', 1572, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1573', 'Altoona', 1573, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1574', 'Erie', 1574, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1575', 'Harrisburg', 1575, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1576', 'Oil City', 1576, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1577', 'Philadelphia', 1577, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1578', 'Pittsburgh', 1578, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1579', 'Scranton', 1579, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1580', 'Wilkes Barre', 1580, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1581', 'Williamsport', 1581, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1582', 'Providence', 1582, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1583', 'Aiken', 1583, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1584', 'Anderson', 1584, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1585', 'Charleston', 1585, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1586', 'Columbia', 1586, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1587', 'Florence', 1587, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1588', 'Georgetown', 1588, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1589', 'Greenville', 1589, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1590', 'Hilton Head Island', 1590, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1591', 'Myrtle Beach', 1591, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1592', 'Spartanburg', 1592, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1593', 'Sumter', 1593, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1594', 'Aberdeen', 1594, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1595', 'Brookings', 1595, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1596', 'Chamberlain', 1596, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1597', 'Hot Springs', 1597, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1598', 'Huron', 1598, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1599', 'Milbank', 1599, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1600', 'Mitchell', 1600, 1, 1);
    `);
  await knex.raw(`
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1601', 'Mobridge', 1601, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1602', 'Pierre', 1602, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1603', 'Pine Ridge', 1603, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1604', 'Rapid City', 1604, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1605', 'Sioux Falls', 1605, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1606', 'Spearfish', 1606, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1607', 'Sturgis', 1607, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1608', 'Vermillion', 1608, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1609', 'Watertown', 1609, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1610', 'Yankton', 1610, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1611', 'Chattanooga', 1611, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1612', 'Clarksville', 1612, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1613', 'Columbia', 1613, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1614', 'Dyersburg', 1614, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1615', 'Jackson', 1615, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1616', 'Johnson City', 1616, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1617', 'Kingsport', 1617, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1618', 'Knoxville', 1618, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1619', 'Memphis', 1619, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1620', 'Murfreesboro', 1620, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1621', 'Nashville', 1621, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1622', 'Oak Ridge', 1622, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1623', 'Paris', 1623, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1624', 'Abilene', 1624, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1625', 'Alice', 1625, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1626', 'Alpine', 1626, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1627', 'Amarillo', 1627, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1628', 'Arlington', 1628, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1629', 'Austin', 1629, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1630', 'Bay City', 1630, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1631', 'Baytown', 1631, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1632', 'Beaumont', 1632, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1633', 'Beeville', 1633, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1634', 'Big Spring', 1634, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1635', 'Borger', 1635, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1636', 'Brownfield', 1636, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1637', 'Brownsville', 1637, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1638', 'Brownwood', 1638, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1639', 'Bryan', 1639, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1640', 'Childress', 1640, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1641', 'Cleburne', 1641, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1642', 'Corpus Christi', 1642, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1643', 'Corsicana', 1643, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1644', 'Dalhart', 1644, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1645', 'Dallas', 1645, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1646', 'Del Rio', 1646, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1647', 'Denton', 1647, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1648', 'Eagle Pass', 1648, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1649', 'El Paso', 1649, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1650', 'Fort Stockton', 1650, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1651', 'Fort Worth', 1651, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1652', 'Freeport', 1652, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1653', 'Gainesville', 1653, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1654', 'Galveston', 1654, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1655', 'Harlingen', 1655, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1656', 'Hereford', 1656, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1657', 'Houston', 1657, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1658', 'Huntsville', 1658, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1659', 'Kerrville', 1659, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1660', 'Killeen', 1660, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1661', 'Kingsville', 1661, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1662', 'Lamesa', 1662, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1663', 'Laredo', 1663, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1664', 'Longview', 1664, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1665', 'Lubbock', 1665, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1666', 'Lufkin', 1666, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1667', 'McAllen', 1667, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1668', 'Midland', 1668, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1669', 'Monahans', 1669, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1670', 'Mount Pleasant', 1670, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1671', 'Nacogdoches', 1671, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1672', 'New Braunfels', 1672, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1673', 'Odessa', 1673, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1674', 'Palestine', 1674, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1675', 'Pampa', 1675, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1676', 'Paris', 1676, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1677', 'Pecos', 1677, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1678', 'Perryton', 1678, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1679', 'Plainview', 1679, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1680', 'Port Arthur', 1680, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1681', 'Port Lavaca', 1681, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1682', 'Presidio', 1682, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1683', 'San Angelo', 1683, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1684', 'San Antonio', 1684, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1685', 'San Marcos', 1685, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1686', 'Sherman', 1686, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1687', 'Snyder', 1687, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1688', 'Sweetwater', 1688, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1689', 'Taylor', 1689, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1690', 'Temple', 1690, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1691', 'Texarkana', 1691, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1692', 'Tyler', 1692, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1693', 'Van Horn', 1693, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1694', 'Vernon', 1694, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1695', 'Victoria', 1695, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1696', 'Waco', 1696, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1697', 'Wichita Falls', 1697, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1698', 'Zapata', 1698, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1699', 'Blanding', 1699, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id,
                                 updated_by_user_id)
    VALUES (${codeHeaderId}, 'city-1700', 'Brigham City', 1700, 1, 1);
  `);
  await knex.raw(`
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1701', 'Cedar City', 1701, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1702', 'Delta', 1702, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1703', 'Green River', 1703, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1704', 'Logan', 1704, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1705', 'Moab', 1705, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1706', 'Monticello', 1706, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1707', 'Nephi', 1707, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1708', 'Ogden', 1708, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1709', 'Orem', 1709, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1710', 'Panguitch', 1710, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1711', 'Price', 1711, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1712', 'Provo', 1712, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1713', 'Richfield', 1713, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1714', 'Salt Lake City', 1714, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1715', 'St George', 1715, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1716', 'Vernal', 1716, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1717', 'Wendover', 1717, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1718', 'Burlington', 1718, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1719', 'Montpelier', 1719, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1720', 'Rutland', 1720, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1721', 'Alexandria', 1721, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1722', 'Blacksburg', 1722, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1723', 'Charlottesville', 1723, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1724', 'Danville', 1724, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1725', 'Lynchburg', 1725, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1726', 'Martinsville', 1726, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1727', 'Newport News', 1727, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1728', 'Norfolk', 1728, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1729', 'Petersburg', 1729, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1730', 'Richmond', 1730, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1731', 'Roanoke', 1731, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1732', 'Staunton', 1732, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1733', 'Virginia Beach', 1733, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1734', 'Aberdeen', 1734, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1735', 'Bellingham', 1735, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1736', 'Bremerton', 1736, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1737', 'Centralia', 1737, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1738', 'Chelan', 1738, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1739', 'Colville', 1739, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1740', 'Ellensburg', 1740, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1741', 'Everett', 1741, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1742', 'Kennewick', 1742, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1743', 'Longview', 1743, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1744', 'Mount Vernon', 1744, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1745', 'Olympia', 1745, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1746', 'Omak', 1746, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1747', 'Port Angeles', 1747, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1748', 'Pullman', 1748, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1749', 'Richland', 1749, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1750', 'Seattle', 1750, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1751', 'Spokane', 1751, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1752', 'Tacoma', 1752, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1753', 'Vancouver', 1753, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1754', 'Walla Walla', 1754, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1755', 'Wenatchee', 1755, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1756', 'Yakima', 1756, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1757', 'Beckley', 1757, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1758', 'Bluefield', 1758, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1759', 'Charleston', 1759, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1760', 'Clarksburg', 1760, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1761', 'Huntington', 1761, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1762', 'Morgantown', 1762, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1763', 'Parkersburg', 1763, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1764', 'Wheeling', 1764, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1765', 'Appleton', 1765, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1766', 'Ashland', 1766, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1767', 'Eau Claire', 1767, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1768', 'Green Bay', 1768, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1769', 'Janesville', 1769, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1770', 'La Crosse', 1770, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1771', 'Madison', 1771, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1772', 'Manitowoc', 1772, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1773', 'Marinette', 1773, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1774', 'Milwaukee', 1774, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1775', 'Oshkosh', 1775, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1776', 'Racine', 1776, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1777', 'Sheboygan', 1777, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1778', 'Superior', 1778, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1779', 'Wausau', 1779, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1780', 'West Bend', 1780, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1781', 'Buffalo', 1781, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1782', 'Casper', 1782, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1783', 'Cheyenne', 1783, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1784', 'Cody', 1784, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1785', 'Gillette', 1785, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1786', 'Green River', 1786, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1787', 'Greybull', 1787, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1788', 'Jackson', 1788, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1789', 'Kemmerer', 1789, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1790', 'Lander', 1790, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1791', 'Laramie', 1791, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1792', 'Lusk', 1792, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1793', 'Newcastle', 1793, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1794', 'Rawlins', 1794, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1795', 'Riverton', 1795, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1796', 'Rock Springs', 1796, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1797', 'Sheridan', 1797, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1798', 'Thermopolis', 1798, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1799', 'Torrington', 1799, 1, 1);
    INSERT INTO invasivesbc.code(code_header_id, code_name, code_description, code_sort_order, created_by_user_id, updated_by_user_id) VALUES (${codeHeaderId}, 'city-1800', 'Worland', 1800, 1, 1);
    `);
}

export async function down(knex: Knex) {
  const insertedHeader = await knex.raw(`
  	SELECT code_header_id FROM invasivesbc.code_header WHERE code_header_name = 'major_cities';
  `);

  const codeHeaderId = insertedHeader.rows[0].code_header_id;

  await knex.raw(`
  	DELETE FROM invasivesbc.code WHERE code_header_id = ${codeHeaderId};
  	DELETE FROM invasivesbc.code_header WHERE code_header_name = 'major_cities';
  `);
}
