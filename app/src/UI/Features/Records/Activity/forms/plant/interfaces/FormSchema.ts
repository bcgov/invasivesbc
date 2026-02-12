import { BaseForm, TerrestrialPlantObservationSchema, AquaticPlantObservationSchema } from '.';

type FormSchema = BaseForm | TerrestrialPlantObservationSchema | AquaticPlantObservationSchema;

export type { FormSchema };
