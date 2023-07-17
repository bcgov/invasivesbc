import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    set search_path = invasivesbc,public;
    
    UPDATE user_role
    SET role_description = 
      CASE 
          WHEN role_id = 12 THEN 'Non-Provincial Government Manager - Animals'
          WHEN role_id = 13 THEN 'Non-Provincial Government Manager - Plants'
          WHEN role_id = 14 THEN 'Non-Provincial Government Manager - Both'
          WHEN role_id = 15 THEN 'Non-Provincial Government Staff - Animals'
          WHEN role_id = 16 THEN 'Non-Provincial Government Staff - Plants'
          WHEN role_id = 17 THEN 'Non-Provincial Government Staff - Both'
          ELSE role_description
      END;
  
      INSERT INTO code
      (code_header_id, code_name, code_description, code_sort_order, valid_from, valid_to, created_at, updated_at, created_by_user_id, updated_by_user_id)
      VALUES(79, 'TTS', 'Tree Top Services', 1, now(), null, now(), now(), 1, 1),
      (79, 'ONA', 'Okanagan Nation Alliance', 1, now(), null, now(), now(), 1, 1),
      (79, 'FCL', 'Forsite Consultants Ltd.', 1, now(), null, now(), now(), 1, 1);
      
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
    
  UPDATE user_role
  SET role_description = 
    CASE 
        WHEN role_id = 12 THEN 'Indigenous/Local Gov/RISO Manager - Animals'
        WHEN role_id = 13 THEN 'Indigenous/Local Gov/RISO Manager - Plants'
        WHEN role_id = 14 THEN 'Indigenous/Local Gov/RISO Manager - Both'
        WHEN role_id = 15 THEN 'Indigenous/Local Gov/RISO Staff - Animals'
        WHEN role_id = 16 THEN 'Indigenous/Local Gov/RISO Staff - Plants'
        WHEN role_id = 17 THEN 'Indigenous/Local Gov/RISO Staff - Both'
        ELSE role_description
    END;

    DELETE FROM code
    WHERE (code_header_id = 79
    AND code_name IN ('TTS','ONA', 'FCL'));
    
    UPDATE code AS c
    SET code_sort_order = subquery.row_number
    FROM (
      SELECT code_id, ROW_NUMBER() OVER (PARTITION BY code_header_id ORDER BY code_header_id, code_description) AS row_number
      FROM code
    ) AS subquery
    WHERE c.code_id = subquery.code_id;

  `);
}
