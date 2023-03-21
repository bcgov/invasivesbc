import {Template, TemplateColumnBuilder} from "../definitions";
import {
  ActivityPersons,
  BasicInformation,
  MicrositeConditions, PhenologyInformation, ProjectInformation,
  WeatherInformation,
  WellInformation
} from "../shared_columns";

const MonitoringBiocontrolDispersalTerrestrialPlant = new Template(
  'monitoring_biocontrol_dispersal_terrestrial_plant',
  'Monitoring - Biocontrol Dispersal - Terrestrial Plant',
  null
);

MonitoringBiocontrolDispersalTerrestrialPlant.columns = [
  ...BasicInformation,
  ...ProjectInformation,
  ...ActivityPersons,
  ...WeatherInformation,
  ...MicrositeConditions,
  ...PhenologyInformation,

  new TemplateColumnBuilder('Monitoring - Start', 'datetime').isRequired().build(),
  new TemplateColumnBuilder('Monitoring - End', 'datetime').isRequired().build(),
  new TemplateColumnBuilder('Monitoring - Plant Count', 'numeric').isRequired().build(),
  new TemplateColumnBuilder('Monitoring - Sweep Count', 'numeric').isRequired().build(),

  new TemplateColumnBuilder('Monitoring - Linear Segment?', 'tristate').build(),

  new TemplateColumnBuilder('Monitoring - Invasive Plant', 'codeReference').referencesCode('invasive_plant_code').isRequired().build(),

  new TemplateColumnBuilder('Monitoring - Linked Treatment ID', 'text').isRequired().build(),
  new TemplateColumnBuilder('Monitoring - Legacy IAPP ID', 'text').build(),

  new TemplateColumnBuilder('Monitoring - Agent Code', 'codeReference').referencesCode('biocontrol_agent_code').isRequired().build(),
  new TemplateColumnBuilder('Monitoring - Biocontrol Present', 'boolean').isRequired().build(),
  new TemplateColumnBuilder('Monitoring - Signs of Presence', 'codeReferenceMulti').referencesCode('biological_agent_presence_code').build(),

  new TemplateColumnBuilder('Monitoring - Location Agents Found', 'codeReference').build(),

  new TemplateColumnBuilder('Monitoring - Actual - Agent Stage', 'codeReference').referencesCode('biocontrol_agent_stage_code').build(),
  new TemplateColumnBuilder('Monitoring - Actual - Quantity', 'numeric').build(),
  new TemplateColumnBuilder('Monitoring - Actual - Plant Position', 'codeReference').referencesCode('plant_position_code').build(),
  new TemplateColumnBuilder('Monitoring - Actual - Agent Location', 'codeReference').referencesCode('location_agents_found_code').build(),

  new TemplateColumnBuilder('Monitoring - Estimated - Agent Stage', 'codeReference').referencesCode('biocontrol_agent_stage_code').build(),
  new TemplateColumnBuilder('Monitoring - Estimated - Quantity', 'numeric').build(),
  new TemplateColumnBuilder('Monitoring - Estimated - Plant Position', 'codeReference').referencesCode('plant_position_code').build(),
  new TemplateColumnBuilder('Monitoring - Estimated - Agent Location', 'codeReference').referencesCode('location_agents_found_code').build(),

  new TemplateColumnBuilder('Monitoring - Monitoring Method', 'codeReference').referencesCode('biocontrol_monitoring_methods_code').isRequired().build(),
  new TemplateColumnBuilder('Monitoring - Monitoring Type', 'codeReference').isRequired().build(),

  new TemplateColumnBuilder('Monitoring - Suitable Collection Site?', 'tristate').isRequired().build(),

];

export { MonitoringBiocontrolDispersalTerrestrialPlant };
