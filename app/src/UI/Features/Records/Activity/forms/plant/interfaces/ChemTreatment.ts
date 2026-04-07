import { AquaticChemicalTreatmentSchema } from './AquaticChemicalTreatment';
import { TerrestrialChemicalTreatmentSchema } from './TerrestrialChemicalTreatment';

type ChemTreatment = TerrestrialChemicalTreatmentSchema | AquaticChemicalTreatmentSchema;

export type { ChemTreatment };
