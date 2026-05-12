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
  SlopeAspectValidator
} from 'utils/batch/shared-columns';

const ObservationTerrestrialPlant = new Template(
  'observation_terrestrial_plant',
  'Observation - Terrestrial Plant',
  null
);
ObservationTerrestrialPlant.subtype = 'Activity_Observation_PlantTerrestrial';

ObservationTerrestrialPlant.columns = [
  ...BasicInformation,
  ...ProjectInformation,
  ...ActivityPersons,
  new TemplateColumnBuilder(
    'Observation - Pre-treatment observation?',
    'tristate',
    'form_data.activity_type_data.pre_treatment_observation'
  )
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Observation - Terrestrial - Soil Texture',
    'codeReference',
    'form_data.activity_subtype_data.Observation_PlantTerrestrial_Information.soil_texture_code'
  )
    .referencesCode('soil_texture_code')
    .build(),
  new TemplateColumnBuilder(
    'Observation - Terrestrial - Specific Use',
    'codeReference',
    'form_data.activity_subtype_data.Observation_PlantTerrestrial_Information.specific_use_code'
  )
    .referencesCode('specific_use_code')
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Observation - Terrestrial - Slope',
    'codeReference',
    'form_data.activity_subtype_data.Observation_PlantTerrestrial_Information.slope_code'
  )
    .referencesCode('slope_code')
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Observation - Terrestrial - Aspect',
    'codeReference',
    'form_data.activity_subtype_data.Observation_PlantTerrestrial_Information.aspect_code'
  )
    .referencesCode('aspect_code')
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Observation - Terrestrial - Research Observation',
    'tristate',
    'form_data.activity_subtype_data.Observation_PlantTerrestrial_Information.research_detection_ind'
  )
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Observation - Terrestrial - Visible Well',
    'tristate',
    'form_data.activity_subtype_data.Observation_PlantTerrestrial_Information.well_ind'
  )
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Observation - Suitable for Biocontrol Agent?',
    'tristate',
    'form_data.activity_subtype_data.Observation_PlantTerrestrial_Information.suitable_for_biocontrol_agent'
  ).build(),
  new TemplateColumnBuilder(
    'Observation - Invasive Plant 1',
    'codeReference',
    'form_data.activity_subtype_data.TerrestrialPlants[0].invasive_plant_code'
  )
    .referencesCode('invasive_plant_code')
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Observation - Type 1',
    'codeReference',
    'form_data.activity_subtype_data.TerrestrialPlants[0].observation_type'
  )
    .hardcodedCodes(OBSERVATION_TYPE_CODES)
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Observation - Density 1',
    'codeReference',
    'form_data.activity_subtype_data.TerrestrialPlants[0].invasive_plant_density_code'
  )
    .referencesCode('invasive_plant_density_code')
    .build(),
  new TemplateColumnBuilder(
    'Observation - Distribution 1',
    'codeReference',
    'form_data.activity_subtype_data.TerrestrialPlants[0].invasive_plant_distribution_code'
  )
    .referencesCode('invasive_plant_distribution_code')
    .build(),
  new TemplateColumnBuilder(
    'Observation - Life Stage 1',
    'codeReference',
    'form_data.activity_subtype_data.TerrestrialPlants[0].plant_life_stage_code'
  )
    .referencesCode('plant_life_stage_code')
    .build(),

  new TemplateColumnBuilder(
    'Voucher - Sample Collected? 1',
    'codeReference',
    'form_data.activity_subtype_data.TerrestrialPlants[0].voucher_specimen_collected'
  )
    .hardcodedCodes(YES_NO_CODES)
    .build(),
  new TemplateColumnBuilder(
    'Observation - Invasive Plant 2',
    'codeReference',
    'form_data.activity_subtype_data.TerrestrialPlants[1].invasive_plant_code'
  )
    .referencesCode('invasive_plant_code')
    .build(),
  new TemplateColumnBuilder(
    'Observation - Type 2',
    'codeReference',
    'form_data.activity_subtype_data.TerrestrialPlants[1].observation_type'
  )
    .hardcodedCodes(OBSERVATION_TYPE_CODES)
    .build(),
  new TemplateColumnBuilder(
    'Observation - Density 2',
    'codeReference',
    'form_data.activity_subtype_data.TerrestrialPlants[1].invasive_plant_density_code'
  )
    .referencesCode('invasive_plant_density_code')
    .build(),
  new TemplateColumnBuilder(
    'Observation - Distribution 2',
    'codeReference',
    'form_data.activity_subtype_data.TerrestrialPlants[1].invasive_plant_distribution_code'
  )
    .referencesCode('invasive_plant_distribution_code')
    .build(),
  new TemplateColumnBuilder(
    'Observation - Life Stage 2',
    'codeReference',
    'form_data.activity_subtype_data.TerrestrialPlants[1].plant_life_stage_code'
  )
    .referencesCode('plant_life_stage_code')
    .build(),

  new TemplateColumnBuilder(
    'Voucher - Sample Collected? 2',
    'codeReference',
    'form_data.activity_subtype_data.TerrestrialPlants[1].voucher_specimen_collected'
  )
    .hardcodedCodes(YES_NO_CODES)
    .build(),
  new TemplateColumnBuilder(
    'Observation - Invasive Plant 3',
    'codeReference',
    'form_data.activity_subtype_data.TerrestrialPlants[2].invasive_plant_code'
  )
    .referencesCode('invasive_plant_code')
    .build(),
  new TemplateColumnBuilder(
    'Observation - Type 3',
    'codeReference',
    'form_data.activity_subtype_data.TerrestrialPlants[2].observation_type'
  )
    .hardcodedCodes(OBSERVATION_TYPE_CODES)
    .build(),
  new TemplateColumnBuilder(
    'Observation - Density 3',
    'codeReference',
    'form_data.activity_subtype_data.TerrestrialPlants[2].invasive_plant_density_code'
  )
    .referencesCode('invasive_plant_density_code')
    .build(),
  new TemplateColumnBuilder(
    'Observation - Distribution 3',
    'codeReference',
    'form_data.activity_subtype_data.TerrestrialPlants[2].invasive_plant_distribution_code'
  )
    .referencesCode('invasive_plant_distribution_code')
    .build(),
  new TemplateColumnBuilder(
    'Observation - Life Stage 3',
    'codeReference',
    'form_data.activity_subtype_data.TerrestrialPlants[2].plant_life_stage_code'
  )
    .referencesCode('plant_life_stage_code')
    .build(),

  new TemplateColumnBuilder(
    'Voucher - Sample Collected? 3',
    'codeReference',
    'form_data.activity_subtype_data.TerrestrialPlants[2].voucher_specimen_collected'
  )
    .hardcodedCodes(YES_NO_CODES)
    .build()
];

ObservationTerrestrialPlant.rowValidators = [
  ...BasicInformationRowValidators,
  PositiveObservationPlantValidator,
  SlopeAspectValidator,
  DuplicateInvasivePlantValidator,
  SampleCollectedNotAllowedValidator,
  ObservationCompleteSetValidator
];

export { ObservationTerrestrialPlant };
