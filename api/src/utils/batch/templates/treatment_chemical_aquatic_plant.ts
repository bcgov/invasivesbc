import {Template, TemplateColumnBuilder} from "../definitions";
import {ActivityPersons, ActivityPersonsWithApplicatorLicense, BasicInformation} from "../shared_columns";

const TreatmentChemicalAquaticPlant = new Template(
  'treatment_chemical_aquatic_plant',
  'Treatment - Chemical - Aquatic Plant',
  null
);

TreatmentChemicalAquaticPlant.columns = [
  ...BasicInformation,
  ...ActivityPersonsWithApplicatorLicense
]

export {TreatmentChemicalAquaticPlant};
