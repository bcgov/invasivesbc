import { Activity } from '../../Activity_Data_Components';
import { Collection, Treatment } from '../../Activity_Type_Data_Components';
import {
  Subtype_Data_Biocontrol_Collection,
  Subtype_Data_Biocontrol_Release
} from '../../Subtype_Data_Lists/Plant_Subtype_Data_Lists';

export const Activity_Biocontrol_Release = {
  type: 'object',
  properties: {
    activity_data: {
      ...Activity
    },
    activity_type_data: {
      ...Treatment
    },
    activity_subtype_data: {
      ...Subtype_Data_Biocontrol_Release
    }
  }
};
export const Activity_Biocontrol_Collection = {
  type: 'object',
  properties: {
    activity_data: {
      ...Activity
    },
    activity_type_data: {
      ...Collection
    },
    activity_subtype_data: {
      ...Subtype_Data_Biocontrol_Collection
    }
  }
};
