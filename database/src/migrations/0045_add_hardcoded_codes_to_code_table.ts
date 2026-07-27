import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  //language=PostgreSQL
  await knex.raw(
    `
-- code headers

INSERT INTO invasivesbc.code_header
(
    code_category_id,
    code_header_name,
    code_header_title,
    code_header_description,
    valid_from,
    valid_to,
    created_at,
    updated_at,
    created_by_user_id,
    updated_by_user_id
)
SELECT
    v.code_category_id,
    v.code_header_name,
    v.code_header_title,
    v.code_header_description,
    now(),
    NULL,
    now(),
    now(),
    1,
    1
FROM (
    VALUES
        (2, 'wind_direction', 'wind_direction', 'wind_direction'),
        (2, 'observation_type', 'observation_type', 'observation_type'),
        (2, 'disposed_material_format', 'disposed_material_format', 'disposed_material_format'),
        (2, 'yes_no', 'yes_no', 'yes_no'),
        (2, 'monitoring_type', 'monitoring_type', 'monitoring_type'),
        (2, 'water_level_management', 'water_level_management', 'water_level_management'),
        (2, 'waterbody_type_code', 'waterbody_type_code', 'waterbody_type_code'),
        (2, 'substrate_type_code', 'substrate_type_code', 'substrate_type_code'),
        (2, 'treatment_pass_code', 'treatment_pass_code', 'treatment_pass_code')
) AS v(
    code_category_id,
    code_header_name,
    code_header_title,
    code_header_description
)
WHERE NOT EXISTS (
    SELECT 1
    FROM invasivesbc.code_header ch
    WHERE ch.code_header_name = v.code_header_name
);


-- wind_direction

WITH header AS (
    SELECT code_header_id
    FROM invasivesbc.code_header
    WHERE code_header_name = 'wind_direction'
)
INSERT INTO invasivesbc.code
(
    code_header_id,
    code_name,
    code_description,
    code_sort_order,
    valid_from,
    valid_to,
    created_at,
    updated_at,
    created_by_user_id,
    updated_by_user_id
)
SELECT
    h.code_header_id,
    v.code_name,
    v.code_description,
    v.code_sort_order,
    now(),
    NULL,
    now(),
    now(),
    1,
    1
FROM header h
CROSS JOIN (
    VALUES
        ('No Wind', 'No Wind', 1),
        ('N', 'North', 2),
        ('NE', 'Northeast', 3),
        ('E', 'East', 4),
        ('SE', 'Southeast', 5),
        ('S', 'South', 6),
        ('SW', 'Southwest', 7),
        ('W', 'West', 8),
        ('NW', 'Northwest', 9)
) AS v(code_name, code_description, code_sort_order)
WHERE NOT EXISTS (
    SELECT 1
    FROM invasivesbc.code c
    WHERE c.code_header_id = h.code_header_id
      AND c.code_name = v.code_name
);


-- observation_type

WITH header AS (
    SELECT code_header_id
    FROM invasivesbc.code_header
    WHERE code_header_name = 'observation_type'
)
INSERT INTO invasivesbc.code
(
    code_header_id,
    code_name,
    code_description,
    code_sort_order,
    valid_from,
    valid_to,
    created_at,
    updated_at,
    created_by_user_id,
    updated_by_user_id
)
SELECT
    h.code_header_id,
    v.code_name,
    v.code_description,
    v.code_sort_order,
    now(),
    NULL,
    now(),
    now(),
    1,
    1
FROM header h
CROSS JOIN (
    VALUES
        ('Positive Observation', 'Positive Observation', 1),
        ('Negative Observation', 'Negative Observation', 2)
) AS v(code_name, code_description, code_sort_order)
WHERE NOT EXISTS (
    SELECT 1
    FROM invasivesbc.code c
    WHERE c.code_header_id = h.code_header_id
      AND c.code_name = v.code_name
);


-- disposed_material_format

WITH header AS (
    SELECT code_header_id
    FROM invasivesbc.code_header
    WHERE code_header_name = 'disposed_material_format'
)
INSERT INTO invasivesbc.code
(
    code_header_id,
    code_name,
    code_description,
    code_sort_order,
    valid_from,
    valid_to,
    created_at,
    updated_at,
    created_by_user_id,
    updated_by_user_id
)
SELECT
    h.code_header_id,
    v.code_name,
    v.code_description,
    v.code_sort_order,
    now(),
    NULL,
    now(),
    now(),
    1,
    1
FROM header h
CROSS JOIN (
    VALUES
        ('number of plants', 'number of plants', 1),
        ('weight', 'weight', 2),
        ('volume (m3)', 'volume (m3)', 3)
) AS v(code_name, code_description, code_sort_order)
WHERE NOT EXISTS (
    SELECT 1
    FROM invasivesbc.code c
    WHERE c.code_header_id = h.code_header_id
      AND c.code_name = v.code_name
);


-- yes_no

WITH header AS (
    SELECT code_header_id
    FROM invasivesbc.code_header
    WHERE code_header_name = 'yes_no'
)
INSERT INTO invasivesbc.code
(
    code_header_id,
    code_name,
    code_description,
    code_sort_order,
    valid_from,
    valid_to,
    created_at,
    updated_at,
    created_by_user_id,
    updated_by_user_id
)
SELECT
    h.code_header_id,
    v.code_name,
    v.code_description,
    v.code_sort_order,
    now(),
    NULL,
    now(),
    now(),
    1,
    1
FROM header h
CROSS JOIN (
    VALUES
        ('Yes', 'Yes', 1),
        ('No', 'No', 2)
) AS v(code_name, code_description, code_sort_order)
WHERE NOT EXISTS (
    SELECT 1
    FROM invasivesbc.code c
    WHERE c.code_header_id = h.code_header_id
      AND c.code_name = v.code_name
);


-- monitoring_type

WITH header AS (
    SELECT code_header_id
    FROM invasivesbc.code_header
    WHERE code_header_name = 'monitoring_type'
)
INSERT INTO invasivesbc.code
(
    code_header_id,
    code_name,
    code_description,
    code_sort_order,
    valid_from,
    valid_to,
    created_at,
    updated_at,
    created_by_user_id,
    updated_by_user_id
)
SELECT
    h.code_header_id,
    v.code_name,
    v.code_description,
    v.code_sort_order,
    now(),
    NULL,
    now(),
    now(),
    1,
    1
FROM header h
CROSS JOIN (
    VALUES
        ('Count', 'Count', 1),
        ('Timed', 'Timed', 2)
) AS v(code_name, code_description, code_sort_order)
WHERE NOT EXISTS (
    SELECT 1
    FROM invasivesbc.code c
    WHERE c.code_header_id = h.code_header_id
      AND c.code_name = v.code_name
);


-- water_level_management

WITH header AS (
    SELECT code_header_id
    FROM invasivesbc.code_header
    WHERE code_header_name = 'water_level_management'
)
INSERT INTO invasivesbc.code
(
    code_header_id,
    code_name,
    code_description,
    code_sort_order,
    valid_from,
    valid_to,
    created_at,
    updated_at,
    created_by_user_id,
    updated_by_user_id
)
SELECT
    h.code_header_id,
    v.code_name,
    v.code_description,
    v.code_sort_order,
    now(),
    NULL,
    now(),
    now(),
    1,
    1
FROM header h
CROSS JOIN (
    VALUES
        ('Dam', 'Dam', 1),
        ('None', 'None', 2),
        ('Other', 'Other', 3),
        ('Station', 'Station', 4),
        ('Weir', 'Weir', 5)
) AS v(code_name, code_description, code_sort_order)
WHERE NOT EXISTS (
    SELECT 1
    FROM invasivesbc.code c
    WHERE c.code_header_id = h.code_header_id
      AND c.code_name = v.code_name
);


-- waterbody_type_code

WITH header AS (
    SELECT code_header_id
    FROM invasivesbc.code_header
    WHERE code_header_name = 'waterbody_type_code'
)
INSERT INTO invasivesbc.code
(
    code_header_id,
    code_name,
    code_description,
    code_sort_order,
    valid_from,
    valid_to,
    created_at,
    updated_at,
    created_by_user_id,
    updated_by_user_id
)
SELECT
    h.code_header_id,
    v.code_name,
    v.code_description,
    v.code_sort_order,
    now(),
    NULL,
    now(),
    now(),
    1,
    1
FROM header h
CROSS JOIN (
    VALUES
        ('Bog', 'Bog', 1),
        ('Confined Pond', 'Confined Pond', 2),
        ('Discharging Pond', 'Discharging Pond', 3),
        ('Ditch', 'Ditch', 4),
        ('Intertidal', 'Intertidal', 5),
        ('Lake', 'Lake', 6),
        ('River', 'River', 7),
        ('Slough', 'Slough', 8),
        ('Stream', 'Stream', 9),
        ('Wetland', 'Wetland', 10)
) AS v(code_name, code_description, code_sort_order)
WHERE NOT EXISTS (
    SELECT 1
    FROM invasivesbc.code c
    WHERE c.code_header_id = h.code_header_id
      AND c.code_name = v.code_name
);


-- substrate_type_code

WITH header AS (
    SELECT code_header_id
    FROM invasivesbc.code_header
    WHERE code_header_name = 'substrate_type_code'
)
INSERT INTO invasivesbc.code
(
    code_header_id,
    code_name,
    code_description,
    code_sort_order,
    valid_from,
    valid_to,
    created_at,
    updated_at,
    created_by_user_id,
    updated_by_user_id
)
SELECT
    h.code_header_id,
    v.code_name,
    v.code_description,
    v.code_sort_order,
    now(),
    NULL,
    now(),
    now(),
    1,
    1
FROM header h
CROSS JOIN (
    VALUES
        ('Clay', 'Clay', 1),
        ('Cobble', 'Cobble', 2),
        ('Concrete', 'Concrete', 3),
        ('Gravel', 'Gravel', 4),
        ('Rip-rap', 'Rip-rap', 5),
        ('Sand', 'Sand', 6),
        ('Silt/Organic', 'Silt/Organic', 7)
) AS v(code_name, code_description, code_sort_order)
WHERE NOT EXISTS (
    SELECT 1
    FROM invasivesbc.code c
    WHERE c.code_header_id = h.code_header_id
      AND c.code_name = v.code_name
);


-- treatment_pass_code

WITH header AS (
    SELECT code_header_id
    FROM invasivesbc.code_header
    WHERE code_header_name = 'treatment_pass_code'
)
INSERT INTO invasivesbc.code
(
    code_header_id,
    code_name,
    code_description,
    code_sort_order,
    valid_from,
    valid_to,
    created_at,
    updated_at,
    created_by_user_id,
    updated_by_user_id
)
SELECT
    h.code_header_id,
    v.code_name,
    v.code_description,
    v.code_sort_order,
    now(),
    NULL,
    now(),
    now(),
    1,
    1
FROM header h
CROSS JOIN (
    VALUES
        ('First', 'First', 1),
        ('Second', 'Second', 2),
        ('Third', 'Third', 3),
        ('Unknown', 'Unknown', 4)
) AS v(code_name, code_description, code_sort_order)
WHERE NOT EXISTS (
    SELECT 1
    FROM invasivesbc.code c
    WHERE c.code_header_id = h.code_header_id
      AND c.code_name = v.code_name
);


-- sort codes 

UPDATE invasivesbc.code AS c
SET code_sort_order = s.row_number
FROM (
    SELECT
        code_id,
        ROW_NUMBER() OVER (
            PARTITION BY code_header_id
            ORDER BY code_description
        ) AS row_number
    FROM invasivesbc.code
    WHERE code_header_id IN (
        SELECT code_header_id
        FROM invasivesbc.code_header
        WHERE code_header_name IN (
            'wind_direction',
            'observation_type',
            'disposed_material_format',
            'yes_no',
            'monitoring_type',
            'water_level_management',
            'waterbody_type_code',
            'substrate_type_code',
            'treatment_pass_code'
        )
    )
) AS s
WHERE c.code_id = s.code_id;
    `
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(
    //language=PostgreSQL
    `
DELETE FROM invasivesbc.code
WHERE code_header_id IN (
    SELECT code_header_id
    FROM invasivesbc.code_header
    WHERE code_header_name IN (
        'wind_direction',
        'observation_type',
        'disposed_material_format',
        'yes_no',
        'monitoring_type',
        'water_level_management',
        'waterbody_type_code',
        'substrate_type_code',
        'treatment_pass_code'
    )
);

DELETE FROM invasivesbc.code_header
WHERE code_header_name IN (
    'wind_direction',
    'observation_type',
    'disposed_material_format',
    'yes_no',
    'monitoring_type',
    'water_level_management',
    'waterbody_type_code',
    'substrate_type_code',
    'treatment_pass_code'
);
    `
  );
}
