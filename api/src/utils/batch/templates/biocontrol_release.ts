import {Template, TemplateColumnBuilder} from "../definitions";
import {
  ActivityPersons,
  BasicInformation, MicrositeConditions,
  PhenologyInformation,
  ProjectInformation,
  WeatherInformation
} from "../shared_columns";

const BiocontrolRelease = new Template(
  'biocontrol_release',
  'Biocontrol Release',
  null
);

BiocontrolRelease.columns = [
  ...BasicInformation,
  ...ProjectInformation,
  ...ActivityPersons,
  ...WeatherInformation,
  ...MicrositeConditions,

  new TemplateColumnBuilder('Release - Invasive Plant', 'codeReference').referencesCode('invasive_plant_code').isRequired().build(),
  new TemplateColumnBuilder('Release - Biological Agent', 'codeReference').referencesCode('biocontrol_agent_code').isRequired().build(),
  new TemplateColumnBuilder('Release - Linear Segment?', 'tristate').build(),
  new TemplateColumnBuilder('Release - Mortality', 'numeric').build(),
  new TemplateColumnBuilder('Release - Collection Date', 'datetime').build(),
  new TemplateColumnBuilder('Release - Plant Collected From', 'codeReference').referencesCode('invasive_plant_code_with_biocontrol').build(),
  new TemplateColumnBuilder('Release - Plant Collected From - Unlisted', 'text').build(),
  new TemplateColumnBuilder('Release - Agent Source', 'text').isRequired().build(),
  new TemplateColumnBuilder('Release - Actual - Agent Stage', 'codeReference').referencesCode('biocontrol_agent_stage_code').build(),
  new TemplateColumnBuilder('Release - Actual - Quantity', 'numeric').build(),
  new TemplateColumnBuilder('Release - Estimated - Agent Stage', 'codeReference').referencesCode('biocontrol_agent_stage_code').build(),
  new TemplateColumnBuilder('Release - Estimated - Quantity', 'numeric').build(),

  ...PhenologyInformation
];

export {BiocontrolRelease};
