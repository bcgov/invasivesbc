export const Monitoring_Biocontrol = {
  title: 'Monitoring Information',
  type: 'object',
  required: ['linked_id', 'observer_first_name', 'observer_last_name', 'weather_conditions', 'microsite_conditions'],
  properties: {
    linked_id: {
      type: 'string',
      title: 'Linked Treatment ID',
      'x-tooltip-text': 'Identifier of linked treatment record'
    },
    observer_first_name: {
      type: 'string',
      title: 'First Name'
    },
    observer_last_name: {
      type: 'string',
      title: 'Last Name'
    },
    weather_conditions: {
      $ref: '#/components/schemas/Weather_Conditions'
    },
    microsite_conditions: {
      $ref: '#/components/schemas/Microsite_Conditions'
    }
  }
};
export const Monitoring_BiologicalDispersal = {
  title: 'Biological Dispersal Information',
  type: 'object',
  required: [
    'biological_agent_presence_code',
    'biological_agent_code',
    'biological_agent_count',
    'monitoring_type',
    'monitoring_method',
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
  properties: {
    invasive_plant_code: {
      type: 'string',
      title: 'Invasive Plant',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'invasive_plant_code_withbiocontrol',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Target invasive plant species at this location'
    },
    applicator1_name: {
      type: 'string',
      title: 'Primary Observer Name',
      'x-tooltip-text': 'Name of primary applicator'
    },
    applicator2_name: {
      type: 'string',
      title: 'Secondary Observer Name',
      'x-tooltip-text': 'Name of secondary applicator'
    },
    linear_segment: {
      type: 'string',
      title: 'Linear segment',
      default: 'Unknown',
      enum: ['Unknown', 'Yes', 'No'],
      'x-tooltip-text': 'If the invasive plant infestation is primarily linear in nature, choose Yes.'
    },
    biological_agent_presence_code: {
      type: 'string',
      title: 'Sign of Biocontrol Presence',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'biological_agent_presence_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Visible state of the agent present'
    },
    biological_agent_code: {
      type: 'string',
      title: 'Biological Agent',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'biological_agent_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Genus species code of the agent (ie ALTICAR [Altica carduorum])'
    },
    monitoring_type: {
      type: 'string',
      title: 'Monitoring Type',
      enum: ['Timed', 'Count']
    },
    monitoring_method: {
      type: 'string',
      title: 'Monitoring Method',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'biocontrol_methods_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      }
    },
    plant_count: {
      type: 'number',
      title: 'Plant Count',
      minimum: 0,
      'x-tooltip-text': 'Numeric value (exact or approximate)'
    },
    biological_agent_stages: {
      type: 'array',
      default: [{}],
      minItems: 1,
      title: 'Biological Agent Stages',
      items: {
        $ref: '#/components/schemas/Biological_Agent_Stage'
      }
    },
    total_bio_agent_quantity: {
      type: 'number',
      title: 'Total Bioagent Quantity'
    },
    biological_agent_count: {
      type: 'number',
      title: 'Biological Agent Count',
      minimum: 0,
      'x-tooltip-text': 'Numeric value (exact or approximate)'
    },
    collection_history: {
      type: 'number',
      title: 'Collection History',
      'x-tooltip-text':
        'Enter the IAPP or InvasivesBC record number to indicate the location where the biocontrol agents were collected from'
    },
    collection_history_comments: {
      type: 'string',
      title: 'Collection History Comments',
      'x-tooltip-text':
        'Enter relevant information about where the biocontrol agents being released came from, how they were shipped, and any related information'
    },
    suitable_collection_site: {
      type: 'string',
      title: 'Suitable Collection Site',
      enum: ['Unknown', 'Yes', 'No'],
      'x-tooltip-text':
        'Do the current biocontrol agent populations and location indicate that this may be a suitable collection site in the future? Add details in the comment field.'
    },
    phen_transect_sampler: {
      type: 'string',
      title: 'Phenology Sampler',
      'x-tooltip-text': 'Initials of the sampler'
    },
    phen_transect_recorder: {
      type: 'string',
      title: 'Phenology Recorder',
      'x-tooltip-text': 'Initials of the recorder'
    },
    phen_transect_seedlings: {
      type: 'number',
      title: 'Phenology Seedlings',
      'x-tooltip-text': 'Number of seedlings observed'
    },
    phen_transect_rosettes: {
      type: 'number',
      title: 'Phenology Rosettes',
      'x-tooltip-text': 'Number of rosettes observed'
    },
    phen_transect_bolting: {
      type: 'number',
      title: 'Phenology Bolting',
      'x-tooltip-text': 'Number of bolting observed'
    },
    phen_transect_flowering: {
      type: 'number',
      title: 'Phenology Flowering',
      'x-tooltip-text': 'Number of flowering observed'
    },
    phen_transect_seeds: {
      type: 'number',
      title: 'Phenology Seeds',
      'x-tooltip-text': 'Number of seeds observed'
    },
    phen_transect_senescent: {
      type: 'number',
      title: 'Phenology Senescent',
      'x-tooltip-text': 'Number of senescent observed'
    },
    phen_total_plants: {
      type: 'number',
      title: 'Phenology Plants',
      'x-tooltip-text': 'Number of plants observed'
    },
    phen_number_stems: {
      type: 'number',
      title: 'Phenology Stems',
      'x-tooltip-text': 'Number of stems observed'
    },
    phen_tallest_1: {
      type: 'number',
      title: 'Phenology Tallest Stem 1',
      'x-tooltip-text': 'Enter stem height in centimetres'
    },
    phen_tallest_2: {
      type: 'number',
      title: 'Phenology Tallest Stem 2',
      'x-tooltip-text': 'Enter stem height in centimetres'
    },
    phen_tallest_3: {
      type: 'number',
      title: 'Phenology Tallest Stem 3',
      'x-tooltip-text': 'Enter stem height in centimetres'
    },
    phen_tallest_4: {
      type: 'number',
      title: 'Phenology Tallest Stem 4',
      'x-tooltip-text': 'Enter stem height in centimetres'
    },
    phen_level_se: {
      type: 'number',
      title: 'Phenology Level SE',
      'x-tooltip-text': 'Enter percentage'
    },
    phen_level_ro: {
      type: 'number',
      title: 'Phenology Level RO',
      'x-tooltip-text': 'Enter percentage'
    },
    phen_level_bo: {
      type: 'number',
      title: 'Phenology Level BO',
      'x-tooltip-text': 'Enter percentage'
    },
    phen_level_fl: {
      type: 'number',
      title: 'Phenology Level FL',
      'x-tooltip-text': 'Enter percentage'
    },
    phen_level_sf: {
      type: 'number',
      title: 'Phenology Level SF',
      'x-tooltip-text': 'Enter percentage'
    },
    phen_level_sc: {
      type: 'number',
      title: 'Phenology Level SC',
      'x-tooltip-text': 'Enter percentage'
    },
    phen_total_percentage: {
      type: 'number',
      title: 'Phenology Total Percentage',
      maximum: 100,
      'x-tooltip-text': 'Total percentage (sum of all 6 levels)'
    }
  },
  dependencies: {
    monitoring_type: {
      oneOf: [
        {
          properties: {
            monitoring_type: {
              const: 'Timed'
            },
            plant_count: {
              type: 'number',
              minimum: 0,
              title: 'Duration of Count (min)'
            }
          }
        },
        {
          properties: {
            monitoring_type: {
              const: 'Count'
            },
            plant_count: {
              type: 'number',
              minimum: 0,
              title: 'Plant Count'
            }
          }
        }
      ]
    }
  }
};
export const Monitoring_ChemicalTerrestrialAquaticPlant = {
  title: 'Chemical Terrestrial Aquatic Monitoring Information',
  type: 'object',
  required: ['monitoring_details', 'invasive_plant_code'],
  properties: {
    invasive_plant_code: {
      type: 'string',
      title: 'Invasive Plant',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'invasive_plant_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Target invasive plant species at this location'
    },
    monitoring_details: {
      type: 'string',
      title: 'Monitoring details'
    }
  }
};
export const Monitoring_MechanicalTerrestrialAquaticPlant = {
  title: 'Mechanical Terrestrial Aquatic Monitoring Information',
  type: 'object',
  required: ['monitoring_details', 'invasive_plant_code'],
  properties: {
    invasive_plant_code: {
      type: 'string',
      title: 'Invasive Plant',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'invasive_plant_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Target invasive plant species at this location'
    },
    monitoring_details: {
      type: 'string',
      title: 'Monitoring details'
    }
  }
};
export const Monitoring_BiocontrolRelease_TerrestrialPlant_Information = {
  title: 'Biological Monitoring Information',
  type: 'object',
  required: [
    'agent_count',
    'agent_destroyed_ind',
    'legacy_presence_ind',
    'biological_agent_presence_code',
    'invasive_plant_code',
    'total_bio_agent_quantity',
    'adults_present_ind',
    'tunnels_present_ind',
    'suitable_collection_site',
    'biological_agent_code'
  ],
  dependencies: {
    monitoring_type: {
      oneOf: [
        {
          properties: {
            monitoring_type: {
              const: 'Timed'
            },
            plant_count: {
              type: 'number',
              minimum: 0,
              title: 'Plant Count (minutes)'
            }
          }
        },
        {
          properties: {
            monitoring_type: {
              const: 'Count'
            },
            plant_count: {
              type: 'number',
              minimum: 0,
              title: 'Plant Count'
            }
          }
        }
      ]
    }
  },
  properties: {
    invasive_plant_code: {
      type: 'string',
      title: 'Invasive Plant',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'invasive_plant_code_withbiocontrol',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Target invasive plant species at this location'
    },
    biological_agent_presence_code: {
      type: 'string',
      title: 'Sign of Biocontrol Presence',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'biological_agent_presence_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Visible state of the agent present'
    },
    biological_agent_code: {
      type: 'string',
      title: 'Biological Control Agent',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'biological_agent_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'The biological control agent that was collected.'
    },
    monitoring_type: {
      type: 'string',
      title: 'Monitoring Type',
      enum: ['Timed', 'Count']
    },
    monitoring_method: {
      type: 'string',
      title: 'Monitoring Method',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'biocontrol_methods_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      }
    },
    biological_agent_stages: {
      type: 'array',
      default: [{}],
      minItems: 1,
      title: 'Biological Agent Stages',
      items: {
        $ref: '#/components/schemas/Biological_Agent_Stage'
      }
    },
    total_bio_agent_quantity: {
      type: 'number',
      title: 'Total Bioagent Quantity'
    },
    bio_agent_location_code: {
      type: 'string',
      title: 'Location agent(s) found',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'bio_agent_location_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      }
    },
    agent_count: {
      type: 'number',
      title: 'Agent Count'
    },
    count_duration: {
      type: 'number',
      minimum: 0,
      title: 'Count Duration'
    },
    suitable_collection_site: {
      type: 'string',
      title: 'Suitable Collection Site',
      enum: ['Unknown', 'Yes', 'No'],
      'x-tooltip-text':
        'Do the current biocontrol agent populations and location indicate that this may be a suitable collection site in the future? Add details in the comment field.'
    },
    legacy_presence_ind: {
      type: 'string',
      title: 'Legacy Presence',
      enum: ['Yes', 'No', 'Unknown'],
      default: 'No',
      'x-tooltip-text': 'Please indicate the presence of legacy IAPP records'
    }
  }
};
export const Monitoring_BiocontrolRelease_TerrestrialPlant = {
  type: 'object',
  allOf: [
    { $ref: '#/components/schemas/Monitoring_BiocontrolRelease_TerrestrialPlant_Information' },
    {
      $ref: '#/components/schemas/Spread_Results'
    },
    {
      $ref: '#/components/schemas/Target_Plant_Phenology'
    }
  ]
};
export const Monitoring_ChemicalAnimalTerrestrial = {
  title: 'Terrestrial Animal Chemical Monitoring',
  type: 'object',
  properties: {
    terrestrial_animal_information: {
      title: 'Animal Information',
      required: ['invasive_animal_species'],
      properties: {
        invasive_animal_species: {
          type: 'string',
          title: 'Invasive Animal Species',
          'x-enum-code': {
            'x-enum-code-category-name': 'invasives',
            'x-enum-code-header-name': 'invasive_animal_code_terrestrial',
            'x-enum-code-name': 'code_name',
            'x-enum-code-text': 'code_description',
            'x-enum-code-sort-order': 'code_sort_order'
          },
          'x-tooltip-text': 'The species of the invasive animal'
        }
      }
    },
    number: {
      type: 'number',
      title: 'Number',
      'x-tooltip-text': 'The number of animals observed'
    },
    life_stage: {
      type: 'string',
      title: 'Life Stage',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'animal_life_stage_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'The life stage of the animal'
    },
    sex: {
      type: 'string',
      title: 'Sex',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'animal_sex_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'The sex of the animal'
    },
    condition: {
      type: 'string',
      title: 'Condition',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'animal_condition_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'The condition of the animal'
    }
  }
};
export const Monitoring_MechanicalAnimalTerrestrial = {
  title: 'Terrestrial Animal Mechanical Monitoring',
  type: 'object',
  properties: {
    terrestrial_animal_information: {
      title: 'Animal Information',
      required: ['invasive_animal_species'],
      properties: {
        invasive_animal_species: {
          type: 'string',
          title: 'Invasive Animal Species',
          'x-enum-code': {
            'x-enum-code-category-name': 'invasives',
            'x-enum-code-header-name': 'invasive_animal_code_terrestrial',
            'x-enum-code-name': 'code_name',
            'x-enum-code-text': 'code_description',
            'x-enum-code-sort-order': 'code_sort_order'
          },
          'x-tooltip-text': 'The species of the invasive animal'
        }
      }
    },
    number: {
      type: 'number',
      title: 'Number',
      'x-tooltip-text': 'The number of animals observed'
    },
    life_stage: {
      type: 'string',
      title: 'Life Stage',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'animal_life_stage_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'The life stage of the animal'
    },
    sex: {
      type: 'string',
      title: 'Sex',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'animal_sex_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'The sex of the animal'
    },
    condition: {
      type: 'string',
      title: 'Condition',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'animal_condition_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'The condition of the animal'
    }
  }
};
