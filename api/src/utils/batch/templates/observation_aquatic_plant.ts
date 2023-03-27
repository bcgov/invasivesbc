import {Template, TemplateColumnBuilder} from "../definitions";
import {
  ActivityPersons,
  BasicInformation,
  BasicInformationRowValidators,
  ProjectInformation,
  ShorelineInformation,
  WaterbodyInformation,
  WaterQualityInformation
} from "../shared_columns";

const ObservationAquaticPlant = new Template(
  'observation_aquatic_plant',
  'Observation - Aquatic Plant',
  null
);
ObservationAquaticPlant.columns = [
  ...BasicInformation,
  ...ProjectInformation,
  ...ActivityPersons,
  ...ShorelineInformation,
  ...WaterbodyInformation,
  ...WaterQualityInformation,
  new TemplateColumnBuilder('Observation - Pre-treatment observation?', 'codeReference').build(),

  new TemplateColumnBuilder('Observation - Sample Point ID', 'text').build(),
  new TemplateColumnBuilder('Observation - Type', 'codeReference').referencesCode('observation_type_code').isRequired().build(),
  new TemplateColumnBuilder('Observation - Invasive Plant', 'codeReference').referencesCode('invasive_plant_aquatic_code').isRequired().build(),
  new TemplateColumnBuilder('Observation - Life Stage', 'codeReference').referencesCode('plant_seed_stage_code').isRequired().build(),
  new TemplateColumnBuilder('Observation - Density', 'codeReference').referencesCode('invasive_plant_density_code').isRequired().build(),
  new TemplateColumnBuilder('Observation - Distribution', 'codeReference').referencesCode('invasive_plant_distribution_code').isRequired().build(),
  new TemplateColumnBuilder('Observation - Suitable for Biocontrol Agent?', 'tristate').build(),

  new TemplateColumnBuilder(
    'Voucher - Sample Collected?',
    'tristate',
    'form_data.activity_subtype_data.AquaticPlants[0].voucher_specimen_collected'
  ).build(),
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
  ).build(),
  new TemplateColumnBuilder(
    'Voucher - Date Collected',
    'date',
    'form_data.activity_subtype_data.AquaticPlants[0].voucher_specimen_collection_information.date_voucher_collected'
  ).build(),
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

ObservationAquaticPlant.rowValidators = [...BasicInformationRowValidators];

export {ObservationAquaticPlant};
