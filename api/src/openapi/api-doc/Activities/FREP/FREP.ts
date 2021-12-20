import { Activity } from '../../Activity_Data_Components';
import { FREP_FormC } from '../../Components/FREP_Sub_Forms';

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
