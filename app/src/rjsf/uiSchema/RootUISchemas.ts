/**
 * This file should only contain root level Schema items.
 *
 * These should mirror the schemas of the same name in the api-doc.json.
 */

import BaseUISchemaComponents from 'rjsf/uiSchema/BaseUISchemaComponents';

// -------------------------- Observations ----------------------------------

const Activity_Observation_PlantTerrestrial = {
  'activity_data': {
    ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
    ...BaseUISchemaComponents.activity_data_objects.Activity
  },
  'activity_type_data': {
    ...BaseUISchemaComponents.column_styles.TwoColumnStyle,
    ...BaseUISchemaComponents.activity_type_data_objects.Observation
  },
  'activity_subtype_data': {
    Observation_PlantTerrestrial_Information: {
      ...BaseUISchemaComponents.activity_subtype_data_information_objects.Observation_PlantTerrestrial_Information
    },
    TerrestrialPlants: {
      ...BaseUISchemaComponents.general_objects.TerrestrialPlants
    },
    'ui:order':['Observation_PlantTerrestrial_Information','TerrestrialPlants']
  },
  'ui:order':['activity_data','activity_type_data','activity_subtype_data']
};

const Activity_Observation_PlantAquatic = {
  'activity_data': {
    ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
    ...BaseUISchemaComponents.activity_data_objects.Activity
  },
  'activity_type_data': {
    ...BaseUISchemaComponents.column_styles.TwoColumnStyle,
    ...BaseUISchemaComponents.activity_type_data_objects.Observation
  },
  'activity_subtype_data': {
    WaterbodyData:{...BaseUISchemaComponents.general_objects.WaterbodyData},
    ShorelineTypes:{...BaseUISchemaComponents.general_objects.ShorelineTypes},
    WaterQuality:{...BaseUISchemaComponents.general_objects.WaterQuality},
    AquaticPlants:{...BaseUISchemaComponents.general_objects.AquaticPlants},
    'ui:order':['WaterbodyData', 'ShorelineTypes', 'WaterQuality', 'AquaticPlants']
    
  },
  'ui:order':['activity_data','activity_type_data','activity_subtype_data']
};

// -------------------------- Transects ----------------------------------

// const Activity_Transect_FireMonitoring = {
//   'activity_data': {
//     ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
//     ...BaseUISchemaComponents.activity_data_objects.Activity
//   },
//   'activity_subtype_data': {
//     ...BaseUISchemaComponents.Transect_FireMonitoring
//   },
//   'ui:order':['activity_data','activity_subtype_data']
// };

// const Activity_Transect_Vegetation = {
//   'activity_data': {
//     ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
//     ...BaseUISchemaComponents.activity_data_objects.Activity
//   },
//   'activity_subtype_data': {
//     ...BaseUISchemaComponents.Transect_Vegetation
//   },
//   'ui:order':['activity_data','activity_subtype_data']
// };

// const Activity_Transect_BiocontrolEfficacy = {
//   'activity_data': {
//     ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
//     ...BaseUISchemaComponents.activity_data_objects.Activity
//   },
//   'activity_subtype_data': {
//     ...BaseUISchemaComponents.Transect_BiocontrolEfficacy
//   },
//   'ui:order':['activity_data','activity_subtype_data']
// };


// -------------------------- Treatments ----------------------------------

const Activity_Treatment_ChemicalPlantTerrestrial = {
  'activity_data': {
    ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
    ...BaseUISchemaComponents.activity_data_objects.Activity
  },
'activity_subtype_data': {
    Well_Information: {
      ...BaseUISchemaComponents.general_objects.Well_Information 
    },
    Treatment_ChemicalPlant_Information: {
      ...BaseUISchemaComponents.activity_subtype_data_information_objects.Treatment_ChemicalPlant_Information 
    },
    'ui:order':['Well_Information','Treatment_ChemicalPlant_Information']
  },
  'ui:order':['activity_data','activity_type_data','activity_subtype_data']
};

const Activity_Treatment_ChemicalPlantAquatic = {
  'activity_data': {
    ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
    ...BaseUISchemaComponents.activity_data_objects.Activity
  },
  'activity_subtype_data': {
    ShorelineTypes: {
      ...BaseUISchemaComponents.general_objects.ShorelineTypes
    },
    Well_Information: {
      ...BaseUISchemaComponents.general_objects.Well_Information
    },
    Treatment_ChemicalPlant_Information: {
      ...BaseUISchemaComponents.activity_subtype_data_information_objects.Treatment_ChemicalPlant_Information
    },
    'ui:order':['Well_Information','ShorelineTypes','Treatment_ChemicalPlant_Information']
  },
  'ui:order':['activity_data','activity_subtype_data']
};

const Activity_Treatment_MechanicalPlantTerrestrial = {
  'activity_data': {
    ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
    ...BaseUISchemaComponents.activity_data_objects.Activity
  },
  'activity_type_data': {
    ...BaseUISchemaComponents.column_styles.TwoColumnStyle,
    ...BaseUISchemaComponents.activity_type_data_objects.Treatment
  },
  'activity_subtype_data': {
    Treatment_MechanicalPlant_Information:{
      ...BaseUISchemaComponents.activity_subtype_data_information_objects.Treatment_MechanicalPlant_Information
    },
    'ui:order':['Treatment_MechanicalPlant_Information']
  },
  'ui:order':['activity_data','activity_type_data','activity_subtype_data']
};

const Activity_Treatment_MechanicalPlantAquatic = {
  'activity_data': {
    ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
    ...BaseUISchemaComponents.activity_data_objects.Activity
  },
  'activity_type_data': {
    ...BaseUISchemaComponents.activity_type_data_objects.Treatment,
  },
  'activity_subtype_data': {
    Authorization_Infotmation: {
      ...BaseUISchemaComponents.general_objects.Authorization_Infotmation
    },
    ShorelineTypes: {
      ...BaseUISchemaComponents.general_objects.ShorelineTypes
    },
    Treatment_MechanicalPlant_Information: {
      ...BaseUISchemaComponents.activity_subtype_data_information_objects.Treatment_MechanicalPlant_Information
    },
    'ui:order':['Authorization_Infotmation','ShorelineTypes','Treatment_MechanicalPlant_Information']
  },
  'ui:order':['activity_data','activity_type_data','activity_subtype_data']
};

// -------------------------- Monitoring ----------------------------------

const Activity_Monitoring_ChemicalTerrestrialAquaticPlant = {
  'activity_data': {
    ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
    ...BaseUISchemaComponents.activity_data_objects.Activity
  },
  'activity_type_data': {
    ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
    ...BaseUISchemaComponents.activity_type_data_objects.Monitoring
  },
  'activity_subtype_data':{
    Well_Information: {
      ...BaseUISchemaComponents.general_objects.Well_Information 
    },
    Monitoring_ChemicalTerrestrialAquaticPlant_Information:{
      ...BaseUISchemaComponents.activity_subtype_data_information_objects.Monitoring_ChemicalTerrestrialAquaticPlant_Information
    },
    'ui:order':['Well_Information','Monitoring_ChemicalTerrestrialAquaticPlant_Information']
  },
  'ui:order':['activity_data','activity_type_data','activity_subtype_data']
};

const Activity_Monitoring_MechanicalTerrestrialAquaticPlant = {
  'activity_data': {
    ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
    ...BaseUISchemaComponents.activity_data_objects.Activity
  },
  'activity_type_data': {
    ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
    ...BaseUISchemaComponents.activity_type_data_objects.Monitoring
  },
  'activity_subtype_data':{
    Monitoring_MechanicalTerrestrialAquaticPlant_Information:{
      ...BaseUISchemaComponents.activity_subtype_data_information_objects.Monitoring_MechanicalTerrestrialAquaticPlant_Information
    },
    'ui:order':['Monitoring_MechanicalTerrestrialAquaticPlant_Information']
  },
  'ui:order':['activity_data','activity_type_data','activity_subtype_data']
};

// const Activity_Monitoring_BiocontrolRelease_TerrestrialPlant = {
//   'activity_data': {
//     ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
//     ...BaseUISchemaComponents.MonitoringActivity
//   },
//   'activity_type_data': {
//     ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
//     ...BaseUISchemaComponents.Monitoring_Biocontrol,
//     ...BaseUISchemaComponents.activity_type_data_objects.Monitoring
//   },
//   'activity_subtype_data': {
//     ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
//     ...BaseUISchemaComponents.Monitoring_BiocontrolRelease_TerrestrialPlant,
//     ...BaseUISchemaComponents.Target_Plant_Phenology,
//     ...BaseUISchemaComponents.Spread_Results,
//   },
//   'ui:order':['activity_data','activity_type_data','activity_subtype_data']
// };

// const Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant = {
//   'activity_data': {
//     ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
//     ...BaseUISchemaComponents.MonitoringActivity
//   },
//   'activity_type_data': {
//     ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
//     ...BaseUISchemaComponents.Microsite_Conditions
//     // ...BaseUISchemaComponents.MonitoringActivity
//   },
//   'activity_subtype_data': {
//     ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
//     ...BaseUISchemaComponents.Monitoring_BiocontrolDispersal_TerrestrialPlant,
//     ...BaseUISchemaComponents.Target_Plant_Phenology,
//     ...BaseUISchemaComponents.Spread_Results
//   },
//   'ui:order':['activity_data','activity_type_data','activity_subtype_data']
// };

// -------------------------- Biocontrol ----------------------------------

// const Activity_Collection_Biocontrol = {
//   'activity_data': {
//     ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
//     ...BaseUISchemaComponents.activity_data_objects.Activity
//   },
//   'activity_type_data': {
//     ...BaseUISchemaComponents.column_styles.TwoColumnStyle,
//     ...BaseUISchemaComponents.Collection
//   },
//   'activity_subtype_data': {
//     ...BaseUISchemaComponents.Collection_BioControll
//   },
//   'ui:order':['activity_data','activity_type_data','activity_subtype_data']
// };

// const Activity_Treatment_BiologicalPlant = {
//   'activity_data': {
//     ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
//     ...BaseUISchemaComponents.activity_data_objects.Activity
//   },
//   'activity_type_data': {
//     ...BaseUISchemaComponents.column_styles.TwoColumnStyle,
//     ...BaseUISchemaComponents.Treatment_Information_BiologicalPlant
//   },
//   'activity_subtype_data': {
//     ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
//     ...BaseUISchemaComponents.Treatment_BiologicalPlant
//   },
//   'ui:order':['activity_data','activity_type_data','activity_subtype_data']
// };


// -------------------------- FREP Forms ----------------------------------

// const Activity_FREP_FormA = {
//   activity_data: {
//     ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
//     ...BaseUISchemaComponents.activity_data_objects.Activity
//   },
//   activity_type_data: {
//     ...BaseUISchemaComponents.column_styles.TwoColumnStyle,
//     ...BaseUISchemaComponents.FREP
//   },
//   activity_subtype_data: {
//     ...BaseUISchemaComponents.column_styles.FourColumnStyle,
//     ...BaseUISchemaComponents.FREP_FormA
//   }
// };

// const Activity_FREP_FormB = {
//   activity_data: {
//     ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
//     ...BaseUISchemaComponents.activity_data_objects.Activity
//   },
//   activity_type_data: {
//     ...BaseUISchemaComponents.column_styles.TwoColumnStyle,
//     ...BaseUISchemaComponents.FREP
//   },
//   activity_subtype_data: {
//     ...BaseUISchemaComponents.column_styles.TwoColumnStyle,
//     ...BaseUISchemaComponents.FREP_FormB
//   }
// };

// const Activity_FREP_FormC = {
//   activity_data: {
//     ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
//     ...BaseUISchemaComponents.activity_data_objects.Activity
//   },
//   activity_type_data: {
//     ...BaseUISchemaComponents.FREP
//   },
//   activity_subtype_data: {
//     ...BaseUISchemaComponents.FREP_FormC
//   }
// };

// -------------------------- Animal ----------------------------------

// const Activity_AnimalActivity_AnimalTerrestrial = {
//   'activity_data': {
//     ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
//     ...BaseUISchemaComponents.activity_data_objects.Activity
//   },
//   'activity_type_data': {
//     ...BaseUISchemaComponents.column_styles.TwoColumnStyle,
//     ...BaseUISchemaComponents.activity_type_data_objects.Observation
//   },
//   'activity_subtype_data': {
//     ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
//     ...BaseUISchemaComponents.Activity_AnimalTerrestrial
//   },
//   'ui:order':['activity_data','activity_type_data', 'activity_subtype_data']
// };

// const Activity_AnimalActivity_AnimalAquatic = {
//   'activity_data': {
//     ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
//     ...BaseUISchemaComponents.activity_data_objects.Activity
//   },
//   'activity_type_data': {
//     ...BaseUISchemaComponents.column_styles.TwoColumnStyle,
//     ...BaseUISchemaComponents.activity_type_data_objects.Observation
//   },
//   'activity_subtype_data': {
//     ...BaseUISchemaComponents.Activity_AnimalAquatic
//   },
//   'ui:order':['activity_data','activity_type_data', 'activity_subtype_data']
// };

const RootUISchemas = {
  Activity_Observation_PlantTerrestrial,
  Activity_Observation_PlantAquatic,
  // Activity_AnimalActivity_AnimalTerrestrial,
  // Activity_AnimalActivity_AnimalAquatic,
  // Activity_Transect_FireMonitoring,
  // Activity_Transect_Vegetation,
  // Activity_Transect_BiocontrolEfficacy,
  Activity_Treatment_ChemicalPlantTerrestrial,
  Activity_Treatment_ChemicalPlantAquatic,
  Activity_Treatment_MechanicalPlantTerrestrial,
  Activity_Treatment_MechanicalPlantAquatic,
  // Activity_Treatment_BiologicalPlant,
  Activity_Monitoring_ChemicalTerrestrialAquaticPlant,
  Activity_Monitoring_MechanicalTerrestrialAquaticPlant,
  // Activity_Monitoring_BiocontrolRelease_TerrestrialPlant,
  // Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant,
  // Activity_Collection_Biocontrol,
  // Activity_FREP_FormA,
  // Activity_FREP_FormB,
  // Activity_FREP_FormC
};

export default RootUISchemas;
