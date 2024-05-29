/**
 * @desc Highest level component for Shifts of officers in the field
 * @author LocalNewsTV
 */
import { ShiftOverview } from '../../Components/Mussels_Officer_Shift_Sub_Forms';

export const Activity_Officer_Shift = {
  type: 'object',
  properties: {
    activity_data: {},
    activity_type_data: {},
    activity_subtype_data: {
      ...ShiftOverview
    }
  }
};
