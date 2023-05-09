import { Template, TemplateColumnBuilder } from '../definitions';
import { BIOCONTROL_MONITORING_TYPE_CODES } from '../hard-coded-codes';
import {
  ActivityPersons,
  BasicInformation,
  BasicInformationRowValidators,
  MicrositeConditions,
  PhenologyInformation,
  PhenologySumValidator,
  ProjectInformation,
  WeatherInformation
} from '../shared-columns';

const MonitoringBiocontrolDispersalTerrestrialPlant = new Template(
  'monitoring_biocontrol_dispersal_terrestrial_plant',
  'Monitoring - Biocontrol Dispersal - Terrestrial Plant',
  null
);

MonitoringBiocontrolDispersalTerrestrialPlant.columns = [
  ...BasicInformation,
  ...ProjectInformation,
  ...ActivityPersons,
  ...WeatherInformation,
  ...MicrositeConditions,

  new TemplateColumnBuilder(
    'Monitoring - Start',
    'datetime',
    'form_data.activity_subtype_data.Monitoring_BiocontrolDispersal_Information.start_time'
  )
    .mustNotBeFuture()
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - End',
    'datetime',
    'form_data.activity_subtype_data.Monitoring_BiocontrolDispersal_Information.stop_time'
  )
    .mustNotBeFuture()
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Plant Count',
    'numeric',
    'form_data.activity_subtype_data.Monitoring_BiocontrolDispersal_Information.plant_count'
  )
    .valueRange(0, null)
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Sweep Count',
    'numeric',
    'form_data.activity_subtype_data.Monitoring_BiocontrolDispersal_Information.num_of_sweeps'
  )
    .valueRange(0, null)
    .isRequired()
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Linear Segment?',
    'tristate',
    'form_data.activity_subtype_data.Monitoring_BiocontrolDispersal_Information.linear_segment'
  ).build(),

  new TemplateColumnBuilder(
    'Monitoring - Invasive Plant',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_BiocontrolDispersal_Information.invasive_plant_code'
  )
    .referencesCode('invasive_plant_code_withbiocontrol')
    .isRequired()
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Agent Code',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_BiocontrolDispersal_Information.biological_agent_code'
  )
    .referencesCode('biological_agent_code')
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Biocontrol Present',
    'boolean',
    'form_data.activity_subtype_data.Monitoring_BiocontrolDispersal_Information.biocontrol_present'
  )
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Signs of Presence',
    'codeReferenceMulti',
    'form_data.activity_subtype_data.Monitoring_BiocontrolDispersal_Information.biological_agent_presence_code'
  )
    .referencesCode('biological_agent_presence_code')
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Location Agents Found',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_BiocontrolDispersal_Information.bio_agent_location_code'
  )
    .referencesCode('location_agents_found_code')
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Actual - Agent Stage',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_BiocontrolDispersal_Information.actual_biological_agents[0].biological_agent_stage_code'
  )
    .referencesCode('biological_agent_stage_code')
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Actual - Quantity',
    'numeric',
    'form_data.activity_subtype_data.Monitoring_BiocontrolDispersal_Information.actual_biological_agents[0].release_quantity'
  )
    .valueRange(0, null)
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Actual - Plant Position',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_BiocontrolDispersal_Information.actual_biological_agents[0].plant_position'
  )
    .referencesCode('plant_position_code')
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Actual - Agent Location',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_BiocontrolDispersal_Information.actual_biological_agents[0].agent_location'
  )
    .referencesCode('agent_location_code')
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Estimated - Agent Stage',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_BiocontrolDispersal_Information.estimated_biological_agents[0].biological_agent_stage_code'
  )
    .referencesCode('biological_agent_stage_code')
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Estimated - Quantity',
    'numeric',
    'form_data.activity_subtype_data.Monitoring_BiocontrolDispersal_Information.estimated_biological_agents[0].release_quantity'
  )
    .valueRange(0, null)
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Estimated - Plant Position',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_BiocontrolDispersal_Information.estimated_biological_agents[0].plant_position'
  )
    .referencesCode('plant_position_code')
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Estimated - Agent Location',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_BiocontrolDispersal_Information.estimated_biological_agents[0].agent_location'
  )
    .referencesCode('agent_location_code')
    .build(),

  new TemplateColumnBuilder('Monitoring - Monitoring Method', 'codeReference', 'biocontrol_monitoring_methods_code')
    .referencesCode('biocontrol_monitoring_methods_code')
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Monitoring - Monitoring Type',
    'codeReference',
    'form_data.activity_subtype_data.Monitoring_BiocontrolDispersal_Information.monitoring_type'
  )
    .hardcodedCodes(BIOCONTROL_MONITORING_TYPE_CODES)
    .isRequired()
    .build(),

  new TemplateColumnBuilder(
    'Monitoring - Suitable Collection Site?',
    'tristate',
    'form_data.activity_subtype_data.Monitoring_BiocontrolDispersal_Information.suitable_collection_site'
  )
    .isRequired()
    .build(),
  ...PhenologyInformation
];

MonitoringBiocontrolDispersalTerrestrialPlant.rowValidators = [...BasicInformationRowValidators, PhenologySumValidator];

export { MonitoringBiocontrolDispersalTerrestrialPlant };
