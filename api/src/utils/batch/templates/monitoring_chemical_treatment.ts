import {Template, TemplateColumnBuilder} from "../definitions";
import {ActivityPersons, BasicInformation, WellInformation} from "../shared_columns";

const MonitoringChemical = new Template(
  'monitoring_chemical',
  'Monitoring - Chemical',
  null
);

MonitoringChemical.columns = [
  ...BasicInformation,
  ...ActivityPersons,
  ...WellInformation,
  new TemplateColumnBuilder('Monitoring - Invasive Plant', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Monitoring - Treatment Pass', 'text').isRequired().build(),

  new TemplateColumnBuilder('Monitoring - Evidence of Treatment', 'boolean').isRequired().build(),
  new TemplateColumnBuilder('Monitoring - Invasive Plants on Site', 'boolean').isRequired().build(),

  new TemplateColumnBuilder('Monitoring - Efficacy Code', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Monitoring - Management Efficacy Rating', 'codeReference').isRequired().build(),

  new TemplateColumnBuilder('Monitoring - Comments', 'text').isRequired().build()
];

export {MonitoringChemical};
