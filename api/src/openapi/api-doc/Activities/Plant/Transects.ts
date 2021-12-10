import { Activity } from 'openapi/api-doc/Activity_Data_Components';
import {
  Subtype_Data_Transect_BiocontrolEfficacy,
  Subtype_Data_Transect_FireMonitoring,
  Subtype_Data_Transect_Vegetation
} from 'openapi/api-doc/Subtype_Data_Lists/Plant_Subtype_Data_Lists';

export const Activity_Transect_FireMonitoring = {
  type: 'object',
  properties: {
    activity_data: {
      ...Activity
    },
    activity_subtype_data: {
      ...Subtype_Data_Transect_FireMonitoring
    }
  }
};
export const Activity_Transect_Vegetation = {
  type: 'object',
  properties: {
    activity_data: {
      ...Activity
    },
    activity_subtype_data: {
      ...Subtype_Data_Transect_Vegetation
    }
  }
};
export const Activity_Transect_BiocontrolEfficacy = {
  type: 'object',
  properties: {
    activity_data: {
      ...Activity
    },
    activity_subtype_data: {
      ...Subtype_Data_Transect_BiocontrolEfficacy
    }
  }
};
