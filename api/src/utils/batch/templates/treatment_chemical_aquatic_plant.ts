import {Template, TemplateColumnBuilder} from "../definitions";
import {
  ActivityPersons,
  ActivityPersonsWithApplicatorLicense,
  BasicInformation, ChemicalPlantTreatmentInformation, HerbicidesInformation,
  ProjectInformation, WellInformation
} from "../shared_columns";

const TreatmentChemicalAquaticPlant = new Template(
  'treatment_chemical_aquatic_plant',
  'Treatment - Chemical - Aquatic Plant',
  null
);

TreatmentChemicalAquaticPlant.columns = [
  ...BasicInformation,
  ...ProjectInformation,
  ...WellInformation,
  ...ActivityPersonsWithApplicatorLicense,
  ...ChemicalPlantTreatmentInformation,
  ...HerbicidesInformation,
  new TemplateColumnBuilder('Chemical Treatment - Invasive Species 1', 'codeReference').referencesCode('invasive_plant_aquatic_code').isRequired().build(),
  new TemplateColumnBuilder('Chemical Treatment - Invasive Species 2', 'codeReference').referencesCode('invasive_plant_aquatic_code').build(),
  new TemplateColumnBuilder('Chemical Treatment - Invasive Species 3', 'codeReference').referencesCode('invasive_plant_aquatic_code').build(),

];

export {TreatmentChemicalAquaticPlant};
