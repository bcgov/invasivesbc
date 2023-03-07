import {Template, TemplateColumnBuilder} from "../definitions";
import {
  ActivityPersons,
  BasicInformation,
  MicrositeConditions, PhenologyInformation,
  WeatherInformation,
  WellInformation
} from "../shared_columns";

const MonitoringBiocontrolReleaseTerrestrialPlant = new Template(
  'monitoring_biocontrol_release_terrestrial_plant',
  'Monitoring - Biocontrol Release - Terrestrial Plant',
  null
);

MonitoringBiocontrolReleaseTerrestrialPlant.columns = [
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

  new TemplateColumnBuilder('Monitoring - Invasive Plant', 'codeReference').isRequired().build(),

  new TemplateColumnBuilder('Monitoring - Biocontrol Present', 'boolean').isRequired().build(),

  new TemplateColumnBuilder('Monitoring - Agent Code', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Monitoring - Actual Quantity', 'numeric').isRequired().build(),
  new TemplateColumnBuilder('Monitoring - Estimated Quantity', 'numeric').isRequired().build(),
  new TemplateColumnBuilder('Monitoring - Agent Presence Code', 'codeReference').isRequired().build(),

  new TemplateColumnBuilder('Monitoring - Monitoring Method', 'codeReference').isRequired().build(),

  new TemplateColumnBuilder('Monitoring - Results - Spread - Recorded?', 'boolean').isRequired().build(),
  new TemplateColumnBuilder('Monitoring - Results - Spread - Plant Attack', 'numeric').build(),
  new TemplateColumnBuilder('Monitoring - Results - Spread - Agent Density', 'numeric').build(),
  new TemplateColumnBuilder('Monitoring - Results - Spread - Max Spread Aspect', 'numeric').build(),
  new TemplateColumnBuilder('Monitoring - Results - Spread - Max Spread Distance', 'numeric').build(),

];

export {MonitoringBiocontrolReleaseTerrestrialPlant};
