import { Activity } from '../../Activity_Data_Components.js';
import { Monitoring, Monitoring_Biocontrol, Monitoring_Biocontrol_Release } from '../../Activity_Type_Data_Components.js';
import {
  Subtype_Data_Monitoring_BiocontrolDispersal_TerrestrialPlant,
  Subtype_Data_Monitoring_BiocontrolRelease_TerrestrialPlant,
  Subtype_Data_Monitoring_ChemicalTerrestrialAquaticPlant,
  Subtype_Data_Monitoring_MechanicalTerrestrialAquaticPlant
} from '../../Subtype_Data_Lists/Plant_Subtype_Data_Lists.js';

export const Activity_Monitoring_ChemicalTerrestrialAquaticPlant = {
  type: 'object',
  properties: {
    activity_data: {
      ...Activity
    },
    activity_type_data: {
      ...Monitoring
    },
    activity_subtype_data: {
      ...Subtype_Data_Monitoring_ChemicalTerrestrialAquaticPlant
    }
  }
};
export const Activity_Monitoring_MechanicalTerrestrialAquaticPlant = {
  type: 'object',
  properties: {
    activity_data: {
      ...Activity
    },
    activity_type_data: {
      ...Monitoring
    },
    activity_subtype_data: {
      ...Subtype_Data_Monitoring_MechanicalTerrestrialAquaticPlant
    }
  }
};
export const Activity_Monitoring_BiocontrolRelease_TerrestrialPlant = {
  type: 'object',
  properties: {
    activity_data: {
      ...Activity
    },
    activity_type_data: {
      ...Monitoring_Biocontrol_Release
    },
    activity_subtype_data: {
      ...Subtype_Data_Monitoring_BiocontrolRelease_TerrestrialPlant
    }
  }
};
export const Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant = {
  type: 'object',
  properties: {
    activity_data: {
      ...Activity
    },
    activity_type_data: {
      ...Monitoring_Biocontrol
    },
    activity_subtype_data: {
      ...Subtype_Data_Monitoring_BiocontrolDispersal_TerrestrialPlant
    }
  }
};
