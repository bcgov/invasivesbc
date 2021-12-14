import {
  AquaticPlants,
  Authorization_Infotmation,
  ShorelineTypes,
  TerrestrialPlants,
  WaterbodyData,
  WaterbodyData_AdditionalFields,
  WaterQuality,
  Well_Information
} from '../Components/General_Sub_Forms';
import {
  Monitoring_ChemicalTerrestrialAquaticPlant_Information,
  Monitoring_MechanicalTerrestrialAquaticPlant_Information
} from '../Components/Monitoring_Sub_Forms';
import { Observation_PlantTerrestrial_Information } from '../Components/Observation_Sub_Forms';
import {
  Treatment_ChemicalPlant_Information,
  Treatment_MechanicalPlant_Information
} from '../Components/Treatment_Sub_Forms';

// ------------------------Treatments--------------------

export const Subtype_Data_Treatment_ChemicalPlantTerrestrial = {
  type: 'object',
  title: 'invisible',
  properties: {
    Well_Information: Well_Information,
    Treatment_ChemicalPlant_Information: Treatment_ChemicalPlant_Information
  }
};
export const Subtype_Data_Treatment_ChemicalPlantAquatic = {
  type: 'object',
  title: 'invisible',
  properties: {
    Well_Information: Well_Information,
    ShorelineTypes: ShorelineTypes,
    Treatment_ChemicalPlant_Information: Treatment_ChemicalPlant_Information
  }
};
export const Subtype_Data_Treatment_MechanicalPlantTerrestrial = {
  type: 'object',
  title: 'invisible',
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
    Observation_PlantTerrestrial_Information: Observation_PlantTerrestrial_Information,
    TerrestrialPlants: TerrestrialPlants
  }
};
export const Subtype_Data_Observation_PlantAquatic = {
  type: 'object',
  title: 'invisible',
  properties: {
    WaterbodyData: { allOf: [{ ...WaterbodyData }, { ...WaterbodyData_AdditionalFields }] },
    ShorelineTypes: ShorelineTypes,
    WaterQuality: WaterQuality,
    AquaticPlants: AquaticPlants
  }
};

// ------------------------Monitorings---------------------

export const Subtype_Data_Monitoring_ChemicalTerrestrialAquaticPlant = {
  type: 'object',
  title: 'invisible',
  properties: {
    Well_Information: Well_Information,
    Monitoring_ChemicalTerrestrialAquaticPlant_Information: Monitoring_ChemicalTerrestrialAquaticPlant_Information
  }
};
export const Subtype_Data_Monitoring_MechanicalTerrestrialAquaticPlant = {
  type: 'object',
  title: 'invisible',
  properties: {
    Monitoring_MechanicalTerrestrialAquaticPlant_Information: Monitoring_MechanicalTerrestrialAquaticPlant_Information
  }
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
