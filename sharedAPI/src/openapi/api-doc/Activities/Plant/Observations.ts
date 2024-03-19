import { Activity } from '../../Activity_Data_Components.js';
import { Observation } from '../../Activity_Type_Data_Components.js';
import {
  Subtype_Data_Observation_PlantAquatic,
  Subtype_Data_Observation_PlantTerrestrial
} from '../../Subtype_Data_Lists/Plant_Subtype_Data_Lists.js';

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
      ...Subtype_Data_Observation_PlantAquatic
    }
  }
};
