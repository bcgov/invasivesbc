import { Template, TemplateColumnBuilder } from 'utils/batch/definitions';
import { DISPOSED_MATERIAL_FORMAT_CODES } from 'utils/batch/hard-coded-codes';
import {
  ActivityPersons,
  AuthorizationInformation,
  BasicInformation,
  BasicInformationRowValidators,
  ProjectInformation,
  ShorelineInformation,
  ShorelineSumValidator
} from 'utils/batch/shared-columns';

const TreatmentMechanicalAquaticPlantTemp = new Template(
  'treatment_mechanical_aquatic_plant_temp',
  'Treatment - Mechanical - Aquatic Plant TEMP POINT',
  null
);

TreatmentMechanicalAquaticPlantTemp.type = 'Treatment';
TreatmentMechanicalAquaticPlantTemp.subtype = 'Activity_Treatment_MechanicalPlantAquatic';

TreatmentMechanicalAquaticPlantTemp.columns = [
  ...BasicInformation,
  ...ProjectInformation,
  ...ActivityPersons,
  ...AuthorizationInformation,
  ...ShorelineInformation,
  new TemplateColumnBuilder('Area', 'numeric').isRequired().build(),
  new TemplateColumnBuilder(
    'Treatment - Treated Area',
    'numeric',
    'form_data.activity_subtype_data.Treatment_MechanicalPlant_Information[0].treated_area'
  )
    .valueRange(0, null)
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Treatment - Disposal Method Code',
    'codeReference',
    'form_data.activity_subtype_data.Treatment_MechanicalPlant_Information[0].mechanical_disposal_code'
  )
    .referencesCode('mechanical_disposal_code')
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Treatment - Disposed Material Format',
    'codeReference',
    'form_data.activity_subtype_data.Treatment_MechanicalPlant_Information[0].disposed_material.disposed_material_input_format'
  )
    .hardcodedCodes(DISPOSED_MATERIAL_FORMAT_CODES)
    .build(),
  new TemplateColumnBuilder(
    'Treatment - Disposed Material Amount',
    'numeric',
    'form_data.activity_subtype_data.Treatment_MechanicalPlant_Information[0].disposed_material.disposed_material_input_number'
  )
    .valueRange(0, null)
    .build(),
  new TemplateColumnBuilder(
    'Treatment - Invasive Plant Code',
    'codeReference',
    'form_data.activity_subtype_data.Treatment_MechanicalPlant_Information[0].invasive_plant_code'
  )
    .referencesCode('invasive_plant_aquatic_code')
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Treatment - Mechanical Method Code',
    'codeReference',
    'form_data.activity_subtype_data.Treatment_MechanicalPlant_Information[0].mechanical_method_code'
  )
    .referencesCode('mechanical_method_code')
    .isRequired()
    .build()
];

TreatmentMechanicalAquaticPlantTemp.rowValidators = [...BasicInformationRowValidators, ShorelineSumValidator];

export { TreatmentMechanicalAquaticPlantTemp };
