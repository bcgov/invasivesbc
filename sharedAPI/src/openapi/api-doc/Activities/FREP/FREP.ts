import { Activity } from '../../Activity_Data_Components.js';
import { FREP_FormC } from '../../Components/FREP_Sub_Forms.js';

export const Activity_FREP_FormC = {
  type: 'object',
  properties: {
    activity_data: {
      ...Activity
    },
    activity_subtype_data: {
      ...FREP_FormC
    }
  }
};
