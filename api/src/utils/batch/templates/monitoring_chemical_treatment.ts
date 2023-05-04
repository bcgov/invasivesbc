import { Template, TemplateColumnBuilder } from '../definitions';
import {
  ActivityPersons,
  BasicInformation,
  BasicInformationRowValidators,
  ProjectInformation,
  WellInformation
} from '../shared-columns';

const MonitoringChemical = new Template('monitoring_chemical', 'Monitoring - Chemical', null);

MonitoringChemical.columns = [
  ...BasicInformation,
  ...ProjectInformation,
  ...ActivityPersons,

  new TemplateColumnBuilder(
    'Monitoring - Treatment Pass',
    'text',
    'form_data.activity_subtype_data.Monitoring_ChemicalTerrestrialAquaticPlant_Information.treatment_pass'
  )
    .isRequired()
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Evidence of Treatment',
    'boolean',
    'form_data.activity_subtype_data.Monitoring_ChemicalTerrestrialAquaticPlant_Information.evidence_of_treatment'
  )
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Invasive Plants on Site',
    'boolean',
    'form_data.activity_subtype_data.Monitoring_ChemicalTerrestrialAquaticPlant_Information.invasive_plants_on_site'
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
    'form_data.activity_subtype_data.Monitoring_ChemicalTerrestrialAquaticPlant_Information.invasive_plant_code'
  )
    .referencesCode('invasive_plant_code')
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Aquatic Invasive Plant',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_ChemicalTerrestrialAquaticPlant_Information.invasive_plant_aquatic_code'
  )
    .referencesCode('invasive_plant_aquatic_code')
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Efficacy Code',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_ChemicalTerrestrialAquaticPlant_Information.efficacy_code'
  )
    .referencesCode('efficacy_code')
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Management Efficacy Rating',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_ChemicalTerrestrialAquaticPlant_Information.management_efficacy_rating'
  )
    .referencesCode('management_efficacy_code')
    .isRequired()
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Comments',
    'text',
    'form_data.activity_subtype_data.Monitoring_ChemicalTerrestrialAquaticPlant_Information.comment'
  )
    .isRequired()
    .build()
];

MonitoringChemical.rowValidators = [...BasicInformationRowValidators];

export { MonitoringChemical };
