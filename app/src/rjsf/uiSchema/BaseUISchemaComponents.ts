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
    Monitoring_MechanicalTerrestrialAquaticPlant_Information
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
    TerrestrialPlant
  },
};

export default BaseUISchemaComponents;
