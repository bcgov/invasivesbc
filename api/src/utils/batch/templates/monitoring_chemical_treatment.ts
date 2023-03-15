import {Template, TemplateColumnBuilder} from "../definitions";
import {ActivityPersons, BasicInformation, ProjectInformation, WellInformation} from "../shared_columns";

const MonitoringChemical = new Template(
  'monitoring_chemical',
  'Monitoring - Chemical',
  null
);

MonitoringChemical.columns = [
  ...BasicInformation,
  ...ProjectInformation,
  ...ActivityPersons,
  ...WellInformation,

  new TemplateColumnBuilder('Monitoring - Treatment Pass', 'text').isRequired().build(),

  new TemplateColumnBuilder('Monitoring - Evidence of Treatment', 'boolean').isRequired().build(),
  new TemplateColumnBuilder('Monitoring - Invasive Plants on Site', 'boolean').isRequired().build(),

  new TemplateColumnBuilder('Monitoring - Linked Treatment ID', 'text').build(),
  new TemplateColumnBuilder('Monitoring - Terrestrial Invasive Plant', 'codeReference').referencesCode('invasive_plant_code').build(),
  new TemplateColumnBuilder('Monitoring - Aquatic Invasive Plant', 'codeReference').referencesCode('invasive_plant_aquatic_code').build(),

  new TemplateColumnBuilder('Monitoring - Efficacy Code', 'codeReference').referencesCode('efficacy_code').isRequired().build(),
  new TemplateColumnBuilder('Monitoring - Management Efficacy Rating', 'codeReference').referencesCode('management_efficacy_code').isRequired().build(),

  new TemplateColumnBuilder('Monitoring - Comments', 'text').isRequired().build()
];

export {MonitoringChemical};
