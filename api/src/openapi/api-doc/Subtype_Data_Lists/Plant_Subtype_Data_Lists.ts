import {
  AquaticPlants,
  Authorization_Infotmation,
  ShorelineTypes,
  TerrestrialPlants,
  WaterbodyData,
  WaterQuality,
  Well_Information
} from '../Components/General_Sub_Forms';
import { ObservationPlantTerrestrialData } from '../Components/Observation_Sub_Forms';
import { Treatment_ChemicalPlant, Treatment_MechanicalPlant_Information } from '../Components/Treatment_Sub_Forms';

// ------------------------Treatments--------------------

export const Subtype_Data_Treatment_ChemicalPlantTerrestrial = {
  type: 'object',
  title: 'invisible',
  properties: {
    Well_Information: Well_Information,
    Treatment_ChemicalPlant: Treatment_ChemicalPlant
  }
};
export const Subtype_Data_Treatment_ChemicalPlantAquatic = {
  type: 'object',
  title: 'invisible',
  properties: {
    Well_Information: Well_Information,
    ShorelineTypes: ShorelineTypes,
    Treatment_ChemicalPlant: Treatment_ChemicalPlant
  }
};
export const Subtype_Data_Treatment_MechanicalPlantTerrestrial = {
  type: 'object',
  title: 'Activity-Specific Information Sections',
  properties: {
    Treatment_MechanicalPlant_Information: Treatment_MechanicalPlant_Information
  }
};
export const Subtype_Data_Treatment_MechanicalPlantAquatic = {
  type: 'object',
  title: 'invisible',
  properties: {
    Authorization_Infotmation: Authorization_Infotmation,
    ShorelineTypes: ShorelineTypes,
    Treatment_MechanicalPlant_Information: Treatment_MechanicalPlant_Information
  }
};

// ------------------------Observations--------------------

export const Subtype_Data_Observation_PlantTerrestrial = {
  type: 'object',
  title: 'invisible',
  properties: {
    ObservationPlantTerrestrialData: ObservationPlantTerrestrialData,
    TerrestrialPlants: TerrestrialPlants
  }
};
export const Subtype_Data_Observation_PlantAquatic = {
  type: 'object',
  title: 'invisible',
  properties: {
    WaterbodyData: WaterbodyData,
    ShorelineTypes: ShorelineTypes,
    WaterQuality: WaterQuality,
    AquaticPlants: AquaticPlants
  }
};

// ------------------------Monitorings---------------------

export const Subtype_Data_Monitoring_ChemicalTerrestrialAquaticPlant = {
  type: 'object',
  allOf: []
};
export const Subtype_Data_Monitoring_MechanicalTerrestrialAquaticPlant = {
  type: 'object',
  allOf: []
};
export const Subtype_Data_Monitoring_BiocontrolRelease_TerrestrialPlant = {
  type: 'object',
  allOf: []
};
export const Subtype_Data_Monitoring_BiocontrolDispersal_TerrestrialPlant = {
  type: 'object',
  allOf: []
};

// ------------------------Biocontrol----------------------

export const Subtype_Data_Biocontrol_Release = {
  type: 'object',
  allOf: []
};
export const Subtype_Data_Biocontrol_Collection = {
  type: 'object',
  allOf: []
};

// ------------------------Transects-----------------------

export const Subtype_Data_Transect_FireMonitoring = {
  type: 'object',
  allOf: []
};
export const Subtype_Data_Transect_Vegetation = {
  type: 'object',
  allOf: []
};
export const Subtype_Data_Transect_BiocontrolEfficacy = {
  type: 'object',
  allOf: []
};
