import { Template, TemplateColumnBuilder } from 'utils/batch/definitions';
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
} from 'utils/batch/shared-columns';

const BiocontrolRelease = new Template(
  'biocontrol_release',
  'Biocontrol - Release',
  null
);

BiocontrolRelease.type = 'Treatment';
BiocontrolRelease.subtype = 'Activity_Biocontrol_Release';

BiocontrolRelease.columns = [
  ...BasicInformation,
  ...ProjectInformation,
  ...ActivityPersons,
  ...WeatherInformation,
  ...MicrositeConditions,

  new TemplateColumnBuilder(
    'Release - Invasive Plant',
    'codeReference',
    'form_data.activity_subtype_data.Biocontrol_Release_Information[0].invasive_plant_code'
  )
    .referencesCode('invasive_plant_code_withbiocontrol')
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Release - Biological Agent',
    'codeReference',
    'form_data.activity_subtype_data.Biocontrol_Release_Information[0].biological_agent_code'
  )
    .referencesCode('biological_agent_code')
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Release - Linear Segment?',
    'tristate',
    'form_data.activity_subtype_data.Biocontrol_Release_Information[0].linear_segment'
  )
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Release - Mortality',
    'numeric',
    'form_data.activity_subtype_data.Biocontrol_Release_Information[0].mortality'
  )
    .valueRange(0, null)
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Release - Collection Date',
    'datetime',
    'form_data.activity_subtype_data.Biocontrol_Release_Information[0].collection_date'
  )
    .mustNotBeFuture()
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Release - Plant Collected From',
    'codeReference',
    'form_data.activity_subtype_data.Biocontrol_Release_Information[0].plant_collected_from'
  )
    .referencesCode('invasive_plant_code_withbiocontrol')
    .build(),
  new TemplateColumnBuilder(
    'Release - Plant Collected From - Unlisted',
    'text',
    'form_data.activity_subtype_data.Biocontrol_Release_Information[0].plant_collected_from_unlisted'
  ).build(),
  new TemplateColumnBuilder(
    'Release - Agent Source',
    'text',
    'form_data.activity_subtype_data.Biocontrol_Release_Information[0].agent_source'
  )
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Release - Actual - Agent Stage',
    'codeReference',
    'form_data.activity_subtype_data.Biocontrol_Release_Information[0].actual_biological_agents[0].biological_agent_stage_code'
  )
    .referencesCode('biological_agent_stage_code')
    .build(),
  new TemplateColumnBuilder(
    'Release - Actual - Quantity',
    'numeric',
    'form_data.activity_subtype_data.Biocontrol_Release_Information[0].actual_biological_agents[0].release_quantity'
  )
    .valueRange(0, null)
    .build(),
  new TemplateColumnBuilder(
    'Release - Estimated - Agent Stage',
    'codeReference',
    'form_data.activity_subtype_data.Biocontrol_Release_Information[0].estimated_biological_agents[0].biological_agent_stage_code'
  )
    .referencesCode('biological_agent_stage_code')
    .build(),
  new TemplateColumnBuilder(
    'Release - Estimated - Quantity',
    'numeric',
    'form_data.activity_subtype_data.Biocontrol_Release_Information[0].estimated_biological_agents[0].release_quantity'
  )
    .valueRange(0, null)
    .build(),

  ...PhenologyInformation
];

BiocontrolRelease.rowValidators = [
  ...BasicInformationRowValidators,
  PhenologySumValidator,
  WindDirectionValidator,
  BioAgentValidator
];

export { BiocontrolRelease };
