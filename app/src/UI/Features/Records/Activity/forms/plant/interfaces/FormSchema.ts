import {
  TerrestrialPlantObservationSchema,
  AquaticPlantObservationSchema,
  TerrestrialMechTreatment,
  MonitoringChemPlantSchema,
  MonitoringMechPlantSchema,
  AquaticMechTreatment,
  BiocontrolReleaseSchema
} from '.';

type FormSchema =
  | TerrestrialPlantObservationSchema
  | AquaticPlantObservationSchema
  | TerrestrialMechTreatment
  | AquaticMechTreatment
  | MonitoringChemPlantSchema
  | MonitoringMechPlantSchema
  | BiocontrolReleaseSchema;

export type { FormSchema };
