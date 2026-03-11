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
  BiocontrolCollectionSchema,
  TerrestrialChemicalTreatmentSchema,
  AquaticChemicalTreatmentSchema
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
  | BiocontrolCollectionSchema
  | TerrestrialChemicalTreatmentSchema
  | AquaticChemicalTreatmentSchema;

export type { FormSchema };
