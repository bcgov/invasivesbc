import {
  AquaticPlants,
  Authorization_Infotmation,
  BiocontrolEfficacyTransectLines,
  FireMonitoringTransectLines,
  Microsite_Conditions,
  Pest_Injury_Threshold_Determination,
  ShorelineTypes,
  Spread_Results,
  Target_Plant_Phenology,
  TerrestrialPlants,
  TransectInvasivePlants,
  VegetationTransectLines,
  WaterbodyData,
  WaterbodyData_AdditionalFields,
  WaterQuality,
  Weather_Conditions,
  Well_Information
} from '../Components/General_Sub_Forms';
import {
  Monitoring_BiocontrolDispersal_Information,
  Monitoring_BiocontrolDispersalPlants,
  Monitoring_BiocontrolRelease_TerrestrialPlant_Information,
  Monitoring_ChemicalPlants,
  Monitoring_MechanicalPlants,
  Monitoring_ChemicalTerrestrialAquaticPlant_Information,
  Monitoring_MechanicalTerrestrialAquaticPlant_Information,
  Monitoring_BiocontrolPlants
} from '../Components/Monitoring_Sub_Forms';
import {
  Observation_PlantAquatic_Information,
  Observation_PlantTerrestrial_Information
} from '../Components/Observation_Sub_Forms';
import {
  Biocontrol_Collection_Information,
  Biocontrol_Release_Information,
  Treatment_ChemicalPlant_Information,
  Treatment_MechanicalPlant_Information,
  Treatment_MechanicalPlant_Information_Aquiatic
} from '../Components/Treatment_Sub_Forms';

// ------------------------Treatments--------------------

export const Subtype_Data_Treatment_ChemicalPlantTerrestrial = {
  type: 'object',
  title: 'invisible',
  properties: {
    Well_Information: Well_Information,
    Treatment_ChemicalPlant_Information: Treatment_ChemicalPlant_Information,
    Pest_Injury_Threshold_Determination: Pest_Injury_Threshold_Determination
  }
};
export const Subtype_Data_Treatment_ChemicalPlantAquatic = {
  type: 'object',
  title: 'invisible',
  properties: {
    Well_Information: Well_Information,
    Treatment_ChemicalPlant_Information: Treatment_ChemicalPlant_Information,
    Pest_Injury_Threshold_Determination: Pest_Injury_Threshold_Determination
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
    Treatment_MechanicalPlant_Information: Treatment_MechanicalPlant_Information_Aquiatic
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
    Observation_PlantAquatic_Information: Observation_PlantAquatic_Information,
    AquaticPlants: AquaticPlants
  }
};

// ------------------------Monitorings---------------------

export const Subtype_Data_Monitoring_ChemicalTerrestrialAquaticPlant = {
  type: 'object',
  title: 'invisible',
  properties: {
    Well_Information: Well_Information,
    Monitoring_ChemicalTerrestrialAquaticPlant_Information: Monitoring_ChemicalPlants
  }
};
export const Subtype_Data_Monitoring_MechanicalTerrestrialAquaticPlant = {
  type: 'object',
  title: 'invisible',
  properties: {
    Monitoring_MechanicalTerrestrialAquaticPlant_Information: Monitoring_MechanicalPlants
  }
};
export const Subtype_Data_Monitoring_BiocontrolRelease_TerrestrialPlant = {
  type: 'object',
  title: 'invisible',
  properties: {
    Weather_Conditions: Weather_Conditions,
    Microsite_Conditions: Microsite_Conditions,
    Monitoring_BiocontrolRelease_TerrestrialPlant_Information: Monitoring_BiocontrolPlants,
    Spread_Results: Spread_Results,
    Target_Plant_Phenology: Target_Plant_Phenology
  }
};
export const Subtype_Data_Monitoring_BiocontrolDispersal_TerrestrialPlant = {
  type: 'object',
  title: 'invisible',
  properties: {
    Weather_Conditions: Weather_Conditions,
    Microsite_Conditions: Microsite_Conditions,
    Monitoring_BiocontrolDispersal_Information: Monitoring_BiocontrolDispersalPlants,
    Target_Plant_Phenology: Target_Plant_Phenology
  }
};

// ------------------------Biocontrol----------------------

export const Subtype_Data_Biocontrol_Release = {
  type: 'object',
  title: 'invisible',
  properties: {
    Microsite_Conditions: Microsite_Conditions,
    Weather_Conditions: Weather_Conditions,
    Biocontrol_Release_Information: Biocontrol_Release_Information,
    Target_Plant_Phenology: Target_Plant_Phenology
  }
};
export const Subtype_Data_Biocontrol_Collection = {
  type: 'object',
  title: 'invisible',
  properties: {
    Microsite_Conditions: Microsite_Conditions,
    Weather_Conditions: Weather_Conditions,
    Biocontrol_Collection_Information: Biocontrol_Collection_Information,
    Target_Plant_Phenology: Target_Plant_Phenology
  }
};

// ------------------------Transects-----------------------

export const Subtype_Data_Transect_FireMonitoring = {
  type: 'object',
  title: 'invisible',
  properties: {
    FireMonitoringTransectLines: FireMonitoringTransectLines
  }
};
export const Subtype_Data_Transect_Vegetation = {
  type: 'object',
  title: 'invisible',
  properties: {
    VegetationTransectLines: VegetationTransectLines
  }
};
export const Subtype_Data_Transect_BiocontrolEfficacy = {
  type: 'object',
  title: 'invisible',
  properties: {
    TransectInvasivePlants: TransectInvasivePlants,
    BiocontrolEfficacyTransectLines: BiocontrolEfficacyTransectLines
  }
};
