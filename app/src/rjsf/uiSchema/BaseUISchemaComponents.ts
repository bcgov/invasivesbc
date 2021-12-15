/**
 * This file should only contain UI Schema items that have NO nested elements.
 *
 * Example of schema item without nested element:
 *
 * const Obj = {
 *   some_field: {}
 * }
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
  activity_date_time: {},
  reported_area: {},
  latitude: {},
  longitude: {},
  utm_zone: {},
  utm_easting: {},
  utm_northing: {},
  employer_code: {},
  invasive_species_agency_code: {},
  jurisdictions: {},
  location_description: {},
  access_description: {},
  project_code: {},
  general_comment: {},
  'ui:order':[
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
    'access_description',
    'location_description',
    'project_code',
    'general_comment'
  ]
};

/** 
 * ------------------  Activity Type Data Objects  -----------------------
*/

const Observation = {
  pre_treatment_observation: {},
  observation_type_code: {},
  observation_persons: {},
  "ui:order":['pre_treatment_observation','observation_type_code','observation_persons']
};

const Monitoring = {
  linked_id: {},
  observer_first_name: {},
  observer_last_name: {},
  'ui:order': ['linked_id', 'observer_first_name', 'observer_last_name'],
};

const Treatment = {
    treatment_persons: {},
    'ui:order':['treatment_persons']
};

const Collection = {
  collection_persons: {},
  'ui:order':['collection_persons']
};


/** 
 * ------------------------  Subtype Information Objects  -----------------------------
*/

const Treatment_ChemicalPlant_Information = {
  ...ThreeColumnStyle,
  applicator1_name: {},
  applicator1_license: {},
  applicator2_name: {},
  applicator2_license: {},
  pesticide_employer_code: {},
  pesticide_use_permit_PUP: {},
  pest_management_plan: {},
  chemical_method_code: {},
  temperature: {},
  wind_speed: {},
  wind_direction_code: {},
  humidity: {},
  signage_on_site: {},
  application_start_time: {},
  'ui:order': [
    'applicator1_name',
    'applicator1_license',
    'applicator2_name',
    'applicator2_license',
    'pesticide_employer_code',
    'pesticide_use_permit_PUP',
    'pest_management_plan',
    'chemical_method_code',
    'temperature',
    'wind_speed',
    'wind_direction_code',
    'humidity',
    'signage_on_site',
    'application_start_time'
  ]
};

const Treatment_MechanicalPlant_Information = {
  items: {
    ...ThreeColumnStyle,
    invasive_plant_code: {},
    treated_area: {},
    mechanical_method_code: {},
    mechanical_disposal_code: {},
    disposed_material: {
      disposed_material_input_format: {},
      disposed_material_input_number: {},
      "ui:order":['disposed_material_input_format','disposed_material_input_number']
    }, 
    "ui:order":['invasive_plant_code','treated_area','mechanical_method_code','mechanical_disposal_code','disposed_material']
  }
};

const Observation_PlantTerrestrial_Information = {
  ...ThreeColumnStyle,
  soil_texture_code: {},
  specific_use_code: {},
  slope_code: {},
  aspect_code: {},
  research_detection_ind: {},
  well_ind: {},
  'ui:order':['soil_texture_code','specific_use_code','slope_code','aspect_code','research_detection_ind','well_ind']
};

const Monitoring_ChemicalTerrestrialAquaticPlant_Information = {
  ...TwoColumnStyle,
  invasive_plant_code: {},
  monitoring_details: {},
  'ui:order':['invasive_plant_code','monitoring_details']
};

const Monitoring_MechanicalTerrestrialAquaticPlant_Information = {
  ...TwoColumnStyle,
  invasive_plant_code: {},
  monitoring_details: {},
  'ui:order':['invasive_plant_code','monitoring_details']
};

const Monitoring_BiocontrolRelease_TerrestrialPlant_Information = {
  ...ThreeColumnStyle,
  invasive_plant_code: {},
  biological_agent_presence_code: {},
  biological_agent_code: {},
  monitoring_type: {},
  plant_count:{},
  monitoring_method: {},
  biological_agent_stages: {},
  total_bio_agent_quantity: {},
  bio_agent_location_code: {},
  agent_count: {},
  count_duration: {},
  suitable_collection_site: {},
  legacy_presence_ind: {},
  'ui:order':[
    'invasive_plant_code',
    'biological_agent_presence_code',
    'biological_agent_code',
    'monitoring_type',
    'plant_count',
    'monitoring_method',
    'biological_agent_stages',
    'total_bio_agent_quantity',
    'bio_agent_location_code',
    'agent_count',
    'count_duration',
    'suitable_collection_site',
    'legacy_presence_ind'
  ]
};

const Monitoring_BiocontrolDispersal_Information = {
  ...ThreeColumnStyle,
  invasive_plant_code: {},
  applicator1_name: {},
  applicator2_name: {},
  linear_segment: {},
  biological_agent_presence_code: {},
  biological_agent_code: {},
  monitoring_type: {},
  monitoring_method: {},
  plant_count: {},
  biological_agent_stages: {},
  total_bio_agent_quantity: {},
  biological_agent_count: {},
  collection_history: { },
  collection_history_comments: {},
  suitable_collection_site: {},
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
  phen_total_percentage: {},
  'ui:order': [
    'biological_agent_presence_code',
    'biological_agent_code',
    'biological_agent_count',
    'monitoring_type',
    'monitoring_method',
    'linear_segment',
    'biological_agent_stages',
    'plant_count', 
    'applicator1_name',
    'applicator2_name',
    'invasive_plant_code',
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
    'total_bio_agent_quantity',
    'phen_level_sc',
    'phen_total_percentage',
    'collection_history',
    'collection_history_comments',
    'suitable_collection_site'
  ],
};

const Biocontrol_Collection = {
  items: {
    ...ThreeColumnStyle,
    invasive_plant_code: {},
    biological_agent_code: {},
    historical_iapp_site_id: {},
    collection_type: {},
    plant_count: {},
    collection_method: {},
    num_of_sweeps: {},
    start_time: { },
    stop_time: {},
    total_time: {},
    actual_quantity_and_life_stage_of_agent_collected: {},
    estimated_quantity_and_life_stage_of_agent_collected: {},
    comment: {},
    'ui:order':[
      'invasive_plant_code',
      'biological_agent_code',
      'historical_iapp_site_id',
      'collection_type',
      'plant_count',
      'collection_method',
      'num_of_sweeps',
      'start_time',
      'stop_time',
      'total_time',
      'actual_quantity_and_life_stage_of_agent_collected',
      'estimated_quantity_and_life_stage_of_agent_collected',
      'comment']
  }
};

export const Biocontrol_Release_Information = {
  ...ThreeColumnStyle,
  invasive_plant_code: {},
  mortality: {},
  agent_source: {},
  collection_date: {},
  plant_collected_from: {},
  biological_agent_code: {},
  biological_agent_stages: {},
  total_release_quantity: {},
  linear_segment: {},
  'ui:order':[
    'invasive_plant_code',
    'biological_agent_stages',
    'linear_segment',
    'release_quantity',
    'mortality',
    'agent_source',
    'collection_date',
    'plant_collected_from',
    'total_release_quantity',
    'biological_agent_code',
    'biological_agent_stage_code'
  ],
};

/** 
 * ------------------------  General Objects  -----------------------------
*/

const Well_Information = {
  ...TwoColumnStyle,
  well_id: {},
  well_proximity: {},
  'ui:order':['well_id','well_proximity']
};

const ShorelineTypes = {
  items: {
    ...TwoColumnStyle,
    shoreline_type: {},
    percent_covered: {}
  }
};

const Authorization_Infotmation = {
  additional_auth_information: {},
  'ui:order':['additional_auth_information']
};

const WaterbodyData = {
  ...ThreeColumnStyle,
  waterbody_type: {},
  waterbody_name_gazetted: {},
  waterbody_name_local: {},
  waterbody_access: {},
  waterbody_use: {},
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
};

const WaterQuality = {
  ...ThreeColumnStyle,
  water_sample_depth: {},
  secchi_depth: {},
  water_colour: {},
  'ui:order':[
    'water_sample_depth',
    'secchi_depth',
    'water_colour'
  ]
};

const TerrestrialPlant = {
  ...ThreeColumnStyle,
  invasive_plant_code: {},
  occurrence: {},
  edna_sample: {},
  invasive_plant_density_code: {},
  invasive_plant_distribution_code: {},
  plant_life_stage_code: {},
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
  enda_sample_information: {
      edna_sample_id: {},
      genetic_structure_collected: {}
  },
  'ui:order':[
    'invasive_plant_code',
    'occurrence',
    'edna_sample',
    'invasive_plant_density_code',
    'invasive_plant_distribution_code',
    'plant_life_stage_code',
    'voucher_specimen_collected',
    'voucher_specimen_collection_information',
    'enda_sample_information'
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
  invasive_plant_code: {},
  observation_type: {},
  invasive_plant_density_code: {},
  invasive_plant_distribution_code: {},
  plant_life_stage_code: {},
  voucher_specimen_collected: {},
  edna_sample: {},
  genetic_sample_id: {},
  genetic_structure_collected: {},
  enda_sample_information: {
    edna_sample_id: {},
    sample_type: {},
    field_replicates_num: {},
    control_sample_taken: {}
  }
};

const AquaticPlants = {
  items: {
    ...AquaticPlant
  }
};

const WaterbodyData_AdditionalFields = {
  water_level_management: {},
  substrate_type: {},
  tidal_influence: {},
  adjacent_land_use: {},
  inflow_permanent: {},
  inflow_other: {},
  outflow: {},
  comment: {},
  'ui:order':[
    'water_level_management',
    'substrate_type',
    'tidal_influence',
    'adjacent_land_use',
    'inflow_permanent',
    'inflow_other',
    'outflow',
    'comment'
  ]
};

const Weather_Conditions = {
  ...ThreeColumnStyle,
  temperature: {},
  cloud_cover_code: {},
  precipitation_code: {},
  wind_speed: {},
  wind_aspect: {},
  weather_comments: {},
  'ui:order':['temperature','cloud_cover_code','precipitation_code','wind_speed','wind_aspect','weather_comments']
};

const Microsite_Conditions = {
  ...TwoColumnStyle,
  mesoslope_position_code: {},
  site_surface_shape_code: {},
  'ui:order':['mesoslope_position_code','site_surface_shape_code']
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
  'ui:order':['phenology_details_recorded','target_plant_heights','winter_dormant','seedlings','rosettes','bolts','flowering','seeds_forming','senescent','target_plant_height']
};

const Spread_Results = {
  ...ThreeColumnStyle,
  spread_details_recorded: {},
  agent_density: {},
  plant_attack: {},
  max_spread_distance: {},
  max_spread_aspect: {},
  'ui:order':['spread_details_recorded','agent_density','plant_attack','max_spread_distance','max_spread_aspect']
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
    Treatment,
    Collection
  },
  activity_subtype_data_information_objects: {
    Treatment_ChemicalPlant_Information,
    Treatment_MechanicalPlant_Information,
    Observation_PlantTerrestrial_Information,
    Monitoring_ChemicalTerrestrialAquaticPlant_Information,
    Monitoring_MechanicalTerrestrialAquaticPlant_Information,
    Monitoring_BiocontrolRelease_TerrestrialPlant_Information,
    Monitoring_BiocontrolDispersal_Information,
    Biocontrol_Collection,
    Biocontrol_Release_Information
  },
  general_objects: {
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
    Spread_Results
  },
};

export default BaseUISchemaComponents;
