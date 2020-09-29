/**
 * This file should contain any UI Schema items that have one or more nested elements.
 *
 * Example of schema item with nested element:
 *
 * const Obj = {
 *   some_nested_field: {
 *      ...nested_field_properties
 *   }
 * }
 */

import BaseUISchemaComponents from 'rjsf/BaseUISchemaComponents';

const Observation = {
  observation_date: {
    type: 'string',
    title: 'Date'
  },
  observation_time: {
    type: 'string',
    title: 'Time'
  },
  observation_type: {
    type: 'string',
    title: 'Type'
  },
  observer_first_name: {
    type: 'string',
    title: 'First Name',
    maximum: 50
  },
  observer_last_name: {
    type: 'string',
    title: 'Last Name',
    maximum: 50
  },
  reported_area: {
    type: 'integer',
    title: 'Area',
    minimum: 1,
    maximum: 100
  },
  sample_taken: {
    'ui:widget': 'radio',
    type: 'boolean',
    title: 'Sample Taken'
  },
  sample_number: {
    type: 'string',
    title: 'Sample Number',
    maximum: 50
  },
  negative_obs_ind: {
    'ui:widget': 'radio',
    type: 'boolean',
    title: 'Negative Observation'
  }
};

const Observation_PlantTerrestial = {
  species_density_code: {
    type: 'string',
    title: 'Density'
  },
  species_distribution_code: {
    type: 'string',
    title: 'Distribution'
  },
  soil_texture_code: {
    type: 'string',
    title: 'Soil Texture'
  },
  specific_use_code: {
    type: 'string',
    title: 'Specific Use'
  },
  slope_code: {
    type: 'string',
    title: 'Slope'
  },
  aspect_code: {
    type: 'string',
    title: 'Aspect'
  },
  proposed_action_code: {
    type: 'string',
    title: 'Proposed Action'
  },
  flowering: {
    'ui:widget': 'radio',
    type: 'boolean',
    title: 'Flowering'
  },
  plant_life_stage: {
    type: 'string',
    title: 'Life Stage'
  },
  plant_health: {
    type: 'string',
    title: 'Health'
  },
  plant_seed_stage: {
    type: 'string',
    title: 'Seed Stage'
  },
  sample_identifier: {
    type: 'string',
    title: 'Sample ID'
  },
  range_unit_number: {
    type: 'string',
    title: 'Range Unit'
  },
  legacy_site_ind: {
    'ui:widget': 'radio',
    type: 'boolean',
    title: 'Legacy site'
  },
  early_detection_rapid_resp_ind: {
    'ui:widget': 'radio',
    type: 'boolean',
    title: 'Early Detection'
  },
  research_detection_ind: {
    'ui:widget': 'radio',
    type: 'boolean',
    title: 'Research Detection'
  },
  well_ind: {
    'ui:widget': 'radio',
    type: 'boolean',
    title: 'Visible well nearby'
  },
  special_care_ind: {
    'ui:widget': 'radio',
    type: 'boolean',
    title: 'Special Care'
  },
  biological_ind: {
    'ui:widget': 'radio',
    type: 'boolean',
    title: 'Biological'
  }
};

const Observation_PlantAquatic = {
  specific_use_code: {
    type: 'string',
    title: 'Specific Use'
  },
  proposed_action_code: {
    type: 'string',
    title: 'Proposed Action'
  },
  flowering: {
    type: 'boolean',
    title: 'Flowering'
  },
  plant_life_stage: {
    type: 'string',
    title: 'Life Stage'
  },
  plant_health: {
    type: 'string',
    title: 'Health'
  },
  plant_seed_stage: {
    type: 'string',
    title: 'Seed Stage'
  },
  sample_identifier: {
    type: 'string',
    title: 'Sample ID'
  },
  range_unit_number: {
    type: 'string',
    title: 'Range Unit'
  },
  legacy_site_ind: {
    'ui:widget': 'radio',
    type: 'boolean'
  },
  early_detection_rapid_resp_ind: {
    'ui:widget': 'radio',
    type: 'boolean',
    title: 'Early Detection'
  },
  research_detection_ind: {
    'ui:widget': 'radio',
    type: 'boolean',
    title: 'Research Detection'
  },
  sample_taken: {
    'ui:widget': 'radio',
    type: 'boolean',
    title: 'Sample Taken'
  },
  sample_point_number: {
    type: 'string',
    title: 'Sample Number'
  },
  special_care_ind: {
    'ui:widget': 'radio',
    type: 'boolean',
    title: 'Special Care'
  },
  biological_ind: {
    'ui:widget': 'radio',
    type: 'boolean',
    title: 'Biological'
  },
  secchi_depth: {
    type: 'number',
    format: 'float',
    title: 'secchi depth'
  },
  water_depth: {
    type: 'number',
    format: 'float',
    title: 'water depth'
  },
  voucher_submitted_ind: {
    'ui:widget': 'radio',
    type: 'boolean',
    title: 'Voucher submitted'
  },
  voucher_submission_detail: {
    type: 'string',
    title: 'Voucher submission details'
  }
};

const Observation_AnimalTerrestrial = {
  number_of_individuals_observed: {
    type: 'number',
    title: 'Number of individuals'
  },
  life_stage: {
    type: 'string',
    title: 'Life Stage',
    enum: ['unknown', 'egg', 'neonate', 'juvenile', 'adult']
  },
  behaviour: {
    type: 'string',
    title: 'Behaviour',
    enum: ['unknown', 'moving', 'resting', 'deceased']
  }
};

const Observation_AnimalAquatic = {
  observation_details: {
    type: 'string',
    title: 'Aquatic animal observations'
  }
};

const Treatment = {
  title: 'Treatment Information',
  description: 'Basic information captured for all treatments',
  type: 'object'
};

const Treatment_ChemicalPlant = {
  primary_applicator_employee_code: {
    type: 'string',
    title: 'Primary Applicator employee code'
  },
  secondary_applicator_employee_code: {
    type: 'string',
    title: 'Secondary Applicator employee code'
  },
  pesticide_employer_code: {
    type: 'string',
    title: 'Pesticide employer code'
  },
  project_management_plan_PMP: {
    type: 'string',
    title: 'Project Management Plan'
  },
  pesticide_use_permit_PUP: {
    type: 'string',
    title: 'Pesticide use permit'
  },
  chemical_treatment_method: {
    type: 'string',
    title: 'Chemical treatment method'
  },
  temperature: {
    type: 'integer',
    title: 'Temperature',
    minimum: 10,
    maximum: 30
  },
  wind_speed: {
    type: 'integer',
    title: ' Wind speed'
  },
  wind_direction: {
    type: 'string',
    title: 'Wind direction',
    enum: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  },
  humidity: {
    type: 'integer',
    title: 'Humidity',
    enum: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
  },
  mix_delivery_rate: {
    type: 'number',
    format: 'float',
    title: 'Mix delivery rate'
  },
  application_rate: {
    type: 'number',
    format: 'float',
    title: 'Application rate'
  },
  area_treated: {
    type: 'number',
    format: 'float',
    title: 'Area treated'
  },
  herbicide: {
    type: 'array',
    title: 'Herbicide',
    items: {
      ...BaseUISchemaComponents.Herbicide
    }
  }
};

const Treatment_MechanicalPlant = {
  applicator1_first_name: {
    type: 'string',
    title: 'Applicator 1 first name'
  },
  applicator1_last_name: {
    type: 'string',
    title: 'Applicator 1 last name'
  },
  applicator2_first_name: {
    type: 'string',
    title: 'Applicator 1 first name'
  },
  applicator2_last_name: {
    type: 'string',
    title: 'Applicator 1 last name'
  },
  treatment_contractor: {
    type: 'string',
    title: 'Treatment contractor'
  },
  mechanical_method: {
    type: 'string',
    title: 'Mechanical method'
  },
  mechanical_disposal_method: {
    type: 'string',
    title: 'Mechanical disposal method'
  },
  mechanical_root_removal_code: {
    type: 'string',
    title: 'Mechanical root removal code'
  },
  mechanical_soil_disturbance_code: {
    type: 'string',
    title: 'Mechanical soil disturbance code'
  },
  signage_on_site: {
    'ui:widget': 'radio',
    type: 'boolean',
    title: 'Signage on site'
  }
};

const Treatment_BiologicalPlant = {
  applicator1_first_name: {
    type: 'string',
    title: 'Applicator 1 first name'
  },
  applicator1_last_name: {
    type: 'string',
    title: 'Applicator 1 last name'
  },
  applicator2_first_name: {
    type: 'string',
    title: 'Applicator 1 first name'
  },
  applicator2_last_name: {
    type: 'string',
    title: 'Applicator 1 last name'
  },
  treatment_contractor: {
    type: 'string',
    title: 'Treatment contractor'
  },
  classified_area: {
    type: 'string',
    title: 'Classified area'
  },
  release_quantity: {
    type: 'integer',
    title: 'Release quantity'
  },
  agent_source: {
    type: 'string',
    title: 'Agent source'
  },
  biological_agent: {
    type: 'string',
    title: 'Biological agent'
  },
  biological_agent_stage: {
    type: 'string',
    title: 'Biological agent stage'
  },
  bioagent_maturity_status: {
    type: 'string',
    title: 'Bioagent maturity status'
  }
};

const Treatment_BiologicalDispersalPlant = {
  applicator1_first_name: {
    type: 'string',
    title: 'Applicator 1 first name'
  },
  applicator1_last_name: {
    type: 'string',
    title: 'Applicator 1 last name'
  },
  applicator2_first_name: {
    type: 'string',
    title: 'Applicator 2 first name'
  },
  applicator2_last_name: {
    type: 'string',
    title: 'Applicator 2 last name'
  },
  treatment_contractor: {
    type: 'string',
    title: 'Treatment contractor'
  },
  duration_of_count: {
    type: 'integer',
    title: 'Duration of count'
  },
  biological_agent: {
    type: 'string',
    title: 'Biological agent'
  },
  plant_count: {
    type: 'integer',
    title: 'Plant count'
  },
  biological_agent_count: {
    type: 'integer',
    title: 'Biological agent count'
  },
  biological_agent_presence: {
    type: 'string',
    title: 'Biological agent presence'
  }
};

const Treatment_MechanicalTerrestrialAnimal = {
  treatment_details: {
    type: 'string',
    title: 'Treatment details'
  }
};

const Treatment_ChemicalTerrestrialAnimal = {
  treatment_details: {
    type: 'string',
    title: 'Treatment details'
  }
};

const Treatment_BiologicalTerrestrialAnimal = {
  treatment_details: {
    type: 'string',
    title: 'Treatment details'
  }
};

const Monitoring = {
  activity_id: {
    type: 'integer',
    title: 'Treatment id'
  },
  observer_first_name: {
    type: 'string',
    title: 'First Name'
  },
  observer_last_name: {
    type: 'string',
    title: 'Last Name'
  },
  efficacy_rating_code: {
    type: 'integer',
    title: 'Efficacy rating',
    enum: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]
  }
};

const Monitoring_ChemicalTerrestrialAquaticPlant = {
  monitoring_details: {
    type: 'string',
    title: 'Monitoring details'
  }
};

const Monitoring_MechanicalTerrestrialAquaticPlant = {
  monitoring_details: {
    type: 'string',
    title: 'Monitoring details'
  }
};

const Monitoring_BiologicalTerrestrialPlant = {
  plant_count: {
    type: 'integer',
    title: 'Plant count'
  },
  agent_count: {
    type: 'integer',
    title: 'Agent count'
  },
  count_duration: {
    type: 'integer',
    title: 'Count duration'
  },
  agent_destroyed_ind: {
    'ui:widget': 'radio',
    type: 'boolean',
    title: 'Agent destroyed'
  },
  legacy_presence_ind: {
    'ui:widget': 'radio',
    type: 'boolean',
    title: 'Legacy presence'
  },
  foliar_feeding_damage_ind: {
    'ui:widget': 'radio',
    type: 'boolean',
    title: 'Foliar feeding damage'
  },
  root_feeding_damage_ind: {
    'ui:widget': 'radio',
    type: 'boolean',
    title: 'Root feeding damage'
  },
  oviposition_marks_ind: {
    'ui:widget': 'radio',
    type: 'boolean',
    title: 'Oviposition marks'
  },
  eggs_present_ind: {
    'ui:widget': 'radio',
    type: 'boolean',
    title: 'Eggs present'
  },
  larvae_present_ind: {
    'ui:widget': 'radio',
    type: 'boolean',
    title: 'Larvae present'
  },
  pupae_present_ind: {
    'ui:widget': 'radio',
    type: 'boolean',
    title: 'Pupae present'
  },
  adults_present_ind: {
    'ui:widget': 'radio',
    type: 'boolean',
    title: 'Adults present'
  },
  tunnels_present_ind: {
    'ui:widget': 'radio',
    type: 'boolean',
    title: 'Tunnels present'
  },
  biological_agent_spread: {
    type: 'string',
    title: 'Biological agent spread'
  }
};

const Monitoring_MechanicalTerrestrialAnimal = {
  monitoring_details: {
    type: 'string',
    title: 'Monitoring details'
  }
};

const Monitoring_ChemicalTerrestrialAnimal = {
  monitoring_details: {
    type: 'string',
    title: 'Monitoring details'
  }
};

const Monitoring_BiologicalTerrestrialAnimal = {
  monitoring_details: {
    type: 'string',
    title: 'Monitoring details'
  }
};

const Media = {
  media_date: {
    type: 'string',
    title: 'Date'
  },
  description: {
    type: 'string',
    title: 'Description'
  },
  file_name: {
    type: 'string',
    title: 'File Name'
  },
  encoded_file: {
    type: 'string',
    format: 'base64',
    description: 'A Data URL base64 encoded image',
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEBLAEsAAD/4REy...'
  }
};

const PaperFile = {
  description: {
    type: 'string',
    title: 'Description',
    maximum: 50
  }
};

const Herbicide = {
  herbicide_name: {
    type: 'string',
    title: 'herbicide name'
  },
  herbicide_amount: {
    type: 'number',
    title: 'herbicide amount',
    format: 'float'
  }
};

const Point = {
  radius: {
    type: 'number',
    format: 'float',
    title: 'Radius',
    writeOnly: true
  },
  coordinates: {
    type: 'array',
    items: {}
  }
};

const LineString = {
  offset: {
    type: 'number',
    format: 'float',
    title: 'Offset',
    writeOnly: true
  },
  coordinates: {
    type: 'array',
    items: {}
  }
};

const Polygon = {
  coordinates: {
    type: 'array',
    items: {}
  }
};

const Geometry = {
  well_proximity: {
    type: 'number',
    format: 'float',
    title: 'Well proximity',
    readOnly: true
  },
  well_tag: {
    type: 'integer',
    title: 'Well tag',
    readOnly: true
  },
  subType: {
    title: 'Geometry subtype',
    oneOf: [
      {
        ...BaseUISchemaComponents.Point
      },
      {
        ...BaseUISchemaComponents.LineString
      },
      {
        ...BaseUISchemaComponents.Polygon
      }
    ]
  }
};

const Activity = {
  species_agency_code: {
    type: 'string',
    title: 'Agency'
  },
  jurisdiction_code: {
    type: 'string',
    title: 'Jurisdiction'
  },
  activity_status: {
    type: 'string',
    title: 'Activity status',
    enum: ['sync', 'done', 'pending', 'errors']
  },
  species_id: {
    type: 'string',
    title: 'Species'
  },
  general_comment: {
    type: 'string',
    title: 'Comment',
    maximum: 300
  },
  access_description: {
    type: 'string',
    title: 'Access Description',
    maximum: 300
  },
  media_indicator: {
    'ui:widget': 'radio',
    type: 'boolean',
    title: 'Photo'
  },
  created_date_on_device: {
    type: 'string',
    title: 'Created date on device'
  },
  updated_date_on_device: {
    type: 'string',
    title: 'Updated date on device'
  },
  paper_file: {
    type: 'array',
    title: 'Paper file',
    items: {
      ...BaseUISchemaComponents.PaperFile
    }
  }
};

const UISchemaComponents = {
  Observation,
  Observation_PlantTerrestial,
  Observation_PlantAquatic,
  Observation_AnimalTerrestrial,
  Observation_AnimalAquatic,
  Treatment,
  Treatment_ChemicalPlant,
  Treatment_MechanicalPlant,
  Treatment_BiologicalPlant,
  Treatment_BiologicalDispersalPlant,
  Treatment_MechanicalTerrestrialAnimal,
  Treatment_ChemicalTerrestrialAnimal,
  Treatment_BiologicalTerrestrialAnimal,
  Monitoring,
  Monitoring_ChemicalTerrestrialAquaticPlant,
  Monitoring_MechanicalTerrestrialAquaticPlant,
  Monitoring_BiologicalTerrestrialPlant,
  Monitoring_MechanicalTerrestrialAnimal,
  Monitoring_ChemicalTerrestrialAnimal,
  Monitoring_BiologicalTerrestrialAnimal,
  Media,
  PaperFile,
  Herbicide,
  Geometry,
  Point,
  LineString,
  Polygon,
  Activity
};

export default UISchemaComponents;
