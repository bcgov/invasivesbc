import { Template, TemplateColumnBuilder } from '../definitions.js';
import {
  ActivityPersons,
  BasicInformation,
  BasicInformationRowValidators,
  ProjectInformation
} from '../shared-columns.js';

const MonitoringMechanical = new Template('monitoring_mechanical', 'Monitoring - Mechanical', null);

MonitoringMechanical.columns = [
  ...BasicInformation,
  ...ProjectInformation,
  ...ActivityPersons,

  new TemplateColumnBuilder(
    'Monitoring - Treatment Pass',
    'text',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information.treatment_pass'
  )
    .isRequired()
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Evidence of Treatment',
    'boolean',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information.evidence_of_treatment'
  )
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Invasive Plants on Site',
    'boolean',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information.invasive_plants_on_site'
  )
    .isRequired()
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Linked Treatment ID',
    'text',
    'form_data.activity_type_data.linked_id'
  ).build(),
  new TemplateColumnBuilder(
    'Monitoring - Terrestrial Invasive Plant',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information.invasive_plant_code'
  )
    .referencesCode('invasive_plant_code')
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Aquatic Invasive Plant',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information.invasive_plant_aquatic_code'
  )
    .referencesCode('invasive_plant_aquatic_code')
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Efficacy Code',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information.efficacy_code'
  )
    .referencesCode('efficacy_code')
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Management Efficacy Rating',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information.management_efficacy_rating'
  )
    .referencesCode('management_efficacy_code')
    .isRequired()
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Comments',
    'text',
    'form_data.activity_subtype_data.Monitoring_MechanicalTerrestrialAquaticPlant_Information.comment'
  )
    .isRequired()
    .build()
];

MonitoringMechanical.rowValidators = [...BasicInformationRowValidators];

export { MonitoringMechanical };
