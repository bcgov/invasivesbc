import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {

  await knex.raw(`
  SET search_path=invasivesbc,public;

  --      migration     --

  -- Create mapping table
  DROP TABLE IF EXISTS activity_subtype_mapping;
  CREATE TABLE IF NOT EXISTS activity_subtype_mapping (
    mapping_id serial PRIMARY KEY,
      form_subtype VARCHAR(100),
      full_subtype VARCHAR(100)
  );

  GRANT SELECT ON activity_subtype_mapping TO invasivebc;

  -- Observations
  INSERT INTO activity_subtype_mapping (form_subtype,full_subtype) VALUES
        ('Activity_Observation_PlantTerrestrial', 'Terrestrial Invasive Plant Observation'),
        ('Activity_Observation_PlantAquatic', 'Aquatic Invasive Plant Observation'),
        ('Activity_AnimalActivity_AnimalTerrestrial', 'Terrestrial Animal Observation'),
        ('Activity_AnimalActivity_AnimalAquatic', 'Aquatic Animal Observation');
  -- Treatments
  INSERT INTO activity_subtype_mapping (form_subtype,full_subtype) VALUES
        ('Activity_Treatment_ChemicalPlantTerrestrial', 'Terrestrial Plant Treatment - Chemical'),
        ('Activity_Treatment_ChemicalPlantAquatic', 'Aquatic Plant Treatment - Chemical'),
        ('Activity_Treatment_MechanicalPlantTerrestrial', 'Terrestrial Plant Treatment - Mechanical'),
        ('Activity_Treatment_MechanicalPlantAquatic', 'Aquatic Invasive Plant Mechanical Treatment'),
        ('Activity_Biocontrol_Release', 'Biocontrol Release'),
        ('Activity_Treatment_ChemicalAnimalTerrestrial', 'Terrestrial Animal Chemical Treatment'),
        ('Activity_Treatment_MechanicalAnimalTerrestrial', 'Terrestrial Animal Mechanical Treatment');
  -- Monitoring
  INSERT INTO activity_subtype_mapping (form_subtype,full_subtype) VALUES
        ('Activity_Monitoring_ChemicalTerrestrialAquaticPlant', 'Chemical Treatment Monitoring'),
        ('Activity_Monitoring_MechanicalTerrestrialAquaticPlant', 'Mechanical Treatment Monitoring'),
        ('Activity_Monitoring_BiocontrolRelease_TerrestrialPlant', 'Biocontrol Release Monitoring'),
        ('Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant', 'Biocontrol Dispersal Monitoring'),
        ('Activity_Monitoring_ChemicalAnimalTerrestrial', 'Chemical Monitoring Animal Terrestrial'),
        ('Activity_Monitoring_MechanicalAnimalTerrestrial', 'Mechanical Monitoring Animal Terrestrial');
  -- Transects
  INSERT INTO activity_subtype_mapping (form_subtype,full_subtype) VALUES
        ('Activity_Transect_FireMonitoring', 'Wildfire & Prescribed Burn Monitoring'),
        ('Activity_Transect_Vegetation', 'Vegetation Transect (Full, Lumped, Invasive Plant Density'),
        ('Activity_Transect_BiocontrolEfficacy', 'Biocontrol Efficacy Transect');
  -- Collections
  INSERT INTO activity_subtype_mapping (form_subtype,full_subtype) VALUES
        ('Activity_Biocontrol_Collection', 'Biocontrol Collection');
  -- FREP
  INSERT INTO activity_subtype_mapping (form_subtype,full_subtype) VALUES
        ('Activity_FREP_FormA', 'Form A'),
        ('Activity_FREP_FormB', 'Form B'),
        ('Activity_FREP_FormC', 'Form C');


  -- Create proper column
  ALTER TABLE activity_incoming_data DROP COLUMN IF EXISTS activity_subtype_full, ADD COLUMN activity_subtype_full TEXT;

  -- Add to column
  UPDATE activity_incoming_data aid
  SET activity_subtype_full = asm.full_subtype 
  FROM activity_subtype_mapping asm
  WHERE aid.activity_subtype = asm.form_subtype;


  --      trigger     --


  CREATE OR REPLACE FUNCTION activity_subtype_update()
      RETURNS TRIGGER
      LANGUAGE PLPGSQL
      AS  
  $$
  BEGIN
    set search_path=invasivesbc,public;
  
    UPDATE activity_incoming_data aid
    SET activity_subtype_full = asm.full_subtype 
    FROM activity_subtype_mapping asm
    WHERE aid.activity_subtype = asm.form_subtype
      AND aid.activity_incoming_data_id = NEW.activity_incoming_data_id;
            
    RETURN NEW;
  END
  $$;

  DROP TRIGGER IF EXISTS activity_subtype_display ON activity_incoming_data;
  CREATE TRIGGER activity_subtype_display 
  AFTER INSERT 
  ON activity_incoming_data
  FOR EACH ROW 
  EXECUTE PROCEDURE activity_subtype_update();

  CREATE INDEX activity_incoming_data_activity_subtype_full_idx ON invasivesbc.activity_incoming_data (activity_subtype_full);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path = invasivesbc,public;
    DROP TRIGGER IF EXISTS activity_subtype_display ON activity_incoming_data;
    DROP INDEX if exists activity_incoming_data_activity_subtype_full_idx;
    `);
}
