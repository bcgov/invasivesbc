/**
 * This file should only contain UI Schema items that have NO nested elements.
 *
 * Example of schema item without nested element:
 *
 * const Obj = {
 *   some_field: {}
 * }
 */

/*
  Styling
*/

const FourColumnStyle = {
  'ui:column-xs': 12,
  'ui:column-md': 6,
  'ui:column-lg': 3
};

const ThreeColumnStyle = {
  'ui:column-xs': 12,
  'ui:column-md': 6,
  'ui:column-lg': 4
};

const TwoColumnStyle = {
  'ui:column-xs': 12,
  'ui:column-md': 6,
  'ui:column-lg': 6
};

const TreatmentPersons = {
  person_name: {}
};

const Jurisdictions = {
  jurisdiction_code: {},
  percent_covered: {}
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

const TerrestrialPlants = {
  invasive_plant_code: {},
  plant_life_stage_code: {},
  invasive_plant_density_code: {},
  invasive_plant_distribution_code: {}
};

const AquaticAnimals = {
  invasive_animal_code: {},
  early_detection_rapid_resp_ind: {},
  negative_obs_ind: {},
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
  flowering: {},
  early_detection_rapid_resp_ind: {},
  negative_obs_ind: {}
};

const LakeBathymetry = {
  survey_type: {},
  littoral_area: {},
  max_depth: {},
  benchmark: {},
  max_water_level: {},
  benchmark_type: {}
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
  tidal_influence: {}
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
  floating_algae_present: {}
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
  adult_suspected_presence: {},
  sample_collected: {}
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
  veliger_positive: {},
  buffered: {}
};

const NetTrapSpecifications = {
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
  substrate_type: {}
};

const ElectrofisherSpecifications = {
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
  model: {}
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

const InvasivePlants = {
  invasive_plant_code: {}
};

/*
  Transect
*/

const TransectInvasivePlants = {
  invasive_plant_code: {},
  invasive_plant_density_code: {},
  invasive_plant_distribution_code: {},
  soil_texture_code: {},
  linear_infestation: {},
  biological_agent_code: {}
};

const TransectLine = {
  transect_line_id: {},
  transect_comment: {},
  start_x_utm: {},
  start_y_utm: {},
  end_x_utm: {},
  end_y_utm: {},
  transect_length: {
    'ui:readonly': true
  },
  transect_bearing: {
    'ui:readonly': true
  }
};

const TransectData = {
  utm_zone: {},
  transect_start_date_time: {},
  transect_end_date_time: {},
  project_number: {},
  surveyor1_name: {},
  surveyor2_name: {},
  field_recorder_name: {},
  research_trial_code: {},
  realm_code: {},
  site_aspect: {},
  site_aspect_variability: {},
  site_slope: {},
  site_slope_variability: {},
  site_elevation: {},
  cloud_cover_code: {},
  beaufort_wind_code: {},
  precipitation_code: {},
  burn_severity_code: {},
  ecological_moisture_regime_code: {},
  mesoslope_position_code: {},
  site_surface_shape_code: {},
  soil_properties_code: {},
  surface_substrate_code: {},
  site_activity_disturbance: {},
  disturbance_site_defunct: {},
  disturbance_condition_code: {},
  disturbance_type_code: {},
  invasive_plant_change_code: {},
  target_plant_change_code: {},
  treatment_seeded: {},
  density_count_type_code: {},
  trace_plants: {},
  growth_pattern: {},
  frame_size_code: {},
  biocontrol_noted_code: {},
  photoplot_start: {},
  photoplot_end: {},
  photoplot_aerials: {},
  photoplot_full_25m: {}
};

const FireMonitoringTransectPoints = {
  sample_point_id: {},
  offset_distance: {},
  utm_x: {
    'ui:readonly': true
  },
  utm_y: {
    'ui:readonly': true
  },
  veg_transect_sampler: {},
  veg_transect_recorder: {},
  veg_transect_native_forbs: {},
  veg_transect_grasses: {},
  veg_transect_bare_ground: {},
  veg_transect_shrubs: {},
  veg_transect_bryophytes: {},
  veg_transect_litter: {},
  invasive_plants: {
    items: {
      ...InvasivePlants
    }
  }
};

const FireMonitoringTransectLines = {
  transect_line: {
    ...TwoColumnStyle,
    ...TransectLine
  },
  fire_monitoring_transect_points: {
    items: {
      ...FourColumnStyle,
      ...FireMonitoringTransectPoints
    }
  }
};

const Transect_FireMonitoring = {
  transect_data: {
    ...ThreeColumnStyle,
    ...TransectData
  },
  fire_monitoring_transect_lines: {
    items: {
      ...FireMonitoringTransectLines
    }
  }
};

const VegetationTransectPoints = {
  sample_point_id: {},
  offset_distance: {},
  utm_x: {
    'ui:readonly': true
  },
  utm_y: {
    'ui:readonly': true
  }
};

const InvasivePlantsPercentCover = {
  invasive_plant_code: {},
  percent_covered: {}
};

const InvasivePlantsNumberPlants = {
  invasive_plant_code: {},
  number_plants: {}
};

const InvasivePlantsDaubenmire = {
  invasive_plant_code: {},
  daubenmire_classification: {}
};

const LumpedSpeciesNumberPlants = {
  lumped_species_type: {},
  number_plants: {}
};

const LumpedSpeciesPercentCover = {
  lumped_species_type: {},
  percent_covered: {}
};

const LumpedSpeciesDaubenmire = {
  lumped_species_type: {},
  daubenmire_classification: {}
};

const CustomSpeciesPercentCover = {
  custom_species_type: {},
  percent_covered: {}
};

const CustomSpeciesNumberPlants = {
  custom_species_type: {},
  number_plants: {}
};

const CustomSpeciesDaubenmire = {
  custom_species_type: {},
  daubenmire_classification: {}
};

const VegetationTransectSpeciesPercentCover = {
  invasive_plants: {
    items: {
      ...InvasivePlantsPercentCover
    }
  },
  lumped_species: {
    items: {
      ...LumpedSpeciesPercentCover
    }
  },
  custom_species: {
    items: {
      ...CustomSpeciesPercentCover
    }
  }
};

const VegetationTransectSpeciesNumberPlants = {
  invasive_plants: {
    items: {
      ...InvasivePlantsNumberPlants
    }
  },
  lumped_species: {
    items: {
      ...LumpedSpeciesNumberPlants
    }
  },
  custom_species: {
    items: {
      ...CustomSpeciesNumberPlants
    }
  }
};

const VegetationTransectSpeciesDaubenmire = {
  invasive_plants: {
    items: {
      ...InvasivePlantsDaubenmire
    }
  },
  lumped_species: {
    items: {
      ...LumpedSpeciesDaubenmire
    }
  },
  custom_species: {
    items: {
      ...CustomSpeciesDaubenmire
    }
  }
};

const VegetationTransectPointsPercentCover = {
  vegetation_transect_points: {
    ...FourColumnStyle,
    ...VegetationTransectPoints
  },
  vegetation_transect_species: {
    ...ThreeColumnStyle,
    ...VegetationTransectSpeciesPercentCover
  }
};

const VegetationTransectPointsNumberPlants = {
  vegetation_transect_points: {
    ...FourColumnStyle,
    ...VegetationTransectPoints
  },
  vegetation_transect_species: {
    ...ThreeColumnStyle,
    ...VegetationTransectSpeciesNumberPlants
  }
};

const VegetationTransectPointsDaubenmire = {
  vegetation_transect_points: {
    ...FourColumnStyle,
    ...VegetationTransectPoints
  },
  vegetation_transect_species: {
    ...ThreeColumnStyle,
    ...VegetationTransectSpeciesDaubenmire
  }
};

const VegetationTransectLines = {
  transect_line: {
    ...TwoColumnStyle,
    ...TransectLine
  },
  vegetation_transect_points_percent_cover: {
    items: {
      ...VegetationTransectPointsPercentCover
    }
  },
  vegetation_transect_points_number_plants: {
    items: {
      ...VegetationTransectPointsNumberPlants
    }
  },
  vegetation_transect_points_daubenmire: {
    items: {
      ...VegetationTransectPointsDaubenmire
    }
  }
};

const Transect_Vegetation = {
  transect_data: {
    ...ThreeColumnStyle,
    ...TransectData
  },
  vegetation_transect_lines: {
    items: {
      ...VegetationTransectLines
    }
  }
};

const BiocontrolEfficacyTransectPoints = {
  sample_point_id: {},
  offset_distance: {},
  utm_x: {
    'ui:readonly': true
  },
  utm_y: {
    'ui:readonly': true
  },
  veg_transect_sampler: {},
  veg_transect_recorder: {},
  veg_transect_target: {},
  veg_transect_other_ips: {},
  veg_transect_native_forbs: {},
  veg_transect_grasses: {},
  veg_transect_bare_ground: {},
  veg_transect_shrubs: {},
  veg_transect_bryophytes: {},
  veg_transect_litter: {},
  phen_transect_sampler: {},
  phen_transect_recorder: {},
  phen_transect_seedlings: {},
  phen_transect_rosettes: {},
  phen_transect_bolting: {},
  phen_transect_flowering: {},
  phen_transect_seeds: {},
  phen_transect_senescent: {},
  phen_total_plants: {},
  phen_number_stems: {},
  phen_tallest_1: {},
  phen_tallest_2: {},
  phen_tallest_3: {},
  phen_tallest_4: {},
  phen_level_se: {},
  phen_level_ro: {},
  phen_level_bo: {},
  phen_level_fl: {},
  phen_level_sf: {},
  phen_level_sc: {},
  phen_total_percentage: {
    'ui:readonly': true
  }
};

const BiocontrolEfficacyTransectLines = {
  transect_line: {
    ...TwoColumnStyle,
    ...TransectLine
  },
  biocontrol_efficacy_transect_points: {
    items: {
      ...FourColumnStyle,
      ...BiocontrolEfficacyTransectPoints
    }
  }
};

const Transect_BiocontrolEfficacy = {
  transect_data: {
    ...ThreeColumnStyle,
    ...TransectData
  },
  transect_invasive_plants: {
    items: {
      ...ThreeColumnStyle,
      ...TransectInvasivePlants
    }
  },
  biocontrol_efficacy_transect_lines: {
    items: {
      ...BiocontrolEfficacyTransectLines
    }
  }
};

/*
  Observation
*/

const Observation = {
  observation_type_code: {},
  observer_first_name: {},
  observer_last_name: {},
  negative_obs_ind: {}
};

const Observation_PlantTerrestrial_Data = {
  soil_texture_code: {},
  specific_use_code: {},
  slope_code: {},
  aspect_code: {},
  research_detection_ind: {},
  well_ind: {},
  special_care_ind: {},
  biological_ind: {}
};

const Observation_PlantTerrestrial = {
  observation_plant_terrestrial_data: {
    ...FourColumnStyle,
    ...Observation_PlantTerrestrial_Data
  },
  invasive_plants: {
    items: {
      ...FourColumnStyle,
      ...TerrestrialPlants
    }
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
  invasive_plants: {
    items: {
      ...ThreeColumnStyle,
      ...AquaticPlants
    }
  }
};

const SurveyData = {
  survey_design: {},
  survey_start_date_time: {},
  survey_end_date_time: {},
  survey_details: {}
};

/*
  Animal Activity
*/

const Activity_AnimalTerrestrial = {
  comment: {
    'ui:widget': 'textarea'
  }
};

const Activity_AnimalAquatic = {
  invasive_aquatic_animals: {
    items: {
      ...ThreeColumnStyle,
      ...AquaticAnimals
    }
  },
  activity_data: {
    survey_data: {
      ...TwoColumnStyle,
      ...SurveyData
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
  }
};

/*
  Dispersal
*/

const Dispersal_BiologicalDispersal = {
  monitoring_organization: {},
  biological_agent_presence_code: {},
  count_duration: {},
  biological_agent_code: {},
  plant_count: {},
  biological_agent_count: {},
  applicator1_name: {},
  applicator2_name: {},
  treatment_organization: {},
  invasive_plant_code: {}
};

/*
  Treatment
*/

const Treatment = {
  activity_id: {
    'ui:readonly': true
  },
  treatment_organization: {},
  treatment_location: {
    'ui:widget': 'textarea'
  },
  treatment_persons: {
    items: {
      ...TreatmentPersons
    }
  }
};

const Treatment_MechanicalPlant = {
  invasive_plant_code: {},
  mechanical_method_code: {},
  mechanical_disposal_code: {}
};

const Treatment_MechanicalPlant_BulkEdit = {
  invasive_plant_code: {},
  mechanical_method_code: {},
  mechanical_disposal_code: {}
};

const Treatment_BiologicalPlant = {
  invasive_plant_code: {},
  treatment_issues_code: {},
  classified_area_code: {},
  release_quantity: {},
  mortality: {},
  agent_source: {},
  biological_agent_code: {},
  biological_agent_stage_code: {},
  bioagent_maturity_status_code: {}
};

const Treatment_BiologicalPlant_BulkEdit = {
  invasive_plant_code: {},
  classified_area_code: {},
  biological_agent_code: {},
  biological_agent_stage_code: {},
  bioagent_maturity_status_code: {}
};

/*
  Monitoring
*/

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
  agent_destroyed_ind: {},
  legacy_presence_ind: {},
  foliar_feeding_damage_ind: {},
  root_feeding_damage_ind: {},
  oviposition_marks_ind: {},
  eggs_present_ind: {},
  larvae_present_ind: {},
  pupae_present_ind: {},
  adults_present_ind: {},
  tunnels_present_ind: {},
  biological_agent_spread: {}
};

/*
  Export
*/

const BaseUISchemaComponents = {
  Activity_AnimalTerrestrial,
  Activity_AnimalAquatic,
  Observation,
  Observation_PlantTerrestrial,
  Observation_PlantAquatic,
  Transect_FireMonitoring,
  Transect_Vegetation,
  Transect_BiocontrolEfficacy,
  Dispersal_BiologicalDispersal,
  Treatment,
  Treatment_MechanicalPlant,
  Treatment_MechanicalPlant_BulkEdit,
  Treatment_BiologicalPlant,
  Treatment_BiologicalPlant_BulkEdit,
  Monitoring,
  Monitoring_BiologicalTerrestrialPlant,
  ProjectCode,
  Herbicide,
  FourColumnStyle,
  ThreeColumnStyle,
  TwoColumnStyle,
  Jurisdictions
};

export default BaseUISchemaComponents;
