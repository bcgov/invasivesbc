import { Template, TemplateColumnBuilder } from '../definitions';
import {
  ActivityPersonsWithApplicatorLicense,
  ApplicationMethodValidator,
  BasicInformation,
  BasicInformationRowValidators,
  ChemicalPlantTreatmentInformation,
  GranularHerbicideRate,
  HerbicidesInformation,
  PmpValidator,
  ProjectInformation,
  WindDirectionValidator
} from '../shared-columns';
import { ChemTreatmentValidators } from '../validation/chemical-treatment';

const TreatmentChemicalAquaticPlant = new Template(
  'treatment_chemical_aquatic_plant',
  'Treatment - Chemical - Aquatic Plant',
  null
);

TreatmentChemicalAquaticPlant.type = 'Treatment';
TreatmentChemicalAquaticPlant.subtype = 'Activity_Treatment_ChemicalPlantAquatic';

TreatmentChemicalAquaticPlant.columns = [
  ...BasicInformation,
  ...ProjectInformation,
  ...ActivityPersonsWithApplicatorLicense,
  ...ChemicalPlantTreatmentInformation,
  new TemplateColumnBuilder(
    'Chemical Treatment - Invasive Species 1',
    'codeReference',
    'form_data.activity_subtype_data.chemical_treatment_details.invasive_plants[0].invasive_plant_code'
  )
    .referencesCode('invasive_plant_aquatic_code')
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Chemical Treatment - Invasive Species 1 %',
    'numeric',
    'form_data.activity_subtype_data.chemical_treatment_details.invasive_plants[0].percent_area_covered'
  )
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Chemical Treatment - Invasive Species 2',
    'codeReference',
    'form_data.activity_subtype_data.chemical_treatment_details.invasive_plants[1].invasive_plant_code'
  )
    .referencesCode('invasive_plant_aquatic_code')
    .build(),
  new TemplateColumnBuilder(
    'Chemical Treatment - Invasive Species 2 %',
    'numeric',
    'form_data.activity_subtype_data.chemical_treatment_details.invasive_plants[1].percent_area_covered'
  ).build(),
  new TemplateColumnBuilder(
    'Chemical Treatment - Invasive Species 3',
    'codeReference',
    'form_data.activity_subtype_data.chemical_treatment_details.invasive_plants[2].invasive_plant_code'
  )
    .referencesCode('invasive_plant_aquatic_code')
    .build(),
  new TemplateColumnBuilder(
    'Chemical Treatment - Invasive Species 3 %',
    'numeric',
    'form_data.activity_subtype_data.chemical_treatment_details.invasive_plants[2].percent_area_covered'
  ).build(),
  ...HerbicidesInformation
];
TreatmentChemicalAquaticPlant.rowValidators = [
  ...BasicInformationRowValidators,
  ...ChemTreatmentValidators,
  PmpValidator,
  WindDirectionValidator,
  ApplicationMethodValidator,
  GranularHerbicideRate
];
export { TreatmentChemicalAquaticPlant };
