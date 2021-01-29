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

const Activity_Observation_AnimalTerrestrial = {
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
    ...BaseUISchemaComponents.Observation_AnimalTerrestrial
  }
};

const Activity_Observation_AnimalAquatic = {
  activity_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Observation
  },
  activity_subtype_data: {
    ...BaseUISchemaComponents.Observation_AnimalAquatic
  }
};

const Activity_Transect_FireMonitoring = {
  activity_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  activity_subtype_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Transect_FireMonitoring
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
    ...BaseUISchemaComponents.ThreeColumnStyle,
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
  activity_type_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Treatment_BulkEdit
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
    ...BaseUISchemaComponents.ThreeColumnStyle,
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
  activity_type_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Treatment_BulkEdit
  },
  activity_subtype_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Treatment_BiologicalPlant_BulkEdit
  }
};

const Activity_Treatment_MechanicalTerrestrialAnimal = {
  activity_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Treatment
  },
  activity_subtype_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Treatment_MechanicalTerrestrialAnimal
  }
};

const Activity_Treatment_ChemicalTerrestrialAnimal = {
  activity_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Treatment
  },
  activity_subtype_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Treatment_ChemicalTerrestrialAnimal
  }
};

const Activity_Treatment_BiologicalTerrestrialAnimal = {
  activity_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Treatment
  },
  activity_subtype_data: {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    ...BaseUISchemaComponents.Treatment_BiologicalTerrestrialAnimal
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

const Activity_Monitoring_MechanicalTerrestrialAnimal = {
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
    ...BaseUISchemaComponents.Monitoring_MechanicalTerrestrialAnimal
  }
};

const Activity_Monitoring_ChemicalTerrestrialAnimal = {
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
    ...BaseUISchemaComponents.Monitoring_ChemicalTerrestrialAnimal
  }
};

const Activity_Monitoring_BiologicalTerrestrialAnimal = {
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
    ...BaseUISchemaComponents.Monitoring_BiologicalTerrestrialAnimal
  }
};

const RootUISchemas = {
  Activity_Observation_PlantTerrestrial,
  Activity_Observation_PlantTerrestrial_BulkEdit,
  Activity_Observation_PlantAquatic,
  Activity_Observation_AnimalTerrestrial,
  Activity_Observation_AnimalAquatic,
  Activity_Transect_FireMonitoring,
  Activity_Treatment_ChemicalPlant,
  Activity_Treatment_ChemicalPlant_BulkEdit,
  Activity_Treatment_MechanicalPlant,
  Activity_Treatment_MechanicalPlant_BulkEdit,
  Activity_Treatment_BiologicalPlant,
  Activity_Treatment_BiologicalPlant_BulkEdit,
  Activity_Treatment_MechanicalTerrestrialAnimal,
  Activity_Treatment_ChemicalTerrestrialAnimal,
  Activity_Treatment_BiologicalTerrestrialAnimal,
  Activity_Monitoring_ChemicalTerrestrialAquaticPlant,
  Activity_Monitoring_MechanicalTerrestrialAquaticPlant,
  Activity_Monitoring_BiologicalTerrestrialPlant,
  Activity_Monitoring_MechanicalTerrestrialAnimal,
  Activity_Monitoring_ChemicalTerrestrialAnimal,
  Activity_Monitoring_BiologicalTerrestrialAnimal
};

export default RootUISchemas;
