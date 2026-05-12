import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  //language=PostgreSQL
  await knex.raw(
    `
      set search_path = invasivesbc,public;

UPDATE invasivesbc.batch_uploads
SET template = CASE template
    WHEN 'monitoring_chemical_treatment' THEN 'monitoring_chemical_treatment_old'
    WHEN 'monitoring_mechanical_treatment' THEN 'monitoring_mechanical_treatment_old'
    WHEN 'observation_aquatic_plant' THEN 'observation_aquatic_plant_old'
    WHEN 'observation_terrestrial_plant' THEN 'observation_terrestrial_plant_old'
    WHEN 'treatment_mechanical_aquatic_plant' THEN 'treatment_mechanical_aquatic_plant_old'
    WHEN 'treatment_mechanical_terrestrial_plant' THEN 'treatment_mechanical_terrestrial_plant_old'
    ELSE template
END
WHERE template IN (
    'monitoring_chemical_treatment',
    'monitoring_mechanical_treatment',
    'observation_aquatic_plant',
    'observation_terrestrial_plant',
    'treatment_mechanical_aquatic_plant',
    'treatment_mechanical_terrestrial_plant'
);
    `
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(
    //language=PostgreSQL
    `
UPDATE invasivesbc.batch_uploads
SET template = CASE template
    WHEN 'monitoring_chemical_treatment_old' THEN 'monitoring_chemical_treatment'
    WHEN 'monitoring_mechanical_treatment_old' THEN 'monitoring_mechanical_treatment'
    WHEN 'observation_aquatic_plant_old' THEN 'observation_aquatic_plant'
    WHEN 'observation_terrestrial_plant_old' THEN 'observation_terrestrial_plant'
    WHEN 'treatment_mechanical_aquatic_plant_old' THEN 'treatment_mechanical_aquatic_plant'
    WHEN 'treatment_mechanical_terrestrial_plant_old' THEN 'treatment_mechanical_terrestrial_plant'
    ELSE template
END
WHERE template IN (
    'monitoring_chemical_treatment_old',
    'monitoring_mechanical_treatment_old',
    'observation_aquatic_plant_old',
    'observation_terrestrial_plant_old',
    'treatment_mechanical_aquatic_plant_old',
    'treatment_mechanical_terrestrial_plant_old'
);
    `
  );
}
