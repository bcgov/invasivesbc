import {Template, TemplateColumnBuilder} from "../definitions";
import {
  ActivityPersonsWithApplicatorLicense,
  BasicInformation,
  ShorelineInformation,
  WellInformation
} from "../shared_columns";

const TreatmentMechanicalAquaticPlant = new Template(
  'treatment_mechanical_aquatic_plant',
  'Treatment - Mechanical - Aquatic Plant',
  null
);

TreatmentMechanicalAquaticPlant.columns = [
  ...BasicInformation,
  ...ActivityPersonsWithApplicatorLicense,
  ...WellInformation,
  ...ShorelineInformation,
  new TemplateColumnBuilder('Treatment - Treated Area', 'numeric').isRequired().build(),
  new TemplateColumnBuilder('Treatment - Disposed Material m3', 'numeric').build(),
  new TemplateColumnBuilder('Treatment - Disposed Material weight', 'numeric').build(),
  new TemplateColumnBuilder('Treatment - Invasive Plant Code', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Treatment - Mechanical Method Code', 'codeReference').isRequired().build(),
  new TemplateColumnBuilder('Treatment - Disposal Code', 'codeReference').isRequired().build()
];

export {TreatmentMechanicalAquaticPlant};
