import { ChemTreatmentValidators } from 'utils/batch/validation/chemical-treatment';
import { Template, TemplateColumnBuilder } from 'utils/batch/definitions';
import {
  ActivityPersonsWithApplicatorLicense,
  BasicInformation,
  BasicInformationRowValidators,
  ChemicalPlantTreatmentInformation,
  HerbicidesInformation,
  PmpValidator,
  ProjectInformation,
  WindDirectionValidator,
  ApplicationMethodType,
  ApplicationMethodValidator,
  GranularHerbicideRate
} from 'utils/batch/shared-columns';

const TreatmentChemicalTerrestrialPlantTemp = new Template(
  'treatment_chemical_terrestrial_plant_temp',
  'Treatment - Chemical - Terrestrial Plant TEMP POINT',
  null
);
TreatmentChemicalTerrestrialPlantTemp.type = 'Treatment';
TreatmentChemicalTerrestrialPlantTemp.subtype = 'Activity_Treatment_ChemicalPlantTerrestrial';

TreatmentChemicalTerrestrialPlantTemp.columns = [
  ...BasicInformation,
  ...ProjectInformation,
  ...ActivityPersonsWithApplicatorLicense,
  ...ChemicalPlantTreatmentInformation,
  new TemplateColumnBuilder('Area', 'numeric').isRequired().build(),
  new TemplateColumnBuilder(
    'Chemical Treatment - Invasive Species 1',
    'codeReference',
    'form_data.activity_subtype_data.chemical_treatment_details.invasive_plants[0].invasive_plant_code'
  )
    .referencesCode('invasive_plant_code')
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
    .referencesCode('invasive_plant_code')
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
    .referencesCode('invasive_plant_code')
    .build(),
  new TemplateColumnBuilder(
    'Chemical Treatment - Invasive Species 3 %',
    'numeric',
    'form_data.activity_subtype_data.chemical_treatment_details.invasive_plants[2].percent_area_covered'
  ).build(),
  ...HerbicidesInformation
];
TreatmentChemicalTerrestrialPlantTemp.rowValidators = [
  ...BasicInformationRowValidators,
  ...ChemTreatmentValidators,
  PmpValidator,
  WindDirectionValidator,
  ApplicationMethodType,
  ApplicationMethodValidator,
  GranularHerbicideRate
];
export { TreatmentChemicalTerrestrialPlantTemp };
