import { Template, TemplateColumnBuilder } from '../definitions';
import { OBSERVATION_TYPE_CODES, YES_NO_CODES } from '../hard-coded-codes';
import {
  ActivityPersons,
  BasicInformation,
  BasicInformationRowValidators,
  PositiveObservationPlantValidator,
  ProjectInformation,
  ShorelineInformation,
  ShorelineSumValidator,
  WaterbodyInformation,
  WaterQualityInformation
} from '../shared-columns';

const ObservationAquaticPlantTemp = new Template(
  'observation_aquatic_plant_temp',
  'Observation - Aquatic Plant TEMP POINT',
  null
);

ObservationAquaticPlantTemp.subtype = 'Activity_Observation_PlantAquatic';

ObservationAquaticPlantTemp.columns = [
  ...BasicInformation,
  ...ProjectInformation,
  ...ActivityPersons,
  ...ShorelineInformation,
  ...WaterbodyInformation,
  ...WaterQualityInformation,
  new TemplateColumnBuilder('Area', 'numeric').isRequired().build(),
  new TemplateColumnBuilder(
    'Observation - Pre-treatment observation?',
    'tristate',
    'form_data.activity_type_data.pre_treatment_observation'
  )
    .isRequired()
    .build(),

  new TemplateColumnBuilder(
    'Observation - Sample Point ID',
    'text',
    'form_data.activity_subtype_data.AquaticPlants[0].sample_point_id'
  ).build(),
  new TemplateColumnBuilder(
    'Observation - Type',
    'codeReference',
    'form_data.activity_subtype_data.AquaticPlants[0].observation_type'
  )
    .hardcodedCodes(OBSERVATION_TYPE_CODES)
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Observation - Invasive Plant',
    'codeReference',
    'form_data.activity_subtype_data.AquaticPlants[0].invasive_plant_code'
  )
    .referencesCode('invasive_plant_aquatic_code')
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Observation - Life Stage',
    'codeReference',
    'form_data.activity_subtype_data.AquaticPlants[0].plant_life_stage_code'
  )
    .referencesCode('plant_life_stage_code')
    .isRequired(false)
    .build(),
  new TemplateColumnBuilder(
    'Observation - Density',
    'codeReference',
    'form_data.activity_subtype_data.AquaticPlants[0].invasive_plant_density_code'
  )
    .referencesCode('invasive_plant_density_code')
    .isRequired(false)
    .build(),
  new TemplateColumnBuilder(
    'Observation - Distribution',
    'codeReference',
    'form_data.activity_subtype_data.AquaticPlants[0].invasive_plant_distribution_code'
  )
    .referencesCode('invasive_plant_distribution_code')
    .isRequired(false)
    .build(),
  new TemplateColumnBuilder(
    'Observation - Suitable for Biocontrol Agent?',
    'tristate',
    'form_data.activity_subtype_data.Observation_PlantAquatic_Information.suitable_for_biocontrol_agent'
  ).build(),

  new TemplateColumnBuilder(
    'Voucher - Sample Collected?',
    'codeReference',
    'form_data.activity_subtype_data.AquaticPlants[0].voucher_specimen_collected'
  )
    .hardcodedCodes(YES_NO_CODES)
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Voucher - Accession Number',
    'text',
    'form_data.activity_subtype_data.AquaticPlants[0].voucher_specimen_collection_information.accession_number'
  ).build(),

  // utm zone is a number here and a string elsewhere. ?!?
  new TemplateColumnBuilder(
    'Voucher - UTM Zone',
    'numeric',
    'form_data.activity_subtype_data.AquaticPlants[0].voucher_specimen_collection_information.exact_utm_coords.utm_zone'
  ).build(),

  new TemplateColumnBuilder(
    'Voucher - UTM Easting',
    'numeric',
    'form_data.activity_subtype_data.AquaticPlants[0].voucher_specimen_collection_information.exact_utm_coords.utm_easting'
  ).build(),
  new TemplateColumnBuilder(
    'Voucher - UTM Northing',
    'numeric',
    'form_data.activity_subtype_data.AquaticPlants[0].voucher_specimen_collection_information.exact_utm_coords.utm_northing'
  ).build(),
  new TemplateColumnBuilder(
    'Voucher - Name of Herbarium',
    'text',
    'form_data.activity_subtype_data.AquaticPlants[0].voucher_specimen_collection_information.name_of_herbarium'
  ).build(),
  new TemplateColumnBuilder(
    'Voucher - Sample ID',
    'text',
    'form_data.activity_subtype_data.AquaticPlants[0].voucher_specimen_collection_information.voucher_sample_id'
  ).build(),
  new TemplateColumnBuilder(
    'Voucher - Date Verified',
    'date',
    'form_data.activity_subtype_data.AquaticPlants[0].voucher_specimen_collection_information.date_voucher_verified'
  )
    .mustNotBeFuture()
    .build(),
  new TemplateColumnBuilder(
    'Voucher - Date Collected',
    'date',
    'form_data.activity_subtype_data.AquaticPlants[0].voucher_specimen_collection_information.date_voucher_collected'
  )
    .mustNotBeFuture()
    .build(),
  new TemplateColumnBuilder(
    'Voucher - Verifying Person',
    'text',
    'form_data.activity_subtype_data.AquaticPlants[0].voucher_specimen_collection_information.voucher_verification_completed_by.person_name'
  ).build(),
  new TemplateColumnBuilder(
    'Voucher - Verifying Organization',
    'text',
    'form_data.activity_subtype_data.AquaticPlants[0].voucher_specimen_collection_information.voucher_verification_completed_by.organization'
  ).build()
];

ObservationAquaticPlantTemp.rowValidators = [
  ...BasicInformationRowValidators,
  ShorelineSumValidator,
  PositiveObservationPlantValidator
];

export { ObservationAquaticPlantTemp };
