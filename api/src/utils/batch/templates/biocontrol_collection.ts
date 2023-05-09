import { Template, TemplateColumnBuilder } from '../definitions';
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

const BiocontrolCollection = new Template('biocontrol_collection', 'Biocontrol Collection', null);

BiocontrolCollection.columns = [
  ...BasicInformation,
  ...ProjectInformation,
  ...ActivityPersons,
  ...WeatherInformation,
  ...MicrositeConditions,

  new TemplateColumnBuilder(
    'Collection - Start',
    'datetime',
    'form_data.activity_subtype_data.Biocontrol_Collection_Information.start_time'
  )
    .mustNotBeFuture()
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Collection - End',
    'datetime',
    'form_data.activity_subtype_data.Biocontrol_Collection_Information.stop_time'
  )
    .mustNotBeFuture()
    .isRequired()
    .build(),

  new TemplateColumnBuilder(
    'Collection - Historical IAPP Site ID',
    'text',
    'form_data.activity_subtype_data.Biocontrol_Collection_Information.historical_iapp_site_id'
  ).build(),

  new TemplateColumnBuilder(
    'Collection - Type',
    'codeReference',
    'form_data.activity_subtype_data.Biocontrol_Collection_Information.collection_type'
  )
    .referencesCode('biocontrol_collection_code')
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Collection - Method',
    'codeReference',
    'form_data.activity_subtype_data.Biocontrol_Collection_Information.collection_method'
  )
    .referencesCode('biocontrol_monitoring_methods_code')
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Collection - Plant Count',
    'numeric',
    'form_data.activity_subtype_data.Biocontrol_Collection_Information.plant_count'
  )
    .valueRange(0, null)
    .build(),

  new TemplateColumnBuilder(
    'Collection - Invasive Plant',
    'codeReference',
    'form_data.activity_subtype_data.Biocontrol_Collection_Information.invasive_plant_code'
  )
    .referencesCode('invasive_plant_code_withbiocontrol')
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Collection - Biological Agent',
    'codeReference',
    'form_data.activity_subtype_data.Biocontrol_Collection_Information.biological_agent_code'
  )
    .referencesCode('biological_agent_code')
    .isRequired()
    .build(),

  new TemplateColumnBuilder(
    'Collection - Sweep Count',
    'numeric',
    'form_data.activity_subtype_data.Biocontrol_Collection_Information.num_of_sweeps'
  ).build(),

  new TemplateColumnBuilder(
    'Collection - Actual - Agent Stage',
    'codeReference',
    'form_data.activity_subtype_data.Biocontrol_Collection_Information.actual_biological_agents[0].biological_agent_stage_code'
  )
    .referencesCode('biological_agent_stage_code')
    .build(),
  new TemplateColumnBuilder(
    'Collection - Actual - Quantity',
    'numeric',
    'form_data.activity_subtype_data.Biocontrol_Collection_Information.actual_biological_agents[0].release_quantity'
  )
    .valueRange(0, null)
    .build(),

  new TemplateColumnBuilder(
    'Collection - Estimated - Agent Stage',
    'codeReference',
    'form_data.activity_subtype_data.Biocontrol_Collection_Information.estimated_biological_agents[0].biological_agent_stage_code'
  )
    .referencesCode('biological_agent_stage_code')
    .build(),
  new TemplateColumnBuilder(
    'Collection - Estimated - Quantity',
    'numeric',
    'form_data.activity_subtype_data.Biocontrol_Collection_Information.estimated_biological_agents[0].release_quantity'
  )
    .valueRange(0, null)
    .build(),

  new TemplateColumnBuilder(
    'Collection - Comment',
    'text',
    'form_data.activity_subtype_data.Biocontrol_Collection_Information.comment'
  ).build(),

  ...PhenologyInformation
];

BiocontrolCollection.rowValidators = [...BasicInformationRowValidators, PhenologySumValidator];

export { BiocontrolCollection };
