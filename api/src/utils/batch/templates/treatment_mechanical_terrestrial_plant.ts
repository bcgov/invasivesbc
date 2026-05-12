import { Template, TemplateColumnBuilder } from 'utils/batch/definitions';
import { DISPOSED_MATERIAL_FORMAT_CODES } from 'utils/batch/hard-coded-codes';
import {
  ActivityPersons,
  BasicInformation,
  BasicInformationRowValidators,
  DuplicateMechanicalTreatmentPlantValidator,
  MechanicalTreatmentValidator,
  ProjectInformation
} from 'utils/batch/shared-columns';

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
    'Treatment - Invasive Plant Code 1',
    'codeReference',
    'form_data.activity_subtype_data.Treatment_MechanicalPlant_Information[0].invasive_plant_code'
  )
    .referencesCode('invasive_plant_code')
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Treatment - Treated Area 1',
    'numeric',
    'form_data.activity_subtype_data.Treatment_MechanicalPlant_Information[0].treated_area'
  )
    .valueRange(0, null)
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Treatment - Mechanical Method Code 1',
    'codeReference',
    'form_data.activity_subtype_data.Treatment_MechanicalPlant_Information[0].mechanical_method_code'
  )
    .referencesCode('mechanical_method_code')
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Treatment - Disposal Method Code 1',
    'codeReference',
    'form_data.activity_subtype_data.Treatment_MechanicalPlant_Information[0].mechanical_disposal_code'
  )
    .referencesCode('mechanical_disposal_code')
    .isRequired()
    .build(),
  new TemplateColumnBuilder(
    'Treatment - Disposed Material Format 1',
    'codeReference',
    'form_data.activity_subtype_data.Treatment_MechanicalPlant_Information[0].disposed_material.disposed_material_input_format'
  )
    .hardcodedCodes(DISPOSED_MATERIAL_FORMAT_CODES)
    .build(),
  new TemplateColumnBuilder(
    'Treatment - Disposed Material Amount 1',
    'numeric',
    'form_data.activity_subtype_data.Treatment_MechanicalPlant_Information[0].disposed_material.disposed_material_input_number'
  )
    .valueRange(0, null)
    .build(),
  new TemplateColumnBuilder(
    'Treatment - Invasive Plant Code 2',
    'codeReference',
    'form_data.activity_subtype_data.Treatment_MechanicalPlant_Information[1].invasive_plant_code'
  )
    .referencesCode('invasive_plant_code')
    .build(),
  new TemplateColumnBuilder(
    'Treatment - Treated Area 2',
    'numeric',
    'form_data.activity_subtype_data.Treatment_MechanicalPlant_Information[1].treated_area'
  )
    .valueRange(0, null)
    .build(),
  new TemplateColumnBuilder(
    'Treatment - Mechanical Method Code 2',
    'codeReference',
    'form_data.activity_subtype_data.Treatment_MechanicalPlant_Information[1].mechanical_method_code'
  )
    .referencesCode('mechanical_method_code')
    .build(),
  new TemplateColumnBuilder(
    'Treatment - Disposal Method Code 2',
    'codeReference',
    'form_data.activity_subtype_data.Treatment_MechanicalPlant_Information[1].mechanical_disposal_code'
  )
    .referencesCode('mechanical_disposal_code')
    .build(),
  new TemplateColumnBuilder(
    'Treatment - Disposed Material Format 2',
    'codeReference',
    'form_data.activity_subtype_data.Treatment_MechanicalPlant_Information[1].disposed_material.disposed_material_input_format'
  )
    .hardcodedCodes(DISPOSED_MATERIAL_FORMAT_CODES)
    .build(),
  new TemplateColumnBuilder(
    'Treatment - Disposed Material Amount 2',
    'numeric',
    'form_data.activity_subtype_data.Treatment_MechanicalPlant_Information[1].disposed_material.disposed_material_input_number'
  )
    .valueRange(0, null)
    .build(),
  new TemplateColumnBuilder(
    'Treatment - Invasive Plant Code 3',
    'codeReference',
    'form_data.activity_subtype_data.Treatment_MechanicalPlant_Information[2].invasive_plant_code'
  )
    .referencesCode('invasive_plant_code')
    .build(),
  new TemplateColumnBuilder(
    'Treatment - Treated Area 3',
    'numeric',
    'form_data.activity_subtype_data.Treatment_MechanicalPlant_Information[2].treated_area'
  )
    .valueRange(0, null)
    .build(),
  new TemplateColumnBuilder(
    'Treatment - Mechanical Method Code 3',
    'codeReference',
    'form_data.activity_subtype_data.Treatment_MechanicalPlant_Information[2].mechanical_method_code'
  )
    .referencesCode('mechanical_method_code')
    .build(),
  new TemplateColumnBuilder(
    'Treatment - Disposal Method Code 3',
    'codeReference',
    'form_data.activity_subtype_data.Treatment_MechanicalPlant_Information[2].mechanical_disposal_code'
  )
    .referencesCode('mechanical_disposal_code')
    .build(),
  new TemplateColumnBuilder(
    'Treatment - Disposed Material Format 3',
    'codeReference',
    'form_data.activity_subtype_data.Treatment_MechanicalPlant_Information[2].disposed_material.disposed_material_input_format'
  )
    .hardcodedCodes(DISPOSED_MATERIAL_FORMAT_CODES)
    .build(),
  new TemplateColumnBuilder(
    'Treatment - Disposed Material Amount 3',
    'numeric',
    'form_data.activity_subtype_data.Treatment_MechanicalPlant_Information[2].disposed_material.disposed_material_input_number'
  )
    .valueRange(0, null)
    .build()
];

TreatmentMechanicalTerrestrialPlant.rowValidators = [
  ...BasicInformationRowValidators,
  MechanicalTreatmentValidator,
  DuplicateMechanicalTreatmentPlantValidator
];

export { TreatmentMechanicalTerrestrialPlant };
