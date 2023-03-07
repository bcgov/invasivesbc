import {Template, TemplateColumnBuilder} from "../definitions";
import {ActivityPersons, BasicInformation, WeatherInformation, WellInformation} from "../shared_columns";

const BiocontrolRelease = new Template(
  'biocontrol_release',
  'Biocontrol Release',
  null
);

BiocontrolRelease.columns = [
  ...BasicInformation,
  ...ActivityPersons,
  ...WellInformation,
  ...WeatherInformation,

  new TemplateColumnBuilder('Collection - Start', 'date').isRequired().build(),
  new TemplateColumnBuilder('Collection - Invasive Plant', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Collection - Biological Control Agent', 'codeReference').isRequired().build()
];

export { BiocontrolRelease };
