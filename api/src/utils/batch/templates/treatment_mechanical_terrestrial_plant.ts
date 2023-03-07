import {Template, TemplateColumnBuilder} from "../definitions";
import {ActivityPersonsWithApplicatorLicense, BasicInformation, WellInformation} from "../shared_columns";

const TreatmentMechanicalTerrestrialPlant = new Template(
  'treatment_mechanical_terrestrial_plant',
  'Treatment - Mechanical - Terrestrial Plant',
  null
);

TreatmentMechanicalTerrestrialPlant.columns = [
  ...BasicInformation,
  ...ActivityPersonsWithApplicatorLicense,
  ...WellInformation,
  new TemplateColumnBuilder('Treatment - Treated Area', 'numeric').isRequired().build(),
  new TemplateColumnBuilder('Treatment - Disposed Material m3', 'numeric').build(),
  new TemplateColumnBuilder('Treatment - Disposed Material weight', 'numeric').build(),
  new TemplateColumnBuilder('Treatment - Invasive Plant Code', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Treatment - Mechanical Method Code', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Treatment - Disposal Code', 'codeReference').isRequired().build()
];

export {TreatmentMechanicalTerrestrialPlant};
