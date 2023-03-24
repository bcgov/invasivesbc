import {Template, TemplateColumnBuilder} from '../definitions';
import {
  ActivityPersons,
  BasicInformation,
  BasicInformationRowValidators,
  ProjectInformation,
  VoucherInformation
} from '../shared_columns';

const ObservationTerrestrialPlant = new Template(
  'observation_terrestrial_plant',
  'Observation - Terrestrial Plant',
  null
);
ObservationTerrestrialPlant.columns = [
  ...BasicInformation,
  ...ProjectInformation,
  ...ActivityPersons,
  new TemplateColumnBuilder('Observation - Pre-treatment observation?', 'boolean').build(),
  new TemplateColumnBuilder('Observation - Terrestrial - Soil Texture', 'codeReference').referencesCode('soil_texture_code').build(),
  new TemplateColumnBuilder('Observation - Terrestrial - Specific Use', 'codeReference').referencesCode('specific_use_code').isRequired().build(),
  new TemplateColumnBuilder('Observation - Terrestrial - Slope', 'codeReference').referencesCode('slope_code').isRequired().build(),
  new TemplateColumnBuilder('Observation - Terrestrial - Aspect', 'codeReference').referencesCode('aspect_code').isRequired().build(),
  new TemplateColumnBuilder('Observation - Terrestrial - Research Observation', 'tristate').isRequired().build(),
  new TemplateColumnBuilder('Observation - Terrestrial - Visible Well', 'tristate').isRequired().build(),

  new TemplateColumnBuilder('Observation - Type', 'codeReference').referencesCode('observation_type_code').isRequired().build(),
  new TemplateColumnBuilder('Observation - Invasive Plant', 'codeReference').referencesCode('invasive_plant_code').isRequired().build(),
  new TemplateColumnBuilder('Observation - Life Stage', 'codeReference').referencesCode('plant_seed_stage_code').isRequired().build(),
  new TemplateColumnBuilder('Observation - Density', 'codeReference').referencesCode('invasive_plant_density_code').isRequired().build(),
  new TemplateColumnBuilder('Observation - Distribution', 'codeReference').referencesCode('invasive_plant_distribution_code').isRequired().build(),
  new TemplateColumnBuilder('Observation - Suitable for Biocontrol Agent?', 'tristate').build(),

  ...VoucherInformation
];

ObservationTerrestrialPlant.rowValidators = [...BasicInformationRowValidators];

export {ObservationTerrestrialPlant};
