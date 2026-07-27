import { TREATMENT_PASS_CODES, YES_NO_CODES } from 'utils/batch/hard-coded-codes';
import { Template, TemplateColumnBuilder } from 'utils/batch/definitions';
import {
  ActivityPersons,
  BasicInformation,
  BasicInformationRowValidators,
  CopyGeometryValidator,
  ProjectInformation,
  TreatmentEfficacyValidator
} from 'utils/batch/shared-columns';

const MonitoringMechanicalOld = new Template(
  'monitoring_mechanical_treatment_old',
  'Monitoring - Mechanical Old',
  null,
  false
);

MonitoringMechanicalOld.type = 'Monitoring';
MonitoringMechanicalOld.subtype = 'Activity_Monitoring_MechanicalTerrestrialAquaticPlant';

MonitoringMechanicalOld.columns = [
  ...BasicInformation,
  ...ProjectInformation,
  ...ActivityPersons,

  new TemplateColumnBuilder(
    'Monitoring - Linked Treatment ID',
    'linked_id',
    'form_data.activity_type_data.linked_id'
  ).build(),

  new TemplateColumnBuilder('Monitoring - Copy Geometry', 'codeReference', 'form_data.activity_type_data.copy_geometry')
    .isRequired()
    .referencesCode('yes_no')
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Terrestrial Invasive Plant',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information[0].invasive_plant_code'
  )
    .referencesCode('invasive_plant_code')
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Aquatic Invasive Plant',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information[0].invasive_plant_aquatic_code'
  )
    .referencesCode('invasive_plant_aquatic_code')
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Evidence of Treatment',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information[0].evidence_of_treatment'
  )
    .isRequired()
    .referencesCode('yes_no')
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Treatment Efficacy Rating',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information[0].efficacy_code'
  )
    .referencesCode('efficacy_code')
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Management Efficacy Rating',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information[0].management_efficacy_rating'
  )
    .referencesCode('management_efficacy_code')
    .isRequired()
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Invasive Plants on Site',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information[0].invasive_plants_on_site'
  )
    .isRequired()
    .referencesCode('monitoring_evidence_code')
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Treatment Pass',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information[0].treatment_pass'
  )
    .isRequired()
    .referencesCode('treatment_pass_code')
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Comments',
    'text',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information[0].comment'
  ).build()
];

MonitoringMechanicalOld.rowValidators = [
  ...BasicInformationRowValidators,
  TreatmentEfficacyValidator,
  CopyGeometryValidator
];

export { MonitoringMechanicalOld };
