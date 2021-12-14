/**
 * This file should only contain root level Schema items.
 *
 * These should mirror the schemas of the same name in the api-doc.json.
 */

import UISchemaComponents from 'rjsf/uiSchema/UISchemaComponents';
import BaseUISchemaComponents from 'rjsf/uiSchema/BaseUISchemaComponents';

const Activity_Observation_PlantTerrestrial = {
  'activity_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  'activity_type_data': {
    ...BaseUISchemaComponents.TwoColumnStyle,
    ...BaseUISchemaComponents.Observation
  },
  'activity_subtype_data': {
    ...BaseUISchemaComponents.Observation_PlantTerrestrial,
    'ui:order':['ObservationPlantTerrestrialData','TerrestrialPlants']
  },
  'ui:order':['activity_data','activity_type_data','activity_subtype_data']
};

const Activity_Observation_PlantAquatic = {
  'activity_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  'activity_type_data': {
    ...BaseUISchemaComponents.TwoColumnStyle,
    ...BaseUISchemaComponents.Observation
  },
  'activity_subtype_data': {
    ...BaseUISchemaComponents.Observation_PlantAquatic
  },
  'ui:order':['activity_data','activity_type_data','activity_subtype_data']
};

const Activity_AnimalActivity_AnimalTerrestrial = {
  'activity_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  'activity_type_data': {
    ...BaseUISchemaComponents.TwoColumnStyle,
    ...BaseUISchemaComponents.Observation
  },
  'activity_subtype_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Activity_AnimalTerrestrial
  },
  'ui:order':['activity_data','activity_type_data', 'activity_subtype_data']
};

const Activity_AnimalActivity_AnimalAquatic = {
  'activity_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  'activity_type_data': {
    ...BaseUISchemaComponents.TwoColumnStyle,
    ...BaseUISchemaComponents.Observation
  },
  'activity_subtype_data': {
    ...BaseUISchemaComponents.Activity_AnimalAquatic
  },
  'ui:order':['activity_data','activity_type_data', 'activity_subtype_data']
};

const Activity_Transect_FireMonitoring = {
  'activity_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  'activity_subtype_data': {
    ...BaseUISchemaComponents.Transect_FireMonitoring
  },
  'ui:order':['activity_data','activity_subtype_data']
};

const Activity_Transect_Vegetation = {
  'activity_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  'activity_subtype_data': {
    ...BaseUISchemaComponents.Transect_Vegetation
  },
  'ui:order':['activity_data','activity_subtype_data']
};

const Activity_Transect_BiocontrolEfficacy = {
  'activity_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  'activity_subtype_data': {
    ...BaseUISchemaComponents.Transect_BiocontrolEfficacy
  },
  'ui:order':['activity_data','activity_subtype_data']
};

const Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant = {
  'activity_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.MonitoringActivity
  },
  'activity_type_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Microsite_Conditions
    // ...UISchemaComponents.MonitoringActivity
  },
  'activity_subtype_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Monitoring_BiocontrolDispersal_TerrestrialPlant,
    ...BaseUISchemaComponents.Target_Plant_Phenology,
    ...BaseUISchemaComponents.Spread_Results
  },
  'ui:order':['activity_data','activity_type_data','activity_subtype_data']
};

const Activity_Treatment_ChemicalPlantTerrestrial = {
  'activity_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
'activity_subtype_data': {
    Well_Information: {...BaseUISchemaComponents.Well_Information},
    Treatment_ChemicalPlant: {...UISchemaComponents.Treatment_ChemicalPlant},
    'ui:order':['Well_Information','Treatment_ChemicalPlant']
  },
  'ui:order':['activity_data','activity_type_data','activity_subtype_data']
};

const Activity_Treatment_ChemicalPlantAquatic = {
  'activity_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  'activity_subtype_data': {
    Well_Information: {...BaseUISchemaComponents.Well_Information},
    Treatment_ChemicalPlant: {...UISchemaComponents.Treatment_ChemicalPlant},
    ShorelineTypes: {...BaseUISchemaComponents.ShorelineTypes},
    'ui:order':['Well_Information','Treatment_ChemicalPlant','ShorelineTypes']
  },
  'ui:order':['activity_data','activity_subtype_data']
};

const Activity_Treatment_MechanicalPlantTerrestrial = {
  'activity_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  'activity_type_data': {
    ...BaseUISchemaComponents.TwoColumnStyle,
    ...BaseUISchemaComponents.Treatment
  },
  'activity_subtype_data': {
    ...BaseUISchemaComponents.Treatment_MechanicalPlant,
    'ui:order':['Treatment_MechanicalPlant_Information']
  },
  'ui:order':['activity_data','activity_type_data','activity_subtype_data']
};

const Activity_Treatment_MechanicalPlantAquatic = {
  'activity_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  'activity_type_data': {
    ...BaseUISchemaComponents.Treatment,
  },
  'activity_subtype_data': {
    ...BaseUISchemaComponents.Authorization_Infotmation,
    ...BaseUISchemaComponents.ShorelineTypes,
    ...BaseUISchemaComponents.Treatment_MechanicalPlant,
    
    'ui:order':['Authorization_Infotmation','ShorelineTypes','Treatment_MechanicalPlant_Information']
  },
  'ui:order':['activity_data','activity_type_data','activity_subtype_data']
};



const Activity_Treatment_BiologicalPlant = {
  'activity_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  'activity_type_data': {
    ...BaseUISchemaComponents.TwoColumnStyle,
    ...BaseUISchemaComponents.Treatment_Information_BiologicalPlant
  },
  'activity_subtype_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Treatment_BiologicalPlant
  },
  'ui:order':['activity_data','activity_type_data','activity_subtype_data']
};

const Activity_Monitoring_ChemicalTerrestrialAquaticPlant = {
  'activity_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.MonitoringActivity
  },
  'activity_type_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Monitoring,
    ...UISchemaComponents.Monitoring
  },
  'ui:order':['activity_data','activity_type_data','activity_subtype_data']
};

const Activity_Monitoring_MechanicalTerrestrialAquaticPlant = {
  'activity_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.MonitoringActivity
  },
  'activity_type_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Monitoring,
    ...UISchemaComponents.Monitoring
  },
  'ui:order':['activity_data','activity_type_data','activity_subtype_data']
};

const Activity_Monitoring_BiocontrolRelease_TerrestrialPlant = {
  'activity_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.MonitoringActivity
  },
  'activity_type_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Monitoring_Biocontrol,
    ...UISchemaComponents.Monitoring
  },
  'activity_subtype_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Monitoring_BiocontrolRelease_TerrestrialPlant,
    ...BaseUISchemaComponents.Target_Plant_Phenology,
    ...BaseUISchemaComponents.Spread_Results,
  },
  'ui:order':['activity_data','activity_type_data','activity_subtype_data']
};

const Activity_Collection_Biocontrol = {
  'activity_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  'activity_type_data': {
    ...BaseUISchemaComponents.TwoColumnStyle,
    ...BaseUISchemaComponents.Collection
  },
  'activity_subtype_data': {
    ...BaseUISchemaComponents.Collection_BioControll
  },
  'ui:order':['activity_data','activity_type_data','activity_subtype_data']
};

const Activity_FREP_FormA = {
  activity_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    ...BaseUISchemaComponents.TwoColumnStyle,
    ...BaseUISchemaComponents.FREP
  },
  activity_subtype_data: {
    ...BaseUISchemaComponents.FourColumnStyle,
    ...BaseUISchemaComponents.FREP_FormA
  }
};

const Activity_FREP_FormB = {
  activity_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    ...BaseUISchemaComponents.TwoColumnStyle,
    ...BaseUISchemaComponents.FREP
  },
  activity_subtype_data: {
    ...BaseUISchemaComponents.TwoColumnStyle,
    ...BaseUISchemaComponents.FREP_FormB
  }
};

const Activity_FREP_FormC = {
  activity_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    ...BaseUISchemaComponents.FREP
  },
  activity_subtype_data: {
    ...BaseUISchemaComponents.FREP_FormC
  }
};

const RootUISchemas = {
  Activity_Observation_PlantTerrestrial,
  Activity_Observation_PlantAquatic,
  Activity_AnimalActivity_AnimalTerrestrial,
  Activity_AnimalActivity_AnimalAquatic,
  Activity_Transect_FireMonitoring,
  Activity_Transect_Vegetation,
  Activity_Transect_BiocontrolEfficacy,
  Activity_Treatment_ChemicalPlantTerrestrial,
  Activity_Treatment_ChemicalPlantAquatic,
  Activity_Treatment_MechanicalPlantTerrestrial,
  Activity_Treatment_MechanicalPlantAquatic,
  Activity_Treatment_BiologicalPlant,
  Activity_Monitoring_ChemicalTerrestrialAquaticPlant,
  Activity_Monitoring_MechanicalTerrestrialAquaticPlant,
  Activity_Monitoring_BiocontrolRelease_TerrestrialPlant,
  Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant,
  Activity_Collection_Biocontrol,
  Activity_FREP_FormA,
  Activity_FREP_FormB,
  Activity_FREP_FormC
};

export default RootUISchemas;
