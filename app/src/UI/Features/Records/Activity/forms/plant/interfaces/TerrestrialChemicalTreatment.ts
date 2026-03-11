import { ActivitySubtypes } from 'sharedAPI';
import { BaseForm } from './BaseForm';

interface TerrestrialChemicalTreatmentSchema extends BaseForm {
  subtype: ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial;
}

export type { TerrestrialChemicalTreatmentSchema };
