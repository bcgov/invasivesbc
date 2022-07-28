import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';
const NODE_ENV = process.env.NODE_ENV;

export async function up(knex: Knex): Promise<void> {
  const sql = `
  set search_path=invasivesbc,public;

--create full name columns
ALTER TABLE activity_incoming_data DROP COLUMN IF EXISTS species_positive_full, ADD COLUMN species_positive_full TEXT;
ALTER TABLE activity_incoming_data DROP COLUMN IF EXISTS species_negative_full, ADD COLUMN species_negative_full TEXT;
ALTER TABLE activity_incoming_data DROP COLUMN IF EXISTS species_treated_full, ADD COLUMN species_treated_full TEXT;

--adapt species_treated to match
ALTER TABLE activity_incoming_data ALTER COLUMN species_treated TYPE jsonb USING species_treated::jsonb;

--fixes null values to allow for jsonb_array_elements_text function
UPDATE activity_incoming_data
SET species_positive  = '[null]'
WHERE jsonb_typeof(species_positive) <> 'array' or species_positive  = '[]';

UPDATE activity_incoming_data
SET species_negative  = '[null]'
WHERE jsonb_typeof(species_negative) <> 'array' or species_negative  = '[]';

UPDATE activity_incoming_data
SET species_treated  = '[null]'
WHERE jsonb_typeof(species_treated) <> 'array' or species_treated  = '[]';

--https://stackoverflow.com/questions/50296102/cannot-extract-elements-from-a-scalar

--species_positive 
WITH names AS (
	SELECT activity_incoming_data_id AS id, array_to_string(ARRAY_AGG(invbc_name), ', ') AS full_name FROM 
		iapp_invbc_mapping, 
		(SELECT jsonb_array_elements_text(species_positive) AS code, activity_incoming_data_id
			FROM activity_incoming_data
			GROUP BY activity_incoming_data_id
		) AS sub 
	WHERE char_code = sub.code
	GROUP BY activity_incoming_data_id
)

UPDATE activity_incoming_data aid
SET species_positive_full = names.full_name 
FROM names
WHERE aid.activity_incoming_data_id = names.id;

--species_negative 
WITH names AS (
	SELECT activity_incoming_data_id AS id, array_to_string(ARRAY_AGG(invbc_name), ', ') AS full_name FROM 
		iapp_invbc_mapping, 
		(SELECT jsonb_array_elements_text(species_negative) AS code, activity_incoming_data_id
			FROM activity_incoming_data
			GROUP BY activity_incoming_data_id
		) AS sub 
	WHERE char_code = sub.code
	GROUP BY activity_incoming_data_id
)

UPDATE activity_incoming_data aid
SET species_negative_full = names.full_name 
FROM names
WHERE aid.activity_incoming_data_id = names.id;

--species_treated 
WITH names AS (
	SELECT activity_incoming_data_id AS id, array_to_string(ARRAY_AGG(invbc_name), ', ') AS full_name FROM 
		iapp_invbc_mapping, 
		(SELECT jsonb_array_elements_text(species_treated) AS code, activity_incoming_data_id
			FROM activity_incoming_data
			GROUP BY activity_incoming_data_id
		) AS sub 
	WHERE char_code = sub.code
	GROUP BY activity_incoming_data_id
)

UPDATE activity_incoming_data aid
SET species_treated_full = names.full_name 
FROM names
WHERE aid.activity_incoming_data_id = names.id;




-- TODO: THIS UPDATES EVERY SINGLE COLUMN, NEED TO ONLY UPDATE THE CURRENT ROW JUST INSERTED




CREATE OR REPLACE FUNCTION code_to_name()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
    AS  
$$
BEGIN
    UPDATE activity_incoming_data
    SET species_positive  = '[null]'
    WHERE       (jsonb_typeof(species_positive) <> 'array' or species_positive  = '[]')
    AND         activity_incoming_data_id  =  (  select activity_incoming_data_id 
                                                from activity_current 
                                                where activity_current.activity_id = new.activity_id
	);

	UPDATE activity_incoming_data
    SET species_negative  = '[null]'
    WHERE       (jsonb_typeof(species_negative) <> 'array' or species_negative  = '[]')
    AND         activity_incoming_data_id  =  (  select activity_incoming_data_id 
                                                from activity_current 
                                                where activity_current.activity_id = new.activity_id
	);

	UPDATE activity_incoming_data
    SET species_treated  = '[null]'
    WHERE       (jsonb_typeof(species_treated) <> 'array' or species_treated  = '[]')
    AND         activity_incoming_data_id  =  (  select activity_incoming_data_id 
                                                from activity_current 
                                                where activity_current.activity_id = new.activity_id
	);

	--species positive full names
	WITH names AS (
		SELECT activity_incoming_data_id AS id, array_to_string(ARRAY_AGG(invbc_name), ', ') AS full_name FROM 
			iapp_invbc_mapping, 
			(SELECT jsonb_array_elements_text(species_positive) AS code, activity_incoming_data_id
				FROM activity_incoming_data
				GROUP BY activity_incoming_data_id
			) AS sub 
		WHERE char_code = sub.code AND activity_incoming_data_id = (  select activity_incoming_data_id 
                                                from activity_current 
                                                where activity_current.activity_id = new.activity_id	)
		GROUP BY activity_incoming_data_id
	)

	UPDATE activity_incoming_data aid
	SET species_positive_full = names.full_name 
	FROM names
	WHERE aid.activity_incoming_data_id = names.id AND activity_incoming_data_id = (  select activity_incoming_data_id 
                                                from activity_current 
                                                where activity_current.activity_id = new.activity_id	);

                                               
                                               
	--species negative full
	WITH names AS (
		SELECT activity_incoming_data_id AS id, array_to_string(ARRAY_AGG(invbc_name), ', ') AS full_name FROM 
			iapp_invbc_mapping, 
			(SELECT jsonb_array_elements_text(species_negative) AS code, activity_incoming_data_id
				FROM activity_incoming_data
				GROUP BY activity_incoming_data_id
			) AS sub 
		WHERE char_code = sub.code AND activity_incoming_data_id = (  select activity_incoming_data_id 
                                                from activity_current 
                                                where activity_current.activity_id = new.activity_id	)
		GROUP BY activity_incoming_data_id
	)

	UPDATE activity_incoming_data aid
	SET species_negative_full = names.full_name 
	FROM names
	WHERE aid.activity_incoming_data_id = names.id AND activity_incoming_data_id = (  select activity_incoming_data_id 
                                                from activity_current 
                                                where activity_current.activity_id = new.activity_id	);

	--species treated full
	WITH names AS (
		SELECT activity_incoming_data_id AS id, array_to_string(ARRAY_AGG(invbc_name), ', ') AS full_name FROM 
			iapp_invbc_mapping, 
			(SELECT jsonb_array_elements_text(species_treated) AS code, activity_incoming_data_id
				FROM activity_incoming_data
				GROUP BY activity_incoming_data_id
			) AS sub 
		WHERE char_code = sub.code AND activity_incoming_data_id = (  select activity_incoming_data_id 
                                                from activity_current 
                                                where activity_current.activity_id = new.activity_id	)
		GROUP BY activity_incoming_data_id
	)

	UPDATE activity_incoming_data aid
	SET species_treated_full = names.full_name 
	FROM names
	WHERE aid.activity_incoming_data_id = names.id AND aid.activity_incoming_data_id = (  select activity_incoming_data_id 
                                                from activity_current 
                                                where activity_current.activity_id = new.activity_id	);

    RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS species_full_name ON activity_incoming_data;
CREATE TRIGGER species_full_name 
AFTER INSERT 
ON activity_incoming_data
FOR EACH ROW 
EXECUTE PROCEDURE code_to_name();
  `;

  await knex.raw(sql);
}

/**
 * Drop the trigger.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;
    DROP TRIGGER IF EXISTS species_full_name ON activity_incoming_data;
  `);
}