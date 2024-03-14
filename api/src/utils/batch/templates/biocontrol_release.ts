import { Template, TemplateColumnBuilder } from '../definitions.js';
import {
  ActivityPersons,
  BasicInformation,
  BasicInformationRowValidators,
  MicrositeConditions,
  PhenologyInformation,
  PhenologySumValidator,
  ProjectInformation,
  WeatherInformation
} from '../shared-columns.js';

const BiocontrolRelease = new Template('biocontrol_release', 'Biocontrol Release', null);

BiocontrolRelease.columns = [
  ...BasicInformation,
  ...ProjectInformation,
  ...ActivityPersons,
  ...WeatherInformation,
  ...MicrositeConditions,

  new TemplateColumnBuilder(
    'Release - Invasive Plant',
    'codeReference',
    'form_data.activity_subtype_data.Biocontrol_Release_Information.invasive_plant_code'
  )
    .referencesCode('invasive_plant_code_withbiocontrol')
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Release - Biological Agent',
    'codeReference',
    'form_data.activity_subtype_data.Biocontrol_Release_Information.biological_agent_code'
  )
    .referencesCode('biological_agent_code')
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Release - Linear Segment?',
    'tristate',
    'form_data.activity_subtype_data.Biocontrol_Release_Information.linear_segment'
  ).build(),
  new TemplateColumnBuilder(
    'Release - Mortality',
    'numeric',
    'form_data.activity_subtype_data.Biocontrol_Release_Information.mortality'
  )
    .valueRange(0, null)
    .build(),
  new TemplateColumnBuilder(
    'Release - Collection Date',
    'datetime',
    'form_data.activity_subtype_data.Biocontrol_Release_Information.collection_date'
  )
    .mustNotBeFuture()
    .build(),
  new TemplateColumnBuilder(
    'Release - Plant Collected From',
    'codeReference',
    'form_data.activity_subtype_data.Biocontrol_Release_Information.plant_collected_from'
  )
    .referencesCode('invasive_plant_code_withbiocontrol')
    .build(),
  new TemplateColumnBuilder(
    'Release - Plant Collected From - Unlisted',
    'text',
    'form_data.activity_subtype_data.Biocontrol_Release_Information.plant_collected_from_unlisted'
  ).build(),
  new TemplateColumnBuilder(
    'Release - Agent Source',
    'text',
    'form_data.activity_subtype_data.Biocontrol_Release_Information.agent_source'
  )
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Release - Actual - Agent Stage',
    'codeReference',
    'form_data.activity_subtype_data.Biocontrol_Release_Information.actual_biological_agents[0].biological_agent_stage_code'
  )
    .referencesCode('biological_agent_stage_code')
    .build(),
  new TemplateColumnBuilder(
    'Release - Actual - Quantity',
    'numeric',
    'form_data.activity_subtype_data.Biocontrol_Release_Information.actual_biological_agents[0].release_quantity'
  )
    .valueRange(0, null)
    .build(),
  new TemplateColumnBuilder(
    'Release - Estimated - Agent Stage',
    'codeReference',
    'form_data.activity_subtype_data.Biocontrol_Release_Information.estimated_biological_agents[0].biological_agent_stage_code'
  )
    .referencesCode('biological_agent_stage_code')
    .build(),
  new TemplateColumnBuilder(
    'Release - Estimated - Quantity',
    'numeric',
    'form_data.activity_subtype_data.Biocontrol_Release_Information.estimated_biological_agents[0].release_quantity'
  )
    .valueRange(0, null)
    .build(),

  ...PhenologyInformation
];

BiocontrolRelease.rowValidators = [...BasicInformationRowValidators, PhenologySumValidator];

export { BiocontrolRelease };
