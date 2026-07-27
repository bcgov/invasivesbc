import { Template, TemplateColumnBuilder } from 'utils/batch/definitions';
import { OBSERVATION_TYPE_CODES, YES_NO_CODES } from 'utils/batch/hard-coded-codes';
import {
  ActivityPersons,
  BasicInformation,
  BasicInformationRowValidators,
  DuplicateInvasivePlantValidator,
  ObservationCompleteSetValidator,
  PositiveObservationPlantValidator,
  ProjectInformation,
  SampleCollectedNotAllowedValidator,
  SamplePointIDValidator,
  ShorelineInformation,
  ShorelineSumValidator,
  WaterbodyInformation,
  WaterQualityInformation
} from 'utils/batch/shared-columns';

const ObservationAquaticPlant = new Template('observation_aquatic_plant', 'Observation - Aquatic Plant', null);

ObservationAquaticPlant.subtype = 'Activity_Observation_PlantAquatic';

ObservationAquaticPlant.columns = [
  ...BasicInformation,
  ...ProjectInformation,
  ...ActivityPersons,
  ...ShorelineInformation,
  ...WaterbodyInformation,
  ...WaterQualityInformation,
  new TemplateColumnBuilder(
    'Observation - Pre-treatment observation?',
    'tristate',
    'form_data.activity_type_data.pre_treatment_observation'
  )
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Observation - Suitable for Biocontrol Agent?',
    'tristate',
    'form_data.activity_subtype_data.Observation_PlantAquatic_Information.suitable_for_biocontrol_agent'
  )
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Observation - Sample Point ID 1',
    'text',
    'form_data.activity_subtype_data.AquaticPlants[0].sample_point_id'
  ).build(),
  new TemplateColumnBuilder(
    'Observation - Invasive Plant 1',
    'codeReference',
    'form_data.activity_subtype_data.AquaticPlants[0].invasive_plant_code'
  )
    .referencesCode('invasive_plant_aquatic_code')
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Observation - Type 1',
    'codeReference',
    'form_data.activity_subtype_data.AquaticPlants[0].observation_type'
  )
    .referencesCode('observation_type')
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Observation - Density 1',
    'codeReference',
    'form_data.activity_subtype_data.AquaticPlants[0].invasive_plant_density_code'
  )
    .referencesCode('invasive_plant_density_code')
    .build(),
  new TemplateColumnBuilder(
    'Observation - Distribution 1',
    'codeReference',
    'form_data.activity_subtype_data.AquaticPlants[0].invasive_plant_distribution_code'
  )
    .referencesCode('invasive_plant_distribution_code')
    .build(),
  new TemplateColumnBuilder(
    'Observation - Life Stage 1',
    'codeReference',
    'form_data.activity_subtype_data.AquaticPlants[0].plant_life_stage_code'
  )
    .referencesCode('plant_life_stage_code')
    .build(),
  new TemplateColumnBuilder(
    'Voucher - Sample Collected? 1',
    'codeReference',
    'form_data.activity_subtype_data.AquaticPlants[0].voucher_specimen_collected'
  )
    .referencesCode('yes_no')
    .build(),
  new TemplateColumnBuilder(
    'Observation - Sample Point ID 2',
    'text',
    'form_data.activity_subtype_data.AquaticPlants[1].sample_point_id'
  ).build(),
  new TemplateColumnBuilder(
    'Observation - Invasive Plant 2',
    'codeReference',
    'form_data.activity_subtype_data.AquaticPlants[1].invasive_plant_code'
  )
    .referencesCode('invasive_plant_aquatic_code')
    .build(),
  new TemplateColumnBuilder(
    'Observation - Type 2',
    'codeReference',
    'form_data.activity_subtype_data.AquaticPlants[1].observation_type'
  )
    .referencesCode('observation_type')
    .build(),
  new TemplateColumnBuilder(
    'Observation - Density 2',
    'codeReference',
    'form_data.activity_subtype_data.AquaticPlants[1].invasive_plant_density_code'
  )
    .referencesCode('invasive_plant_density_code')
    .build(),
  new TemplateColumnBuilder(
    'Observation - Distribution 2',
    'codeReference',
    'form_data.activity_subtype_data.AquaticPlants[1].invasive_plant_distribution_code'
  )
    .referencesCode('invasive_plant_distribution_code')
    .build(),
  new TemplateColumnBuilder(
    'Observation - Life Stage 2',
    'codeReference',
    'form_data.activity_subtype_data.AquaticPlants[1].plant_life_stage_code'
  )
    .referencesCode('plant_life_stage_code')
    .build(),
  new TemplateColumnBuilder(
    'Voucher - Sample Collected? 2',
    'codeReference',
    'form_data.activity_subtype_data.AquaticPlants[1].voucher_specimen_collected'
  )
    .referencesCode('yes_no')
    .build(),
  new TemplateColumnBuilder(
    'Observation - Sample Point ID 3',
    'text',
    'form_data.activity_subtype_data.AquaticPlants[2].sample_point_id'
  ).build(),
  new TemplateColumnBuilder(
    'Observation - Invasive Plant 3',
    'codeReference',
    'form_data.activity_subtype_data.AquaticPlants[2].invasive_plant_code'
  )
    .referencesCode('invasive_plant_aquatic_code')
    .build(),
  new TemplateColumnBuilder(
    'Observation - Type 3',
    'codeReference',
    'form_data.activity_subtype_data.AquaticPlants[2].observation_type'
  )
    .referencesCode('observation_type')
    .build(),
  new TemplateColumnBuilder(
    'Observation - Density 3',
    'codeReference',
    'form_data.activity_subtype_data.AquaticPlants[2].invasive_plant_density_code'
  )
    .referencesCode('invasive_plant_density_code')
    .build(),
  new TemplateColumnBuilder(
    'Observation - Distribution 3',
    'codeReference',
    'form_data.activity_subtype_data.AquaticPlants[2].invasive_plant_distribution_code'
  )
    .referencesCode('invasive_plant_distribution_code')
    .build(),
  new TemplateColumnBuilder(
    'Observation - Life Stage 3',
    'codeReference',
    'form_data.activity_subtype_data.AquaticPlants[2].plant_life_stage_code'
  )
    .referencesCode('plant_life_stage_code')
    .build(),
  new TemplateColumnBuilder(
    'Voucher - Sample Collected? 3',
    'codeReference',
    'form_data.activity_subtype_data.AquaticPlants[2].voucher_specimen_collected'
  )
    .referencesCode('yes_no')
    .build()
];

ObservationAquaticPlant.rowValidators = [
  ...BasicInformationRowValidators,
  ShorelineSumValidator,
  PositiveObservationPlantValidator,
  DuplicateInvasivePlantValidator,
  SampleCollectedNotAllowedValidator,
  SamplePointIDValidator,
  ObservationCompleteSetValidator
];

export { ObservationAquaticPlant };
