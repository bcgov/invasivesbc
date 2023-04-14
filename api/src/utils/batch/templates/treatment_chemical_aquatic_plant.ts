import {Template, TemplateColumnBuilder} from "../definitions";
import {
  ActivityPersons,
  ActivityPersonsWithApplicatorLicense,
  BasicInformation, BasicInformationRowValidators, ChemicalPlantTreatmentInformation, HerbicidesInformation,
  ProjectInformation, WellInformation
} from "../shared-columns";

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
  new TemplateColumnBuilder('Chemical Treatment - Invasive Species 1', 'codeReference', 'form_data.activity_subtype_data.chemical_treatment_details.invasive_plants[0].invasive_plant_code').referencesCode('invasive_plant_aquatic_code').isRequired().build(),
  new TemplateColumnBuilder('Chemical Treatment - Invasive Species 2', 'codeReference', 'form_data.activity_subtype_data.chemical_treatment_details.invasive_plants[1].invasive_plant_code').referencesCode('invasive_plant_aquatic_code').build(),
  new TemplateColumnBuilder('Chemical Treatment - Invasive Species 3', 'codeReference', 'form_data.activity_subtype_data.chemical_treatment_details.invasive_plants[2].invasive_plant_code').referencesCode('invasive_plant_aquatic_code').build(),

];
TreatmentChemicalAquaticPlant.rowValidators = [...BasicInformationRowValidators];
export {TreatmentChemicalAquaticPlant};
