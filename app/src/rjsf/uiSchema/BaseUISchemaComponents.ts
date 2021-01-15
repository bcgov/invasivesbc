/**
 * This file should only contain UI Schema items that have NO nested elements.
 *
 * Example of schema item without nested element:
 *
 * const Obj = {
 *   some_field: {}
 * }
 */

const InvasivePlants = {
  invasive_plant_code: {}
};

const InvasiveAnimals = {
  invasive_animal_code: {}
};

const Observation = {
  observation_type_code: {},
  observer_first_name: {},
  observer_last_name: {},
  sample_number: {},
  negative_obs_ind: {
    'ui:widget': 'radio'
  }
};

const Observation_PlantTerrestial = {
  invasive_plant_density_code: {},
  invasive_plant_distribution_code: {},
  soil_texture_code: {},
  specific_use_code: {},
  slope_code: {},
  aspect_code: {},
  invasive_plant_code: {},
  proposed_treatment_code: {},
  range_unit_number: {},
  plant_life_stage_code: {},
  plant_health_code: {},
  plant_seed_stage_code: {},
  flowering: {
    'ui:widget': 'radio'
  },
  legacy_site_ind: {
    'ui:widget': 'radio'
  },
  early_detection_rapid_resp_ind: {
    'ui:widget': 'radio'
  },
  research_detection_ind: {
    'ui:widget': 'radio'
  },
  well_ind: {
    'ui:widget': 'radio'
  },
  special_care_ind: {
    'ui:widget': 'radio'
  },
  biological_ind: {
    'ui:widget': 'radio'
  }
};

const Observation_PlantTerrestrial_BulkEdit = {
  invasive_plant_density_code: {},
  invasive_plant_distribution_code: {},
  soil_texture_code: {},
  specific_use_code: {},
  slope_code: {},
  aspect_code: {},
  invasive_plant_code: {},
  proposed_treatment_code: {},
  plant_life_stage_code: {},
  plant_health_code: {},
  plant_seed_stage_code: {}
};

const Observation_PlantAquatic = {
  specific_use_code: {},
  proposed_action_code: {},
  flowering: {},
  plant_life_stage: {},
  plant_health: {},
  plant_seed_stage: {},
  range_unit_number: {},
  legacy_site_ind: {
    'ui:widget': 'radio'
  },
  early_detection_rapid_resp_ind: {
    'ui:widget': 'radio'
  },
  research_detection_ind: {
    'ui:widget': 'radio'
  },
  sample_point_number: {},
  special_care_ind: {
    'ui:widget': 'radio'
  },
  biological_ind: {
    'ui:widget': 'radio'
  },
  secchi_depth: {},
  water_depth: {},
  voucher_submitted_ind: {
    'ui:widget': 'radio'
  },
  voucher_submission_detail: {},
  invasive_plants: {
    items: {
      ...InvasivePlants
    }
  }
};

const Observation_AnimalTerrestrial = {
  number_of_individuals_observed: {},
  invasive_animal_code: {},
  animal_behavior_code: {},
  animal_life_stage_code: {}
};

const Observation_AnimalAquatic = {
  observation_details: {},
  invasive_animals: {
    items: {
      ...InvasiveAnimals
    }
  }
};

const Treatment = {
  activity_id: {
    'ui:readonly': true
  },
  applicator1_first_name: {},
  applicator1_last_name: {},
  applicator2_first_name: {},
  applicator2_last_name: {},
  treatment_contractor: {},
  treatment_issues_code: {}
};

const Treatment_BulkEdit = {
  treatment_issues_code: {}
};

const Treatment_MechanicalPlant = {
  invasive_plant_code: {},
  mechanical_method_code: {},
  mechanical_disposal_code: {},
  root_removal_code: {},
  soil_disturbance_code: {},
  signage_on_site: {
    'ui:widget': 'radio'
  }
};

const Treatment_BiologicalPlant = {
  classified_area_code: {},
  release_quantity: {},
  agent_source: {},
  biological_agent_code: {},
  biological_agent_stage_code: {},
  invasive_plant_code: {},
  bioagent_maturity_status_code: {}
};

const Treatment_BiologicalDispersalPlant = {
  duration_of_count: {},
  biological_agent_code: {},
  plant_count: {},
  biological_agent_count: {},
  invasive_plant_code: {},
  biological_agent_presence_code: {}
};

const Treatment_MechanicalTerrestrialAnimal = {
  treatment_details: {
    'ui:widget': 'textarea'
  },
  invasive_animal_code: {}
};

const Treatment_ChemicalTerrestrialAnimal = {
  treatment_details: {
    'ui:widget': 'textarea'
  },
  invasive_animal_code: {}
};

const Treatment_BiologicalTerrestrialAnimal = {
  treatment_details: {
    'ui:widget': 'textarea'
  },
  invasive_animal_code: {}
};

const Monitoring = {
  activity_id: {
    'ui:readonly': true
  },
  observer_first_name: {},
  observer_last_name: {},
  efficacy_code: {}
};

const Monitoring_BiologicalTerrestrialPlant = {
  plant_count: {},
  agent_count: {},
  count_duration: {},
  agent_destroyed_ind: {
    'ui:widget': 'radio'
  },
  legacy_presence_ind: {
    'ui:widget': 'radio'
  },
  foliar_feeding_damage_ind: {
    'ui:widget': 'radio'
  },
  root_feeding_damage_ind: {
    'ui:widget': 'radio'
  },
  oviposition_marks_ind: {
    'ui:widget': 'radio'
  },
  eggs_present_ind: {
    'ui:widget': 'radio'
  },
  larvae_present_ind: {
    'ui:widget': 'radio'
  },
  pupae_present_ind: {
    'ui:widget': 'radio'
  },
  adults_present_ind: {
    'ui:widget': 'radio'
  },
  tunnels_present_ind: {
    'ui:widget': 'radio'
  },
  biological_agent_spread: {}
};

const Monitoring_MechanicalTerrestrialAnimal = {
  monitoring_details: {}
};

const Monitoring_ChemicalTerrestrialAnimal = {
  monitoring_details: {}
};

const Monitoring_BiologicalTerrestrialAnimal = {
  monitoring_details: {}
};

const PaperFileID = {
  description: {}
};

const Herbicide = {
  liquid_herbicide_code: {},
  herbicide_amount: {},
  mix_delivery_rate: {},
  application_rate: {},
  dilution: {
    'ui:readonly': true
  },
  specific_treatment_area: {
    'ui:readonly': true
  },
  tank_volume: {
    'ui:readonly': true
  }
};

const BaseUISchemaComponents = {
  Observation,
  Observation_PlantTerrestial,
  Observation_PlantTerrestrial_BulkEdit,
  Observation_PlantAquatic,
  Observation_AnimalTerrestrial,
  Observation_AnimalAquatic,
  Treatment,
  Treatment_BulkEdit,
  Treatment_MechanicalPlant,
  Treatment_BiologicalPlant,
  Treatment_BiologicalDispersalPlant,
  Treatment_MechanicalTerrestrialAnimal,
  Treatment_ChemicalTerrestrialAnimal,
  Treatment_BiologicalTerrestrialAnimal,
  Monitoring,
  Monitoring_BiologicalTerrestrialPlant,
  Monitoring_MechanicalTerrestrialAnimal,
  Monitoring_ChemicalTerrestrialAnimal,
  Monitoring_BiologicalTerrestrialAnimal,
  PaperFileID,
  Herbicide,
  InvasivePlants
};

export default BaseUISchemaComponents;
