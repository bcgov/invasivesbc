import { Activity } from 'openapi/api-doc/Activity_Data_Components';
import { Observation } from 'openapi/api-doc/Activity_Type_Data_Components';
import { Subtype_Data_Observation_PlantTerrestrial } from 'openapi/api-doc/Subtype_Data_Lists/Plant_Subtype_Data_Lists';

export const Activity_Observation_PlantTerrestrial = {
  type: 'object',
  properties: {
    activity_data: {
      ...Activity
    },
    activity_type_data: {
      ...Observation
    },
    activity_subtype_data: {
      ...Subtype_Data_Observation_PlantTerrestrial
    }
  }
};
export const Activity_Observation_PlantAquatic = {
  type: 'object',
  properties: {
    activity_data: {
      ...Activity
    },
    activity_type_data: {
      ...Observation
    },
    activity_subtype_data: {
      ...Subtype_Data_Observation_PlantTerrestrial
    }
  }
};
