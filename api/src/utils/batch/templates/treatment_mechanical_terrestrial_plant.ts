import { Template, TemplateColumnBuilder } from '../definitions.js';
import { DISPOSED_MATERIAL_FORMAT_CODES } from '../hard-coded-codes.js';
import {
  ActivityPersons,
  BasicInformation,
  BasicInformationRowValidators,
  ProjectInformation
} from '../shared-columns.js';

const TreatmentMechanicalTerrestrialPlant = new Template(
  'treatment_mechanical_terrestrial_plant',
  'Treatment - Mechanical - Terrestrial Plant',
  null
);
TreatmentMechanicalTerrestrialPlant.type = 'Treatment';
TreatmentMechanicalTerrestrialPlant.subtype = 'Activity_Treatment_MechanicalPlantTerrestrial';

TreatmentMechanicalTerrestrialPlant.columns = [
  ...BasicInformation,
  ...ProjectInformation,
  ...ActivityPersons,
  new TemplateColumnBuilder(
    'Treatment - Invasive Plant Code',
    'codeReference',
    'form_data.activity_subtype_data.Treatment_MechanicalPlant_Information[0].invasive_plant_code'
  )
    .referencesCode('invasive_plant_code')
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Treatment - Treated Area',
    'numeric',
    'form_data.activity_subtype_data.Treatment_MechanicalPlant_Information[0].treated_area'
  )
    .valueRange(0, null)
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Treatment - Mechanical Method Code',
    'codeReference',
    'form_data.activity_subtype_data.Treatment_MechanicalPlant_Information[0].mechanical_method_code'
  )
    .referencesCode('mechanical_method_code')
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
    .build()
];

TreatmentMechanicalTerrestrialPlant.rowValidators = [...BasicInformationRowValidators];

export { TreatmentMechanicalTerrestrialPlant };
