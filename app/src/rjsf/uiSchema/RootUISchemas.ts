/**
 * This file should only contain root level Schema items.
 *
 * These should mirror the schemas of the same name in the api-doc.json.
 */

import BaseUISchemaComponents from 'rjsf/uiSchema/BaseUISchemaComponents';

// -------------------------- Observations ----------------------------------

const Activity_Observation_PlantTerrestrial = {
  activity_data: {
    ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
    ...BaseUISchemaComponents.activity_data_objects.Activity
  },
  activity_type_data: {
    ...BaseUISchemaComponents.column_styles.TwoColumnStyle,
    ...BaseUISchemaComponents.activity_type_data_objects.Observation
  },
  activity_subtype_data: {
    Observation_PlantTerrestrial_Information: {
      ...BaseUISchemaComponents.activity_subtype_data_information_objects.Observation_PlantTerrestrial_Information
    },
    TerrestrialPlants: {
      ...BaseUISchemaComponents.general_objects.TerrestrialPlants
    },
    'ui:order': ['Observation_PlantTerrestrial_Information', 'TerrestrialPlants']
  },
  'ui:order': ['activity_data', 'activity_type_data', 'activity_subtype_data']
};

const Activity_Observation_PlantAquatic = {
  activity_data: {
    ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
    ...BaseUISchemaComponents.activity_data_objects.Activity
  },
  activity_type_data: {
    ...BaseUISchemaComponents.column_styles.TwoColumnStyle,
    ...BaseUISchemaComponents.activity_type_data_objects.Observation
  },
  activity_subtype_data: {
    WaterbodyData: {
      ...BaseUISchemaComponents.general_objects.WaterbodyData,
      ...BaseUISchemaComponents.general_objects.WaterbodyData_AdditionalFields
    },
    ShorelineTypes: { ...BaseUISchemaComponents.general_objects.ShorelineTypes },
    WaterQuality: { ...BaseUISchemaComponents.general_objects.WaterQuality },
    Observation_PlantAquatic_Information: {
      ...BaseUISchemaComponents.activity_subtype_data_information_objects.Observation_PlantAquatic_Information
    },
    AquaticPlants: { ...BaseUISchemaComponents.general_objects.AquaticPlants },
    'ui:order': [
      'WaterbodyData',
      'ShorelineTypes',
      'WaterQuality',
      'Observation_PlantAquatic_Information',
      'AquaticPlants'
    ]
  },
  'ui:order': ['activity_data', 'activity_type_data', 'activity_subtype_data']
};

// -------------------------- Transects ----------------------------------

const Activity_Transect_FireMonitoring = {
  activity_data: {
    ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
    ...BaseUISchemaComponents.activity_data_objects.Activity
  },
  activity_type_data: {
    ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
    ...BaseUISchemaComponents.activity_type_data_objects.TransectData
  },
  activity_subtype_data: {
    FireMonitoringTransectLines: BaseUISchemaComponents.general_objects.FireMonitoringTransectLines
  },
  'ui:order': ['activity_data', 'activity_type_data', 'activity_subtype_data']
};

const Activity_Transect_Vegetation = {
  activity_data: {
    ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
    ...BaseUISchemaComponents.activity_data_objects.Activity
  },
  activity_type_data: {
    ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
    ...BaseUISchemaComponents.activity_type_data_objects.TransectData
  },
  activity_subtype_data: {
    VegetationTransectLines: BaseUISchemaComponents.general_objects.VegetationTransectLines
  },
  'ui:order': ['activity_data', 'activity_type_data', 'activity_subtype_data']
};

const Activity_Transect_BiocontrolEfficacy = {
  activity_data: {
    ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
    ...BaseUISchemaComponents.activity_data_objects.Activity
  },
  activity_type_data: {
    ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
    ...BaseUISchemaComponents.activity_type_data_objects.TransectData
  },
  activity_subtype_data: {
    TransectInvasivePlants: BaseUISchemaComponents.general_objects.TransectInvasivePlants,
    BiocontrolEfficacyTransectLines: BaseUISchemaComponents.general_objects.BiocontrolEfficacyTransectLines
  },
  'ui:order': ['activity_data', 'activity_type_data', 'activity_subtype_data']
};

// -------------------------- Treatments ----------------------------------

const Activity_Treatment_ChemicalPlantTerrestrial = {
  activity_data: {
    ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
    ...BaseUISchemaComponents.activity_data_objects.Activity
  },
  activity_type_data: {
    ...BaseUISchemaComponents.column_styles.TwoColumnStyle,
    ...BaseUISchemaComponents.activity_type_data_objects.Treatment_Chemical
  },
  activity_subtype_data: {
    Well_Information: {
      ...BaseUISchemaComponents.general_objects.Well_Information
    },
    Treatment_ChemicalPlant_Information: {
      ...BaseUISchemaComponents.activity_subtype_data_information_objects.Treatment_ChemicalPlant_Information
    },
    Pest_Injury_Threshold_Determination: {
      ...BaseUISchemaComponents.general_objects.Pest_Injury_Threshold_Determination
    },
    'ui:order': ['Well_Information', 'Treatment_ChemicalPlant_Information', 'Pest_Injury_Threshold_Determination']
  },
  'ui:order': ['activity_data', 'activity_type_data', 'activity_subtype_data']
};

const Activity_Treatment_ChemicalPlantAquatic = {
  activity_data: {
    ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
    ...BaseUISchemaComponents.activity_data_objects.Activity
  },
  activity_type_data: {
    ...BaseUISchemaComponents.column_styles.TwoColumnStyle,
    ...BaseUISchemaComponents.activity_type_data_objects.Treatment_Chemical
  },
  activity_subtype_data: {
    Well_Information: {
      ...BaseUISchemaComponents.general_objects.Well_Information
    },
    Treatment_ChemicalPlant_Information: {
      ...BaseUISchemaComponents.activity_subtype_data_information_objects.Treatment_ChemicalPlant_Information
    },
    Pest_Injury_Threshold_Determination: {
      ...BaseUISchemaComponents.general_objects.Pest_Injury_Threshold_Determination
    },
    'ui:order': ['Well_Information', 'Treatment_ChemicalPlant_Information', 'Pest_Injury_Threshold_Determination']
  },
  'ui:order': ['activity_data', 'activity_type_data', 'activity_subtype_data']
};

const Activity_Treatment_MechanicalPlantTerrestrial = {
  activity_data: {
    ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
    ...BaseUISchemaComponents.activity_data_objects.Activity
  },
  activity_type_data: {
    ...BaseUISchemaComponents.column_styles.TwoColumnStyle,
    ...BaseUISchemaComponents.activity_type_data_objects.Treatment
  },
  activity_subtype_data: {
    Treatment_MechanicalPlant_Information: {
      ...BaseUISchemaComponents.activity_subtype_data_information_objects.Treatment_MechanicalPlant_Information
    },
    'ui:order': ['Treatment_MechanicalPlant_Information']
  },
  'ui:order': ['activity_data', 'activity_type_data', 'activity_subtype_data']
};

const Activity_Treatment_MechanicalPlantAquatic = {
  activity_data: {
    ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
    ...BaseUISchemaComponents.activity_data_objects.Activity
  },
  activity_type_data: {
    ...BaseUISchemaComponents.activity_type_data_objects.Treatment
  },
  activity_subtype_data: {
    Authorization_Infotmation: {
      ...BaseUISchemaComponents.general_objects.Authorization_Infotmation
    },
    ShorelineTypes: {
      ...BaseUISchemaComponents.general_objects.ShorelineTypes
    },
    Treatment_MechanicalPlant_Information: {
      ...BaseUISchemaComponents.activity_subtype_data_information_objects.Treatment_MechanicalPlant_Information
    },
    'ui:order': ['Authorization_Infotmation', 'ShorelineTypes', 'Treatment_MechanicalPlant_Information']
  },
  'ui:order': ['activity_data', 'activity_type_data', 'activity_subtype_data']
};

// -------------------------- Monitoring ----------------------------------

const Activity_Monitoring_ChemicalTerrestrialAquaticPlant = {
  activity_data: {
    ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
    ...BaseUISchemaComponents.activity_data_objects.Activity
  },
  activity_type_data: {
    ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
    ...BaseUISchemaComponents.activity_type_data_objects.Monitoring
  },
  activity_subtype_data: {
    Well_Information: {
      ...BaseUISchemaComponents.general_objects.Well_Information
    },
    Monitoring_ChemicalTerrestrialAquaticPlant_Information: {
      ...BaseUISchemaComponents.activity_subtype_data_information_objects
        .Monitoring_ChemicalTerrestrialAquaticPlant_Information
    },
    'ui:order': ['Well_Information', 'Monitoring_ChemicalTerrestrialAquaticPlant_Information']
  },
  'ui:order': ['activity_data', 'activity_type_data', 'activity_subtype_data']
};

const Activity_Monitoring_MechanicalTerrestrialAquaticPlant = {
  activity_data: {
    ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
    ...BaseUISchemaComponents.activity_data_objects.Activity
  },
  activity_type_data: {
    ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
    ...BaseUISchemaComponents.activity_type_data_objects.Monitoring
  },
  activity_subtype_data: {
    Monitoring_MechanicalTerrestrialAquaticPlant_Information: {
      ...BaseUISchemaComponents.activity_subtype_data_information_objects
        .Monitoring_MechanicalTerrestrialAquaticPlant_Information
    },
    'ui:order': ['Monitoring_MechanicalTerrestrialAquaticPlant_Information']
  },
  'ui:order': ['activity_data', 'activity_type_data', 'activity_subtype_data']
};

const Activity_Monitoring_BiocontrolRelease_TerrestrialPlant = {
  activity_data: {
    ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
    ...BaseUISchemaComponents.activity_data_objects.Activity
  },
  activity_type_data: {
    ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
    ...BaseUISchemaComponents.activity_type_data_objects.Monitoring_Biocontrol_Release
  },
  activity_subtype_data: {
    Weather_Conditions: BaseUISchemaComponents.general_objects.Weather_Conditions,
    Microsite_Conditions: BaseUISchemaComponents.general_objects.Microsite_Conditions,
    Monitoring_BiocontrolRelease_TerrestrialPlant_Information:
      BaseUISchemaComponents.activity_subtype_data_information_objects
        .Monitoring_BiocontrolRelease_TerrestrialPlant_Information,
    Target_Plant_Phenology: BaseUISchemaComponents.general_objects.Target_Plant_Phenology,
    Spread_Results: BaseUISchemaComponents.general_objects.Spread_Results,
    'ui:order': [
      'Weather_Conditions',
      'Microsite_Conditions',
      'Monitoring_BiocontrolRelease_TerrestrialPlant_Information',
      'Target_Plant_Phenology',
      'Spread_Results'
    ]
  },
  'ui:order': ['activity_data', 'activity_type_data', 'activity_subtype_data']
};

const Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant = {
  activity_data: {
    ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
    ...BaseUISchemaComponents.activity_data_objects.Activity
  },
  activity_type_data: {
    ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
    ...BaseUISchemaComponents.activity_type_data_objects.Monitoring_Biocontrol
  },
  activity_subtype_data: {
    Weather_Conditions: BaseUISchemaComponents.general_objects.Weather_Conditions,
    Microsite_Conditions: BaseUISchemaComponents.general_objects.Microsite_Conditions,
    Monitoring_BiocontrolDispersal_Information:
      BaseUISchemaComponents.activity_subtype_data_information_objects.Monitoring_BiocontrolDispersal_Information,
    Target_Plant_Phenology: BaseUISchemaComponents.general_objects.Target_Plant_Phenology,
    'ui:order': [
      'Weather_Conditions',
      'Microsite_Conditions',
      'Monitoring_BiocontrolDispersal_Information',
      'Target_Plant_Phenology'
    ]
  },
  'ui:order': ['activity_data', 'activity_type_data', 'activity_subtype_data']
};

// -------------------------- Biocontrol ----------------------------------

const Activity_Biocontrol_Collection = {
  activity_data: {
    ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
    ...BaseUISchemaComponents.activity_data_objects.Activity
  },
  activity_type_data: {
    ...BaseUISchemaComponents.column_styles.TwoColumnStyle,
    ...BaseUISchemaComponents.activity_type_data_objects.Collection
  },
  activity_subtype_data: {
    Weather_Conditions: BaseUISchemaComponents.general_objects.Weather_Conditions,
    Microsite_Conditions: BaseUISchemaComponents.general_objects.Microsite_Conditions,
    Biocontrol_Collection_Information:
      BaseUISchemaComponents.activity_subtype_data_information_objects.Biocontrol_Collection_Information,
    Target_Plant_Phenology: BaseUISchemaComponents.general_objects.Target_Plant_Phenology,
    'ui:order': [
      'Weather_Conditions',
      'Microsite_Conditions',
      'Biocontrol_Collection_Information',
      'Target_Plant_Phenology'
    ]
  },
  'ui:order': ['activity_data', 'activity_type_data', 'activity_subtype_data']
};

const Activity_Biocontrol_Release = {
  activity_data: {
    ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
    ...BaseUISchemaComponents.activity_data_objects.Activity
  },
  activity_type_data: {
    ...BaseUISchemaComponents.column_styles.TwoColumnStyle,
    ...BaseUISchemaComponents.activity_type_data_objects.Treatment
  },
  activity_subtype_data: {
    Weather_Conditions: BaseUISchemaComponents.general_objects.Weather_Conditions,
    Microsite_Conditions: BaseUISchemaComponents.general_objects.Microsite_Conditions,
    Biocontrol_Release_Information:
      BaseUISchemaComponents.activity_subtype_data_information_objects.Biocontrol_Release_Information,
    Target_Plant_Phenology: BaseUISchemaComponents.general_objects.Target_Plant_Phenology,
    'ui:order': [
      'Weather_Conditions',
      'Microsite_Conditions',
      'Biocontrol_Release_Information',
      'Target_Plant_Phenology'
    ]
  },
  'ui:order': ['activity_data', 'activity_type_data', 'activity_subtype_data']
};

// -------------------------- FREP Forms ----------------------------------

const Activity_FREP_FormC = {
  activity_data: {
    ...BaseUISchemaComponents.column_styles.ThreeColumnStyle,
    ...BaseUISchemaComponents.activity_data_objects.Activity
  },
  activity_subtype_data: {
    ...BaseUISchemaComponents.general_objects.FREP_FormC
  },
  'ui:order': ['activity_data', 'activity_subtype_data']
};

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
  //Plant-Observations
  Activity_Observation_PlantTerrestrial,
  Activity_Observation_PlantAquatic,
  //Plant-Treatments
  Activity_Treatment_ChemicalPlantTerrestrial,
  Activity_Treatment_ChemicalPlantAquatic,
  Activity_Treatment_MechanicalPlantTerrestrial,
  Activity_Treatment_MechanicalPlantAquatic,
  //Plant-Monitorings
  Activity_Monitoring_ChemicalTerrestrialAquaticPlant,
  Activity_Monitoring_MechanicalTerrestrialAquaticPlant,
  Activity_Monitoring_BiocontrolRelease_TerrestrialPlant,
  Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant,
  //Plant-Biocontrol
  Activity_Biocontrol_Collection,
  Activity_Biocontrol_Release,
  //Plant-Transect
  Activity_Transect_FireMonitoring,
  Activity_Transect_Vegetation,
  Activity_Transect_BiocontrolEfficacy,
  //FREP
  Activity_FREP_FormC
  //Animals
  // Activity_AnimalActivity_AnimalTerrestrial,
  // Activity_AnimalActivity_AnimalAquatic,
};

export default RootUISchemas;
