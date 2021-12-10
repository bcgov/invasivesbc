import { Treatment_ChemicalPlant } from '../Components/Treatment_Sub_Forms';

// ------------------------Treatments--------------------

export const Subtype_Data_Treatment_ChemicalPlantTerrestrial = {
  type: 'object',
  allOf: [{ ...Treatment_ChemicalPlant }]
};
export const Subtype_Data_Treatment_ChemicalPlantAquatic = {
  type: 'object',
  allOf: []
};
export const Subtype_Data_Treatment_MechanicalPlantTerrestrial = {
  type: 'object',
  allOf: []
};
export const Subtype_Data_Treatment_MechanicalPlantAquatic = {
  type: 'object',
  allOf: []
};

// ------------------------Observations--------------------

export const Subtype_Data_Observation_PlantTerrestrial = {
  type: 'object',
  allOf: []
};
export const Subtype_Data_Observation_PlantAquatic = {
  type: 'object',
  allOf: []
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
