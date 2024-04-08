import { Activity } from '../../Activity_Data_Components';
import { Observation } from '../../Activity_Type_Data_Components';
import {
    Subtype_Data_Observation_Mussels
} from '../../Subtype_Data_Lists/Mussels_Subtype_Data_Lists';

export const Activity_Observation_Mussels = {
  type: 'object',
  properties: {
    activity_data: {},
    activity_type_data: {},
    activity_subtype_data: {
      ...Subtype_Data_Observation_Mussels
    }
  }
};
