import {
  TerrestrialPlantObservationSchema,
  AquaticPlantObservationSchema,
  TerrestrialMechTreatment,
  MonitoringChemPlantSchema,
  MonitoringMechPlantSchema,
  AquaticMechTreatment,
  BiocontrolReleaseSchema,
  BiocontrolReleaseMonitoringSchema,
  BiocontrolDispersalMonitoringSchema,
  BiocontrolCollectionSchema
} from '.';

type FormSchema =
  | TerrestrialPlantObservationSchema
  | AquaticPlantObservationSchema
  | TerrestrialMechTreatment
  | AquaticMechTreatment
  | MonitoringChemPlantSchema
  | MonitoringMechPlantSchema
  | BiocontrolReleaseMonitoringSchema
  | BiocontrolReleaseSchema
  | BiocontrolDispersalMonitoringSchema
  | BiocontrolCollectionSchema;

export type { FormSchema };
