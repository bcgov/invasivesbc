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

const OneColumnStyle = {
  'ui:column-xs': 12,
  'ui:column-md': 12,
  'ui:column-lg': 12
};

const Persons = {
  'person_name': {},
    'ui:order':['person_name']
};

const Jurisdictions = {
  'jurisdiction_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'percent_covered': {},
    'ui:order':['jurisdiction_code','percent_covered']
};

const Weather_Conditions = {
  'temperature':{},
  'cloud_cover_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'precipitation_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'wind_speed':{},
  'weather_comments': {
    'ui:widget': 'textarea'
  },
  'ui:order':['temperature','cloud_cover_code','precipitation_code','wind_speed','weather_comments']
};

const Herbicide = {
    'herbicide_type':{},
  'herbicide_code':{
    'ui:widget': 'single-select-autocomplete'
  },
  'tank_volume':{},
  'herbicide_information':{
    'area_treated':{},
    'application_rate': {
      validateOnBlur: true
    },
    'herbicide_amount':{},
    'mix_delivery_rate': {},
    'dilution': {
      'ui:readonly': true
    },
    'specific_treatment_area': {
      'ui:readonly': true
    },
    'ui:order':['area_treated','application_rate','herbicide_amount','mix_delivery_rate','dilution','specific_treatment_area']
  },
  'ui:order':['herbicide_type','herbicide_code','tank_volume','herbicide_information']
};

const ProjectCode = {
  'description': {},
  'ui:order':['description']
};

const TerrestrialPlants = {
  ...ThreeColumnStyle,
  'invasive_plant_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'occurrence':{},
  'edna_sample':{},
  'enda_sample_information':{
    'edna_sample_id':{},
    'genetic_structure_collected':{},
    'ui:order':['edna_sample_id','genetic_structure_collected']
  },
  'invasive_plant_density_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'invasive_plant_distribution_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'plant_life_stage_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'voucher_specimen_collected':{},
  'voucher_specimen_collection_information':{
    'voucher_sample_id':{},
    'date_voucher_collected':{},
    'date_voucher_verified':{},
    'name_of_herbarium':{},
    'accession_number':{},
    'voucher_verification_completed_by':{
     'person_name':{},
     'organization':{},
      'ui:order':['person_name','organization']
    },
    'exact_utm_coords':{
      'utm_zone':{},
      'utm_easting':{},
      'utm_northing':{},
      'ui:order':['utm_zone','utm_easting','utm_northing']
    }
  },
  'ui:order':[
    'invasive_plant_code',
    'occurrence',
    'edna_sample',
    'enda_sample_information',
    'invasive_plant_density_code',
    'invasive_plant_distribution_code',
    'plant_life_stage_code',
    'voucher_specimen_collected',
    'voucher_specimen_collection_information']
};

const AquaticAnimals = {
  'invasive_animal_code': {
    'ui:widget': 'single-select-autocomplete'
  }, 
  'early_detection_rapid_resp_ind': {},
  'negative_obs_ind':{},
  'life_stage': {
    'ui:widget': 'single-select-autocomplete'
  },
  'sex': {},
  'reproductive_maturity': {
    'ui:widget': 'single-select-autocomplete'
  },
  'length': {},
  'length_method': {},
  'weight': {},
  'behaviour': {
    'ui:widget': 'single-select-autocomplete'
  },
  'condition': {
    'ui:widget': 'single-select-autocomplete'
  },
  'captured': {},
  'disposed': {},
  'specimen_id': {},
  'sample_collected': {},
  'sample_id': {},
  'sample_type': {
    'ui:widget': 'single-select-autocomplete'
  },
  'age_analysis': {},
  'genetic_analysis': {},
    'ui:order':
      ['invasive_animal_code',
      'early_detection_rapid_resp_ind',
      'negative_obs_ind',
      'life_stage',
      'sex',
      'reproductive_maturity',
      'length',
      'length_method',
      'weight',
      'behaviour',
      'condition',
      'captured',
      'disposed',
      'specimen_id',
      'sample_collected',
      'sample_id',
      'sample_type',
      'age_analysis',
      'genetic_analysis']
};

const AquaticPlants = {
  'sample_point_id': {},
  'invasive_plant_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'observation_type':{},
  'invasive_plant_density_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'invasive_plant_distribution_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'plant_life_stage_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'voucher_specimen_collected': {},
  'genetic_sample_id': {},
  'genetic_structure_collected': {},
  'edna_sample':{},
  'enda_sample_information':{
    'edna_sample_id':{},
    'sample_type':{},
    'field_replicates_num': {},
    'control_sample_taken':{
      'ui:widget': 'select'
    },
    'ui:order':['edna_sample_id','sample_type','field_replicates_num','control_sample_taken']
  },
  'ui:order':[
    'sample_point_id',
    'invasive_plant_code',
    'observation_type',
    'invasive_plant_density_code',
    'invasive_plant_distribution_code',
    'plant_life_stage_code',
    'voucher_specimen_collected',
    'genetic_sample_id',
    'genetic_structure_collected',
    'edna_sample',
    'enda_sample_information'
  ]
};    

const WaterbodyData = {
  'waterbody_type': {
    'ui:widget': 'single-select-autocomplete'
  },
  'waterbody_name_gazetted': {},
  'waterbody_name_local': {},
  'waterbody_access':{},
  'waterbody_use': {
    'ui:widget': 'multi-select-autocomplete'
  },
  'ui:order':[
    'waterbody_type',
    'waterbody_name_gazetted',
    'waterbody_name_local',
    'waterbody_access',
    'waterbody_use'
  ]
};

const ProjectData = {
  'surveyors': {},
  'survey_type': {
    'ui:widget': 'single-select-autocomplete'
  }
};

const TerrainCharacteristics = {
  'setting': {},
  'aspect': {},
  'hillslope_coupling': {},
  'shoreline_type': {},
  'cover': {},
  'recreational_features': {},
  'number_inlets': {},
  'inlet_type': {},
  'number_outlets': {},
  'outlet_type': {},
  'ui:order':[
    'setting',
    'aspect',
    'hillslope_coupling',
    'shoreline_type',
    'cover',
    'recreational_features',
    'number_inlets',
    'inlet_type',
    'number_outlets',
    'outlet_type'
  ]
};

const Access = {
  'access_air': {},
  'access_road': {},
  'access_auto': {},
  'access_off_road': {},
  'access_off_road_distance': {},
  'access_trail': {},
  'access_trail_distance': {},
  'access_closest_community': {},
  'access_water_access': {},
  'comments': {
    'ui:widget': 'textarea'
  },
  'ui:order':[
    'access_air',
    'access_road',
    'access_auto',
    'access_off_road',
    'access_off_road_distance',
    'access_trail',
    'access_trail_distance',
    'access_closest_community',
    'access_water_access',
    'comments'
    ]
};

const AquaticFlora = {
  'emergent_vegetation': {},
  'emergent_vegetation_dominant_species': {},
  'submergent_vegetation': {},
  'submergent_vegetation_dominant_species': {},
  'floating_algae_present': {},
  'lake_bathymetry': {},
  'littoral_area': {},
  'max_depth': {},
  'benchmark': {},
  'max_water_level': {},
  'benchmark_type': {
    'ui:widget': 'textarea'
  },
  'ui:order':[
    'emergent_vegetation',
    'emergent_vegetation_dominant_species',
    'submergent_vegetation',
    'submergent_vegetation_dominant_species',
    'floating_algae_present',
    'lake_bathymetry',
    'littoral_area',
    'max_depth',
    'benchmark',
    'max_water_level',
    'benchmark_type'
  ]
};

const WaterQuality = {
  'water_sample_depth': {},
  'secchi_depth': {},
  'water_colour': {},
  'ui:order':['water_sample_depth','secchi_depth','water_colour']
};

const ConductivityProfile = {
  'depth': {},
  'dissolved_oxygen': {},
  'temperature': {},
  'conductivity': {},
  'thermocline': {},
  'ui:order':['depth','dissolved_oxygen','temperature','conductivity','thermocline']
};

const SubstrateSample = {
  'date_installed': {},
  'date_monitored': {},
  'waterbody': {},
  'site_location': {},
  'depth': {},
  'latitude': {},
  'longitude': {},
  'water_temperature': {},
  'water_column_ph': {},
  'secchi_depth': {},
  'preservative_type': {},
  'location_description': {
    'ui:widget': 'textarea'
  },
  'comments': {
    'ui:widget': 'textarea'
  },
  'microscopy_species': {
    'ui:widget': 'textarea'
  },
  'e_dna_sample': {
    'ui:widget': 'textarea'
  },
  'adult_suspected_presence': {},
  'sample_collected': {},
    'ui:order':[
    'date_installed',
    'date_monitored',
    'waterbody',
    'site_location',
    'depth',
    'latitude',
    'longitude',
    'water_temperature',
    'water_column_ph',
    'secchi_depth',
    'preservative_type', 
    'location_description',
    'comments',
    'microscopy_species',
    'e_dna_sample',
    'adult_suspected_presence',
    'sample_collected'
  ]
};

const PlanktonTowSample = {
  'tows': {},
  'date_time': {},
  'plankton_tow_type': {},
  'tow_depth_length': {},
  'volume_sampled': {},
  'containers': {},
  'preserved_sample_ph': {},
  'arrival_sample_ph': {},
  'preservative_type': {},
  'preservation_concentration': {},
  'other_species': {},
  'veliger_positive': {},
  'buffered': {},
  'ui:order':[
    'tows',
    'date_time',
    'plankton_tow_type',
    'tow_depth_length',
    'volume_sampled',
    'containers',
    'preserved_sample_ph',
    'arrival_sample_ph',
    'preservative_type',
    'preservation_concentration',
    'other_species',
    'veliger_positive',
    'buffered'
  ]
};

const NetTrapSpecifications = {
  'haul_number': {},
  'date_time_in': {},
  'date_time_out': {},
  'net_trap_type': {},
  'length': {},
  'depth': {},
  'mesh_size': {},
  'mesh_description': {},
  'zone': {},
  'habitat': {},
  'substrate_type': {},
  'ui:order':[
    'haul_number',
    'date_time_in',
    'date_time_out',
    'net_trap_type',
    'length',
    'depth',
    'mesh_size',
    'mesh_description',
    'zone',
    'habitat',
    'substrate_type'
  ]
};

const ElectrofisherSpecifications = {
  'passes': {},
  'date_time_in': {},
  'date_time_out': {},
  'one_pass_time': {},
  'length': {},
  'width': {},
  'enclosure': {},
  'voltage': {},
  'frequency': {},
  'pulse': {},
  'make': {},
  'model': {},
  'ui:order':[
    'passes',
    'date_time_in',
    'date_time_out',
    'one_pass_time',
    'length',
    'width',
    'enclosure',
    'voltage',
    'frequency',
    'pulse',
    'make',
    'model'
  ]
};

const EDna = {
  'comment': {},
  'ui:order':['comment']
};

const HabitatAlteration = {
  'type': {},
  'description': {
    'ui:widget': 'textarea'
  },
  'ui:order':['type','description']
};

const Chemical = {
  'type': {},
  'description': {
    'ui:widget': 'textarea'
  },
  'ui:order':['type','description']
};

const Biological = {
  'type': {},
  'description': {
    'ui:widget': 'textarea'
  },
  'ui:order':['type','description']
};

const ShorelineSurveys = {
  'date_time': {},
  'waterbody': {},
  'target_species': {},
  'weather_conditions': {},
  'sampling_distance': {},
  'sampling_location_lat': {},
  'sampling_location_lng': {},
  'substrate_type': {},
  'species_present': {},
  'density': {},
  'diameter_largest_individual': {},
  'other_species_found': {},
  'comments': {
    'ui:widget': 'textarea'
  },
  'ui:order':[
    'date_time',
    'waterbody',
    'target_species',
    'weather_conditions',
    'sampling_distance',
    'sampling_location_lat',
    'sampling_location_lng',
    'substrate_type',
    'species_present',
    'density',
    'diameter_largest_individual',
    'other_species_found',
    'comments'
  ]
};

const SurveyData = {
  'survey_design': {},
  'survey_start_date_time': {},
  'survey_end_date_time': {},
  'survey_details': {},
  'ui:order':[
    'survey_design',
    'survey_start_date_time',
    'survey_end_date_time',
    'survey_details'
  ]
};

const TreatmentData = {
  'treatment_start_date_time': {},
  'treatment_end_date_time': {},
  'permit_number': {},
  'survey_details': {},
  'ui:order':[
    'treatment_start_date_time',
    'treatment_end_date_time',
    'permit_number',
    'survey_details'
  ]
};

const MonitoringData = {
  'monitoring_start_date_time': {},
  'monitoring_end_date_time': {},
  'monitoring_results': {
    'ui:widget': 'textarea'
  },
  'comment': {
    'ui:widget': 'textarea'
  },
  'ui:order':
  [
    'monitoring_start_date_time',
    'monitoring_end_date_time',
    'monitoring_results',
    'comment'
  ]
};

const InvasivePlants = {
  'invasive_plant_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'ui:order':['invasive_plant_code']
};

/*
  Transect
*/

const TransectInvasivePlants = {
  'invasive_plant_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'invasive_plant_density_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'invasive_plant_distribution_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'soil_texture_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'linear_infestation': {},
  'biological_agent_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'ui:order':[
    'invasive_plant_code',
    'invasive_plant_density_code',
    'invasive_plant_distribution_code',
    'soil_texture_code',
    'linear_infestation',
    'biological_agent_code'
  ]
};

const TransectLine = {
  'transect_line_id': {},
  'transect_comment': {},
  'start_x_utm': {},
  'start_y_utm': {},
  'end_x_utm': {},
  'end_y_utm': {},
  'transect_length': {
    'ui:readonly': true
  },
  'transect_bearing': {
    'ui:readonly': true
  },
  'ui:order':[
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

const TransectData = {
  'utm_zone': {},
  'transect_start_date_time': {},
  'transect_end_date_time': {},
  'project_number': {},
  'surveyor1_name': {},
  'surveyor2_name': {},
  'field_recorder_name': {},
  'research_trial_code': {},
  'realm_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'site_aspect': {},
  'site_aspect_variability': {},
  'site_slope': {},
  'site_slope_variability': {},
  'site_elevation': {},
  'cloud_cover_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'beaufort_wind_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'precipitation_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'burn_severity_code': {},
  'ecological_moisture_regime_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'mesoslope_position_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'site_surface_shape_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'soil_properties_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'surface_substrate_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'site_activity_disturbance': {},
  'disturbance_site_defunct': {},
  'disturbance_condition_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'disturbance_type_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'invasive_plant_change_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'target_plant_change_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'treatment_seeded': {},
  'density_count_type_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'trace_plants': {},
  'growth_pattern': {},
  'frame_size_code': {},
  'biocontrol_noted_code': {},
  'photoplot_start': {},
  'photoplot_end': {},
  'photoplot_aerials': {},
  'photoplot_full_25m': {},
  'plot_location': {},
  'ui:order':[
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
    'cloud_cover_code',
    'beaufort_wind_code',
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
    "trace_plants",
    "growth_pattern",
    "frame_size_code",
    "biocontrol_noted_code",
    "photoplot_start",
    "photoplot_end",
    "photoplot_aerials",
    "photoplot_full_25m",
    "plot_location",
    "veg_transect_sampler",
    "veg_transect_recorder"
  ]
};

const FireMonitoringTransectPoints = {
  'sample_point_id': {},
  'offset_distance': {},
  'utm_x': {
    'ui:readonly': true
  },
  'utm_y': {
    'ui:readonly': true
  },
  'veg_transect_sampler': {},
  'veg_transect_recorder': {},
  'veg_transect_native_forbs': {},
  'veg_transect_grasses': {},
  'veg_transect_bare_ground': {},
  'veg_transect_shrubs': {},
  'veg_transect_bryophytes': {},
  'veg_transect_litter': {},
  'invasive_plants': {
    items: {
      ...InvasivePlants
    }
  },
  'ui:order':[
    'sample_point_id',
    'offset_distance',
    'utm_x',
    'utm_y',
    'veg_transect_sampler',
    'veg_transect_recorder',
    'veg_transect_native_forbs',
    'veg_transect_grasses',
    'veg_transect_bare_ground',
    'veg_transect_shrubs',
    'veg_transect_bryophytes',
    'veg_transect_litter',
    'invasive_plants'
  ]
};

const FireMonitoringTransectLines = {
  'transect_line': {
    ...TwoColumnStyle,
    ...TransectLine
  },
  'fire_monitoring_transect_points': {
    items: {
      ...FourColumnStyle,
      ...FireMonitoringTransectPoints
    }
  },
  'ui:order':['transect_line','fire_monitoring_transect_points']
};

const Transect_FireMonitoring = {
  'transect_data': {
    ...ThreeColumnStyle,
    ...TransectData
  },
  'fire_monitoring_transect_lines': {
    items: {
      ...FireMonitoringTransectLines
    }
  },
  'ui:order':['transect_data','fire_monitoring_transect_lines']
};

const VegetationTransectPoints = {
  'sample_point_id': {},
  'offset_distance': {},
  'utm_x': {
    'ui:readonly': true
  },
  'utm_y': {
    'ui:readonly': true
  },
  'ui:order':['sample_point_id','offset_distance','utm_x','utm_y']
};

const InvasivePlantsPercentCover = {
  'invasive_plant_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'percent_covered': {},
  'ui:order':['invasive_plant_code','percent_covered']
};

const InvasivePlantsNumberPlants = {
  'invasive_plant_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'number_plants': {},
  'ui:order':['invasive_plant_code','number_plants']
};

const InvasivePlantsDaubenmire = {
  'invasive_plant_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'daubenmire_classification': {
    'ui:widget': 'single-select-autocomplete'
  },
  'ui:order':['invasive_plant_code','daubenmire_classification']
};

const LumpedSpeciesNumberPlants = {
  'lumped_species_type': {
    'ui:widget': 'single-select-autocomplete'
  },
  'number_plants': {},
  'ui:order':['lumped_species_type','number_plants']
};

const LumpedSpeciesPercentCover = {
  'lumped_species_type': {
    'ui:widget': 'single-select-autocomplete'
  },
  'percent_covered': {},
  'ui:order':['lumped_species_type','percent_covered']
};

const LumpedSpeciesDaubenmire = {
  'lumped_species_type': {
    'ui:widget': 'single-select-autocomplete'
  },
  'daubenmire_classification': {
    'ui:widget': 'single-select-autocomplete'
  },
  'ui:order':['lumped_species_type','daubenmire_classification']
};

const CustomSpeciesPercentCover = {
  'custom_species_type': {
    'ui:widget': 'single-select-autocomplete'
  },
  'percent_covered': {},
  'ui:order':['custom_species_type','percent_covered']
};

const CustomSpeciesNumberPlants = {
  'custom_species_type': {
    'ui:widget': 'single-select-autocomplete'
  },
  'number_plants': {},
  'ui:order':['custom_species_type','number_plants']
};

const CustomSpeciesDaubenmire = {
  'custom_species_type': {
    'ui:widget': 'single-select-autocomplete'
  },
  'daubenmire_classification': {
    'ui:widget': 'single-select-autocomplete'
  },
  'ui:order':['custom_species_type','daubenmire_classification']
};

const VegetationTransectSpeciesPercentCover = {
  'invasive_plants': {
    items: {
      ...InvasivePlantsPercentCover
    }
  },
  'lumped_species': {
    items: {
      ...LumpedSpeciesPercentCover
    }
  },
  'custom_species': {
    items: {
      ...CustomSpeciesPercentCover
    }
  },
  'ui:order':['invasive_plants','lumped_species','custom_species']
};

const VegetationTransectSpeciesNumberPlants = {
  'invasive_plants': {
    items: {
      ...InvasivePlantsNumberPlants
    }
  },
  'lumped_species': {
    items: {
      ...LumpedSpeciesNumberPlants
    }
  },
  'custom_species': {
    items: {
      ...CustomSpeciesNumberPlants
    }
  },
  'ui:order':['invasive_plants','lumped_species','custom_species']
};

const VegetationTransectSpeciesDaubenmire = {
  'invasive_plants': {
    items: {
      ...InvasivePlantsDaubenmire
    }
  },
  'lumped_species': {
    items: {
      ...LumpedSpeciesDaubenmire
    }
  },
  'custom_species': {
    items: {
      ...CustomSpeciesDaubenmire
    }
  },
  'ui:order':['invasive_plants','lumped_species','custom_species']
};

const VegetationTransectPointsPercentCover = {
  'vegetation_transect_points': {
    ...FourColumnStyle,
    ...VegetationTransectPoints
  },
  'vegetation_transect_species': {
    ...ThreeColumnStyle,
    ...VegetationTransectSpeciesPercentCover
  },
  'ui:order':['vegetation_transect_points','vegetation_transect_species']
};

const VegetationTransectPointsNumberPlants = {
  'vegetation_transect_points': {
    ...FourColumnStyle,
    ...VegetationTransectPoints
  },
  'vegetation_transect_species': {
    ...ThreeColumnStyle,
    ...VegetationTransectSpeciesNumberPlants
  },
  'ui:order':['vegetation_transect_points','vegetation_transect_species']
};

const VegetationTransectPointsDaubenmire = {
  'vegetation_transect_points': {
    ...FourColumnStyle,
    ...VegetationTransectPoints
  },
  'vegetation_transect_species': {
    ...ThreeColumnStyle,
    ...VegetationTransectSpeciesDaubenmire
  },
  'ui:order':['vegetation_transect_points','vegetation_transect_species']
};

const VegetationTransectLines = {
  'transect_line': {
    ...TwoColumnStyle,
    ...TransectLine
  },
  'vegetation_transect_points_percent_cover': {
    items: {
      ...VegetationTransectPointsPercentCover
    }
  },
  'vegetation_transect_points_number_plants': {
    items: {
      ...VegetationTransectPointsNumberPlants
    }
  },
  'vegetation_transect_points_daubenmire': {
    items: {
      ...VegetationTransectPointsDaubenmire
    }
  },
  'ui:order':[
    'transect_line',
    'count_type',
    'vegetation_transect_points_percent_cover',
    'vegetation_transect_points_number_plants',
    'vegetation_transect_points_daubenmire'
  ]
};

const Transect_Vegetation = {
  'transect_data': {
    ...ThreeColumnStyle,

    ...TransectData
  },
  'vegetation_transect_lines': {
    items: {
      ...VegetationTransectLines
    }
  },
  'ui:order':['transect_data','vegetation_transect_lines']
};

const BiocontrolEfficacyTransectPoints = {
  'sample_point_id': {},
  'offset_distance': {},
  'utm_x': {
    'ui:readonly': true
  },
  'utm_y': {
    'ui:readonly': true
  },
  'veg_transect_sampler': {},
  'veg_transect_recorder': {},
  'veg_transect_target': {},
  'veg_transect_other_ips': {},
  'veg_transect_native_forbs': {},
  'veg_transect_grasses': {},
  'veg_transect_bare_ground': {},
  'veg_transect_shrubs': {},
  'veg_transect_bryophytes': {},
  'veg_transect_litter': {},
  'veg_total_percentage': {
    'ui:readonly': true
  },
  'ui:order':[
    'sample_point_id',
    'offset_distance',
    'utm_x',
    'utm_y',
    'veg_transect_sampler',
    'veg_transect_recorder',
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

const BiocontrolEfficacyTransectLines = {
  'transect_line': {
    ...TwoColumnStyle,
    ...TransectLine
  },
  'biocontrol_efficacy_transect_points': {
    items: {
      ...FourColumnStyle,
      ...BiocontrolEfficacyTransectPoints
    }
  },
  'ui:order':['transect_line','biocontrol_efficacy_transect_points']
};

const Transect_BiocontrolEfficacy = {
  'transect_data': {
    ...ThreeColumnStyle,
    ...TransectData
  },
  'transect_invasive_plants': {
    items: {
      ...ThreeColumnStyle,
      ...TransectInvasivePlants
    }
  },
  'biocontrol_efficacy_transect_lines': {
    items: {
      ...BiocontrolEfficacyTransectLines
    }
  },
  'ui:order':['transect_data','transect_invasive_plants','biocontrol_efficacy_transect_lines']
};

/*
  Observation
*/

const Observation = {
  'observation_type_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'observation_persons': {
    items: {
      ...Persons
    }
  },
  'survey_type':{},
  'ui:order':['observation_type_code','observation_persons','survey_type']
};

const Observation_PlantTerrestrial_Data = {
  'soil_texture_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'specific_use_code': {
    'ui:widget': 'multi-select-autocomplete'
  },
  'slope_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'aspect_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'research_detection_ind': {},
  'well_ind': {},
  'special_care_ind': {},
  'ui:order':['soil_texture_code','specific_use_code','slope_code','aspect_code','research_detection_ind','well_ind','special_care_ind']
};

const Observation_PlantTerrestrial = {
  'observation_plant_terrestrial_data': {
    ...FourColumnStyle,
    ...Observation_PlantTerrestrial_Data
  },
  'invasive_plants': {
    items: {
      ...FourColumnStyle,
      ...TerrestrialPlants
    }
  },
  'ui:order':['observation_plant_terrestrial_data','invasive_plants']
};

const Observation_PlantAquatic = {
  'waterbody_data': {
    ...ThreeColumnStyle,
    ...WaterbodyData,
    'water_level_management': {
      'ui:widget': 'multi-select-autocomplete'
    },
    'substrate_type': {
      'ui:widget': 'multi-select-autocomplete'
    },
    'adjacent_land_use':{
      'ui:widget': 'multi-select-autocomplete'
    },
    'tidal_influence': {},
    'inflow_permanent':{'ui:widget': 'multi-select-autocomplete'},
    'inflow_other':{'ui:widget': 'multi-select-autocomplete'},
    'outflow':{'ui:widget': 'multi-select-autocomplete'},
    
    'comment': {
      'ui:widget': 'textarea'
    },
    'ui:order':[
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
      'comment'
    ]
  },
  'shoreline_types':{},
  'water_quality':{},
  'invasive_plants': {
    items: {
      ...ThreeColumnStyle,
      ...AquaticPlants
    }
  },
  'ui:order':['waterbody_data','shoreline_types','water_quality','invasive_plants']
};

/* 
  Collection
*/

const Microsite_Conditions = {
  'mesoslope_position_code':{},
  'site_surface_shape_code':{},
  'ui:order':['mesoslope_position_code','site_surface_shape_code']
}

const Collection = {
  'microsite_conditions': {
    ...Microsite_Conditions
  },
  'collection_persons': {
    items: {
      ...Persons
    }
  },
  'weather_conditions': {
    ...Weather_Conditions
  },
  'ui:order':['microsite_conditions','collection_persons','weather_conditions']
};

const Biocontrol_Collection_Details = {
  ...ThreeColumnStyle,
  'invasive_plant_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'biological_agent_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'collection_type':{},
  'plant_count':{},
  'historical_iapp_site_id': {},
  'collection_method': {
    'ui:widget': 'single-select-autocomplete'
  },
    'num_of_plants': {
  },
  'start_time': {
    'ui:widget': 'datetime'
  },
  'stop_time': {
    'ui:widget': 'datetime'
  },
  'total_time': {
    'ui:readonly': true
  },
  'actual_quantity_and_life_stage_of_agent_collected': {},
  'estimated_quantity_and_life_stage_of_agent_collected': {},
  'comment': {
    'ui:widget': 'textarea'
  },
  'ui:order':[
    'invasive_plant_code',
    'biological_agent_code',
    'historical_iapp_site_id',
    'collection_type',
    'plant_count',
    'collection_method',
    'num_of_plants',
    'start_time',
    'stop_time',
    'total_time',
    'actual_quantity_and_life_stage_of_agent_collected',
    'estimated_quantity_and_life_stage_of_agent_collected',
    'comment'
  ]
};

const Collection_BioControll = {
  'collections': {
    items: {
      ...Biocontrol_Collection_Details
    }
  },
  'ui:order':['collections']
};

/*
  Animal Activity
*/

const Treatment_ChemicalAnimalTerrestrial = {
  'terrestrial_animal_information': {
    ...ThreeColumnStyle,
    'invasive_animal_species': {
      'ui:widget': 'multi-select-autocomplete'
    },
    'number': {},
    'life_stage': { 'ui:widget': 'single-select-autocomplete' },
    'sex': { 'ui:widget': 'single-select-autocomplete' },
    'condition': { 'ui:widget': 'single-select-autocomplete' },
    'ui:order': [
      'invasive_animal_species',
      'number',
      'life_stage',
      'sex',
      'condition'
    ]
  }
}

const Treatment_MechanicalAnimalTerrestrial = {
  'terrestrial_animal_information': {
    ...ThreeColumnStyle,
    'invasive_animal_species': {
      'ui:widget': 'multi-select-autocomplete'
    },
    'number': {},
    'life_stage': { 'ui:widget': 'single-select-autocomplete' },
    'sex': { 'ui:widget': 'single-select-autocomplete' },
    'condition': { 'ui:widget': 'single-select-autocomplete' },
    'ui:order': [
      'invasive_animal_species',
      'number',
      'life_stage',
      'sex',
      'condition'
    ]
  }
}

const Monitoring_ChemicalAnimalTerrestrial = {
  'terrestrial_animal_information': {
    ...ThreeColumnStyle,
    'invasive_animal_species': {
      'ui:widget': 'multi-select-autocomplete'
    },
    'number': {},
    'life_stage': { 'ui:widget': 'single-select-autocomplete' },
    'sex': { 'ui:widget': 'single-select-autocomplete' },
    'condition': { 'ui:widget': 'single-select-autocomplete' },
    'ui:order': [
      'invasive_animal_species',
      'number',
      'life_stage',
      'sex',
      'condition'
    ]
  }
}

const Monitoring_MechanicalAnimalTerrestrial = {
  'terrestrial_animal_information': {
    ...ThreeColumnStyle,
    'invasive_animal_species': {
      'ui:widget': 'multi-select-autocomplete'
    },
    'number': {},
    'life_stage': { 'ui:widget': 'single-select-autocomplete' },
    'sex': { 'ui:widget': 'single-select-autocomplete' },
    'condition': { 'ui:widget': 'single-select-autocomplete' },
    'ui:order': [
      'invasive_animal_species',
      'number',
      'life_stage',
      'sex',
      'condition'
    ]
  }
}

const Activity_AnimalTerrestrial = {
  ...OneColumnStyle,
  'location_information': {
    ...ThreeColumnStyle,
    'land_use': {},
    'biogeoclimatic_zone': {},
    'management_unit': {},
    'wildlife_habitat_area': {},
    'additional_site_features': {},
    'comment': {},
    'ui:order': [
      'land_use',
      'biogeoclimatic_zone',
      'management_unit',
      'wildlife_habitat_area',
      'additional_site_features',
      'comment'
    ]
  },
  'methods': {
    ...ThreeColumnStyle,
    'survey_or_research_observation': {
      'ui:widget': 'single-select-autocomplete'
    },
    'survey_method': {
      'ui:widget': 'single-select-autocomplete'
    },
    'survey_design': {
      'ui:widget': 'single-select-autocomplete'
    },
    'survey_start_date_time': {},
    'survey_end_date_time': {},
    "survey_details": {},
    'observation_method': {
      'ui:widget': 'single-select-autocomplete'
    },
    'comments': {},
    'ui:order': [
      'survey_or_research_observation',
      'survey_method',
      'survey_design',
      'survey_start_date_time',
      'survey_end_date_time',
      'survey_details',
      'observation_method',
      'comments'
    ]
  },
  'terrestrial_animal_information': {
    ...ThreeColumnStyle,
    'invasive_animal_species': {
      'ui:widget': 'multi-select-autocomplete'
    },
    'occurrence': {
      'ui:widget': 'single-select-autocomplete'
    },
    'number': {},
    'life_stage': {
      'ui:widget': 'single-select-autocomplete'
    },
    'sex': {
      'ui:widget': 'single-select-autocomplete'
    },
    'condition': {
      'ui:widget': 'single-select-autocomplete'
    },
    'behaviour': {
      'ui:widget': 'single-select-autocomplete'
    },
    'station_id': {},
    'captured': {
      'ui:widget': 'single-select-autocomplete'
    },
    'detection_distance': {},
    'specimen_id': {},
    'sample_collected': {
      'ui:widget': 'single-select-autocomplete'
    },
    'sample_id': {},
    'edna_sample': {
      'ui:widget': 'single-select-autocomplete'
    },
    'edna_sample_id': {},
    'disposal_method': {
      'ui:widget': 'single-select-autocomplete'
    },
    'comment': {},
    'ui:order':[
      'invasive_animal_species',
      'occurrence',
      'number',
      'life_stage',
      'sex',
      'condition',
      'behaviour',
      'station_id',
      'captured',
      'detection_distance',
      'specimen_id',
      'sample_collected',
      'sample_id',
      'edna_sample',
      'edna_sample_id',
      'disposal_method',
      'comment'
    ]
  },
  'animal_measurements': {
    ...ThreeColumnStyle,
    'length': {},
    'length_method': {},
    'weight': {},
    'ui:order': [
      'length',
      'length_method',
      'weight'
    ]
  },
  'microhabitat': {
    ...ThreeColumnStyle,
    'habitat': {},
    'primary_vegetation_layer': {},
    'primary_vegetation_layer_percent_cover': {},
    'secondary_vegetation_layer': {},
    'secondary_vegetation_layer_percent_cover': {},
    'substrate_type': {},
    'air_temperature': {},
    'ui:order':[
      'habitat',
      'primary_vegetation_layer',
      'primary_vegetation_layer_percent_cover',
      'secondary_vegetation_layer',
      'secondary_vegetation_layer_percent_cover',
      'substrate_type',
      'air_temperature'
    ]
  },
  'ui:order':['location_information', 'methods', 'terrestrial_animal_information','animal_measurements','microhabitat']
};

const Activity_AnimalAquatic = {
  'invasive_aquatic_animals': {
    items: {
      ...ThreeColumnStyle,
      ...AquaticAnimals
    }
  },
  'site_information': {
    'waterbody_data': {
      ...FourColumnStyle,
      ...WaterbodyData,
      'reach_number': {},
      'adjacent_land_use': {},
      'watershed_code': {},
      'waterbody_id': {},
      'additional_site_features': {
        'ui:widget': 'textarea'
      },
      'comment': {
        'ui:widget': 'textarea'
      },
      'ui:order':[
        'waterbody_type',
        'waterbody_name_gazetted',
        'waterbody_name_local',
        'waterbody_access',
        'waterbody_use',
        'reach_number',
        'adjacent_land_use',
        'watershed_code',
        'waterbody_id',
        'additional_site_features',
        'comment',
      ]
    },
    'terrain_characteristics': {
      ...FourColumnStyle,
      ...TerrainCharacteristics
    },
    'access': {
      ...FourColumnStyle,
      ...Access
    },
    'aquatic_flora': {
      ...ThreeColumnStyle,
      ...AquaticFlora
    },
    'water_quality': {
      ...ThreeColumnStyle,
      ...WaterQuality,
      'water_sample': {},
      'water_sample_requisition_number': {},
      'surface_water_temperature': {},
      'field_ph': {},
      'turbidity': {},
      'ice_depth': {},
      'ui:order':[
        'water_sample',
        'water_sample_requisition_number',
        'surface_water_temperature',
        'field_ph',
        'turbidity',
        'ice_depth',
        'water_sample_depth',
        'secchi_depth',
        'water_colour'
      ]
    },
    'conductivity_profile': {
      ...ThreeColumnStyle,
      ...ConductivityProfile
    },
    'ui:order':[
      'waterbody_data',
      'terrain_characteristics',
      'access',
      'aquatic_flora',
      'water_quality',
      'conductivity_profile'
    ]
  },
  'activity_data': {
    'survey_data': {
      ...TwoColumnStyle,
      ...SurveyData
    },
    'treatment_data': {
      ...TwoColumnStyle,
      ...TreatmentData
    },
    'monitoring_data': {
      ...TwoColumnStyle,
      ...MonitoringData
    },
    'net_trap_specifications': {
      ...ThreeColumnStyle,
      ...NetTrapSpecifications
    },
    'electrofisher_specifications': {
      ...ThreeColumnStyle,
      ...ElectrofisherSpecifications
    },
    'plankton_tow_sample': {
      ...ThreeColumnStyle,
      ...PlanktonTowSample
    },
    'substrate_sample': {
      ...ThreeColumnStyle,
      ...SubstrateSample
    },
    'shoreline_surveys': {
      ...ThreeColumnStyle,
      ...ShorelineSurveys
    },
    'edna': {
      ...ThreeColumnStyle,
      ...EDna
    },
    'habitat_alteration': {
      ...TwoColumnStyle,
      ...HabitatAlteration
    },
    'chemical': {
      ...TwoColumnStyle,
      ...Chemical
    },
    'biological': {
      ...TwoColumnStyle,
      ...Biological
    },
    'ui:order':[
      'survey_data',
      'treatment_data',
      'monitoring_data',
      'net_trap_specifications',
      'electrofisher_specifications',
      'plankton_tow_sample',
      'substrate_sample',
      'shoreline_surveys',
      'edna',
      'habitat_alteration',
      'chemical',
      'biological',
      'activity_type'
    ]
  },
  'ui:order':['invasive_aquatic_animals','site_information','activity_data']
};

/*
  Dispersal
*/

const Monitoring_BiologicalDispersal = {
  'monitoring_organization': {},
  'biological_agent_presence_code': {
    'ui:widget': 'multi-select-autocomplete'
  },
  'count_duration': {},
  'biological_agent_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'plant_count': {},
  'biological_agent_count': {},
  'applicator1_name': {},
  'applicator2_name': {},
  'treatment_organization': {},
  'invasive_plant_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'collection_history':{},
  'collection_history_comments':{},
  'suitable_collection_site':{},
  'phen_transect_sampler': {},
  'phen_transect_recorder': {},
  'phen_transect_seedlings': {},
  'phen_transect_rosettes': {},
  'phen_transect_bolting': {},
  'phen_transect_flowering': {},
  'phen_transect_seeds': {},
  'phen_transect_senescent': {},
  'phen_total_plants': {},
  'phen_number_stems': {},
  'phen_tallest_1': {},
  'phen_tallest_2': {},
  'phen_tallest_3': {},
  'phen_tallest_4': {},
  'phen_level_se': {},
  'phen_level_ro': {},
  'phen_level_bo': {},
  'phen_level_fl': {},
  'phen_level_sf': {},
  'phen_level_sc': {},
  'phen_total_percentage': {
    'ui:readonly': true
  },
  'ui:order':[
    'invasive_plant_code',
    'applicator1_name',
    'applicator2_name',
    'monitoring_organization',
    'biological_agent_presence_code',
    'count_duration',
    'biological_agent_code',
    'plant_count',
    'biological_agent_count',
    'collection_history',
    'collection_history_comments',
    'suitable_collection_site',
    'treatment_organization',
    'phen_transect_sampler',
    'phen_transect_recorder',
    'phen_transect_seedlings',
    'phen_transect_rosettes',
    'phen_transect_bolting',
    'phen_transect_flowering',
    'phen_transect_seeds',
    'phen_transect_senescent',
    'phen_total_plants',
    'phen_number_stems',
    'phen_tallest_1',
    'phen_tallest_2',
    'phen_tallest_3',
    'phen_tallest_4',
    'phen_level_se',
    'phen_level_ro',
    'phen_level_bo',
    'phen_level_fl',
    'phen_level_sf',
    'phen_level_sc',
    'phen_total_percentage'
  ]
};

/*
  Treatment
*/

const Treatment = {
  'treatment_organization': {},
  'treatment_location': {
    'ui:widget': 'textarea'
  },
  'treatment_persons': {
    items: {
      ...Persons
    }
  },
  'ui:order':['treatment_organization','treatment_location','treatment_persons']
};

const Treatment_Information_BiologicalPlant = {
  ...Microsite_Conditions,
 ...Treatment,
 ...Weather_Conditions,
 'ui:order':['microsite_conditions','treatment_persons','weather_conditions']
}

const Treatment_MechanicalPlant = {
  'mechanical_plant_information':{
    items: {
      ...ThreeColumnStyle,
      'invasive_plant_code': {
        'ui:widget': 'single-select-autocomplete'
      },
      'mechanical_method_code': {
        'ui:widget': 'single-select-autocomplete'
      },
      'mechanical_disposal_code': {
        'ui:widget': 'single-select-autocomplete'
      },
    },
    'ui:order':['invasive_plant_code','mechanical_method_code','mechanical_disposal_code']
  },
  'ui:order':["mechanical_plant_information"]
};

const Treatment_MechanicalPlantAquatic = {
  'shoreline_types':{},
  'mechanical_treatment_information': {
    ...Treatment_MechanicalPlant
  },
  'ui:order':['shoreline_types']
}

const Treatment_MechanicalPlant_BulkEdit = {
  'invasive_plant_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'mechanical_method_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'mechanical_disposal_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'ui:order':['invasive_plant_code','mechanical_method_code','mechanical_disposal_code']
};

const Treatment_BiologicalPlant = {
  'invasive_plant_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'treatment_issues_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'classified_area_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  
  'mortality': {},
  'agent_source': {},
  'collection_date':{
    'ui:widget': 'datetime'
  },
  'plant_collected_from':{},
  'biological_agent_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'biological_agent_stages':{
    'biological_agent_stage_code': {
      'ui:widget': 'single-select-autocomplete'
    },
    'release_quantity': {},
    'ui:order':['biological_agent_stage_code','release_quantity']
  },
  'total_release_quantity':{
    'ui:readonly': true
  },
  'linear_segment':{},
  'bioagent_maturity_status_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'ui:order':[
    'invasive_plant_code',
    'biological_agent_code',
    'biological_agent_stages',
    'total_release_quantity',
    'treatment_issues_code',
    'classified_area_code',
    'mortality',
    'agent_source',
    'collection_date',
    'plant_collected_from',
    'linear_segment',
    'bioagent_maturity_status_code'
  ]
};

const Treatment_BiologicalPlant_BulkEdit = {
  'invasive_plant_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'classified_area_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'biological_agent_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'biological_agent_stage_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'bioagent_maturity_status_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'ui:order':['invasive_plant_code','classified_area_code','biological_agent_code','biological_agent_stage_code','bioagent_maturity_status_code']
};

/*
  Monitoring
*/

const Monitoring = {
  linked_id: {
    'ui:widget': 'single-select-autocomplete'
  },
  'observer_name': {},
  'tank_mix': {
    'ui:widget': 'select'
  },
  'efficacy_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'ui:order':['linked_id','observer_name','tank_mix','efficacy_code']
};

const Monitoring_BiologicalTerrestrialPlant = {
  'invasive_plant_code':{},
  'plant_count': {},
  'agent_count': {},
  'count_duration': {},
  'suitable_collection_site':{},
  'agent_destroyed_ind': {},
  'legacy_presence_ind': {},
  'foliar_feeding_damage_ind': {},
  'root_feeding_damage_ind': {},
  'oviposition_marks_ind': {},
  'eggs_present_ind': {},
  'larvae_present_ind': {},
  'pupae_present_ind': {},
  'adults_present_ind': {},
  'tunnels_present_ind': {},
  'biological_agent_spread': {},
  'ui:order':[
    'invasive_plant_code',
    'plant_count',
    'agent_count',
    'count_duration',
    'suitable_collection_site',
    'agent_destroyed_ind',
    'legacy_presence_ind',
    'foliar_feeding_damage_ind',
    'root_feeding_damage_ind',
    'oviposition_marks_ind',
    'eggs_present_ind',
    'larvae_present_ind',
    'pupae_present_ind',
    'adults_present_ind',
    'tunnels_present_ind',
    'biological_agent_spread'
  ]
};

const FREP = {
  observation_type_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  observation_persons: {
    items: {
      ...Persons
    }
  }
};

const FREP_Stand_Table = {
  ...ThreeColumnStyle,
  tree_num: {},
  species: { 'ui:widget': 'single-select-autocomplete' },
  wt_class: { 'ui:widget': 'single-select-autocomplete' },
  dbh: {},
  ht: {}
};

const FREP_Log = {
  ...ThreeColumnStyle,
  log_num: {},
  species: {
    'ui:widget': 'single-select-autocomplete'
  },
  decay_class: {
    'ui:widget': 'single-select-autocomplete'
  },
  diameter: {},
  length: {}
};

const FREP_FormA = {
  plot_identification: {
    ...ThreeColumnStyle,
    date: {},
    opening_id: {},
    assessed_by: {},
    plot_number: {},
    stratum_id: { 'ui:widget': 'single-select-autocomplete' },
    stratum_number: { 'ui:widget': 'single-select-autocomplete' },
    stratum_type: { 'ui:widget': 'single-select-autocomplete' },
    utm_zone: {},
    easting: {},
    northing: {}
  },
  plot_identification_trees: {
    ...ThreeColumnStyle,
    trees_exist: {},
    baf: {},
    fixed_area: {},
    full_count_area: {}
  },
  stand_table: { items: { ...FREP_Stand_Table } },
  tree_comments: {},
  plot_information: {
    cwd_in_transect: {},
    first_leg: {},
    second_leg: {},
    log: { items: { ...FREP_Log } },
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
    noncommerical_brush: { 'ui:widget': 'single-select-autocomplete' },
    low_mercantile_timber: { 'ui:widget': 'single-select-autocomplete' },
    sensitive_terrain: { 'ui:widget': 'single-select-autocomplete' },
    uwr_wha_whf: { 'ui:widget': 'single-select-autocomplete' },
    ogma: { 'ui:widget': 'single-select-autocomplete' },
    visuals: { 'ui:widget': 'single-select-autocomplete' },
    cultural_heritage_feature: { 'ui:widget': 'single-select-autocomplete' },
    recration_feature: { 'ui:widget': 'single-select-autocomplete' },
    other: {},
    comments: {}
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
    license: {},
    district_code: {
      'ui:widget': 'single-select-autocomplete'
    },
    location_description: {},
    nar: {},
    gross_area: {},
    override_code: {
      'ui:widget': 'single-select-autocomplete'
    }
  },
  innovative_practices: {
    innovative_practices: {}
  },
  invasive_plants: {
    invasive_code: {
      'ui:widget': 'single-select-autocomplete'
    }
  },
  evaluator_opinion: {
    ...TwoColumnStyle,
    evaluator_opinion_code: {
      'ui:widget': 'single-select-autocomplete'
    },
    rationale: {}
  },
  form_b: {
    items: {
      ...FREP_FormB
    }
  }
};

const ActivityPersons = {
  person_name: {},
}

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
  Monitoring_BiologicalDispersal,
  Monitoring_ChemicalAnimalTerrestrial,
  Monitoring_MechanicalAnimalTerrestrial,
  Treatment,
  Treatment_MechanicalPlant,
  Treatment_Information_BiologicalPlant,
  Treatment_MechanicalPlantAquatic,
  Treatment_MechanicalPlant_BulkEdit,
  Treatment_BiologicalPlant,
  Treatment_BiologicalPlant_BulkEdit,
  Treatment_MechanicalAnimalTerrestrial,
  Treatment_ChemicalAnimalTerrestrial,
  Monitoring,
  Monitoring_BiologicalTerrestrialPlant,
  Collection,
  Collection_BioControll,
  ProjectCode,
  Herbicide,
  FourColumnStyle,
  ThreeColumnStyle,
  OneColumnStyle,
  TwoColumnStyle,
  Jurisdictions,
  Weather_Conditions,
  FREP,
  FREP_FormA,
  FREP_FormB,
  FREP_FormC,
  FREP_Log,
  FREP_Stand_Table,
  ActivityPersons
};

export default BaseUISchemaComponents;
