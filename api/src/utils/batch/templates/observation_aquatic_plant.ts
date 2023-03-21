import {Template, TemplateColumnBuilder} from "../definitions";
import {
  ActivityPersons,
  BasicInformation,
  ProjectInformation,
  ShorelineInformation,
  VoucherInformation,
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

  ...VoucherInformation

];

export {ObservationAquaticPlant};
