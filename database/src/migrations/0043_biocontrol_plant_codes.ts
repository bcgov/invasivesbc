import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    set search_path=invasivesbc,public;

    DELETE FROM code
    WHERE code_header_id = 78 and code_name = 'BU';
    
    INSERT INTO code
    (code_header_id, code_name, code_description, code_sort_order, valid_from, valid_to, created_at, updated_at, created_by_user_id, updated_by_user_id)
    VALUES(78, 'BU', 'Common burdock (ARCT MIN Arctium minus)', 1, now(), null, now(), now(), 1, 1),
    (78, 'FR', 'Flowering rush (BUTO UMB Butomus umbellatus)', 1, now(), null, now(), now(), 1, 1),
    (78, 'AP', 'Garlic mustard (ALLI PET Alliaria petiolata)', 1, now(), null, now(), now(), 1, 1),
    (78, 'GB', 'Great burdock (ARCT LAP Arctium lappa)', 1, now(), null, now(), now(), 1, 1),
    (78, 'OD', 'Oxeye daisy (LEUC VUL Leucanthemum vulgare)', 1, now(), null, now(), now(), 1, 1),
    (78, 'RO', 'Russian olive (ELAE ANG Elaeagnus angustifolia)', 1, now(), null, now(), now(), 1, 1);
    
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
  WHERE code_header_id = 78 and code_name in ('BU', 'FR', 'AP', 'GB', 'OD', 'RO');

  `);
}
