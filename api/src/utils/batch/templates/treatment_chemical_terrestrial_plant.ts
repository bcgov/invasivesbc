import { ChemTreatmentValidators } from "../validation/chemical-treatment";
import {Template, TemplateColumnBuilder} from "../definitions";
import {
  ActivityPersonsWithApplicatorLicense,
  BasicInformation,
  BasicInformationRowValidators,
  ChemicalPlantTreatmentInformation,
  HerbicidesInformation,
  ProjectInformation,
  WellInformation
} from '../shared-columns';

const TreatmentChemicalTerrestrialPlant = new Template(
  'treatment_chemical_terrestrial_plant',
  'Treatment - Chemical - Terrestrial Plant',
  null
);
TreatmentChemicalTerrestrialPlant.type = 'Treatment';
TreatmentChemicalTerrestrialPlant.subtype = 'Activity_Treatment_ChemicalPlantTerrestrial';

TreatmentChemicalTerrestrialPlant.columns = [
  ...BasicInformation,
  ...ProjectInformation,
  ...WellInformation,
  ...ActivityPersonsWithApplicatorLicense,
  ...ChemicalPlantTreatmentInformation,
  ...HerbicidesInformation,
  new TemplateColumnBuilder('Chemical Treatment - Invasive Species 1', 'codeReference', 'form_data.activity_subtype_data.chemical_treatment_details.invasive_plants[0].invasive_plant_code').referencesCode('invasive_plant_code').isRequired().build(),
  new TemplateColumnBuilder('Chemical Treatment - Invasive Species 1 %', 'numeric', 'form_data.activity_subtype_data.chemical_treatment_details.invasive_plants[0].percent_area_covered').isRequired().build(),
  new TemplateColumnBuilder('Chemical Treatment - Invasive Species 2', 'codeReference', 'form_data.activity_subtype_data.chemical_treatment_details.invasive_plants[1].invasive_plant_code').referencesCode('invasive_plant_code').build(),
  new TemplateColumnBuilder('Chemical Treatment - Invasive Species 2 %', 'numeric', 'form_data.activity_subtype_data.chemical_treatment_details.invasive_plants[1].percent_area_covered').isRequired().build(),
  new TemplateColumnBuilder('Chemical Treatment - Invasive Species 3', 'codeReference', 'form_data.activity_subtype_data.chemical_treatment_details.invasive_plants[2].invasive_plant_code').referencesCode('invasive_plant_code').build(),
  new TemplateColumnBuilder('Chemical Treatment - Invasive Species 3 %', 'numeric', 'form_data.activity_subtype_data.chemical_treatment_details.invasive_plants[2].percent_area_covered').isRequired().build(),

];
TreatmentChemicalTerrestrialPlant.rowValidators = [...BasicInformationRowValidators, ...ChemTreatmentValidators];
export {TreatmentChemicalTerrestrialPlant};
