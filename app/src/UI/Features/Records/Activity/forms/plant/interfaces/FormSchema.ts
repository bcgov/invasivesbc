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
  BiocontrolCollection
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
  | BiocontrolCollection;

export type { FormSchema };
