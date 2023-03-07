import {Template, TemplateColumnBuilder} from "../definitions";
import {
  ActivityPersons,
  BasicInformation,
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
  ...ActivityPersons,
  ...ShorelineInformation,
  ...WaterbodyInformation,
  ...WaterQualityInformation,
  new TemplateColumnBuilder('Observation - Type', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Observation - Plant Code', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Observation - Plant Life Stage', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Observation - Density', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Observation - Distribution Code', 'codeReference').isRequired().build()
];

export { ObservationAquaticPlant };
