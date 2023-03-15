import {Template, TemplateColumnBuilder} from "../definitions";
import {ActivityPersons, BasicInformation, ProjectInformation, ShorelineInformation} from "../shared_columns";

const TreatmentMechanicalAquaticPlant = new Template(
  'treatment_mechanical_aquatic_plant',
  'Treatment - Mechanical - Aquatic Plant',
  null
);

TreatmentMechanicalAquaticPlant.columns = [
  ...BasicInformation,
  ...ProjectInformation,
  ...ActivityPersons,
  ...ShorelineInformation,
  new TemplateColumnBuilder('Treatment - Authorization Information', 'text').build(),
  new TemplateColumnBuilder('Treatment - Treated Area', 'numeric').isRequired().build(),
  new TemplateColumnBuilder('Treatment - Disposal Code', 'codeReference').referencesCode('mechanical_disposal_code').isRequired().build(),
  new TemplateColumnBuilder('Treatment - Disposed Material Format', 'codeReference').build(),
  new TemplateColumnBuilder('Treatment - Disposed Material Amount', 'numeric').build(),
  new TemplateColumnBuilder('Treatment - Invasive Plant Code', 'codeReference').referencesCode('invasive_plant_aquatic_code').isRequired().build(),
  new TemplateColumnBuilder('Treatment - Mechanical Method Code', 'codeReference').referencesCode('mechanical_method_code').isRequired().build(),
];

export {TreatmentMechanicalAquaticPlant};
