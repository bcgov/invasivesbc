import {Template, TemplateColumnBuilder} from "../definitions";
import {ActivityPersons, BasicInformation, PhenologyInformation} from "../shared_columns";

const BiocontrolCollection = new Template(
  'biocontrol_collection',
  'Biocontrol Collection',
  null
);

BiocontrolCollection.columns = [
  ...BasicInformation,
  ...ActivityPersons,
  ...PhenologyInformation,
  new TemplateColumnBuilder('Collection - Start', 'date').isRequired().build(),
  new TemplateColumnBuilder('Collection - End', 'date').isRequired().build(),
  new TemplateColumnBuilder('Collection - Type', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Collection - Method', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Collection - Invasive Plant', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Collection - Biological Control Agent', 'codeReference').isRequired().build()
]

export {BiocontrolCollection};
