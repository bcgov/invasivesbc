import { Template, TemplateColumnBuilder } from '../definitions';
import {
  ActivityPersons,
  BasicInformation,
  BasicInformationRowValidators,
  BioAgentValidator,
  MicrositeConditions,
  PhenologyInformation,
  PhenologySumValidator,
  ProjectInformation,
  WeatherInformation,
  WindDirectionValidator
} from '../shared-columns';

const BiocontrolCollectionTemp = new Template(
  'biocontrol_collection_temp',
  'Biocontrol - Collection TEMP POINT',
  null
);

BiocontrolCollectionTemp.type = 'Biocontrol';
BiocontrolCollectionTemp.subtype = 'Activity_Biocontrol_Collection';

BiocontrolCollectionTemp.columns = [
  ...BasicInformation,
  ...ProjectInformation,
  ...ActivityPersons,
  ...WeatherInformation,
  ...MicrositeConditions,

  new TemplateColumnBuilder('Area', 'numeric', 'form_data.activity_data.reported_area')
    .isRequired()
    .mapperOverwritesPrevious()
    .build(),

  new TemplateColumnBuilder(
    'Collection - Start',
    'datetime',
    'form_data.activity_subtype_data.Biocontrol_Collection_Information[0].start_time'
  )
    .mustNotBeFuture()
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Collection - End',
    'datetime',
    'form_data.activity_subtype_data.Biocontrol_Collection_Information[0].stop_time'
  )
    .mustNotBeFuture()
    .isRequired()
    .build(),

  new TemplateColumnBuilder(
    'Collection - Historical IAPP Site ID',
    'numeric',
    'form_data.activity_subtype_data.Biocontrol_Collection_Information[0].historical_iapp_site_id'
  ).build(),

  new TemplateColumnBuilder(
    'Collection - Type',
    'codeReference',
    'form_data.activity_subtype_data.Biocontrol_Collection_Information[0].collection_type'
  )
    .referencesCode('biocontrol_collection_code')
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Collection - Method',
    'codeReference',
    'form_data.activity_subtype_data.Biocontrol_Collection_Information[0].collection_method'
  )
    .referencesCode('biocontrol_monitoring_methods_code')
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Collection - Plant Count',
    'numeric',
    'form_data.activity_subtype_data.Biocontrol_Collection_Information[0].plant_count'
  )
    .valueRange(0, null)
    .build(),

  new TemplateColumnBuilder(
    'Collection - Invasive Plant',
    'codeReference',
    'form_data.activity_subtype_data.Biocontrol_Collection_Information[0].invasive_plant_code'
  )
    .referencesCode('invasive_plant_code_withbiocontrol')
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Collection - Biological Agent',
    'codeReference',
    'form_data.activity_subtype_data.Biocontrol_Collection_Information[0].biological_agent_code'
  )
    .referencesCode('biological_agent_code')
    .isRequired()
    .build(),

  new TemplateColumnBuilder(
    'Collection - Sweep Count',
    'numeric',
    'form_data.activity_subtype_data.Biocontrol_Collection_Information[0].num_of_sweeps'
  ).build(),

  new TemplateColumnBuilder(
    'Collection - Actual - Agent Stage',
    'codeReference',
    'form_data.activity_subtype_data.Biocontrol_Collection_Information[0].actual_biological_agents[0].biological_agent_stage_code'
  )
    .referencesCode('biological_agent_stage_code')
    .build(),
  new TemplateColumnBuilder(
    'Collection - Actual - Quantity',
    'numeric',
    'form_data.activity_subtype_data.Biocontrol_Collection_Information[0].actual_biological_agents[0].release_quantity'
  )
    .valueRange(0, null)
    .build(),

  new TemplateColumnBuilder(
    'Collection - Estimated - Agent Stage',
    'codeReference',
    'form_data.activity_subtype_data.Biocontrol_Collection_Information[0].estimated_biological_agents[0].biological_agent_stage_code'
  )
    .referencesCode('biological_agent_stage_code')
    .build(),
  new TemplateColumnBuilder(
    'Collection - Estimated - Quantity',
    'numeric',
    'form_data.activity_subtype_data.Biocontrol_Collection_Information[0].estimated_biological_agents[0].release_quantity'
  )
    .valueRange(0, null)
    .build(),

  new TemplateColumnBuilder(
    'Collection - Comment',
    'text',
    'form_data.activity_subtype_data.Biocontrol_Collection_Information[0].comment'
  ).build(),

  ...PhenologyInformation
];

BiocontrolCollectionTemp.rowValidators = [
  ...BasicInformationRowValidators,
  PhenologySumValidator,
  WindDirectionValidator,
  BioAgentValidator
];

export { BiocontrolCollectionTemp };
