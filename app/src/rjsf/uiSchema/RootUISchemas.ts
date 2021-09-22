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
    ...BaseUISchemaComponents.Observation_PlantTerrestrial
  },
  'ui:order':['activity_data','activity_type_data','activity_subtype_data']
};

const Activity_Observation_PlantTerrestrial_BulkEdit = {
  'activity_data': {
    ...BaseUISchemaComponents.TwoColumnStyle,
    ...UISchemaComponents.Activity_BulkEdit
  },
  'ui:order':['activity_data']
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
  'activity_subtype_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Activity_AnimalTerrestrial
  },
  'ui:order':['activity_data','activity_type','activity_subtype_data']
};

const Activity_AnimalActivity_AnimalAquatic = {
  'activity_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  'activity_subtype_data': {
    ...BaseUISchemaComponents.Activity_AnimalAquatic
  },
  'ui:order':['activity_data','activity_subtype_data']
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

const Activity_Dispersal_BiologicalDispersal = {
  'activity_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  'activity_subtype_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Dispersal_BiologicalDispersal
  },
  'ui:order':['activity_data','activity_subtype_data']
};

const Activity_Treatment_ChemicalPlant = {
  'activity_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  'activity_subtype_data': {
    ...UISchemaComponents.Treatment_ChemicalPlant
  },
  'ui:order':['activity_data','activity_subtype_data']
};

const Activity_Treatment_ChemicalPlant_BulkEdit = {
  'activity_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity_BulkEdit
  },
  'activity_subtype_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Treatment_ChemicalPlant_BulkEdit
  },
  'ui:order':['activity_data','activity_subtype_data',]
};

const Activity_Treatment_ChemicalPlantAquatic = {
  'activity_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  'activity_subtype_data': {
    ...UISchemaComponents.Treatment_ChemicalPlantAquatic
  },
  'ui:order':['activity_data','activity_subtype_data']
};

const Activity_Treatment_MechanicalPlant = {
  'activity_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  'activity_type_data': {
    ...BaseUISchemaComponents.TwoColumnStyle,
    ...BaseUISchemaComponents.Treatment
  },
  'activity_subtype_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Treatment_MechanicalPlant
  },
  'ui:order':['activity_data','activity_type_data','activity_subtype_data']
};

const Activity_Treatment_MechanicalPlantAquatic = {
  'activity_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  'activity_type_data': {
    ...BaseUISchemaComponents.TwoColumnStyle,
    ...BaseUISchemaComponents.Treatment,
    'ui:order':['treatment_organization','treatment_location','treatment_persons','additional_auth_information']
    
  },
  'activity_subtype_data': {
    ...BaseUISchemaComponents.Treatment_MechanicalPlantAquatic,
    'ui:order':['waterbody_data','shoreline_types','water_quality','mechanical_treatment_information']
  },
  'ui:order':['activity_data','activity_type_data','activity_subtype_data']
};

const Activity_Treatment_MechanicalPlant_BulkEdit = {
  'activity_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity_BulkEdit
  },
  'activity_subtype_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Treatment_MechanicalPlant_BulkEdit
  },
  'ui:order':['activity_data','activity_subtype_data','activity_subtype_data']
};

const Activity_Treatment_BiologicalPlant = {
  'activity_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  'activity_type_data': {
    ...BaseUISchemaComponents.TwoColumnStyle,
    ...BaseUISchemaComponents.Treatment
  },
  'activity_subtype_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Treatment_BiologicalPlant
  },
  'ui:order':['activity_data','activity_type_data','activity_subtype_data']
};

const Activity_Treatment_BiologicalPlant_BulkEdit = {
  'activity_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity_BulkEdit
  },
  'activity_subtype_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Treatment_BiologicalPlant_BulkEdit
  },
  'ui:order':['activity_data','activity_subtype_data','activity_subtype_data']
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

const Activity_Monitoring_BiologicalTerrestrialPlant = {
  'activity_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.MonitoringActivity
  },
  'activity_type_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Monitoring,
    ...UISchemaComponents.Monitoring
  },
  'activity_subtype_data': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Monitoring_BiologicalTerrestrialPlant
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

const RootUISchemas = {
  Activity_Observation_PlantTerrestrial,
  Activity_Observation_PlantTerrestrial_BulkEdit,
  Activity_Observation_PlantAquatic,
  Activity_AnimalActivity_AnimalTerrestrial,
  Activity_AnimalActivity_AnimalAquatic,
  Activity_Transect_FireMonitoring,
  Activity_Transect_Vegetation,
  Activity_Transect_BiocontrolEfficacy,
  Activity_Dispersal_BiologicalDispersal,
  Activity_Treatment_ChemicalPlant,
  Activity_Treatment_ChemicalPlant_BulkEdit,
  Activity_Treatment_ChemicalPlantAquatic,
  Activity_Treatment_MechanicalPlant,
  Activity_Treatment_MechanicalPlantAquatic,
  Activity_Treatment_MechanicalPlant_BulkEdit,
  Activity_Treatment_BiologicalPlant,
  Activity_Treatment_BiologicalPlant_BulkEdit,
  Activity_Monitoring_ChemicalTerrestrialAquaticPlant,
  Activity_Monitoring_MechanicalTerrestrialAquaticPlant,
  Activity_Monitoring_BiologicalTerrestrialPlant,
  Activity_Collection_Biocontrol
};

export default RootUISchemas;
