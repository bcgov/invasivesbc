import { Activity } from '../../Activity_Data_Components';
import { Treatment, Treatment_Chemical } from '../../Activity_Type_Data_Components';
import {
  Subtype_Data_Treatment_ChemicalPlantAquatic,
  Subtype_Data_Treatment_ChemicalPlantTerrestrial,
  Subtype_Data_Treatment_MechanicalPlantAquatic,
  Subtype_Data_Treatment_MechanicalPlantTerrestrial
} from '../../Subtype_Data_Lists/Plant_Subtype_Data_Lists';

export const Activity_Treatment_ChemicalPlantTerrestrial = {
  type: 'object',
  properties: {
    activity_data: {
      ...Activity
    },
    activity_type_data: {
      ...Treatment_Chemical
    },
    activity_subtype_data: {
      ...Subtype_Data_Treatment_ChemicalPlantTerrestrial
    }
  }
};
export const Activity_Treatment_ChemicalPlantAquatic = {
  type: 'object',
  properties: {
    activity_data: {
      ...Activity
    },
    activity_type_data: {
      ...Treatment_Chemical
    },
    activity_subtype_data: {
      ...Subtype_Data_Treatment_ChemicalPlantAquatic
    }
  }
};
export const Activity_Treatment_MechanicalPlantTerrestrial = {
  type: 'object',
  properties: {
    activity_data: {
      ...Activity
    },
    activity_type_data: {
      ...Treatment
    },
    activity_subtype_data: {
      ...Subtype_Data_Treatment_MechanicalPlantTerrestrial
    }
  }
};
export const Activity_Treatment_MechanicalPlantAquatic = {
  type: 'object',
  properties: {
    activity_data: {
      ...Activity
    },
    activity_type_data: {
      ...Treatment
    },
    activity_subtype_data: {
      ...Subtype_Data_Treatment_MechanicalPlantAquatic
    }
  }
};
