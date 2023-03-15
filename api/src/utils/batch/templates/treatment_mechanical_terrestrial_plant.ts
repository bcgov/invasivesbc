import {Template, TemplateColumnBuilder} from "../definitions";
import {ActivityPersons, BasicInformation, ProjectInformation} from "../shared_columns";

const TreatmentMechanicalTerrestrialPlant = new Template(
  'treatment_mechanical_terrestrial_plant',
  'Treatment - Mechanical - Terrestrial Plant',
  null
);

TreatmentMechanicalTerrestrialPlant.columns = [
  ...BasicInformation,
  ...ProjectInformation,
  ...ActivityPersons,
  new TemplateColumnBuilder('Treatment - Treated Area', 'numeric').isRequired().build(),
  new TemplateColumnBuilder('Treatment - Disposal Code', 'codeReference').referencesCode('mechanical_disposal_code').isRequired().build(),
  new TemplateColumnBuilder('Treatment - Disposed Material Format', 'codeReference').build(),
  new TemplateColumnBuilder('Treatment - Disposed Material Amount', 'numeric').build(),
  new TemplateColumnBuilder('Treatment - Invasive Plant Code', 'codeReference').referencesCode('invasive_plant_code').isRequired().build(),
  new TemplateColumnBuilder('Treatment - Mechanical Method Code', 'codeReference').referencesCode('mechanical_method_code').isRequired().build()
];

export {TreatmentMechanicalTerrestrialPlant};
