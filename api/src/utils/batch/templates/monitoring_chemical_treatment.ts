import { Template, TemplateColumnBuilder } from 'utils/batch/definitions';
import {
  ActivityPersons,
  BasicInformation,
  BasicInformationRowValidators,
  CopyGeometryValidator,
  ProjectInformation,
  TerrestrialAquaticPlantValidator,
  TreatmentEfficacyValidator
} from 'utils/batch/shared-columns';
import { TREATMENT_PASS_CODES, YES_NO_CODES } from '../hard-coded-codes';

const MonitoringChemical = new Template(
  'monitoring_chemical_treatment',
  'Monitoring - Chemical',
  null
);

MonitoringChemical.type = 'Monitoring';
MonitoringChemical.subtype = 'Activity_Monitoring_ChemicalTerrestrialAquaticPlant';

MonitoringChemical.columns = [
  ...BasicInformation,
  ...ProjectInformation,
  ...ActivityPersons,

  new TemplateColumnBuilder(
    'Monitoring - Linked Treatment ID',
    'linked_id',
    'form_data.activity_type_data.linked_id'
  ).build(),

  new TemplateColumnBuilder('Monitoring - Copy Geometry', 'codeReference', 'form_data.activity_type_data.copy_geometry')
    .hardcodedCodes(YES_NO_CODES)
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Terrestrial Invasive Plant',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_ChemicalTerrestrialAquaticPlant_Information[0].invasive_plant_code'
  )
    .referencesCode('invasive_plant_code')
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Aquatic Invasive Plant',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_ChemicalTerrestrialAquaticPlant_Information[0].invasive_plant_aquatic_code'
  )
    .referencesCode('invasive_plant_aquatic_code')
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Evidence of Treatment',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_ChemicalTerrestrialAquaticPlant_Information[0].evidence_of_treatment'
  )
    .isRequired()
    .hardcodedCodes(YES_NO_CODES)
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Treatment Efficacy Rating',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_ChemicalTerrestrialAquaticPlant_Information[0].efficacy_code'
  )
    .referencesCode('efficacy_code')
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Management Efficacy Rating',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_ChemicalTerrestrialAquaticPlant_Information[0].management_efficacy_rating'
  )
    .referencesCode('management_efficacy_code')
    .isRequired()
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Invasive Plants on Site',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_ChemicalTerrestrialAquaticPlant_Information[0].invasive_plants_on_site'
  )
    .isRequired()
    .referencesCode('monitoring_evidence_code')
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Treatment Pass',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_ChemicalTerrestrialAquaticPlant_Information[0].treatment_pass'
  )
    .isRequired()
    .hardcodedCodes(TREATMENT_PASS_CODES)
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Comments',
    'text',
    'form_data.activity_subtype_data.Monitoring_ChemicalTerrestrialAquaticPlant_Information[0].comment'
  )
    .isRequired()
    .build()
];

MonitoringChemical.rowValidators = [
  ...BasicInformationRowValidators,
  TreatmentEfficacyValidator,
  TerrestrialAquaticPlantValidator,
  CopyGeometryValidator
];

export { MonitoringChemical };
