/**
 *
 * This file should contain UI Schema items.
 *
 */

/**
 * ------------------  Styling  -----------------------
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
const OneColumnStyle = {
  'ui:column-xs': 12,
  'ui:column-md': 12,
  'ui:column-lg': 12
};

/**
 * ------------------  Activity Data Objects  -----------------------
 */

const Activity = {
  activity_date_time: { 'ui:widget': 'datetime' },
  reported_area: { 'ui:readonly': true },
  latitude: { 'ui:readonly': true },
  longitude: { 'ui:readonly': true },
  utm_zone: { 'ui:readonly': true },
  utm_easting: { 'ui:readonly': true },
  utm_northing: { 'ui:readonly': true },
  employer_code: { 'ui:widget': 'single-select-autocomplete' },
  invasive_species_agency_code: { 'ui:widget': 'multi-select-autocomplete' },
  jurisdictions: {
    items: {
      jurisdiction_code: { 'ui:widget': 'single-select-autocomplete' },
      percent_covered: {}
    }
  },
  location_description: { 'ui:widget': 'textarea' },
  access_description: { 'ui:widget': 'textarea' },
  project_code: {},
  general_comment: { 'ui:widget': 'textarea' },
  'ui:order': [
    'activity_date_time',
    'reported_area',
    'latitude',
    'longitude',
    'utm_zone',
    'utm_easting',
    'utm_northing',
    'employer_code',
    'invasive_species_agency_code',
    'jurisdictions',
    'location_description',
    'access_description',
    'project_code',
    'general_comment'
  ]
};

/**
 * ------------------  Activity Type Data Objects  -----------------------
 */

const Observation = {
  pre_treatment_observation: {},
  activity_persons: {},
  'ui:order': ['pre_treatment_observation', 'activity_persons']
};

const Monitoring = {
  linked_id: { 'ui:widget': 'single-select-autocomplete' },
  copy_geometry: { 'ui:widget': 'single-select-autocomplete' },
  activity_persons: {},
  'ui:order': [
    'linked_id',
    'copy_geometry',
    'activity_persons'
  ]
};

const Monitoring_Biocontrol_Release = {
  linked_id: { 'ui:widget': 'single-select-autocomplete' },
  legacy_iapp_id: {},
  activity_persons: {},
  'ui:order': ['linked_id', 'legacy_iapp_id', 'activity_persons']
};

const Monitoring_Biocontrol = {
  activity_persons: {},
  'ui:order': ['activity_persons']
};

const Treatment = {
  activity_persons: {},
  'ui:order': ['activity_persons']
};

const Treatment_Chemical = {
  activity_persons: {},
  'ui:order': ['activity_persons']
};

const Collection = {
  activity_persons: {},
  'ui:order': ['activity_persons']
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
  realm_code: { 'ui:widget': 'single-select-autocomplete' },
  site_aspect: {},
  site_aspect_variability: {},
  site_slope: {},
  site_slope_variability: {},
  site_elevation: {},
  precipitation_code: { 'ui:widget': 'single-select-autocomplete' },
  burn_severity_code: {},
  ecological_moisture_regime_code: { 'ui:widget': 'single-select-autocomplete' },
  mesoslope_position_code: { 'ui:widget': 'single-select-autocomplete' },
  site_surface_shape_code: { 'ui:widget': 'single-select-autocomplete' },
  soil_properties_code: { 'ui:widget': 'single-select-autocomplete' },
  surface_substrate_code: { 'ui:widget': 'single-select-autocomplete' },
  site_activity_disturbance: {},
  disturbance_site_defunct: {},
  disturbance_condition_code: { 'ui:widget': 'single-select-autocomplete' },
  disturbance_type_code: { 'ui:widget': 'single-select-autocomplete' },
  invasive_plant_change_code: { 'ui:widget': 'single-select-autocomplete' },
  target_plant_change_code: { 'ui:widget': 'single-select-autocomplete' },
  treatment_seeded: {},
  density_count_type_code: { 'ui:widget': 'single-select-autocomplete' },
  trace_plants: {},
  growth_pattern: {},
  frame_size_code: {},
  biocontrol_noted_code: {},
  photoplot_start: {},
  photoplot_end: {},
  photoplot_aerials: {},
  photoplot_full_25m: {},
  plot_location: {},
  veg_transect_sampler: {},
  veg_transect_recorder: {},
  'ui:order': [
    'utm_zone',
    'transect_start_date_time',
    'transect_end_date_time',
    'project_number',
    'surveyor1_name',
    'surveyor2_name',
    'field_recorder_name',
    'research_trial_code',
    'realm_code',
    'site_aspect',
    'site_aspect_variability',
    'site_slope',
    'site_slope_variability',
    'site_elevation',
    'precipitation_code',
    'burn_severity_code',
    'ecological_moisture_regime_code',
    'mesoslope_position_code',
    'site_surface_shape_code',
    'soil_properties_code',
    'surface_substrate_code',
    'site_activity_disturbance',
    'disturbance_site_defunct',
    'disturbance_condition_code',
    'disturbance_type_code',
    'invasive_plant_change_code',
    'target_plant_change_code',
    'treatment_seeded',
    'density_count_type_code',
    'trace_plants',
    'growth_pattern',
    'frame_size_code',
    'biocontrol_noted_code',
    'photoplot_start',
    'photoplot_end',
    'photoplot_aerials',
    'photoplot_full_25m',
    'plot_location',
    'veg_transect_sampler',
    'veg_transect_recorder'
  ]
};

/**
 * ------------------------  General Objects  -----------------------------
 */

const Biocontrol_Release_Biological_Agent_Stage = {
  biological_agent_stage_code: { 'ui:widget': 'single-select-autocomplete' },
  release_quantity: {},
  'ui:order': ['biological_agent_stage_code', 'release_quantity']
};

const Biological_Agent_Stage = {
  biological_agent_stage_code: { 'ui:widget': 'single-select-autocomplete' },
  release_quantity: {},
  plant_position: { 'ui:widget': 'single-select-autocomplete' },
  agent_location: { 'ui:widget': 'single-select-autocomplete' },
  'ui:order': ['biological_agent_stage_code', 'release_quantity', 'plant_position', 'agent_location']
};

const Well_Information = {
  items: {
    ...TwoColumnStyle,
    well_id: { 'ui:readonly': true },
    well_proximity: { 'ui:readonly': true },
    'ui:order': ['well_id', 'well_proximity']
  },
  'ui:options': {
    addable: false,
    orderable: false,
    removable: false
  }
};

const ShorelineTypes = {
  items: {
    ...TwoColumnStyle,
    shoreline_type: { 'ui:widget': 'single-select-autocomplete' },
    percent_covered: {}
  }
};

const Authorization_Infotmation = {
  additional_auth_information: {},
  'ui:order': ['additional_auth_information']
};

const WaterQuality = {
  ...ThreeColumnStyle,
  water_sample_depth: {},
  secchi_depth: {},
  water_colour: {},
  'ui:order': ['water_sample_depth', 'secchi_depth', 'water_colour']
};

const TerrestrialPlant = {
  ...ThreeColumnStyle,
  invasive_plant_code: { 'ui:widget': 'single-select-autocomplete' },
  observation_type: {},
  edna_sample: { 'ui:widget': 'single-select-autocomplete' },
  invasive_plant_density_code: { 'ui:widget': 'single-select-autocomplete' },
  invasive_plant_distribution_code: { 'ui:widget': 'single-select-autocomplete' },
  plant_life_stage_code: { 'ui:widget': 'single-select-autocomplete' },
  voucher_specimen_collected: {},
  voucher_specimen_collection_information: {
    voucher_sample_id: {},
    date_voucher_collected: {},
    date_voucher_verified: {},
    name_of_herbarium: {},
    accession_number: {},
    voucher_verification_completed_by: {},
    exact_utm_coords: {}
  },
  edna_sample_information: {
    edna_sample_id: {},
    genetic_structure_collected: {}
  },
  'ui:order': [
    'invasive_plant_code',
    'observation_type',
    'edna_sample',
    'invasive_plant_density_code',
    'invasive_plant_distribution_code',
    'plant_life_stage_code',
    'voucher_specimen_collected',
    'voucher_specimen_collection_information',
    'edna_sample_information'
  ]
};

const TerrestrialPlants = {
  items: {
    ...TerrestrialPlant
  }
};

const AquaticPlant = {
  ...ThreeColumnStyle,
  sample_point_id: {},
  invasive_plant_code: { 'ui:widget': 'single-select-autocomplete' },
  observation_type: {},
  invasive_plant_density_code: { 'ui:widget': 'single-select-autocomplete' },
  invasive_plant_distribution_code: { 'ui:widget': 'single-select-autocomplete' },
  plant_life_stage_code: { 'ui:widget': 'single-select-autocomplete' },
  voucher_specimen_collected: {},
  edna_sample: { 'ui:widget': 'single-select-autocomplete' },
  genetic_sample_id: {},
  genetic_structure_collected: {},
  edna_sample_information: {
    edna_sample_id: {},
    sample_type: { 'ui:widget': 'single-select-autocomplete' },
    field_replicates_num: {},
    efficacy_code: { 'ui:widget': 'select' }
  }
};

const AquaticPlants = {
  items: {
    ...AquaticPlant
  }
};

const WaterbodyData = {
  ...ThreeColumnStyle,
  waterbody_type: { 'ui:widget': 'single-select-autocomplete' },
  waterbody_name_gazetted: {},
  waterbody_name_local: {},
  waterbody_access: {},
  waterbody_use: { 'ui:widget': 'multi-select-autocomplete' },
  'ui:order': ['waterbody_type', 'waterbody_name_gazetted', 'waterbody_name_local', 'waterbody_access', 'waterbody_use']
};

const WaterbodyData_AdditionalFields = {
  water_level_management: { 'ui:widget': 'multi-select-autocomplete' },
  substrate_type: { 'ui:widget': 'multi-select-autocomplete' },
  tidal_influence: {},
  adjacent_land_use: { 'ui:widget': 'multi-select-autocomplete' },
  inflow_permanent: { 'ui:widget': 'multi-select-autocomplete' },
  inflow_other: { 'ui:widget': 'multi-select-autocomplete' },
  outflow: { 'ui:widget': 'multi-select-autocomplete' },
  outflow_other: { 'ui:widget': 'multi-select-autocomplete' },
  comment: { 'ui:widget': 'textarea' },
  'ui:order': [
    'waterbody_type',
    'waterbody_name_gazetted',
    'waterbody_name_local',
    'waterbody_access',
    'waterbody_use',
    'water_level_management',
    'substrate_type',
    'tidal_influence',
    'adjacent_land_use',
    'inflow_permanent',
    'inflow_other',
    'outflow',
    'outflow_other',
    'comment'
  ]
};

const Weather_Conditions = {
  ...ThreeColumnStyle,
  temperature: { validateOnBlur: true },
  cloud_cover_code: { 'ui:widget': 'single-select-autocomplete' },
  precipitation_code: { 'ui:widget': 'single-select-autocomplete' },
  wind_speed: { validateOnBlur: true },
  wind_direction_code: { 'ui:widget': 'single-select-autocomplete' },
  weather_comments: { 'ui:widget': 'textarea' },
  'ui:order': [
    'temperature',
    'cloud_cover_code',
    'precipitation_code',
    'wind_speed',
    'wind_direction_code',
    'weather_comments'
  ]
};

const Microsite_Conditions = {
  ...TwoColumnStyle,
  mesoslope_position_code: { 'ui:widget': 'single-select-autocomplete' },
  site_surface_shape_code: { 'ui:widget': 'single-select-autocomplete' },
  'ui:order': ['mesoslope_position_code', 'site_surface_shape_code']
};

const Pest_Injury_Threshold_Determination = {
  completed_radio: {
    'ui:widget': 'radio'
  },
  'ui:order': ['completed_radio']
};

const Target_Plant_Phenology = {
  ...ThreeColumnStyle,
  phenology_details_recorded: {},
  winter_dormant: {},
  seedlings: {},
  rosettes: {},
  bolts: {},
  flowering: {},
  seeds_forming: {},
  senescent: {},
  target_plant_height: {},
  'ui:order': [
    'phenology_details_recorded',
    'target_plant_heights',
    'winter_dormant',
    'seedlings',
    'rosettes',
    'bolts',
    'flowering',
    'seeds_forming',
    'senescent',
    'target_plant_height'
  ]
};

const Spread_Results = {
  ...ThreeColumnStyle,
  spread_details_recorded: {},
  agent_density: {},
  plant_attack: {},
  max_spread_distance: {},
  max_spread_aspect: {},
  'ui:order': ['spread_details_recorded', 'agent_density', 'plant_attack', 'max_spread_distance', 'max_spread_aspect']
};

const TransectLine = {
  ...ThreeColumnStyle,
  transect_line_id: {},
  transect_comment: { 'ui:widget': 'textarea' },
  start_x_utm: {},
  start_y_utm: {},
  end_x_utm: {},
  end_y_utm: {},
  transect_length: { 'ui:readonly': true },
  transect_bearing: { 'ui:readonly': true },
  'ui:order': [
    'transect_line_id',
    'transect_comment',
    'start_x_utm',
    'start_y_utm',
    'end_x_utm',
    'end_y_utm',
    'transect_length',
    'transect_bearing'
  ]
};

const InvasivePlants = {
  invasive_plant_code: { 'ui:widget': 'single-select-autocomplete' },
  'ui:order': ['invasive_plant_code']
};

const FireMonitoringTransectPoints = {
  ...ThreeColumnStyle,
  sample_point_id: {},
  offset_distance: {},
  utm_x: { 'ui:readonly': true },
  utm_y: { 'ui:readonly': true },
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
  },
  'ui:order': [
    'sample_point_id',
    'offset_distance',
    'utm_x',
    'utm_y',
    'veg_transect_native_forbs',
    'veg_transect_grasses',
    'veg_transect_bare_ground',
    'veg_transect_shrubs',
    'veg_transect_bryophytes',
    'veg_transect_litter',
    'invasive_plants'
  ]
};

const FireMonitoringTransectLine = {
  transect_line: {
    ...TransectLine
  },
  fire_monitoring_transect_points: {
    items: {
      ...FireMonitoringTransectPoints
    }
  },
  'ui:order': ['transect_line', 'fire_monitoring_transect_points']
};

const FireMonitoringTransectLines = {
  items: {
    ...FireMonitoringTransectLine
  }
};

const VegetationTransectPoints = {
  sample_point_id: {},
  offset_distance: {},
  utm_x: { 'ui:readonly': true },
  utm_y: { 'ui:readonly': true },
  'ui:order': ['sample_point_id', 'offset_distance', 'utm_x', 'utm_y']
};

const VegetationTransectSpeciesDaubenmire = {
  invasive_plants: {
    items: {
      invasive_plant_code: { 'ui:widget': 'single-select-autocomplete' },
      daubenmire_classification: { 'ui:widget': 'single-select-autocomplete' },
      'ui:order': ['invasive_plant_code', 'daubenmire_classification']
    }
  },
  lumped_species: {
    items: {
      lumped_species_type: { 'ui:widget': 'single-select-autocomplete' },
      daubenmire_classification: { 'ui:widget': 'single-select-autocomplete' },
      'ui:order': ['lumped_species_type', 'daubenmire_classification']
    }
  },
  custom_species: {
    items: {
      custom_species_type: { 'ui:widget': 'single-select-autocomplete' },
      daubenmire_classification: { 'ui:widget': 'single-select-autocomplete' },
      'ui:order': ['custom_species_type', 'daubenmire_classification']
    }
  },
  'ui:order': ['invasive_plants', 'lumped_species', 'custom_species']
};

const VegetationTransectPointsDaubenmire = {
  vegetation_transect_points: {
    ...VegetationTransectPoints
  },
  vegetation_transect_species: {
    ...VegetationTransectSpeciesDaubenmire
  },
  'ui:order': ['vegetation_transect_points', 'vegetation_transect_species']
};

const VegetationTransectSpeciesPercentCover = {
  invasive_plants: {
    items: {
      invasive_plant_code: { 'ui:widget': 'single-select-autocomplete' },
      percent_covered: {},
      'ui:order': ['invasive_plant_code', 'percent_covered']
    }
  },
  lumped_species: {
    items: {
      lumped_species_type: { 'ui:widget': 'single-select-autocomplete' },
      percent_covered: {},
      'ui:order': ['lumped_species_type', 'percent_covered']
    }
  },
  custom_species: {
    items: {
      custom_species_type: { 'ui:widget': 'single-select-autocomplete' },
      percent_covered: {},
      'ui:order': ['custom_species_type', 'percent_covered']
    }
  },
  'ui:order': ['invasive_plants', 'lumped_species', 'custom_species']
};

const VegetationTransectSpeciesNumberPlants = {
  invasive_plants: {
    items: {
      invasive_plant_code: { 'ui:widget': 'single-select-autocomplete' },
      number_plants: {},
      'ui:order': ['invasive_plant_code', 'number_plants']
    }
  },
  lumped_species: {
    items: {
      lumped_species_type: { 'ui:widget': 'single-select-autocomplete' },
      number_plants: {},
      'ui:order': ['lumped_species_type', 'number_plants']
    }
  },
  custom_species: {
    items: {
      custom_species_type: { 'ui:widget': 'single-select-autocomplete' },
      number_plants: {},
      'ui:order': ['custom_species_type', 'number_plants']
    }
  },
  'ui:order': ['invasive_plants', 'lumped_species', 'custom_species']
};

const VegetationTransectPointsNumberPlants = {
  vegetation_transect_points: {
    ...VegetationTransectPoints
  },
  vegetation_transect_species: {
    ...VegetationTransectSpeciesNumberPlants
  },
  'ui:order': ['vegetation_transect_points', 'vegetation_transect_species']
};

const VegetationTransectPointsPercentCover = {
  vegetation_transect_points: {
    ...VegetationTransectPoints
  },
  vegetation_transect_species: {
    ...VegetationTransectSpeciesPercentCover
  },
  'ui:order': ['vegetation_transect_points', 'vegetation_transect_species']
};

const VegetationTransectLine = {
  transect_line: {
    ...TransectLine
  },
  count_type: {},
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
  },
  'ui:order': [
    'transect_line',
    'count_type',
    'vegetation_transect_points_percent_cover',
    'vegetation_transect_points_number_plants',
    'vegetation_transect_points_daubenmire'
  ]
};

const VegetationTransectLines = {
  items: {
    ...VegetationTransectLine
  }
};

const TransectInvasivePlants = {
  ...ThreeColumnStyle,
  invasive_plant_code: { 'ui:widget': 'single-select-autocomplete' },
  invasive_plant_density_code: { 'ui:widget': 'single-select-autocomplete' },
  invasive_plant_distribution_code: { 'ui:widget': 'single-select-autocomplete' },
  soil_texture_code: { 'ui:widget': 'single-select-autocomplete' },
  linear_infestation: {},
  biological_agent_code: { 'ui:widget': 'single-select-autocomplete' },
  'ui:order': [
    'invasive_plant_code',
    'invasive_plant_density_code',
    'invasive_plant_distribution_code',
    'soil_texture_code',
    'linear_infestation',
    'biological_agent_code'
  ]
};

const BiocontrolEfficacyTransectPoint = {
  ...ThreeColumnStyle,
  sample_point_id: {},
  offset_distance: {},
  utm_x: { 'ui:readonly': true },
  utm_y: { 'ui:readonly': true },
  veg_transect_target: {},
  veg_transect_other_ips: {},
  veg_transect_native_forbs: {},
  veg_transect_grasses: {},
  veg_transect_bare_ground: {},
  veg_transect_shrubs: {},
  veg_transect_bryophytes: {},
  veg_transect_litter: {},
  veg_total_percentage: { 'ui:readonly': true },
  'ui:order': [
    'sample_point_id',
    'offset_distance',
    'utm_x',
    'utm_y',
    'veg_transect_target',
    'veg_transect_other_ips',
    'veg_transect_native_forbs',
    'veg_transect_grasses',
    'veg_transect_bare_ground',
    'veg_transect_shrubs',
    'veg_transect_bryophytes',
    'veg_transect_litter',
    'veg_total_percentage'
  ]
};

const BiocontrolEfficacyTransectLine = {
  transect_line: {
    ...TransectLine
  },
  biocontrol_efficacy_transect_points: {
    items: {
      ...BiocontrolEfficacyTransectPoint
    }
  },
  'ui:order': ['transect_line', 'biocontrol_efficacy_transect_points']
};

const BiocontrolEfficacyTransectLines = {
  items: {
    ...BiocontrolEfficacyTransectLine
  }
};

const FREP_Log = {
  ...ThreeColumnStyle,
  log_num: {},
  species: { 'ui:widget': 'single-select-autocomplete' },
  decay_class: { 'ui:widget': 'single-select-autocomplete' },
  diameter: {},
  length: {}
};

const FREP_Stand_Table = {
  ...ThreeColumnStyle,
  tree_num: {},
  species: { 'ui:widget': 'single-select-autocomplete' },
  wt_class: { 'ui:widget': 'single-select-autocomplete' },
  dbh: {},
  ht: {}
};

const FREP_FormA = {
  plot_identification: {
    ...ThreeColumnStyle,
    date: {},
    opening_id: {},
    assessed_by: {},
    plot_number: {},
    utm_zone: {},
    easting: {},
    northing: {}
  },
  plot_identification_trees: {
    ...ThreeColumnStyle,
    trees_exist: {},
    baf: {},
    fixed_area: {},
    full_count_area: {},
    tree_comments: { 'ui:widget': 'textarea' }
  },
  stand_table: {
    items: {
      ...FREP_Stand_Table
    }
  },
  plot_information: {
    ...ThreeColumnStyle,
    cwd_in_transect: {},
    first_leg: {},
    second_leg: {},
    log: {
      items: {
        ...FREP_Log
      }
    },
    log_comments: {}
  }
};

const FREP_FormB = {
  stratum_summary: {
    ...ThreeColumnStyle,
    date: {},
    opening_id: {},
    assessed_by: {},
    stratum_id: { 'ui:widget': 'single-select-autocomplete' },
    stratum_number: { 'ui:widget': 'single-select-autocomplete' },
    stratum_type: { 'ui:widget': 'single-select-autocomplete' },
    num_plots_stratum: {},
    mapped_stratum_size: {},
    bec_zone: { 'ui:widget': 'single-select-autocomplete' },
    subzone: { 'ui:widget': 'single-select-autocomplete' },
    variant: { 'ui:widget': 'single-select-autocomplete' },
    site_series: { 'ui:widget': 'single-select-autocomplete' },
    stratum_location_consistent: { 'ui:widget': 'single-select-autocomplete' },
    estimated_size: {}
  },
  dispersed_summary: {
    ...ThreeColumnStyle,
    estimated_age_of_oldest_trees: {},
    patch_location: { 'ui:widget': 'single-select-autocomplete' },
    percent_trees_windthrown: { 'ui:widget': 'single-select-autocomplete' },
    windthrow_distribution: { 'ui:widget': 'single-select-autocomplete' },
    windthrow_treatment: { 'ui:widget': 'single-select-autocomplete' }
  },
  reserve_constraints: {
    ...ThreeColumnStyle,
    reserve_constraints_none: { 'ui:widget': 'single-select-autocomplete' },
    wetsite: { 'ui:widget': 'single-select-autocomplete' },
    rmz: { 'ui:widget': 'single-select-autocomplete' },
    rrz: { 'ui:widget': 'single-select-autocomplete' },
    rock_outcrop: { 'ui:widget': 'single-select-autocomplete' },
    noncommercial_brush: {},
    low_mercantile_timber: { 'ui:widget': 'single-select-autocomplete' },
    sensitive_terrain: { 'ui:widget': 'single-select-autocomplete' },
    uwr_wha_whf: { 'ui:widget': 'single-select-autocomplete' },
    ogma: { 'ui:widget': 'single-select-autocomplete' },
    visuals: { 'ui:widget': 'single-select-autocomplete' },
    cultural_heritage_feature: { 'ui:widget': 'single-select-autocomplete' },
    recreation_feature: {},
    reserve_constraints_other: {},
    reserve_constraints_comments: {}
  },
  ecological_anchors: {
    ...ThreeColumnStyle,
    ecological_anchors_none: { 'ui:widget': 'single-select-autocomplete' },
    bear_den: {},
    hibernaculum: {},
    vet_trees: { 'ui:widget': 'single-select-autocomplete' },
    mineral_lick: {},
    large_stick_nest: {},
    cavity_nest: {},
    large_hollow_tree: {},
    large_witches_broom: {},
    karst_feature: { 'ui:widget': 'single-select-autocomplete' },
    large_tree_for_site: { 'ui:widget': 'single-select-autocomplete' },
    cwd_heavy_concentration: { 'ui:widget': 'single-select-autocomplete' },
    active_wildlife_trails: { 'ui:widget': 'single-select-autocomplete' },
    active_wlt_cwd_feeding: { 'ui:widget': 'single-select-autocomplete' },
    uncommon_tree_species: { 'ui:widget': 'single-select-autocomplete' },
    ecological_anchors_other: {},
    ecological_anchors_comments: {}
  },
  form_a: {
    items: {
      ...FREP_FormA
    }
  }
};

const FREP_FormC = {
  opening_identification: {
    ...ThreeColumnStyle,
    opening_number: {},
    opening_id: {},
    license_number: {},
    cp_number: {},
    block: {},
    licensee: {},
    district_code: { 'ui:widget': 'single-select-autocomplete' },
    location_description: { 'ui:widget': 'textarea' },
    nar: {},
    gross_area: {},
    override_code: { 'ui:widget': 'single-select-autocomplete' }
  },
  innovative_practices: {
    ...ThreeColumnStyle,
    innovative_practices: {}
  },
  invasive_plants: {
    ...ThreeColumnStyle,
    invasive_code: { 'ui:widget': 'single-select-autocomplete' }
  },
  evaluator_opinion: {
    ...ThreeColumnStyle,
    evaluator_opinion_code: { 'ui:widget': 'single-select-autocomplete' },
    rationale: {}
  },
  form_b: {
    items: {
      ...FREP_FormB
    }
  }
};

/**
 * ------------------------  Subtype Information Objects  -----------------------------
 */

const Treatment_ChemicalPlant_Information = {
  ...ThreeColumnStyle,
  pesticide_employer_code: { 'ui:widget': 'single-select-autocomplete' },
  pesticide_use_permit_PUP: {},
  pest_management_plan: { 'ui:widget': 'single-select-autocomplete' },
  pmp_not_in_dropdown: {},
  chemical_method_code: { 'ui:widget': 'single-select-autocomplete' },
  temperature: { validateOnBlur: true },
  wind_speed: { validateOnBlur: true },
  wind_direction_code: { 'ui:widget': 'single-select-autocomplete' },
  humidity: {},
  signage_on_site: {},
  ntz_reduction: { 'ui:widget': 'radio' },
  rationale_for_ntz_reduction: {},
  precautionary_statement: { 'ui:widget': 'single-select-autocomplete' },
  unmapped_wells: {},
  application_start_time: { 'ui:widget': 'datetime' },
  'ui:order': [
    'pesticide_employer_code',
    'pesticide_use_permit_PUP',
    'pest_management_plan',
    'pmp_not_in_dropdown',
    'chemical_method_code',
    'temperature',
    'wind_speed',
    'wind_direction_code',
    'humidity',
    'signage_on_site',
    'precautionary_statement',
    'ntz_reduction',
    'rationale_for_ntz_reduction',
    'unmapped_wells',
    'application_start_time'
  ]
};

const Treatment_MechanicalPlant_Information = {
  items: {
    ...ThreeColumnStyle,
    invasive_plant_code: { 'ui:widget': 'single-select-autocomplete' },
    treated_area: {},
    mechanical_method_code: { 'ui:widget': 'single-select-autocomplete' },
    mechanical_disposal_code: { 'ui:widget': 'single-select-autocomplete' },
    disposed_material: {
      disposed_material_input_format: {},
      disposed_material_input_number: {},
      'ui:order': ['disposed_material_input_format', 'disposed_material_input_number']
    },
    'ui:order': [
      'invasive_plant_code',
      'treated_area',
      'mechanical_method_code',
      'mechanical_disposal_code',
      'disposed_material'
    ]
  }
};

const Observation_PlantTerrestrial_Information = {
  ...ThreeColumnStyle,
  soil_texture_code: { 'ui:widget': 'single-select-autocomplete' },
  specific_use_code: { 'ui:widget': 'multi-select-autocomplete' },
  suitable_for_biocontrol_agent: {},
  slope_code: { 'ui:widget': 'single-select-autocomplete' },
  aspect_code: { 'ui:widget': 'single-select-autocomplete' },
  research_detection_ind: {},
  well_ind: {},
  'ui:order': [
    'soil_texture_code',
    'specific_use_code',
    'slope_code',
    'aspect_code',
    'research_detection_ind',
    'well_ind',
    'suitable_for_biocontrol_agent'
  ]
};

const Observation_PlantAquatic_Information = {
  ...OneColumnStyle,
  suitable_for_biocontrol_agent: {},
  'ui:order': ['suitable_for_biocontrol_agent']
};

const Monitoring_ChemicalTerrestrialAquaticPlant_Information = {
  ...TwoColumnStyle,
  invasive_plant_code: { 'ui:widget': 'single-select-autocomplete' },
  invasive_plant_aquatic_code: { 'ui:widget': 'single-select-autocomplete' },
  // monitoring_details: {},
  efficacy_code: { 'ui:widget': 'single-select-autocomplete' },
  management_efficacy_rating: { 'ui:widget': 'single-select-autocomplete' },
  evidence_of_treatment: {},
  invasive_plants_on_site: { 'ui:widget': 'multi-select-autocomplete' },
  treatment_pass: {},
  comment: {},
  'ui:order': [
    'invasive_plant_code',
    'invasive_plant_aquatic_code',
    // 'monitoring_details',
    'evidence_of_treatment',
    'efficacy_code',
    'management_efficacy_rating',
    'invasive_plants_on_site',
    'treatment_pass',
    'comment'
  ]
};

const Monitoring_MechanicalTerrestrialAquaticPlant_Information = {
  ...TwoColumnStyle,
  invasive_plant_code: { 'ui:widget': 'single-select-autocomplete' },
  invasive_plant_aquatic_code: { 'ui:widget': 'single-select-autocomplete' },
  // monitoring_details: {},
  efficacy_code: { 'ui:widget': 'single-select-autocomplete' },
  management_efficacy_rating: { 'ui:widget': 'single-select-autocomplete' },
  evidence_of_treatment: {},
  invasive_plants_on_site: { 'ui:widget': 'multi-select-autocomplete' },
  treatment_pass: {},
  comment: {},
  'ui:order': [
    'invasive_plant_code',
    'invasive_plant_aquatic_code',
    // 'monitoring_details',
    'evidence_of_treatment',
    'efficacy_code',
    'management_efficacy_rating',
    'invasive_plants_on_site',
    'plant_count',
    'treatment_pass',
    'comment'
  ]
};

const Monitoring_BiocontrolRelease_TerrestrialPlant_Information = {
  ...ThreeColumnStyle,
  invasive_plant_code: { 'ui:widget': 'single-select-autocomplete' },
  biological_agent_code: { 'ui:widget': 'single-select-autocomplete' },
  biocontrol_present: {},
  biological_agent_presence_code: { 'ui:widget': 'multi-select-autocomplete' },
  monitoring_type: {},
  plant_count: {},
  biocontrol_monitoring_methods_code: { 'ui:widget': 'single-select-autocomplete' },
  num_of_sweeps: {},
  start_time: {},
  stop_time: {},
  bio_agent_location_code: { 'ui:widget': 'multi-select-autocomplete' },
  actual_biological_agents: { items: { ...Biological_Agent_Stage } },
  estimated_biological_agents: { items: { ...Biological_Agent_Stage } },
  total_bio_agent_quantity_actual: { 'ui:readonly': true },
  total_bio_agent_quantity_estimated: { 'ui:readonly': true },
  count_duration: {},
  suitable_collection_site: {},
  'ui:order': [
    'invasive_plant_code',
    'biological_agent_code',
    'biocontrol_present',
    'biological_agent_presence_code',
    'monitoring_type',
    'plant_count',
    'biocontrol_monitoring_methods_code',
    'num_of_sweeps',
    'start_time',
    'stop_time',
    'bio_agent_location_code',
    'actual_biological_agents',
    'estimated_biological_agents',
    'total_bio_agent_quantity_actual',
    'total_bio_agent_quantity_estimated',
    'suitable_collection_site'
  ]
};

const Monitoring_BiocontrolDispersal_Information = {
  ...ThreeColumnStyle,
  invasive_plant_code: { 'ui:widget': 'single-select-autocomplete' },
  applicator1_name: {},
  applicator2_name: {},
  linear_segment: {},
  biocontrol_present: {},
  biological_agent_presence_code: { 'ui:widget': 'multi-select-autocomplete' },
  biological_agent_code: { 'ui:widget': 'single-select-autocomplete' },
  monitoring_type: {},
  plant_count: {},
  biocontrol_monitoring_methods_code: { 'ui:widget': 'single-select-autocomplete' },
  num_of_sweeps: {},
  start_time: {},
  stop_time: {},
  bio_agent_location_code: { 'ui:widget': 'multi-select-autocomplete' },
  actual_biological_agents: { items: { ...Biological_Agent_Stage } },
  estimated_biological_agents: { items: { ...Biological_Agent_Stage } },
  total_bio_agent_quantity_actual: { 'ui:readonly': true },
  total_bio_agent_quantity_estimated: { 'ui:readonly': true },
  suitable_collection_site: {},
  override_code: { 'ui:readonly': true },
  'ui:order': [
    'invasive_plant_code',
    'biological_agent_code',
    'biocontrol_present',
    'biological_agent_presence_code',
    'monitoring_type',
    'plant_count',
    'biocontrol_monitoring_methods_code',
    'num_of_sweeps',
    'linear_segment',
    'biological_agent_stages',
    'start_time',
    'stop_time',
    'bio_agent_location_code',
    'actual_biological_agents',
    'estimated_biological_agents',
    'total_bio_agent_quantity_actual',
    'total_bio_agent_quantity_estimated',
    'suitable_collection_site'
  ]
};

const Biocontrol_Collection_Information = {
  ...ThreeColumnStyle,
  invasive_plant_code: { 'ui:widget': 'single-select-autocomplete' },
  biological_agent_code: { 'ui:widget': 'single-select-autocomplete' },
  historical_iapp_site_id: {},
  collection_type: {},
  plant_count: {},
  collection_method: { 'ui:widget': 'single-select-autocomplete' },
  num_of_sweeps: {},
  start_time: {},
  stop_time: { 'ui:widget': 'datetime' },
  actual_biological_agents: { items: { ...Biocontrol_Release_Biological_Agent_Stage } },
  estimated_biological_agents: { items: { ...Biocontrol_Release_Biological_Agent_Stage } },
  total_bio_agent_quantity_actual: { 'ui:readonly': true },
  total_bio_agent_quantity_estimated: { 'ui:readonly': true },
  comment: { 'ui:widget': 'textarea' },
  'ui:order': [
    'invasive_plant_code',
    'biological_agent_code',
    'historical_iapp_site_id',
    'collection_type',
    'plant_count',
    'collection_method',
    'num_of_sweeps',
    'start_time',
    'stop_time',
    'actual_biological_agents',
    'estimated_biological_agents',
    'total_bio_agent_quantity_actual',
    'total_bio_agent_quantity_estimated',
    'comment'
  ]
};

const Biocontrol_Release_Information = {
  ...ThreeColumnStyle,
  invasive_plant_code: { 'ui:widget': 'single-select-autocomplete' },
  mortality: {},
  agent_source: {},
  collection_date: {},
  plant_collected_from: { 'ui:widget': 'single-select-autocomplete' },
  plant_collected_from_unlisted: {},
  biological_agent_stage_code: { 'ui:widget': 'single-select-autocomplete' },
  biological_agent_code: { 'ui:widget': 'single-select-autocomplete' },
  actual_biological_agents: { items: { ...Biocontrol_Release_Biological_Agent_Stage } },
  estimated_biological_agents: { items: { ...Biocontrol_Release_Biological_Agent_Stage } },
  total_bio_agent_quantity_actual: { 'ui:readonly': true },
  total_bio_agent_quantity_estimated: { 'ui:readonly': true },
  total_release_quantity: { 'ui:readonly': true },
  linear_segment: {},
  'ui:order': [
    'invasive_plant_code',
    'biological_agent_code',
    'biological_agent_stages',
    'linear_segment',
    'release_quantity',
    'mortality',
    'agent_source',
    'collection_date',
    'plant_collected_from',
    'plant_collected_from_unlisted',
    'total_release_quantity',
    'biological_agent_stage_code',
    'actual_biological_agents',
    'estimated_biological_agents',
    'total_bio_agent_quantity_actual',
    'total_bio_agent_quantity_estimated'
  ]
};

/*
  Export
*/
const BaseUISchemaComponents = {
  column_styles: {
    FourColumnStyle,
    ThreeColumnStyle,
    OneColumnStyle,
    TwoColumnStyle
  },
  activity_data_objects: {
    Activity
  },
  activity_type_data_objects: {
    Observation,
    Monitoring,
    Monitoring_Biocontrol_Release,
    Monitoring_Biocontrol,
    Treatment,
    Treatment_Chemical,
    Collection,
    TransectData
  },
  activity_subtype_data_information_objects: {
    Treatment_ChemicalPlant_Information,
    Treatment_MechanicalPlant_Information,
    Observation_PlantTerrestrial_Information,
    Observation_PlantAquatic_Information,
    Monitoring_ChemicalTerrestrialAquaticPlant_Information,
    Monitoring_MechanicalTerrestrialAquaticPlant_Information,
    Monitoring_BiocontrolRelease_TerrestrialPlant_Information,
    Monitoring_BiocontrolDispersal_Information,
    Biocontrol_Collection_Information,
    Biocontrol_Release_Information
  },
  general_objects: {
    Pest_Injury_Threshold_Determination,
    Biological_Agent_Stage,
    Biocontrol_Release_Biological_Agent_Stage,
    Well_Information,
    WaterbodyData,
    WaterbodyData_AdditionalFields,
    WaterQuality,
    ShorelineTypes,
    AquaticPlant,
    AquaticPlants,
    Authorization_Infotmation,
    TerrestrialPlants,
    TerrestrialPlant,
    Weather_Conditions,
    Microsite_Conditions,
    Target_Plant_Phenology,
    Spread_Results,
    FireMonitoringTransectLines,
    VegetationTransectLines,
    TransectInvasivePlants,
    BiocontrolEfficacyTransectLines,
    FREP_FormC
  }
};

export default BaseUISchemaComponents;
