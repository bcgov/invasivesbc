import {Template} from "../definitions";
import {ActivityPersonsWithApplicatorLicense, BasicInformation} from "../shared_columns";

const TreatmentChemicalTerrestrialPlant = new Template(
  'treatment_chemical_terrestrial_plant',
  'Treatment - Chemical - Terrestrial Plant',
  null
);
TreatmentChemicalTerrestrialPlant.columns = [
  ...BasicInformation,
  ...ActivityPersonsWithApplicatorLicense,

];
export {TreatmentChemicalTerrestrialPlant};
