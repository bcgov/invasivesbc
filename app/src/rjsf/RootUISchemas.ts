/**
 * This file should only contain root level Schema items.
 *
 * Example of schema item with nested element:
 *
 * const Obj = {
 *   some_nested_field: {
 *      ...nested_field_properties
 *   }
 * }
 */

import UISchemaComponents from 'rjsf/UISchemaComponents';

const Activity_Observation_PlantTerrestial = {
  activity_data: {
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    ...UISchemaComponents.Observation
  },
  activity_subtype_data: {
    ...UISchemaComponents.Observation_PlantTerrestial
  }
};

const Activity_Observation_PlantAquatic = {
  activity_data: {
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    ...UISchemaComponents.Observation
  },
  activity_subtype_data: {
    ...UISchemaComponents.Observation_PlantAquatic
  }
};

const Activity_Observation_AnimalTerrestrial = {
  activity_data: {
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    ...UISchemaComponents.Observation
  },
  activity_subtype_data: {
    ...UISchemaComponents.Observation_AnimalTerrestrial
  }
};

const Activity_Observation_AnimalAquatic = {
  activity_data: {
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    ...UISchemaComponents.Observation
  },
  activity_subtype_data: {
    ...UISchemaComponents.Observation_AnimalAquatic
  }
};

const Activity_Treatment_ChemicalPlant = {
  activity_data: {
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    ...UISchemaComponents.Treatment
  },
  activity_subtype_data: {
    ...UISchemaComponents.Treatment_ChemicalPlant
  }
};

const Activity_Treatment_MechanicalPlant = {
  activity_data: {
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    ...UISchemaComponents.Treatment
  },
  activity_subtype_data: {
    ...UISchemaComponents.Treatment_MechanicalPlant
  }
};

const Activity_Treatment_BiologicalPlant = {
  activity_data: {
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    ...UISchemaComponents.Treatment
  },
  activity_subtype_data: {
    ...UISchemaComponents.Treatment_BiologicalPlant
  }
};

const Activity_Treatment_BiologicalDispersalPlant = {
  activity_data: {
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    ...UISchemaComponents.Treatment
  },
  activity_subtype_data: {
    ...UISchemaComponents.Treatment_BiologicalDispersalPlant
  }
};

const Activity_Treatment_MechanicalTerrestrialAnimal = {
  activity_data: {
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    ...UISchemaComponents.Treatment
  },
  activity_subtype_data: {
    ...UISchemaComponents.Treatment_MechanicalTerrestrialAnimal
  }
};

const Activity_Treatment_ChemicalTerrestrialAnimal = {
  activity_data: {
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    ...UISchemaComponents.Treatment
  },
  activity_subtype_data: {
    ...UISchemaComponents.Treatment_ChemicalTerrestrialAnimal
  }
};

const Activity_Treatment_BiologicalTerrestrialAnimal = {
  activity_data: {
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    ...UISchemaComponents.Treatment
  },
  activity_subtype_data: {
    ...UISchemaComponents.Treatment_BiologicalTerrestrialAnimal
  }
};

const Activity_Monitoring_ChemicalTerrestrialAquaticPlant = {
  activity_data: {
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    ...UISchemaComponents.Monitoring
  },
  activity_subtype_data: {
    ...UISchemaComponents.Monitoring_ChemicalTerrestrialAquaticPlant
  }
};

const Activity_Monitoring_MechanicalTerrestrialAquaticPlant = {
  activity_data: {
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    ...UISchemaComponents.Monitoring
  },
  activity_subtype_data: {
    ...UISchemaComponents.Monitoring_MechanicalTerrestrialAquaticPlant
  }
};

const Activity_Monitoring_BiologicalTerrestrialPlant = {
  activity_data: {
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    ...UISchemaComponents.Monitoring
  },
  activity_subtype_data: {
    ...UISchemaComponents.Monitoring_BiologicalTerrestrialPlant
  }
};

const Activity_Monitoring_MechanicalTerrestrialAnimal = {
  activity_data: {
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    ...UISchemaComponents.Monitoring
  },
  activity_subtype_data: {
    ...UISchemaComponents.Monitoring_MechanicalTerrestrialAnimal
  }
};

const Activity_Monitoring_ChemicalTerrestrialAnimal = {
  activity_data: {
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    ...UISchemaComponents.Monitoring
  },
  activity_subtype_data: {
    ...UISchemaComponents.Monitoring_ChemicalTerrestrialAnimal
  }
};

const Activity_Monitoring_BiologicalTerrestrialAnimal = {
  activity_data: {
    ...UISchemaComponents.Activity
  },
  activity_type_data: {
    ...UISchemaComponents.Monitoring
  },
  activity_subtype_data: {
    ...UISchemaComponents.Monitoring_BiologicalTerrestrialAnimal
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
