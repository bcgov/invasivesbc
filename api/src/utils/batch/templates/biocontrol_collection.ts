import {Template, TemplateColumnBuilder} from "../definitions";
import {
  ActivityPersons,
  BasicInformation, BasicInformationRowValidators, MicrositeConditions,
  PhenologyInformation,
  ProjectInformation,
  WeatherInformation
} from "../shared_columns";

const BiocontrolCollection = new Template(
  'biocontrol_collection',
  'Biocontrol Collection',
  null
);

BiocontrolCollection.columns = [
  ...BasicInformation,
  ...ProjectInformation,
  ...ActivityPersons,
  ...WeatherInformation,
  ...MicrositeConditions,

  new TemplateColumnBuilder('Collection - Start', 'datetime').isRequired().build(),
  new TemplateColumnBuilder('Collection - End', 'datetime').isRequired().build(),

  new TemplateColumnBuilder('Collection - Historical IAPP Site ID', 'text').build(),

  new TemplateColumnBuilder('Collection - Type', 'codeReference').referencesCode('biocontrol_collection_code').isRequired().build(),
  new TemplateColumnBuilder('Collection - Method', 'codeReference').referencesCode('biocontrol_monitoring_methods_code').isRequired().build(),
  new TemplateColumnBuilder('Collection - Plant Count', 'numeric').build(),

  new TemplateColumnBuilder('Collection - Invasive Plant', 'codeReference').referencesCode('invasive_plant_code').isRequired().build(),
  new TemplateColumnBuilder('Collection - Biological Agent', 'codeReference').referencesCode('biocontrol_agent_code').isRequired().build(),

  new TemplateColumnBuilder('Collection - Sweep Count', 'numeric').build(),

  new TemplateColumnBuilder('Collection - Actual - Agent Stage', 'codeReference').referencesCode('biocontrol_agent_stage_code').build(),
  new TemplateColumnBuilder('Collection - Actual - Quantity', 'numeric').build(),

  new TemplateColumnBuilder('Collection - Estimated - Agent Stage', 'codeReference').referencesCode('biocontrol_agent_stage_code').build(),
  new TemplateColumnBuilder('Collection - Estimated - Quantity', 'numeric').build(),

  new TemplateColumnBuilder('Collection - Comment', 'text').build(),

  ...PhenologyInformation,

]

BiocontrolCollection.rowValidators = [...BasicInformationRowValidators];

export {BiocontrolCollection};
