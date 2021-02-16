/**
 * This file should only contain root level Schema items.
 *
 * These should mirror the schemas of the same name in the api-doc.json.
 */

import UISchemaComponents from 'rjsf/uiSchema/UISchemaComponents';
import BaseUISchemaComponents from 'rjsf/uiSchema/BaseUISchemaComponents';

const Activity_Observation_PlantTerrestrial = {
  activity_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Observation
  },
  activity_subtype_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Observation_PlantTerrestrial
  }
};

const Activity_Observation_PlantTerrestrial_BulkEdit = {
  activity_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity_BulkEdit
  },
  activity_subtype_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Observation_PlantTerrestrial_BulkEdit
  }
};

const Activity_Observation_PlantAquatic = {
  activity_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Observation
  },
  activity_subtype_data: {
    ...BaseUISchemaComponents.Observation_PlantAquatic
  }
};

const Activity_AnimalActivity_AnimalTerrestrial = {
  activity_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  activity_subtype_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Activity_AnimalTerrestrial
  }
};

const Activity_AnimalActivity_AnimalAquatic = {
  activity_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  activity_subtype_data: {
    ...BaseUISchemaComponents.Activity_AnimalAquatic
  }
};

const Activity_Transect_FireMonitoring = {
  activity_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  activity_subtype_data: {
    ...BaseUISchemaComponents.Transect_FireMonitoring
  }
};

const Activity_Transect_InvasivePlantDensity = {
  activity_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  activity_subtype_data: {
    ...BaseUISchemaComponents.Transect_InvasivePlantDensity
  }
};

const Activity_Transect_FullVegetation = {
  activity_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  activity_subtype_data: {
    ...BaseUISchemaComponents.Transect_FullVegetation
  }
};

const Activity_Transect_LumpedSpeciesVegetation = {
  activity_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  activity_subtype_data: {
    ...BaseUISchemaComponents.Transect_LumpedSpeciesVegetation
  }
};

const Activity_Transect_BiocontrolEfficacy = {
  activity_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  activity_subtype_data: {
    ...BaseUISchemaComponents.Transect_BiocontrolEfficacy
  }
};

const Activity_Dispersal_BiologicalDispersal = {
  activity_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  activity_subtype_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Dispersal_BiologicalDispersal
  }
};

const Activity_Treatment_ChemicalPlant = {
  activity_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  activity_subtype_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Treatment_ChemicalPlant
  }
};

const Activity_Treatment_ChemicalPlant_BulkEdit = {
  activity_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity_BulkEdit
  },
  activity_subtype_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Treatment_ChemicalPlant_BulkEdit
  }
};

const Activity_Treatment_MechanicalPlant = {
  activity_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    ...BaseUISchemaComponents.TwoColumnStyle,
    ...BaseUISchemaComponents.Treatment
  },
  activity_subtype_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Treatment_MechanicalPlant
  }
};

const Activity_Treatment_MechanicalPlant_BulkEdit = {
  activity_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity_BulkEdit
  },
  activity_subtype_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Treatment_MechanicalPlant_BulkEdit
  }
};

const Activity_Treatment_BiologicalPlant = {
  activity_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    ...BaseUISchemaComponents.TwoColumnStyle,
    ...BaseUISchemaComponents.Treatment
  },
  activity_subtype_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Treatment_BiologicalPlant
  }
};

const Activity_Treatment_BiologicalPlant_BulkEdit = {
  activity_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity_BulkEdit
  },
  activity_subtype_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Treatment_BiologicalPlant_BulkEdit
  }
};

const Activity_Monitoring_ChemicalTerrestrialAquaticPlant = {
  activity_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.MonitoringActivity
  },
  activity_type_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Monitoring
  }
};

const Activity_Monitoring_MechanicalTerrestrialAquaticPlant = {
  activity_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.MonitoringActivity
  },
  activity_type_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Monitoring
  }
};

const Activity_Monitoring_BiologicalTerrestrialPlant = {
  activity_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.MonitoringActivity
  },
  activity_type_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Monitoring
  },
  activity_subtype_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Monitoring_BiologicalTerrestrialPlant
  }
};

const RootUISchemas = {
  Activity_Observation_PlantTerrestrial,
  Activity_Observation_PlantTerrestrial_BulkEdit,
  Activity_Observation_PlantAquatic,
  Activity_AnimalActivity_AnimalTerrestrial,
  Activity_AnimalActivity_AnimalAquatic,
  Activity_Transect_FireMonitoring,
  Activity_Transect_InvasivePlantDensity,
  Activity_Transect_FullVegetation,
  Activity_Transect_LumpedSpeciesVegetation,
  Activity_Transect_BiocontrolEfficacy,
  Activity_Dispersal_BiologicalDispersal,
  Activity_Treatment_ChemicalPlant,
  Activity_Treatment_ChemicalPlant_BulkEdit,
  Activity_Treatment_MechanicalPlant,
  Activity_Treatment_MechanicalPlant_BulkEdit,
  Activity_Treatment_BiologicalPlant,
  Activity_Treatment_BiologicalPlant_BulkEdit,
  Activity_Monitoring_ChemicalTerrestrialAquaticPlant,
  Activity_Monitoring_MechanicalTerrestrialAquaticPlant,
  Activity_Monitoring_BiologicalTerrestrialPlant
};

export default RootUISchemas;
