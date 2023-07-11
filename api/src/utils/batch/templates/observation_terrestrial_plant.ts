import { Template, TemplateColumnBuilder } from '../definitions';
import { OBSERVATION_TYPE_CODES, YES_NO_CODES } from '../hard-coded-codes';
import {
  ActivityPersons,
  BasicInformation,
  BasicInformationRowValidators,
  PositiveObservationPlantValidator,
  SlopeAspectValidator,
  ProjectInformation
} from '../shared-columns';

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
  ).build(),
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
    'Observation - Invasive Plant',
    'codeReference',
    'form_data.activity_subtype_data.TerrestrialPlants[0].invasive_plant_code'
  )
    .referencesCode('invasive_plant_code')
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Observation - Type',
    'codeReference',
    'form_data.activity_subtype_data.TerrestrialPlants[0].observation_type'
  )
    .hardcodedCodes(OBSERVATION_TYPE_CODES)
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Observation - Density',
    'codeReference',
    'form_data.activity_subtype_data.TerrestrialPlants[0].invasive_plant_density_code'
  )
    .referencesCode('invasive_plant_density_code')
    .isRequired(false)
    .build(),
  new TemplateColumnBuilder(
    'Observation - Distribution',
    'codeReference',
    'form_data.activity_subtype_data.TerrestrialPlants[0].invasive_plant_distribution_code'
  )
    .referencesCode('invasive_plant_distribution_code')
    .isRequired(false)
    .build(),
  new TemplateColumnBuilder(
    'Observation - Life Stage',
    'codeReference',
    'form_data.activity_subtype_data.TerrestrialPlants[0].plant_life_stage_code'
  )
    .referencesCode('plant_life_stage_code')
    .isRequired(false)
    .build(),

  new TemplateColumnBuilder(
    'Voucher - Sample Collected?',
    'codeReference',
    'form_data.activity_subtype_data.TerrestrialPlants[0].voucher_specimen_collected'
  )
    .hardcodedCodes(YES_NO_CODES)
    .build(),
  new TemplateColumnBuilder(
    'Voucher - Sample ID',
    'text',
    'form_data.activity_subtype_data.TerrestrialPlants[0].voucher_specimen_collection_information.voucher_sample_id'
  ).build(),
  new TemplateColumnBuilder(
    'Voucher - Date Collected',
    'date',
    'form_data.activity_subtype_data.TerrestrialPlants[0].voucher_specimen_collection_information.date_voucher_collected'
  ).build(),
  new TemplateColumnBuilder(
    'Voucher - Date Verified',
    'date',
    'form_data.activity_subtype_data.TerrestrialPlants[0].voucher_specimen_collection_information.date_voucher_verified'
  ).build(),
  new TemplateColumnBuilder(
    'Voucher - Name of Herbarium',
    'text',
    'form_data.activity_subtype_data.TerrestrialPlants[0].voucher_specimen_collection_information.name_of_herbarium'
  ).build(),
  new TemplateColumnBuilder(
    'Voucher - Accession Number',
    'text',
    'form_data.activity_subtype_data.TerrestrialPlants[0].voucher_specimen_collection_information.accession_number'
  ).build(),
  new TemplateColumnBuilder(
    'Voucher - Verifying Person',
    'text',
    'form_data.activity_subtype_data.TerrestrialPlants[0].voucher_specimen_collection_information.voucher_verification_completed_by.person_name'
  ).build(),
  new TemplateColumnBuilder(
    'Voucher - Verifying Organization',
    'text',
    'form_data.activity_subtype_data.TerrestrialPlants[0].voucher_specimen_collection_information.voucher_verification_completed_by.organization'
  ).build(),

  // utm zone is a number here and a string elsewhere. ?!?
  new TemplateColumnBuilder(
    'Voucher - UTM Zone',
    'numeric',
    'form_data.activity_subtype_data.TerrestrialPlants[0].voucher_specimen_collection_information.exact_utm_coords.utm_zone'
  ).build(),

  new TemplateColumnBuilder(
    'Voucher - UTM Easting',
    'numeric',
    'form_data.activity_subtype_data.TerrestrialPlants[0].voucher_specimen_collection_information.exact_utm_coords.utm_easting'
  ).build(),
  new TemplateColumnBuilder(
    'Voucher - UTM Northing',
    'numeric',
    'form_data.activity_subtype_data.TerrestrialPlants[0].voucher_specimen_collection_information.exact_utm_coords.utm_northing'
  ).build()
];

ObservationTerrestrialPlant.rowValidators = [
  ...BasicInformationRowValidators,
  PositiveObservationPlantValidator,
  SlopeAspectValidator
];

export { ObservationTerrestrialPlant };
