import { Knex } from 'knex';

export async function up(knex: Knex) {
  // Add Biocontrol role to role table
  await knex.raw(`
    INSERT INTO invasivesbc.user_role(role_description, role_name, metabase_group)
    SELECT
      role_description,
      role_name,
      metabase_group
    FROM
      (VALUES
        ('Primary Biocontrol User', 'biocontrol_user', 'standard_user')
      ) AS new_role(role_description, role_name, metabase_group)
    WHERE NOT EXISTS (
      SELECT 1
      FROM invasivesbc.user_role existing_role
      WHERE existing_role.role_description = new_role.role_description
    );
  `);

  // Add Agent Codes to code table
  await knex.raw(`
    INSERT INTO invasivesbc.code (code_header_id, code_name, code_description, created_by_user_id, updated_by_user_id)
    SELECT
      code_header_id,
      code_name,
      code_description,
      created_by_user_id,
      updated_by_user_id
    FROM
      (VALUES
        (43, 'SCLESCL', 'SCLESCL [Sclerotinia sclerotium]', 1, 1),
        (43, 'CEUTSCR', 'CEUTSCR [Ceutorhynchus scrobicollis]', 1, 1),
        (43, 'ACERANG', 'ACERANG [Aceria angustifolia]', 1, 1),
        (43, 'DICHAER', 'DICHAER [Dichrorampha aeratana]', 1, 1),
        (43, 'ARCHNEU', 'ARCHNEU [Archanara neurica]', 1, 1),
        (43, 'BAGONOD', 'BAGONOD [Bagous nodulosus]', 1, 1),
        (43, 'LENIGEM', 'LENIGEM [Lenisa geminipuncta]', 1, 1),
        (43, 'JAAPIVA', 'JAAPIVA [Jaapiella ivannikovi]', 1, 1),
        (43, 'BANGFAU', 'BANGFAU [Bangasternus fausti]', 1, 1)
      ) AS new_codes (code_header_id, code_name, code_description, created_by_user_id, updated_by_user_id)
    WHERE NOT EXISTS (
      SELECT 1
      FROM invasivesbc.code existing_codes
      WHERE existing_codes.code_description = new_codes.code_description
    );
  `);

  // Update Sort Order
  await knex.raw(`
    WITH ordered_alphabetically AS (
        SELECT
          code_id,
          ROW_NUMBER() OVER (ORDER BY code_description) AS new_sort_order
        FROM invasivesbc.code
        WHERE code_header_id = 43
    )
    UPDATE invasivesbc.code
    SET code_sort_order = ordered_alphabetically.new_sort_order
    FROM ordered_alphabetically
    WHERE invasivesbc.code.code_id = ordered_alphabetically.code_id;
  `);

  // Create Table for mapping Plants to Agent for treatment
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS invasivesbc.plant_agent_treatment (
      plant_code_pkey INTEGER,
      plant_code_name VARCHAR(40) NOT NULL,
      agent_code_pkey INTEGER,
      agent_code_name VARCHAR(40) NOT NULL,
      PRIMARY KEY (plant_code_pkey, agent_code_pkey),
      FOREIGN KEY (plant_code_pkey) REFERENCES invasivesbc.code(code_id),
      FOREIGN KEY (agent_code_pkey) REFERENCES invasivesbc.code(code_id)
    );
    COMMENT ON TABLE  invasivesbc.plant_agent_treatment IS 'Matching Invasive Plants to Biocontrol Agents';
    COMMENT ON COLUMN invasivesbc.plant_agent_treatment.plant_code_pkey IS 'Primary Key for entry in Code table';
    COMMENT ON COLUMN invasivesbc.plant_agent_treatment.agent_code_pkey IS 'Primary Key for entry in Code table';
    COMMENT ON COLUMN invasivesbc.plant_agent_treatment.plant_code_name IS 'value of "code_name" column Code table';
    COMMENT ON COLUMN invasivesbc.plant_agent_treatment.agent_code_name IS 'value of "code_name" column Code table';
  `);

  // Create Function to get code_id from code table using code_name and header_number values
  await knex.raw(`
    CREATE OR REPLACE FUNCTION invasivesbc.get_code_id_for_plant_agents(p_code_name VARCHAR, p_code_header_number INTEGER)
    RETURNS INTEGER AS $$
    DECLARE
      v_code_id INTEGER;
    BEGIN
      SELECT code_id INTO v_code_id
      FROM invasivesbc.code
      WHERE code_name = p_code_name
      AND code_header_id = p_code_header_number
      LIMIT 1;
      RETURN v_code_id;
    END;
    $$ LANGUAGE plpgsql;
  `);

  /* Create trigger populating the IDS when codes are entered in table
      39 = invasive_plant_aquatic_code
      40 = invasive_plant_code
      43 = biological_agent_code
  */

  await knex.raw(`
    CREATE OR REPLACE FUNCTION invasivesbc.populate_pkeys()
    RETURNS TRIGGER AS $$
    DECLARE
      v_invasive_plant_aquatic_code INTEGER = 39;
      v_invasive_plant_code INTEGER = 40;
      v_biological_agent_code INTEGER = 43;
    BEGIN
      -- Get the plant_code_pkey
      NEW.plant_code_pkey := invasivesbc.get_code_id_for_plant_agents(NEW.plant_code_name, v_invasive_plant_code);
      IF NEW.plant_code_pkey IS NULL THEN
        NEW.plant_code_pkey := invasivesbc.get_code_id_for_plant_agents(NEW.plant_code_name, v_invasive_plant_aquatic_code);
      END IF;
      -- Get the agent_code_pkey
      NEW.agent_code_pkey := invasivesbc.get_code_id_for_plant_agents(NEW.agent_code_name, v_biological_agent_code);
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trg_populate_pkeys
    BEFORE INSERT OR UPDATE ON invasivesbc.plant_agent_treatment
    FOR EACH ROW
    EXECUTE FUNCTION invasivesbc.populate_pkeys();
  `);

  // Populate Table with
  await knex.raw(`
    INSERT INTO invasivesbc.plant_agent_treatment(plant_code_name, agent_code_name)
    VALUES
      ('BL', 'LARIMIN'),
      ('BL', 'LARIOBT'),
      ('BL', 'LARISPP'),
      ('BL', 'METZPAU'),
      ('BL', 'UROPAFF'),
      ('BL', 'UROPJAC'),
      ('BL', 'UROPQUA'),
      ('BL', 'UROPSPP'),
      ('BO', 'APHAITA'),
      ('BK', 'LARIMIN'),
      ('BK', 'LARIOBT'),
      ('BK', 'LARISPP'),
      ('BK', 'METZPAU'),
      ('BK', 'UROPAFF'),
      ('BK', 'UROPJAC'),
      ('BK', 'UROPQUA'),
      ('BK', 'UROPSPP'),
      ('BT', 'CASSRUB'),
      ('BT', 'LARICAR'),
      ('BT', 'RHINCON'),
      ('BT', 'TRICHOR'),
      ('BT', 'UROPSTY'),
      ('CT', 'ALTICAR'),
      ('CT', 'CASSRUB'),
      ('CT', 'HADRLIT'),
      ('CT', 'LARICAR'),
      ('CT', 'PUCCPUN'),
      ('CT', 'RHINCON'),
      ('CT', 'TERERUF'),
      ('CT', 'UROPCAR'),
      ('CT', 'UROPSTY'),
      ('BU', 'METZLAP'),
      ('CS', 'APHTCYP'),
      ('CS', 'APHTCZW'),
      ('CS', 'APHTFLA'),
      ('CS', 'APHTLAC'),
      ('CS', 'APHTNIG'),
      ('CS', 'APHTSPP'),
      ('CS', 'MINOMUR'),
      ('CS', 'SPURESU'),
      ('DT', 'BRACPUL'),
      ('DT', 'CALOLUN'),
      ('DT', 'ETEOINT'),
      ('DT', 'MECIJAN'),
      ('DT', 'RHINANT'),
      ('DT', 'RHINLIN'),
      ('DT', 'RHINNET'),
      ('DK', 'AGAPZOE'),
      ('DK', 'CHAEACR'),
      ('DK', 'CYPHACH'),
      ('DK', 'LARIMIN'),
      ('DK', 'LARIOBT'),
      ('DK', 'LARISPP'),
      ('DK', 'METZPAU'),
      ('DK', 'PELOMED'),
      ('DK', 'PTERINS'),
      ('DK', 'PUCCJAC'),
      ('DK', 'SPHEJUG'),
      ('DK', 'SUBAPIC'),
      ('DK', 'TEREVIR'),
      ('DK', 'UROPAFF'),
      ('DK', 'UROPQUA'),
      ('DK', 'UROPSPP'),
      ('RC', 'ARCHNEU'),
      ('RC', 'LENIGEM'),
      ('FB', 'ACERMAL'),
      ('FB', 'CHARSEX'),
      ('FB', 'DELOGUT'),
      ('FR', 'BAGONOD'),
      ('AP', 'CEUTSCR'),
      ('GO', 'AGONNER'),
      ('GB', 'METZLAP'),
      ('BI', 'CHARSEX'),
      ('BI', 'DELOGUT'),
      ('HT', 'LONGQUA'),
      ('HT', 'MOGUCRU'),
      ('JK', 'APHAITA'),
      ('KH', 'AULASUB'),
      ('KH', 'CHEIURB'),
      ('LS', 'APHTCYP'),
      ('LS', 'APHTCZW'),
      ('LS', 'APHTFLA'),
      ('LS', 'APHTLAC'),
      ('LS', 'APHTNIG'),
      ('LS', 'APHTSPP'),
      ('LS', 'AULASUB'),
      ('LS', 'HYLEEUP'),
      ('LS', 'MINOMUR'),
      ('LS', 'SPURESU'),
      ('MT', 'CASSRUB'),
      ('MT', 'LARICAR'),
      ('MT', 'RHINCON'),
      ('MT', 'TERERUF'),
      ('MT', 'TRICHOR'),
      ('MH', 'CHEIURB'),
      ('MK', 'CYPHACH'),
      ('MK', 'LARIMIN'),
      ('MK', 'LARIOBT'),
      ('MK', 'LARISPP'),
      ('MK', 'METZPAU'),
      ('MK', 'UROPAFF'),
      ('MK', 'UROPQUA'),
      ('MK', 'UROPSPP'),
      ('ME', 'AULASUB'),
      ('ME', 'CHEIURB'),
      ('MU', 'RHINTET'),
      ('NT', 'CASSRUB'),
      ('NT', 'LARICAR'),
      ('NT', 'PUCCCAR'),
      ('NT', 'RHINCON'),
      ('NT', 'TRICHOR'),
      ('NT', 'UROPSOL'),
      ('OH', 'AULASUB'),
      ('OH', 'CHEIURB'),
      ('OD', 'DICHAER'),
      ('PS', 'CYSTSON'),
      ('PT', 'CASSRUB'),
      ('PT', 'LARICAR'),
      ('PT', 'RHINCON'),
      ('PT', 'TRICHOR'),
      ('PT', 'UROPSOL'),
      ('PV', 'CYSTSON'),
      ('PL', 'GALECAL'),
      ('PL', 'GALEPUS'),
      ('PL', 'HYLOTRA'),
      ('QH', 'CHEIURB'),
      ('RS', 'ACERCHO'),
      ('RS', 'BRADGIL'),
      ('RS', 'CYSTSCH'),
      ('RS', 'PUCCCHO'),
      ('RK', 'AULAACR'),
      ('RK', 'JAAPIVA'),
      ('RO', 'ACERANG'),
      ('SH', 'MICREDE'),
      ('SH', 'OMPHHOO'),
      ('SH', 'RHOPTRI'),
      ('SB', 'ACERGEN'),
      ('SB', 'AGONNER'),
      ('SB', 'BRUCVIL'),
      ('SB', 'EXAPFUS'),
      ('CN', 'CHAEACR'),
      ('CN', 'LARIOBT'),
      ('CN', 'LARISPP'),
      ('CN', 'METZPAU'),
      ('CN', 'UROPAFF'),
      ('CN', 'UROPQUA'),
      ('CN', 'UROPSPP'),
      ('SK', 'AGAPZOE'),
      ('SK', 'CHAEACR'),
      ('SK', 'CYPHACH'),
      ('SK', 'LARIMIN'),
      ('SK', 'LARIOBT'),
      ('SK', 'LARISPP'),
      ('SK', 'METZPAU'),
      ('SK', 'PELOMED'),
      ('SK', 'PTERINS'),
      ('SK', 'PUCCJAC'),
      ('SK', 'SPHEJUG'),
      ('SK', 'UROPAFF'),
      ('SK', 'UROPQUA'),
      ('SK', 'UROPSPP'),
      ('SJ', 'AGRIHYP'),
      ('SJ', 'APHICHL'),
      ('SJ', 'CHRYHYP'),
      ('SJ', 'CHRYQUA'),
      ('SJ', 'CHRYSPP'),
      ('SJ', 'CHRYVAR'),
      ('SJ', 'ZEUXGIA'),
      ('TH', 'CHEIURB'),
      ('TR', 'BOTASEN'),
      ('TR', 'COCHATR'),
      ('TR', 'LONGFLA'),
      ('TR', 'LONGGRA'),
      ('TR', 'LONGJAC'),
      ('TR', 'LONGJAS'),
      ('TR', 'TYRIJAC'),
      ('WP', 'AULASUB'),
      ('WP', 'CHEIURB'),
      ('YT', 'BRACPUL'),
      ('YT', 'CALOLUN'),
      ('YT', 'ETEOINT'),
      ('YT', 'ETEOSER'),
      ('YT', 'MECIJAN'),
      ('YT', 'RHINANT'),
      ('YT', 'RHINLIN'),
      ('YT', 'RHINNET'),
      ('YT', 'RHINPIL');
  `);
}

export async function down(knex: Knex) {
  // Remove Biocontrol role
  await knex.raw(`
    DELETE FROM
      invasivesbc.user_role
    WHERE
      role_name = 'biocontrol_user';
  `);

  // Remove Tables, Functions, Triggers
  await knex.raw(`
    DROP TRIGGER  IF EXISTS trg_populate_pkeys ON invasivesbc.plant_agent_treatment;  
    DROP FUNCTION IF EXISTS invasivesbc.get_code_id_for_plant_agents(VARCHAR, INTEGER);  
    DROP FUNCTION IF EXISTS invasivesbc.populate_pkeys();  
    DROP TABLE    IF EXISTS invasivesbc.plant_agent_treatment;
  `);

  // Remove Agent Codes added in migration
  await knex.raw(`
    DELETE FROM invasivesbc.code WHERE code_name = 'SCLESCL' and code_header_id = 43;
    DELETE FROM invasivesbc.code WHERE code_name = 'CEUTSCR' and code_header_id = 43;
    DELETE FROM invasivesbc.code WHERE code_name = 'ACERANG' and code_header_id = 43;
    DELETE FROM invasivesbc.code WHERE code_name = 'DICHAER' and code_header_id = 43;
    DELETE FROM invasivesbc.code WHERE code_name = 'ARCHNEU' and code_header_id = 43;
    DELETE FROM invasivesbc.code WHERE code_name = 'BAGONOD' and code_header_id = 43;
    DELETE FROM invasivesbc.code WHERE code_name = 'LENIGEM' and code_header_id = 43;
    DELETE FROM invasivesbc.code WHERE code_name = 'JAAPIVA' and code_header_id = 43;
    DELETE FROM invasivesbc.code WHERE code_name = 'BANGFAU' and code_header_id = 43;
  `);

  // Update Sorting Order
  await knex.raw(`
    WITH ordered_alphabetically AS (
        SELECT
          code_id,
          ROW_NUMBER() OVER (ORDER BY code_description) AS new_sort_order
        FROM invasivesbc.code
        WHERE code_header_id = 43
    )
    UPDATE invasivesbc.code
    SET code_sort_order = ordered_alphabetically.new_sort_order
    FROM ordered_alphabetically
    WHERE invasivesbc.code.code_id = ordered_alphabetically.code_id;
  `);
}
