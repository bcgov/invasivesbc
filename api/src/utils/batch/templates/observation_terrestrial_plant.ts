import {Template, TemplateColumnBuilder} from '../definitions';
import {ActivityPersons, BasicInformation} from '../shared_columns';

const ObservationTerrestrialPlant = new Template(
  'observation_terrestrial_plant',
  'Observation - Terrestrial Plant',
  null
);
ObservationTerrestrialPlant.columns = [
  ...BasicInformation,
  ...ActivityPersons,

  new TemplateColumnBuilder('Observation - Terrestrial - Soil Texture', 'codeReference').build(),
  new TemplateColumnBuilder('Observation - Terrestrial - Specific Use', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Observation - Terrestrial - Slope', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Observation - Terrestrial - Aspect', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Observation - Terrestrial - Research Observation', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Observation - Terrestrial - Visible Well', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Observation - Terrestrial - Suitable For Biocontrol', 'codeReference').isRequired().build(),

  new TemplateColumnBuilder('Observation - Type', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Observation - Plant Code', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Observation - Plant Life Stage', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Observation - Density', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Observation - Distribution Code', 'codeReference').isRequired().build(),
];
export {ObservationTerrestrialPlant};
