import { TREATMENT_PASS_CODES, YES_NO_CODES } from 'utils/batch/hard-coded-codes';
import { Template, TemplateColumnBuilder } from 'utils/batch/definitions';
import {
  ActivityPersons,
  BasicInformation,
  BasicInformationRowValidators,
  CopyGeometryValidator,
  DuplicateMonitoringInvasivePlantValidator,
  ProjectInformation,
  TreatmentEfficacyValidator,
  TreatmentMonitoringValidator
} from 'utils/batch/shared-columns';

const MonitoringMechanical = new Template('monitoring_mechanical_treatment', 'Monitoring - Mechanical', null);

MonitoringMechanical.type = 'Monitoring';
MonitoringMechanical.subtype = 'Activity_Monitoring_MechanicalTerrestrialAquaticPlant';

MonitoringMechanical.columns = [
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
    .hardcodedCodes(YES_NO_CODES)
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Terrestrial Invasive Plant 1',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information[0].invasive_plant_code'
  )
    .referencesCode('invasive_plant_code')
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Aquatic Invasive Plant 1',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information[0].invasive_plant_aquatic_code'
  )
    .referencesCode('invasive_plant_aquatic_code')
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Evidence of Treatment 1',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information[0].evidence_of_treatment'
  )
    .isRequired()
    .hardcodedCodes(YES_NO_CODES)
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Treatment Efficacy Rating 1',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information[0].efficacy_code'
  )
    .referencesCode('efficacy_code')
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Management Efficacy Rating 1',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information[0].management_efficacy_rating'
  )
    .referencesCode('management_efficacy_code')
    .isRequired()
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Invasive Plants on Site 1',
    'codeReferenceMulti',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information[0].invasive_plants_on_site'
  )
    .isRequired()
    .referencesCode('monitoring_evidence_code')
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Treatment Pass 1',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information[0].treatment_pass'
  )
    .hardcodedCodes(TREATMENT_PASS_CODES)
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Comments 1',
    'text',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information[0].comment'
  ).build(),
  new TemplateColumnBuilder(
    'Monitoring - Terrestrial Invasive Plant 2',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information[1].invasive_plant_code'
  )
    .referencesCode('invasive_plant_code')
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Aquatic Invasive Plant 2',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information[1].invasive_plant_aquatic_code'
  )
    .referencesCode('invasive_plant_aquatic_code')
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Evidence of Treatment 2',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information[1].evidence_of_treatment'
  )
    .hardcodedCodes(YES_NO_CODES)
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Treatment Efficacy Rating 2',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information[1].efficacy_code'
  )
    .referencesCode('efficacy_code')
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Management Efficacy Rating 2',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information[1].management_efficacy_rating'
  )
    .referencesCode('management_efficacy_code')
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Invasive Plants on Site 2',
    'codeReferenceMulti',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information[1].invasive_plants_on_site'
  )
    .referencesCode('monitoring_evidence_code')
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Treatment Pass 2',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information[1].treatment_pass'
  )
    .hardcodedCodes(TREATMENT_PASS_CODES)
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Comments 2',
    'text',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information[1].comment'
  ).build(),
  new TemplateColumnBuilder(
    'Monitoring - Terrestrial Invasive Plant 3',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information[2].invasive_plant_code'
  )
    .referencesCode('invasive_plant_code')
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Aquatic Invasive Plant 3',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information[2].invasive_plant_aquatic_code'
  )
    .referencesCode('invasive_plant_aquatic_code')
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Evidence of Treatment 3',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information[2].evidence_of_treatment'
  )
    .hardcodedCodes(YES_NO_CODES)
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Treatment Efficacy Rating 3',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information[2].efficacy_code'
  )
    .referencesCode('efficacy_code')
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Management Efficacy Rating 3',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information[2].management_efficacy_rating'
  )
    .referencesCode('management_efficacy_code')
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Invasive Plants on Site 3',
    'codeReferenceMulti',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information[2].invasive_plants_on_site'
  )
    .referencesCode('monitoring_evidence_code')
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Treatment Pass 3',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information[2].treatment_pass'
  )
    .hardcodedCodes(TREATMENT_PASS_CODES)
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Comments 3',
    'text',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information[2].comment'
  ).build()
];

MonitoringMechanical.rowValidators = [
  ...BasicInformationRowValidators,
  TreatmentEfficacyValidator,
  CopyGeometryValidator,
  TreatmentMonitoringValidator,
  DuplicateMonitoringInvasivePlantValidator
];

export { MonitoringMechanical };
