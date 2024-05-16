import { Template, TemplateColumnBuilder } from 'utils/batch/definitions';
import { BIOCONTROL_MONITORING_TYPE_CODES, YES_NO_CODES } from 'utils/batch/hard-coded-codes';
import {
  ActivityPersons,
  BasicInformation,
  BasicInformationRowValidators,
  MicrositeConditions,
  PhenologyInformation,
  PhenologySumValidator,
  ProjectInformation,
  WeatherInformation
} from 'utils/batch/shared-columns';

const MonitoringBiocontrolReleaseTerrestrialPlant = new Template(
  'monitoring_biocontrol_release_terrestrial_plant',
  'Monitoring - Biocontrol Release - Terrestrial Plant',
  null
);

MonitoringBiocontrolReleaseTerrestrialPlant.columns = [
  ...BasicInformation,
  ...ProjectInformation,
  ...ActivityPersons,
  ...WeatherInformation,
  ...MicrositeConditions,
  ...PhenologyInformation,

  new TemplateColumnBuilder(
    'Monitoring - Start',
    'datetime',
    'form_data.activity_subtype_data.Monitoring_BiocontrolRelease_TerrestrialPlant_Information.start_time'
  )
    .mustNotBeFuture()
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - End',
    'datetime',
    'form_data.activity_subtype_data.Monitoring_BiocontrolRelease_TerrestrialPlant_Information.stop_time'
  )
    .mustNotBeFuture()
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Plant Count',
    'numeric',
    'form_data.activity_subtype_data.Monitoring_BiocontrolRelease_TerrestrialPlant_Information.plant_count'
  )
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Sweep Count',
    'numeric',
    'form_data.activity_subtype_data.Monitoring_BiocontrolRelease_TerrestrialPlant_Information.num_of_sweeps'
  )
    .isRequired()
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Invasive Plant',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_BiocontrolRelease_TerrestrialPlant_Information.invasive_plant_code'
  )
    .referencesCode('invasive_plant_code')
    .isRequired()
    .build(),

  new TemplateColumnBuilder('Monitoring - Linked Treatment ID', 'text', 'form_data.activity_type_data.linked_id')
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Legacy IAPP ID',
    'text',
    'form_data.activity_type_data.legacy_iapp_id'
  ).build(),

  new TemplateColumnBuilder(
    'Monitoring - Agent Code',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_BiocontrolRelease_TerrestrialPlant_Information.biological_agent_code'
  )
    .referencesCode('biological_agent_code')
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Biocontrol Present',
    'boolean',
    'form_data.activity_subtype_data.Monitoring_BiocontrolRelease_TerrestrialPlant_Information.biocontrol_present'
  )
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Signs of Presence',
    'codeReferenceMulti',
    'form_data.activity_subtype_data.Monitoring_BiocontrolRelease_TerrestrialPlant_Information.biological_agent_presence_code'
  )
    .referencesCode('biological_agent_presence_code')
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Actual - Agent Stage',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_BiocontrolRelease_TerrestrialPlant_Information.actual_biological_agents[0].biological_agent_stage_code'
  )
    .referencesCode('biological_agent_stage_code')
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Actual - Quantity',
    'numeric',
    'form_data.activity_subtype_data.Monitoring_BiocontrolRelease_TerrestrialPlant_Information.actual_biological_agents[0].release_quantity'
  ).build(),
  new TemplateColumnBuilder(
    'Monitoring - Actual - Plant Position',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_BiocontrolRelease_TerrestrialPlant_Information.actual_biological_agents[0].plant_position'
  )
    .referencesCode('plant_position_code')
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Actual - Agent Location',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_BiocontrolRelease_TerrestrialPlant_Information.actual_biological_agents[0].agent_location'
  )
    .referencesCode('agent_location_code')
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Estimated - Agent Stage',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_BiocontrolRelease_TerrestrialPlant_Information.estimated_biological_agents[0].biological_agent_stage_code'
  )
    .referencesCode('biological_agent_stage_code')
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Estimated - Quantity',
    'numeric',
    'form_data.activity_subtype_data.Monitoring_BiocontrolRelease_TerrestrialPlant_Information.estimated_biological_agents[0].release_quantity'
  ).build(),
  new TemplateColumnBuilder(
    'Monitoring - Estimated - Plant Position',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_BiocontrolRelease_TerrestrialPlant_Information.estimated_biological_agents[0].plant_position'
  )
    .referencesCode('plant_position_code')
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Estimated - Agent Location',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_BiocontrolRelease_TerrestrialPlant_Information.estimated_biological_agents[0].agent_location'
  )
    .referencesCode('agent_location_code')
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Monitoring Method',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_BiocontrolRelease_TerrestrialPlant_Information.biocontrol_monitoring_methods_code'
  )
    .referencesCode('biocontrol_monitoring_methods_code')
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Monitoring Type',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_BiocontrolRelease_TerrestrialPlant_Information.monitoring_type'
  )
    .hardcodedCodes(BIOCONTROL_MONITORING_TYPE_CODES)
    .isRequired()
    .build(),

  new TemplateColumnBuilder('Monitoring - Location Agents Found', 'codeReferenceMulti')
    .referencesCode('agent_location_code')
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Suitable For Collection',
    'tristate',
    'form_data.activity_subtype_data.Monitoring_BiocontrolRelease_TerrestrialPlant_Information.suitable_collection_site'
  ).build(),

  new TemplateColumnBuilder(
    'Monitoring - Results - Spread - Recorded?',
    'codeReference',
    'form_data.activity_subtype_data.Spread_Results.spread_details_recorded'
  )
    .hardcodedCodes(YES_NO_CODES)
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Results - Spread - Plant Attack',
    'numeric',
    'form_data.activity_subtype_data.Spread_Results.plant_attack'
  ).build(),
  new TemplateColumnBuilder(
    'Monitoring - Results - Spread - Agent Density',
    'numeric',
    'form_data.activity_subtype_data.Spread_Results.agent_density'
  ).build(),
  new TemplateColumnBuilder(
    'Monitoring - Results - Spread - Max Spread Aspect',
    'numeric',
    'form_data.activity_subtype_data.Spread_Results.max_spread_aspect'
  ).build(),
  new TemplateColumnBuilder(
    'Monitoring - Results - Spread - Max Spread Distance',
    'numeric',
    'form_data.activity_subtype_data.Spread_Results.max_spread_distance'
  ).build()
];

MonitoringBiocontrolReleaseTerrestrialPlant.rowValidators = [...BasicInformationRowValidators, PhenologySumValidator];

export { MonitoringBiocontrolReleaseTerrestrialPlant };
