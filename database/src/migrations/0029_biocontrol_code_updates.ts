import { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.raw(
    //language=PostgreSQL
    `
-- insert agent into bio agent codes
INSERT INTO invasivesbc.code
            (code_header_id,
             code_name,
             code_description,
             created_by_user_id,
             updated_by_user_id)
SELECT code_header_id,
       code_name,
       code_description,
       created_by_user_id,
       updated_by_user_id
FROM   (VALUES (43,
       'CHEIGRO',
       'CHEIGRO [Cheilosia grossa]',
       1,
       1)) AS new_codes (code_header_id, code_name, code_description,
       created_by_user_id, updated_by_user_id)
WHERE  NOT EXISTS (SELECT 1
                   FROM   invasivesbc.code existing_codes
                   WHERE  existing_codes.code_description =
                          new_codes.code_description);

-- update agent code sort order
WITH ordered_alphabetically
     AS (SELECT code_id,
                Row_number()
                  OVER (
                    ORDER BY code_description) AS new_sort_order
         FROM   invasivesbc.code
         WHERE  code_header_id = 43)
UPDATE invasivesbc.code
SET    code_sort_order = ordered_alphabetically.new_sort_order
FROM   ordered_alphabetically
WHERE  invasivesbc.code.code_id = ordered_alphabetically.code_id;

-- insert plants into ip with biocontrol codes
INSERT INTO invasivesbc.code
            (code_header_id,
             code_name,
             code_description,
             created_by_user_id,
             updated_by_user_id)
SELECT code_header_id,
       code_name,
       code_description,
       created_by_user_id,
       updated_by_user_id
FROM   (VALUES (78,
       'RC',
       'European common reed (PHRA AUS Phragmites australis subsp. australis)',
       1,
       1),
               (78,
       'GK',
       'Giant knotweed (FALL SAC Reynoutria / Fallopia sachalinensis)',
       1,
       1),
               (78,
       'QH',
       'Queendevil hawkweed (HIER PRA Pilosella praealta / Hieracium praealtum)'
       ,
       1,
       1),
               (78,
       'TH',
       'Tall hawkweed (HIER PIL Pilosella / Hieracium piloselloides)',
       1,
       1)) AS new_codes (code_header_id, code_name, code_description,
       created_by_user_id, updated_by_user_id)
WHERE  NOT EXISTS (SELECT 1
                   FROM   invasivesbc.code existing_codes
                   WHERE  existing_codes.code_description =
                          new_codes.code_description);

-- update code sort order
WITH ordered_alphabetically
     AS (SELECT code_id,
                Row_number()
                  OVER (
                    ORDER BY code_description) AS new_sort_order
         FROM   invasivesbc.code
         WHERE  code_header_id = 78)
UPDATE invasivesbc.code
SET    code_sort_order = ordered_alphabetically.new_sort_order
FROM   ordered_alphabetically
WHERE  invasivesbc.code.code_id = ordered_alphabetically.code_id;

-- update agent description typos
UPDATE invasivesbc.code
SET    code_description = CASE
                            WHEN code_name = 'CYSTSON' THEN
                            'CYSTSON [Cystiphora sonchi]'
                            WHEN code_name = 'MOGUCRU' THEN
                            'MOGUCRU [Mogulones crucifer]'
                            WHEN code_name = 'SCLESCL' THEN
                            'SCLESCL [Sclerotinia sclerotiorum]'
                            WHEN code_name = 'TYRIJAC' THEN
                            'TYRIJAC [Tyria jacobaeae]'
                            WHEN code_name = 'UROPSOL' THEN
                            'UROPSOL [Urophora solstitialis]'
                            WHEN code_name = 'ACERANG' THEN
                            'ACERANG [Aceria angustifoliae]'
                          END
WHERE  code_header_id = 43
       AND code_name IN ( 'CYSTSON', 'MOGUCRU', 'SCLESCL', 'TYRIJAC',
                          'UROPSOL', 'ACERANG' );

-- insert plant agent combinations
INSERT INTO invasivesbc.plant_agent_treatment
            (plant_code_name,
             agent_code_name)
VALUES      ('BT',
             'CHEIGRO'),
            ('CT',
             'CHEIGRO'),
            ('DK',
             'BANGFAU'),
            ('SK',
             'BANGFAU'),
            ('GK',
             'APHAITA'),
            ('SK',
             'TEREVIR'); 
    `
  );
}

export async function down(knex: Knex) {
  //language=PostgreSQL
  await knex.raw(
    `
-- delete plant agent combinations
DELETE FROM invasivesbc.plant_agent_treatment
WHERE  ( ( plant_code_name = 'BT'
           AND agent_code_name = 'CHEIGRO' )
          OR ( plant_code_name = 'CT'
               AND agent_code_name = 'CHEIGRO' )
          OR ( plant_code_name = 'DK'
               AND agent_code_name = 'BANGFAU' )
          OR ( plant_code_name = 'SK'
               AND agent_code_name = 'BANGFAU' )
          OR ( plant_code_name = 'GK'
               AND agent_code_name = 'APHAITA' )
          OR ( plant_code_name = 'SK'
               AND agent_code_name = 'TEREVIR' ) );

-- delete agent code
DELETE FROM invasivesbc.code
WHERE  code_header_id = 43
       AND code_name IN ( 'CHEIGRO' );

-- update agent code sort order
WITH ordered_alphabetically
     AS (SELECT code_id,
                Row_number()
                  OVER (
                    ORDER BY code_description) AS new_sort_order
         FROM   invasivesbc.code
         WHERE  code_header_id = 43)
UPDATE invasivesbc.code
SET    code_sort_order = ordered_alphabetically.new_sort_order
FROM   ordered_alphabetically
WHERE  invasivesbc.code.code_id = ordered_alphabetically.code_id;

-- delete ip with bioctronol codes
DELETE FROM invasivesbc.code
WHERE  code_header_id = 78
       AND code_name IN ( 'RC', 'GK', 'QH', 'TH' );

-- update sort order
WITH ordered_alphabetically
     AS (SELECT code_id,
                Row_number()
                  OVER (
                    ORDER BY code_description) AS new_sort_order
         FROM   invasivesbc.code
         WHERE  code_header_id = 78)
UPDATE invasivesbc.code
SET    code_sort_order = ordered_alphabetically.new_sort_order
FROM   ordered_alphabetically
WHERE  invasivesbc.code.code_id = ordered_alphabetically.code_id;

-- update agent code description
UPDATE invasivesbc.code
SET    code_description = CASE
                            WHEN code_name = 'CYSTSON' THEN
                            'CYSTSON [Cystophora sonchi]'
                            WHEN code_name = 'MOGUCRU' THEN
                            'MOGUCRU [Mogulones cruciger]'
                            WHEN code_name = 'SCLESCL' THEN
                            'SCLESCL [Sclerotinia sclerotium]'
                            WHEN code_name = 'TYRIJAC' THEN
                            'TYRIJAC [Tyria jacobeae]'
                            WHEN code_name = 'UROPSOL' THEN
                            'UROPSOL [Urophora solstitialus]'
                            WHEN code_name = 'ACERANG' THEN
                            'ACERANG [Aceria angustifolia]'
                          END
WHERE  code_header_id = 43
       AND code_name IN ( 'CYSTSON', 'MOGUCRU', 'SCLESCL', 'TYRIJAC',
                          'UROPSOL', 'ACERANG' ); 

    `
  );
}
