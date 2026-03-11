import { ActivitySubtypes } from 'sharedAPI';
import { BaseForm } from './BaseForm';

interface AquaticChemicalTreatmentSchema extends BaseForm {
  subtype: ActivitySubtypes.Treatment_Chemical_Plant_Aquatic;
}

export type { AquaticChemicalTreatmentSchema };
