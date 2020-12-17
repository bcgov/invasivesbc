/**
 * This file should only contain root level Schema items.
 *
 * These should mirror the schemas of the same name in the api-doc.json.
 */

import UISchemaComponents from 'rjsf/uiSchema/UISchemaComponents';
import BaseUISchemaComponents from 'rjsf/uiSchema/BaseUISchemaComponents';

const Activity_Observation_PlantTerrestial = {
  activity_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...BaseUISchemaComponents.Observation
  },
  activity_subtype_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...BaseUISchemaComponents.Observation_PlantTerrestial
  }
};

const Activity_Observation_PlantAquatic = {
  activity_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...BaseUISchemaComponents.Observation
  },
  activity_subtype_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...BaseUISchemaComponents.Observation_PlantAquatic
  }
};

const Activity_Observation_AnimalTerrestrial = {
  activity_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...BaseUISchemaComponents.Observation
  },
  activity_subtype_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...BaseUISchemaComponents.Observation_AnimalTerrestrial
  }
};

const Activity_Observation_AnimalAquatic = {
  activity_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...BaseUISchemaComponents.Observation
  },
  activity_subtype_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...BaseUISchemaComponents.Observation_AnimalAquatic
  }
};

const Activity_Treatment_ChemicalPlant = {
  activity_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...BaseUISchemaComponents.Treatment
  },
  activity_subtype_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...UISchemaComponents.Treatment_ChemicalPlant
  }
};

const Activity_Treatment_MechanicalPlant = {
  activity_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...BaseUISchemaComponents.Treatment
  },
  activity_subtype_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...BaseUISchemaComponents.Treatment_MechanicalPlant
  }
};

const Activity_Treatment_BiologicalPlant = {
  activity_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...BaseUISchemaComponents.Treatment
  },
  activity_subtype_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...BaseUISchemaComponents.Treatment_BiologicalPlant
  }
};

const Activity_Treatment_BiologicalDispersalPlant = {
  activity_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...BaseUISchemaComponents.Treatment
  },
  activity_subtype_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...BaseUISchemaComponents.Treatment_BiologicalDispersalPlant
  }
};

const Activity_Treatment_MechanicalTerrestrialAnimal = {
  activity_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...BaseUISchemaComponents.Treatment
  },
  activity_subtype_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...BaseUISchemaComponents.Treatment_MechanicalTerrestrialAnimal
  }
};

const Activity_Treatment_ChemicalTerrestrialAnimal = {
  activity_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...BaseUISchemaComponents.Treatment
  },
  activity_subtype_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...BaseUISchemaComponents.Treatment_ChemicalTerrestrialAnimal
  }
};

const Activity_Treatment_BiologicalTerrestrialAnimal = {
  activity_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...BaseUISchemaComponents.Treatment
  },
  activity_subtype_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...BaseUISchemaComponents.Treatment_BiologicalTerrestrialAnimal
  }
};

const Activity_Monitoring_ChemicalTerrestrialAquaticPlant = {
  activity_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...BaseUISchemaComponents.Monitoring
  }
};

const Activity_Monitoring_MechanicalTerrestrialAquaticPlant = {
  activity_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...BaseUISchemaComponents.Monitoring
  }
};

const Activity_Monitoring_BiologicalTerrestrialPlant = {
  activity_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...BaseUISchemaComponents.Monitoring
  },
  activity_subtype_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...BaseUISchemaComponents.Monitoring_BiologicalTerrestrialPlant
  }
};

const Activity_Monitoring_MechanicalTerrestrialAnimal = {
  activity_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...BaseUISchemaComponents.Monitoring
  },
  activity_subtype_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...BaseUISchemaComponents.Monitoring_MechanicalTerrestrialAnimal
  }
};

const Activity_Monitoring_ChemicalTerrestrialAnimal = {
  activity_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...BaseUISchemaComponents.Monitoring
  },
  activity_subtype_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...BaseUISchemaComponents.Monitoring_ChemicalTerrestrialAnimal
  }
};

const Activity_Monitoring_BiologicalTerrestrialAnimal = {
  activity_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...BaseUISchemaComponents.Monitoring
  },
  activity_subtype_data: {
    'ui:column-xs': 12,
    'ui:column-md': 6,
    'ui:column-lg': 4,
    ...BaseUISchemaComponents.Monitoring_BiologicalTerrestrialAnimal
  }
};

const RootUISchemas = {
  Activity_Observation_PlantTerrestial,
  Activity_Observation_PlantAquatic,
  Activity_Observation_AnimalTerrestrial,
  Activity_Observation_AnimalAquatic,
  Activity_Treatment_ChemicalPlant,
  Activity_Treatment_MechanicalPlant,
  Activity_Treatment_BiologicalPlant,
  Activity_Treatment_BiologicalDispersalPlant,
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
