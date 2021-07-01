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

const Persons = {
  person_name: {}
};

const Jurisdictions = {
  jurisdiction_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  percent_covered: {}
};

const Herbicide = {
  liquid_herbicide_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  herbicide_amount: {},
  mix_delivery_rate: {},
  application_rate: {
    validateOnBlur: true
  },
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
  invasive_plant_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  plant_life_stage_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  invasive_plant_density_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  invasive_plant_distribution_code: {
    'ui:widget': 'single-select-autocomplete'
  }
};

const AquaticAnimals = {
  invasive_animal_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  early_detection_rapid_resp_ind: {},
  negative_obs_ind: {},
  life_stage: {
    'ui:widget': 'single-select-autocomplete'
  },
  sex: {},
  reproductive_maturity: {
    'ui:widget': 'single-select-autocomplete'
  },
  length: {},
  length_method: {},
  weight: {},
  behaviour: {
    'ui:widget': 'single-select-autocomplete'
  },
  condition: {
    'ui:widget': 'single-select-autocomplete'
  },
  captured: {},
  disposed: {},
  specimen_id: {},
  sample_collected: {},
  sample_id: {},
  sample_type: {
    'ui:widget': 'single-select-autocomplete'
  },
  age_analysis: {},
  genetic_analysis: {}
};

const AquaticPlants = {
  sample_point_id: {},
  invasive_plant_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  provincial_edrr: {},
  invasive_plant_density_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  invasive_plant_distribution_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  plant_life_stage_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  plant_health_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  plant_seed_stage_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  voucher_specimen_collected: {},
  e_dna_sample: {},
  genetic_structure_collected: {},
  genetic_sample_id: {},
  negative_obs_ind: {}
};

const WaterbodyData = {
  waterbody_name_gazetted: {},
  waterbody_name_local: {},
  waterbody_type: {
    'ui:widget': 'single-select-autocomplete'
  },
  waterbody_use: {}
};

const ProjectData = {
  surveyors: {},
  survey_type: {
    'ui:widget': 'single-select-autocomplete'
  }
};

const TerrainCharacteristics = {
  setting: {},
  aspect: {},
  hillslope_coupling: {},
  shoreline_type: {},
  cover: {},
  recreational_features: {},
  number_inlets: {},
  inlet_type: {},
  number_outlets: {},
  outlet_type: {}
};

const Access = {
  access_air: {},
  access_road: {},
  access_auto: {},
  access_off_road: {},
  access_off_road_distance: {},
  access_trail: {},
  access_trail_distance: {},
  access_closest_community: {},
  access_water_access: {},
  comments: {
    'ui:widget': 'textarea'
  }
};

const AquaticFlora = {
  emergent_vegetation: {},
  emergent_vegetation_dominant_species: {},
  submergent_vegetation: {},
  submergent_vegetation_dominant_species: {},
  floating_algae_present: {},
  lake_bathymetry: {},
  littoral_area: {},
  max_depth: {},
  benchmark: {},
  max_water_level: {},
  benchmark_type: {
    'ui:widget': 'textarea'
  }
};

const WaterQuality = {
  water_sample_depth: {},
  secchi_depth: {},
  water_colour: {}
};

const ConductivityProfile = {
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
  type: {},
  description: {
    'ui:widget': 'textarea'
  }
};

const Chemical = {
  type: {},
  description: {
    'ui:widget': 'textarea'
  }
};

const Biological = {
  type: {},
  description: {
    'ui:widget': 'textarea'
  }
};

const ShorelineSurveys = {
  date_time: {},
  waterbody: {},
  target_species: {},
  weather_conditions: {},
  sampling_distance: {},
  sampling_location_lat: {},
  sampling_location_lng: {},
  substrate_type: {},
  species_present: {},
  density: {},
  diameter_largest_individual: {},
  other_species_found: {},
  comments: {
    'ui:widget': 'textarea'
  }
};

const SurveyData = {
  survey_design: {},
  survey_start_date_time: {},
  survey_end_date_time: {},
  survey_details: {}
};

const TreatmentData = {
  treatment_start_date_time: {},
  treatment_end_date_time: {},
  permit_number: {},
  survey_details: {}
};

const MonitoringData = {
  monitoring_start_date_time: {},
  monitoring_end_date_time: {},
  monitoring_results: {
    'ui:widget': 'textarea'
  },
  comment: {
    'ui:widget': 'textarea'
  }
};

const InvasivePlants = {
  invasive_plant_code: {
    'ui:widget': 'single-select-autocomplete'
  }
};

/*
  Transect
*/

const TransectInvasivePlants = {
  invasive_plant_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  invasive_plant_density_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  invasive_plant_distribution_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  soil_texture_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  linear_infestation: {},
  biological_agent_code: {
    'ui:widget': 'single-select-autocomplete'
  }
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
  realm_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  site_aspect: {},
  site_aspect_variability: {},
  site_slope: {},
  site_slope_variability: {},
  site_elevation: {},
  cloud_cover_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  beaufort_wind_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  precipitation_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  burn_severity_code: {},
  ecological_moisture_regime_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  mesoslope_position_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  site_surface_shape_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  soil_properties_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  surface_substrate_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  site_activity_disturbance: {},
  disturbance_site_defunct: {},
  disturbance_condition_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  disturbance_type_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  invasive_plant_change_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  target_plant_change_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  treatment_seeded: {},
  density_count_type_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  trace_plants: {},
  growth_pattern: {},
  frame_size_code: {},
  biocontrol_noted_code: {},
  photoplot_start: {},
  photoplot_end: {},
  photoplot_aerials: {},
  photoplot_full_25m: {},
  plot_location: {}
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
  invasive_plant_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  percent_covered: {}
};

const InvasivePlantsNumberPlants = {
  invasive_plant_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  number_plants: {}
};

const InvasivePlantsDaubenmire = {
  invasive_plant_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  daubenmire_classification: {
    'ui:widget': 'single-select-autocomplete'
  }
};

const LumpedSpeciesNumberPlants = {
  lumped_species_type: {
    'ui:widget': 'single-select-autocomplete'
  },
  number_plants: {}
};

const LumpedSpeciesPercentCover = {
  lumped_species_type: {
    'ui:widget': 'single-select-autocomplete'
  },
  percent_covered: {
    'ui:widget': 'single-select-autocomplete'
  }
};

const LumpedSpeciesDaubenmire = {
  lumped_species_type: {
    'ui:widget': 'single-select-autocomplete'
  },
  daubenmire_classification: {
    'ui:widget': 'single-select-autocomplete'
  }
};

const CustomSpeciesPercentCover = {
  custom_species_type: {
    'ui:widget': 'single-select-autocomplete'
  },
  percent_covered: {}
};

const CustomSpeciesNumberPlants = {
  custom_species_type: {
    'ui:widget': 'single-select-autocomplete'
  },
  number_plants: {}
};

const CustomSpeciesDaubenmire = {
  custom_species_type: {
    'ui:widget': 'single-select-autocomplete'
  },
  daubenmire_classification: {
    'ui:widget': 'single-select-autocomplete'
  }
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
  veg_total_percentage: {
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
  observation_type_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  observation_persons: {
    items: {
      ...Persons
    }
  }
};

const Observation_PlantTerrestrial_Data = {
  soil_texture_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  specific_use_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  slope_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  aspect_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  research_detection_ind: {},
  well_ind: {},
  special_care_ind: {}
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
    ...WaterbodyData,
    water_level_management: {
      'ui:widget': 'single-select-autocomplete'
    },
    substrate_type: {
      'ui:widget': 'single-select-autocomplete'
    },
    tidal_influence: {},
    comment: {
      'ui:widget': 'textarea'
    }
  },
  project_data: {
    ...TwoColumnStyle,
    ...ProjectData
  },
  terrain_characteristics: {
    ...ThreeColumnStyle,
    adjacent_land_use: {},
    inflow_permanent: {},
    inflow_other: {},
    outflow: {},
    shoreline_types: {}
  },
  water_quality: {
    ...ThreeColumnStyle,
    ...WaterQuality
  },
  invasive_plants: {
    items: {
      ...ThreeColumnStyle,
      ...AquaticPlants
    }
  }
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
  site_information: {
    waterbody_data: {
      ...FourColumnStyle,
      ...WaterbodyData,
      reach_number: {},
      adjacent_land_use: {},
      watershed_code: {},
      waterbody_id: {},
      additional_site_features: {
        'ui:widget': 'textarea'
      },
      comment: {
        'ui:widget': 'textarea'
      }
    },
    terrain_characteristics: {
      ...FourColumnStyle,
      ...TerrainCharacteristics
    },
    access: {
      ...FourColumnStyle,
      ...Access
    },
    aquatic_flora: {
      ...ThreeColumnStyle,
      ...AquaticFlora
    },
    water_quality: {
      ...ThreeColumnStyle,
      ...WaterQuality,
      water_sample: {},
      water_sample_requisition_number: {},
      surface_water_temperature: {},
      field_ph: {},
      turbidity: {},
      ice_depth: {}
    },
    conductivity_profile: {
      ...ThreeColumnStyle,
      ...ConductivityProfile
    }
  },
  activity_data: {
    survey_data: {
      ...TwoColumnStyle,
      ...SurveyData
    },
    treatment_data: {
      ...TwoColumnStyle,
      ...TreatmentData
    },
    monitoring_data: {
      ...TwoColumnStyle,
      ...MonitoringData
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
    shoreline_surveys: {
      ...ThreeColumnStyle,
      ...ShorelineSurveys
    },
    edna: {
      ...ThreeColumnStyle,
      ...EDna
    },
    habitat_alteration: {
      ...TwoColumnStyle,
      ...HabitatAlteration
    },
    chemical: {
      ...TwoColumnStyle,
      ...Chemical
    },
    biological: {
      ...TwoColumnStyle,
      ...Biological
    }
  }
};

/*
  Dispersal
*/

const Dispersal_BiologicalDispersal = {
  monitoring_organization: {},
  biological_agent_presence_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  count_duration: {},
  biological_agent_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  plant_count: {},
  biological_agent_count: {},
  applicator1_name: {},
  applicator2_name: {},
  treatment_organization: {},
  invasive_plant_code: {
    'ui:widget': 'single-select-autocomplete'
  },
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
      ...Persons
    }
  }
};

const Treatment_MechanicalPlant = {
  invasive_plant_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  mechanical_method_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  mechanical_disposal_code: {
    'ui:widget': 'single-select-autocomplete'
  }
};

const Treatment_MechanicalPlant_BulkEdit = {
  invasive_plant_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  mechanical_method_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  mechanical_disposal_code: {
    'ui:widget': 'single-select-autocomplete'
  }
};

const Treatment_BiologicalPlant = {
  invasive_plant_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  treatment_issues_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  classified_area_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  release_quantity: {},
  mortality: {},
  agent_source: {},
  biological_agent_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  biological_agent_stage_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  bioagent_maturity_status_code: {
    'ui:widget': 'single-select-autocomplete'
  }
};

const Treatment_BiologicalPlant_BulkEdit = {
  invasive_plant_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  classified_area_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  biological_agent_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  biological_agent_stage_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  bioagent_maturity_status_code: {
    'ui:widget': 'single-select-autocomplete'
  }
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
  efficacy_code: {
    'ui:widget': 'single-select-autocomplete'
  }
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
