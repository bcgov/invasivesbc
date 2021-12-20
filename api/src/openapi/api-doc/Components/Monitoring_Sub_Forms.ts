import { Biological_Agent_Stage } from './General_Sub_Forms';

export const Monitoring_ChemicalTerrestrialAquaticPlant_Information = {
  title: 'Chemical Terrestrial Aquatic Monitoring Information',
  type: 'object',
  required: ['monitoring_details'],
  properties: {
    invasive_plant_code: {
      type: 'string',
      title: 'Terrastrial Invasive Plant',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'invasive_plant_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Target invasive plant species at this location'
    },
    aquatic_invasive_plant_code: {
      type: 'string',
      title: 'Aquatic Invasive Plant',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'aquatic_invasive_plant_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Target invasive plant species being treated at this location'
    },
    monitoring_details: {
      type: 'string',
      title: 'Monitoring details'
    }
  }
};
export const Monitoring_MechanicalTerrestrialAquaticPlant_Information = {
  title: 'Mechanical Terrestrial Aquatic Monitoring Information',
  type: 'object',
  required: ['monitoring_details'],
  properties: {
    invasive_plant_code: {
      type: 'string',
      title: 'Terrastrial Invasive Plant',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'invasive_plant_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Target invasive plant species at this location'
    },
    aquatic_invasive_plant_code: {
      type: 'string',
      title: 'Aquatic Invasive Plant',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'aquatic_invasive_plant_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Target invasive plant species being treated at this location'
    },
    monitoring_details: {
      type: 'string',
      title: 'Monitoring details'
    }
  }
};
//------------------- biocontrol ----------------------

export const Monitoring_BiocontrolRelease_TerrestrialPlant_Information = {
  title: 'Biological Monitoring Information',
  type: 'object',
  required: [
    'agent_count',
    'agent_destroyed_ind',
    'legacy_presence_ind',
    'biocontrol_present',
    'biological_agent_presence_code',
    'invasive_plant_code',
    'adults_present_ind',
    'tunnels_present_ind',
    'plant_count',
    'biological_agent_code'
  ],
  dependencies: {
    monitoring_type: {
      oneOf: [
        {
          properties: {
            monitoring_type: {
              enum: ['Timed']
            },
            plant_count: {
              title: 'Count Duration (minutes)',
              type: 'number',
              minimum: 0
            }
          }
        },
        {
          properties: {
            monitoring_type: {
              enum: ['Count']
            },
            plant_count: {
              title: 'Plant Count',
              type: 'number'
            }
          }
        }
      ]
    },
    biocontrol_present: {
      oneOf: [
        {
          properties: {
            biocontrol_present: {
              enum: [true]
            },
            actual_biological_agents: {
              type: 'array',
              default: [{}],
              title: 'Actual Biological Agents',
              items: {
                ...Biological_Agent_Stage
              }
            },
            estimated_biological_agents: {
              type: 'array',
              default: [{}],
              title: 'Estimated Biological Agents',
              items: {
                ...Biological_Agent_Stage
              }
            },
            total_bio_agent_quantity_estimated: {
              type: 'number',
              default: 0,
              title: 'Total Bioagent Quantity (Estimated)'
            },
            total_bio_agent_quantity_actual: {
              type: 'number',
              default: 0,
              title: 'Total Bioagent Quantity (Actual)'
            }
          },
          required: ['total_bio_agent_quantity_actual', 'total_bio_agent_quantity_estimated']
        },
        {
          properties: {
            biocontrol_present: {
              enum: [false]
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
      'x-tooltip-text': 'The biological control agent that was collected.'
    },
    biocontrol_present: {
      type: 'boolean',
      default: false,
      title: 'Biocontrol Present'
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
    agent_count: {
      type: 'number',
      minimum: 0,
      title: 'Agent Count'
    },
    count_duration: {
      type: 'number',
      minimum: 0,
      title: 'Count Duration'
    },
    bio_agent_location_code: {
      type: 'string',
      title: 'Location agent(s) found',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'location_agents_found_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      }
    },
    suitable_collection_site: {
      type: 'string',
      title: 'Suitable For Collection',
      default: 'Unknown',
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
export const Monitoring_BiocontrolDispersal_Information = {
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
    'total_bio_agent_quantity',
    'collection_history',
    'collection_history_comments'
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
    biocontrol_present: {
      type: 'boolean',
      default: false,
      title: 'Biocontrol Present'
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
      title: 'Suitable For Collection',
      enum: ['Unknown', 'Yes', 'No'],
      'x-tooltip-text':
        'Do the current biocontrol agent populations and location indicate that this may be a suitable collection site in the future? Add details in the comment field.'
    }
  },
  dependencies: {
    monitoring_type: {
      oneOf: [
        {
          properties: {
            monitoring_type: {
              enum: ['Timed']
            },
            plant_count: {
              title: 'Count Duration (minutes)',
              type: 'number',
              minimum: 0
            }
          }
        },
        {
          properties: {
            monitoring_type: {
              enum: ['Count']
            },
            plant_count: {
              title: 'Plant Count',
              type: 'number'
            }
          }
        }
      ]
    },
    biocontrol_present: {
      oneOf: [
        {
          properties: {
            biocontrol_present: {
              enum: [true]
            },
            actual_biological_agents: {
              type: 'array',
              default: [{}],
              title: 'Actual Biological Agents',
              items: {
                ...Biological_Agent_Stage
              }
            },
            estimated_biological_agents: {
              type: 'array',
              default: [{}],
              title: 'Estimated Biological Agents',
              items: {
                ...Biological_Agent_Stage
              }
            },
            total_bio_agent_quantity_estimated: {
              type: 'number',
              default: 0,
              title: 'Total Bioagent Quantity (Estimated)'
            },
            total_bio_agent_quantity_actual: {
              type: 'number',
              default: 0,
              title: 'Total Bioagent Quantity (Actual)'
            }
          },
          required: ['total_bio_agent_quantity_actual', 'total_bio_agent_quantity_estimated']
        },
        {
          properties: {
            biocontrol_present: {
              enum: [false]
            }
          }
        }
      ]
    }
  }
};

// -------------------- Animal ------------------------
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
