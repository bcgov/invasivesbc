import {
  TerrestrialPlantObservationSchema,
  AquaticPlantObservationSchema,
  TerrestrialMechTreatment,
  MonitoringChemPlantSchema,
  MonitoringMechPlantSchema,
  AquaticMechTreatment,
  BiocontrolReleaseSchema,
  BiocontrolReleaseMonitoringSchema
} from '.';

type FormSchema =
  | TerrestrialPlantObservationSchema
  | AquaticPlantObservationSchema
  | TerrestrialMechTreatment
  | AquaticMechTreatment
  | MonitoringChemPlantSchema
  | MonitoringMechPlantSchema
  | BiocontrolReleaseMonitoringSchema
  | BiocontrolReleaseSchema;

export type { FormSchema };
