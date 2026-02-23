import { TerrestrialPlantObservationSchema, AquaticPlantObservationSchema, TerrestrialMechTreatment } from '.';

type FormSchema =
  | TerrestrialPlantObservationSchema
  | AquaticPlantObservationSchema
  | TerrestrialMechTreatment
  | AquaticPlantObservationSchema;

export type { FormSchema };
