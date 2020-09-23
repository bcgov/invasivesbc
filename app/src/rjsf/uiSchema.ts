// Declare variables at top so they can be used in any order below.
// Fixes: https://palantir.github.io/tslint/rules/no-use-before-declare/
let Activity;
let Observation;
let Observation_PlantTerrestial;
let Observation_PlantAquatic;
let Observation_AnimalTerrestrial;
let Observation_AnimalAquatic;
let Treatment;
let Treatment_ChemicalPlant;
let Treatment_MechanicalPlant;
let Treatment_BiologicalPlant;
let Treatment_BiologicalDispersalPlant;
let Treatment_MechanicalTerrestrialAnimal;
let Treatment_ChemicalTerrestrialAnimal;
let Treatment_BiologicalTerrestrialAnimal;
let Monitoring;
let Monitoring_ChemicalTerrestrialAquaticPlant;
let Monitoring_MechanicalTerrestrialAquaticPlant;
let Monitoring_BiologicalTerrestrialPlant;
let Monitoring_MechanicalTerrestrialAnimal;
let Monitoring_ChemicalTerrestrialAnimal;
let Monitoring_BiologicalTerrestrialAnimal;
let Media;

Activity = {
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
    title: 'Activity status'
  },
  species_id: {
    type: 'string',
    title: 'Species'
  },
  general_comment: {
    type: 'string',
    title: 'Comment',
    'ui:widget': 'textarea'
  },
  access_description: {
    type: 'string',
    title: 'Access Description',
    'ui:widget': 'textarea'
  },
  primary_paper_file_id: {
    type: 'string',
    title: 'Primary File'
  },
  secondary_paper_file_id: {
    type: 'string',
    title: 'Secondary File'
  },
  media_indicator: {
    type: 'boolean',
    title: 'Photo'
  },
  created_date_on_device: {
    type: 'string',
    title: 'created on device',
    format: 'date'
  },
  updated_date_on_device: {
    type: 'string',
    title: 'created on device',
    format: 'date-time'
  },
  media: {
    type: 'array',
    items: {
      ...Media
    }
  },
  subType: {
    ...Observation,
    ...Treatment,
    ...Monitoring
  }
};

Observation = {
  observation_id: {
    type: 'number',
    title: 'ID'
  },
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
    title: 'First Name'
  },
  observer_last_name: {
    type: 'string',
    title: 'Last Name'
  },
  reported_area: {
    type: 'integer',
    title: 'Area'
  },
  sample_taken: {
    type: 'boolean',
    title: 'Sample Taken'
  },
  sample_number: {
    type: 'string',
    title: 'Sample Number'
  },
  negative_obs_ind: {
    type: 'boolean',
    title: 'Negative Observation'
  },
  subType: {
    ...Observation_PlantTerrestial,
    ...Observation_PlantAquatic,
    ...Observation_AnimalTerrestrial,
    ...Observation_AnimalAquatic
  }
};

Observation_PlantTerrestial = {
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
    type: 'boolean'
  },
  early_detection_rapid_resp_ind: {
    type: 'boolean',
    title: 'Early Detection'
  },
  research_detection_ind: {
    type: 'boolean',
    title: 'Research Detection'
  },
  well_ind: {
    type: 'boolean',
    title: 'Well'
  },
  special_care_ind: {
    type: 'boolean',
    title: 'Special Care'
  },
  biological_ind: {
    type: 'boolean',
    title: 'Biological'
  }
};

Observation_PlantAquatic = {
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
    type: 'boolean'
  },
  early_detection_rapid_resp_ind: {
    type: 'boolean',
    title: 'Early Detection'
  },
  research_detection_ind: {
    type: 'boolean',
    title: 'Research Detection'
  },
  sample_taken: {
    type: 'boolean',
    title: 'Sample Taken'
  },
  sample_point_number: {
    type: 'string',
    title: 'Sample Number'
  },
  special_care_ind: {
    type: 'boolean',
    title: 'Special Care'
  },
  biological_ind: {
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
    type: 'boolean',
    title: 'Voucher submitted'
  },
  voucher_submission_detail: {
    type: 'string',
    title: 'Voucher submission details'
  }
};

Observation_AnimalTerrestrial = {
  Number_of_Individuals_observed: {
    type: 'number',
    title: 'Number of Individuals'
  },
  Life_Stage: {
    type: 'string',
    title: 'Life Stage'
  },
  Behaviour: {
    type: 'string',
    title: 'Behaviour'
  }
};

Observation_AnimalAquatic = {
  observation_details: {
    type: 'string',
    title: 'Aquatic animal observations'
  }
};

Treatment = {
  treatment_method: {
    type: 'string',
    title: 'Treatment method'
  },
  treatment_date: {
    type: 'string',
    title: 'Treatment date'
  },
  treatment_time: {
    type: 'string',
    title: 'Treatment time'
  },
  subType: {
    ...Treatment_ChemicalPlant,
    ...Treatment_MechanicalPlant,
    ...Treatment_BiologicalPlant,
    ...Treatment_BiologicalDispersalPlant,
    ...Treatment_MechanicalTerrestrialAnimal,
    ...Treatment_ChemicalTerrestrialAnimal,
    ...Treatment_BiologicalTerrestrialAnimal
  }
};

Treatment_ChemicalPlant = {
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
    title: 'Projecty Management Plan'
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
    title: 'Temperature'
  },
  wind_speed: {
    type: 'string',
    title: 'Wind'
  },
  humidity: {
    type: 'integer',
    title: 'Humidity'
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
  amount_of_herbicide_1: {
    type: 'number',
    format: 'float',
    title: 'Herbicide 1 amount'
  },
  amount_of_herbicide_2: {
    type: 'number',
    format: 'float',
    title: 'Herbicide 2 amount'
  },
  amount_of_herbicide_3: {
    type: 'number',
    format: 'float',
    title: 'Herbicide 3 amount'
  },
  herbicide_1: {
    type: 'string',
    title: 'Herbicide 1'
  },
  herbicide_2: {
    type: 'string',
    title: 'Herbicide 2'
  },
  herbicide_3: {
    type: 'string',
    title: 'Herbicide 3'
  }
};

Treatment_MechanicalPlant = {
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
    type: 'boolean',
    title: 'Signage on site'
  }
};

Treatment_BiologicalPlant = {
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
  biological_maturity_status: {
    type: 'string',
    title: 'Biological maturity status'
  }
};

Treatment_BiologicalDispersalPlant = {
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

Treatment_MechanicalTerrestrialAnimal = {
  treatment_details: {
    type: 'string',
    title: 'Treatment details'
  }
};

Treatment_ChemicalTerrestrialAnimal = {
  treatment_details: {
    type: 'string',
    title: 'Treatment details'
  }
};

Treatment_BiologicalTerrestrialAnimal = {
  treatment_details: {
    type: 'string',
    title: 'Treatment details'
  }
};

Monitoring = {
  activity_id: {
    type: 'integer',
    title: 'Treatment id'
  },
  monitoring_date: {
    type: 'string',
    title: 'Treatment date'
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
    title: 'Efficacy rating'
  },
  subType: {
    ...Monitoring_ChemicalTerrestrialAquaticPlant,
    ...Monitoring_MechanicalTerrestrialAquaticPlant,
    ...Monitoring_BiologicalTerrestrialPlant,
    ...Monitoring_MechanicalTerrestrialAnimal,
    ...Monitoring_ChemicalTerrestrialAnimal,
    ...Monitoring_BiologicalTerrestrialAnimal
  }
};

Monitoring_ChemicalTerrestrialAquaticPlant = {
  monitoring_details: {
    type: 'string',
    title: 'Monitoring details'
  }
};

Monitoring_MechanicalTerrestrialAquaticPlant = {
  monitoring_details: {
    type: 'string',
    title: 'Monitoring details'
  }
};

Monitoring_BiologicalTerrestrialPlant = {
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
    type: 'boolean',
    title: 'Agent destroyed'
  },
  legacy_presence_ind: {
    type: 'boolean',
    title: 'Legacy presence'
  },
  foliar_feeding_damage_ind: {
    type: 'boolean',
    title: 'Foliar feeding damage'
  },
  root_feeding_damage_ind: {
    type: 'boolean',
    title: 'Root feeding damage'
  },
  oviposition_marks_ind: {
    type: 'boolean',
    title: 'Oviposition marks'
  },
  eggs_present_ind: {
    type: 'boolean',
    title: 'Eggs present'
  },
  larvae_present_ind: {
    type: 'boolean',
    title: 'Larvae present'
  },
  pupae_present_ind: {
    type: 'boolean',
    title: 'Pupae present'
  },
  adults_present_ind: {
    type: 'boolean',
    title: 'Adults present'
  },
  tunnels_present_ind: {
    type: 'boolean',
    title: 'Tunnels present'
  },
  biological_agent_spread: {
    type: 'string',
    title: 'Biological agent spread'
  }
};

Monitoring_MechanicalTerrestrialAnimal = {
  monitoring_details: {
    type: 'string',
    title: 'Monitoring details'
  }
};

Monitoring_ChemicalTerrestrialAnimal = {
  monitoring_details: {
    type: 'string',
    title: 'Monitoring details'
  }
};

Monitoring_BiologicalTerrestrialAnimal = {
  monitoring_details: {
    type: 'string',
    title: 'Monitoring details'
  }
};

Media = {
  media_date: {
    type: 'string',
    title: 'Date'
  },
  description: {
    type: 'string',
    title: 'Description',
    "ui:widget": "textarea"
  },
  file_name: {
    type: 'string',
    title: 'File Name'
  },
  encoded_file: {
    type: 'string',

    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEBLAEsAAD/4REy...'
  }
};

export {
  Activity,
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
  Media
};
