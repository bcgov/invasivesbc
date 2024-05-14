/**
 * @desc Highest level component for Watercraft Observations from officers in the field 
 * @author LocalNewsTV davidclaveau
 */
import {
  Observation_Mussels_Information,
} from '../Components/Observation_Sub_Forms';

export const Subtype_Data_Observation_Mussels = {
  type: 'object',
  title: 'invisible',
  properties: {
    Observation_Mussels_Information: Observation_Mussels_Information,
  }
};
