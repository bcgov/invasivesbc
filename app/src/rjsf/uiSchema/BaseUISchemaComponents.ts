/**
 * This file should only contain UI Schema items that have NO nested elements.
 *
 * Example of schema item without nested element:
 *
 * const Obj = {
 *   some_field: {}
 * }
 */

const ThreeColumnStyle = {
  'ui:column-xs': 12,
  'ui:column-md': 6,
  'ui:column-lg': 4
};

const InvasivePlants = {
  invasive_plant_code: {}
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

const ProjectCode = {
  description: {}
};

const AquaticAnimals = {
  invasive_animal_code: {},
  early_detection_rapid_resp_ind: {
    'ui:widget': 'radio'
  },
  negative_obs_ind: {
    'ui:widget': 'radio'
  },
  number_of_individuals_observed: {},
  length_method: {},
  length: {},
  weight: {},
  sex: {},
  reproductive_maturity: {},
  life_stage: {},
  behaviour: {},
  age_sample_id: {},
  age_structure_collected: {},
  age: {},
  voucher_sample_id: {},
  genetic_sample_id: {},
  genetic_structure_collected: {}
};

const LakeBathymetry = {
  survey_type: {},
  littoral_area: {},
  max_depth: {},
  benchmark: {},
  max_water_level: {},
  benchmark_type: {}
};

const AquaticPlants = {
  invasive_plant_code: {},
  invasive_plant_density_code: {},
  invasive_plant_distribution_code: {},
  plant_life_stage_code: {},
  plant_health_code: {},
  plant_seed_stage_code: {},
  voucher_sample_id: {},
  genetic_sample_id: {},
  genetic_structure_collected: {},
  flowering: {
    'ui:widget': 'radio'
  },
  early_detection_rapid_resp_ind: {
    'ui:widget': 'radio'
  },
  negative_obs_ind: {
    'ui:widget': 'radio'
  }
};

const WaterbodyData = {
  waterbody_name_gazetted: {},
  waterbody_name_local: {},
  waterbody_type: {},
  reach_number: {},
  water_level_management: {},
  waterbody_use: {},
  adjacent_land_use: {},
  substrate_type: {},
  watershed_code: {},
  waterbody_id: {},
  tidal_influence: {
    'ui:widget': 'radio'
  }
};

const ProjectData = {
  project_id: {},
  fish_permit_number: {},
  start_date: {},
  completion_date: {},
  crew: {},
  purpose: {},
  targeted_species: {},
  method: {}
};

const TerrainCharacteristics = {
  setting: {},
  aspect: {},
  hillslope_coupling: {},
  lake_basin_genesis: {},
  land_use_percent: {},
  shoreline_type: {},
  percentage_of_type: {},
  cover: {},
  recreational_features: {},
  permanent_inlets: {},
  other_inlets: {},
  outlets: {},
  inlet_spawning_habitat: {}
};

const AquaticFlora = {
  emergent_vegetation: {},
  emergent_vegetation_dominant_species: {},
  submergent_vegetation: {},
  submergent_vegetation_dominant_species: {},
  voucher_specimens_collected: {},
  floating_algae_present: {
    'ui:widget': 'radio'
  }
};

const LimnologicalStationWaterQuality = {
  station_number: {},
  date_time: {},
  location: {},
  ems_number: {}
};

const WaterQuality = {
  water_sample: {},
  water_sample_depth: {},
  water_sample_requisition_number: {},
  surface_water_temperature: {},
  field_ph: {},
  turbidity: {},
  secchi_depth: {},
  water_colour: {},
  ice_depth: {}
};

const Profile = {
  depth: {},
  dissolved_oxygen: {},
  temperature: {},
  conductivity: {},
  thermocline: {}
};

const SubstrateSample = {
  date_installed: {},
  date_monitored: {},
  waterbody: {},
  site_location: {},
  depth: {},
  latitude: {},
  longitude: {},
  water_temperature: {},
  water_column_ph: {},
  secchi_depth: {},
  preservative_type: {},
  location_description: {
    'ui:widget': 'textarea'
  },
  comments: {
    'ui:widget': 'textarea'
  },
  microscopy_species: {
    'ui:widget': 'textarea'
  },
  e_dna_sample: {
    'ui:widget': 'textarea'
  },
  adult_suspected_presence: {
    'ui:widget': 'radio'
  },
  sample_collected: {
    'ui:widget': 'radio'
  }
};

const PlanktonTowSample = {
  tows: {},
  date_time: {},
  plankton_tow_type: {},
  tow_depth_length: {},
  volume_sampled: {},
  containers: {},
  preserved_sample_ph: {},
  arrival_sample_ph: {},
  preservative_type: {},
  preservation_concentration: {},
  other_species: {},
  veliger_positive: {
    'ui:widget': 'radio'
  },
  buffered: {
    'ui:widget': 'radio'
  }
};

const NetTrapSpecifications = {
  fish_permit_number: {},
  haul_number: {},
  date_time_in: {},
  date_time_out: {},
  net_trap_type: {},
  length: {},
  depth: {},
  mesh_size: {},
  mesh_description: {},
  zone: {},
  habitat: {},
  number_of_fish: {},
  min_length: {},
  max_length: {}
};

const ElectrofisherSpecifications = {
  fish_permit_number: {},
  passes: {},
  date_time_in: {},
  date_time_out: {},
  one_pass_time: {},
  length: {},
  width: {},
  enclosure: {},
  voltage: {},
  frequency: {},
  pulse: {},
  make: {},
  model: {},
  number_of_fish: {},
  min_length: {},
  max_length: {}
};

const EDna = {
  comment: {}
};

const HabitatAlteration = {
  comment: {}
};

const Chemical = {
  comment: {}
};

const Biological = {
  comment: {}
};

const FireMonitoringTransectPoints = {
  offset_distance: {}
};

const FireMonitoringTransectLines = {
  start_x_utm: {},
  start_y_utm: {},
  end_x_utm: {},
  end_y_utm: {},
  fire_monitoring_transect_points: {
    items: {
      ...FireMonitoringTransectPoints
    }
  }
};

const InvasivePlantDensityTransectPoints = {
  offset_distance: {}
};

const InvasivePlantDensityTransectLines = {
  start_x_utm: {},
  start_y_utm: {},
  end_x_utm: {},
  end_y_utm: {},
  invasive_plant_density_transect_points: {
    items: {
      ...InvasivePlantDensityTransectPoints
    }
  }
};

const FullVegetationTransectPoints = {
  offset_distance: {}
};

const FullVegetationTransectLines = {
  start_x_utm: {},
  start_y_utm: {},
  end_x_utm: {},
  end_y_utm: {},
  full_vegetation_transect_points: {
    items: {
      ...FullVegetationTransectPoints
    }
  }
};

const LumpedSpeciesVegetationTransectPoints = {
  offset_distance: {}
};

const LumpedSpeciesVegetationTransectLines = {
  start_x_utm: {},
  start_y_utm: {},
  end_x_utm: {},
  end_y_utm: {},
  lumped_species_vegetation_transect_points: {
    items: {
      ...LumpedSpeciesVegetationTransectPoints
    }
  }
};

const BiocontrolEfficacyTransectPoints = {
  offset_distance: {}
};

const BiocontrolEfficacyTransectLines = {
  start_x_utm: {},
  start_y_utm: {},
  end_x_utm: {},
  end_y_utm: {},
  biocontrol_efficacy_transect_points: {
    items: {
      ...BiocontrolEfficacyTransectPoints
    }
  }
};

const Observation = {
  observation_type_code: {},
  observer_first_name: {},
  observer_last_name: {},
  negative_obs_ind: {
    'ui:widget': 'radio'
  }
};

const Activity_AnimalTerrestrial = {
  comment: {
    'ui:widget': 'textarea'
  }
};

const Activity_AnimalAquatic = {
  comment: {
    'ui:widget': 'textarea'
  },
  net_trap_specifications: {
    ...ThreeColumnStyle,
    ...NetTrapSpecifications
  },
  electrofisher_specifications: {
    ...ThreeColumnStyle,
    ...ElectrofisherSpecifications
  },
  plankton_tow_sample: {
    ...ThreeColumnStyle,
    ...PlanktonTowSample
  },
  substrate_sample: {
    ...ThreeColumnStyle,
    ...SubstrateSample
  },
  edna: {
    ...ThreeColumnStyle,
    ...EDna
  },
  habitat_alteration: {
    ...ThreeColumnStyle,
    ...HabitatAlteration
  },
  chemical: {
    ...ThreeColumnStyle,
    ...Chemical
  },
  biological: {
    ...ThreeColumnStyle,
    ...Biological
  }
};

const Observation_PlantTerrestrial = {
  invasive_plant_density_code: {},
  invasive_plant_distribution_code: {},
  soil_texture_code: {},
  specific_use_code: {},
  slope_code: {},
  aspect_code: {},
  invasive_plant_code: {},
  plant_life_stage_code: {},
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

const Transect_FireMonitoring = {
  utm_zone: {},
  fire_monitoring_transect_lines: {
    items: {
      ...ThreeColumnStyle,
      ...FireMonitoringTransectLines
    }
  }
};

const Transect_InvasivePlantDensity = {
  utm_zone: {},
  invasive_plant_density_transect_lines: {
    items: {
      ...ThreeColumnStyle,
      ...InvasivePlantDensityTransectLines
    }
  }
};

const Transect_FullVegetation = {
  utm_zone: {},
  full_vegetation_transect_lines: {
    items: {
      ...ThreeColumnStyle,
      ...FullVegetationTransectLines
    }
  }
};

const Transect_LumpedSpeciesVegetation = {
  utm_zone: {},
  lumped_species_vegetation_transect_lines: {
    items: {
      ...ThreeColumnStyle,
      ...LumpedSpeciesVegetationTransectLines
    }
  }
};

const Transect_BiocontrolEfficacy = {
  utm_zone: {},
  biocontrol_efficacy_transect_lines: {
    items: {
      ...ThreeColumnStyle,
      ...BiocontrolEfficacyTransectLines
    }
  }
};

const Observation_PlantTerrestrial_BulkEdit = {
  specific_use_code: {},
  invasive_plant_code: {},
  early_detection_rapid_resp_ind: {
    'ui:widget': 'radio'
  }
};

const Observation_PlantAquatic = {
  waterbody_data: {
    ...ThreeColumnStyle,
    ...WaterbodyData
  },
  project_data: {
    ...ThreeColumnStyle,
    ...ProjectData
  },
  terrain_characteristics: {
    ...ThreeColumnStyle,
    ...TerrainCharacteristics
  },
  aquatic_flora: {
    ...ThreeColumnStyle,
    ...AquaticFlora
  },
  lake_bathymetry: {
    ...ThreeColumnStyle,
    ...LakeBathymetry
  },
  limnological_station_water_quality: {
    ...ThreeColumnStyle,
    ...LimnologicalStationWaterQuality
  },
  water_quality: {
    ...ThreeColumnStyle,
    ...WaterQuality
  },
  profile: {
    ...ThreeColumnStyle,
    ...Profile
  },
  substrate_sample: {
    ...ThreeColumnStyle,
    ...SubstrateSample
  },
  invasive_aquatic_plants: {
    items: {
      ...ThreeColumnStyle,
      ...AquaticPlants
    }
  }
};

const Observation_AnimalAquatic = {
  waterbody_data: {
    ...ThreeColumnStyle,
    ...WaterbodyData
  },
  project_data: {
    ...ThreeColumnStyle,
    ...ProjectData
  },
  terrain_characteristics: {
    ...ThreeColumnStyle,
    ...TerrainCharacteristics
  },
  aquatic_flora: {
    ...ThreeColumnStyle,
    ...AquaticFlora
  },
  lake_bathymetry: {
    ...ThreeColumnStyle,
    ...LakeBathymetry
  },
  limnological_station_water_quality: {
    ...ThreeColumnStyle,
    ...LimnologicalStationWaterQuality
  },
  water_quality: {
    ...ThreeColumnStyle,
    ...WaterQuality
  },
  profile: {
    ...ThreeColumnStyle,
    ...Profile
  },
  invasive_aquatic_animals: {
    items: {
      ...ThreeColumnStyle,
      ...AquaticAnimals
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

const Treatment_MechanicalPlant_BulkEdit = {
  invasive_plant_code: {},
  mechanical_method_code: {},
  mechanical_disposal_code: {}
};

const Treatment_BiologicalPlant = {
  classified_area_code: {},
  release_quantity: {},
  agent_source: {},
  biological_agent_code: {},
  biological_agent_stage_code: {},
  invasive_plant_code: {},
  bioagent_maturity_status_code: {},
  signage_on_site: {
    'ui:widget': 'radio'
  }
};

const Treatment_BiologicalPlant_BulkEdit = {
  invasive_plant_code: {},
  classified_area_code: {},
  biological_agent_code: {},
  biological_agent_stage_code: {},
  bioagent_maturity_status_code: {}
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

const BaseUISchemaComponents = {
  Activity_AnimalTerrestrial,
  Activity_AnimalAquatic,
  Observation,
  Observation_PlantTerrestrial,
  Observation_PlantTerrestrial_BulkEdit,
  Observation_PlantAquatic,
  Transect_FireMonitoring,
  Transect_InvasivePlantDensity,
  Transect_FullVegetation,
  Transect_LumpedSpeciesVegetation,
  Transect_BiocontrolEfficacy,
  Treatment,
  Treatment_BulkEdit,
  Treatment_MechanicalPlant,
  Treatment_MechanicalPlant_BulkEdit,
  Treatment_BiologicalPlant,
  Treatment_BiologicalPlant_BulkEdit,
  Treatment_MechanicalTerrestrialAnimal,
  Treatment_ChemicalTerrestrialAnimal,
  Treatment_BiologicalTerrestrialAnimal,
  Monitoring,
  Monitoring_BiologicalTerrestrialPlant,
  Monitoring_MechanicalTerrestrialAnimal,
  Monitoring_ChemicalTerrestrialAnimal,
  Monitoring_BiologicalTerrestrialAnimal,
  ProjectCode,
  Herbicide,
  InvasivePlants,
  ThreeColumnStyle
};

export default BaseUISchemaComponents;
