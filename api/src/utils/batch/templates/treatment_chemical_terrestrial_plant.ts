import {Template, TemplateColumnBuilder} from "../definitions";
import {
  ActivityPersonsWithApplicatorLicense,
  BasicInformation, ChemicalPlantTreatmentInformation, HerbicidesInformation,
  ProjectInformation,
  WellInformation
} from "../shared_columns";

const TreatmentChemicalTerrestrialPlant = new Template(
  'treatment_chemical_terrestrial_plant',
  'Treatment - Chemical - Terrestrial Plant',
  null
);
TreatmentChemicalTerrestrialPlant.columns = [
  ...BasicInformation,
  ...ProjectInformation,
  ...WellInformation,
  ...ActivityPersonsWithApplicatorLicense,
  ...ChemicalPlantTreatmentInformation,
  ...HerbicidesInformation,
  new TemplateColumnBuilder('Chemical Treatment - Invasive Species 1', 'codeReference').referencesCode('invasive_plant_code').isRequired().build(),
  new TemplateColumnBuilder('Chemical Treatment - Invasive Species 2', 'codeReference').referencesCode('invasive_plant_code').build(),
  new TemplateColumnBuilder('Chemical Treatment - Invasive Species 3', 'codeReference').referencesCode('invasive_plant_code').build(),

];
export {TreatmentChemicalTerrestrialPlant};