import {Template, TemplateColumnBuilder} from "../definitions";
import {
  ActivityPersons,
  BasicInformation,
  MicrositeConditions, PhenologyInformation,
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
  ...ActivityPersons,
  ...WellInformation,
  ...WeatherInformation,
  ...MicrositeConditions,
  ...PhenologyInformation,

  new TemplateColumnBuilder('Monitoring - Start', 'date').isRequired().build(),
  new TemplateColumnBuilder('Monitoring - End', 'date').isRequired().build(),
  new TemplateColumnBuilder('Monitoring - Plant Count', 'numeric').isRequired().build(),
  new TemplateColumnBuilder('Monitoring - Sweep Count', 'numeric').isRequired().build(),

  new TemplateColumnBuilder('Monitoring - Biocontrol Present', 'boolean').isRequired().build(),

  new TemplateColumnBuilder('Monitoring - Agent Code', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Monitoring - Agent Location Code', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Monitoring - Agent Presence Code', 'codeReference').isRequired().build(),

  new TemplateColumnBuilder('Monitoring - Monitoring - Actual Agent Location', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Monitoring - Monitoring - Actual Agent Plant Position', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Monitoring - Monitoring - Actual Stage Code', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Monitoring - Monitoring - Actual Agent Release Quantity', 'numeric').isRequired().build(),

  new TemplateColumnBuilder('Monitoring - Monitoring - Estimated Agent Location', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Monitoring - Monitoring - Estimated Agent Plant Position', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Monitoring - Monitoring - Estimated Stage Code', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Monitoring - Monitoring - Estimated Agent Release Quantity', 'numeric').isRequired().build(),

  new TemplateColumnBuilder('Monitoring - Monitoring Method', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Monitoring - Monitoring - Suitable Collection Site', 'boolean').isRequired().build(),

];

export { MonitoringBiocontrolDispersalTerrestrialPlant };
