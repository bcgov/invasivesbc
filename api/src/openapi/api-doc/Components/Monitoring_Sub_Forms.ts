import { Biological_Agent_Stage } from './General_Sub_Forms';

export const Monitoring_ChemicalTerrestrialAquaticPlant_Information = {
  title: 'Chemical Treatment Monitoring Information',
  type: 'object',
  required: ['efficacy_code', 'management_efficacy_rating', 'evidence_of_treatment', 'invasive_plants_on_site'],
  properties: {
    invasive_plant_code: {
      type: 'string',
      title: 'Terrestrial Invasive Plant',
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
      title: 'Efficacy comments',
      'x-tooltip-text': 'Provide any other observations of the treatment that was completed.'
    },
    efficacy_code: {
      type: 'string',
      title: 'Treatment Efficacy Rating',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'efficacy_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Choose the efficacy of the treatment for the area that was treated.'
    },
    management_efficacy_rating: {
      type: 'string',
      title: 'Management Efficacy Rating',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'management_efficacy_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text':
        'Choose the efficacy rating indicating the mortality of all the target species found on the site, including those that were not treated. Eg: 50% of plants on the site have evidence of treatment = Efficacy of 5.'
    },
    evidence_of_treatment: {
      type: 'string',
      title: 'Evidence of treatment?',
      enum: ['Yes', 'No']
    },
    invasive_plants_on_site: {
      type: 'string',
      title: 'Invasive Plants on site',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'monitoring_evidence_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text':
        'Choose one or more option to indicate whether target invasive plants are still found on site following the treatment.'
    },
    treatment_pass: {
      type: 'string',
      title: 'Treatment Pass',
      enum: ['First', 'Second', 'Unknown'],
      'x-tooltip-text':
        'Indicate whether you are monitoring the first or second treatment pass of the calendar year, if known'
    },
    comment: {
      type: 'string',
      title: 'Comment',
      'x-tooltip-text':
        'Note whether chlorosis, necrosis, curling, browning, yellow, epicormic growth etc. is observed, or any additional relevant information'
    }
  }
};
export const Monitoring_MechanicalTerrestrialAquaticPlant_Information = {
  title: 'Mechanical Terrestrial Aquatic Monitoring Information',
  type: 'object',
  required: ['efficacy_code', 'management_efficacy_rating', 'evidence_of_treatment', 'invasive_plants_on_site'],
  properties: {
    invasive_plant_code: {
      type: 'string',
      title: 'Terrestrial Invasive Plant',
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
      title: 'Efficacy comments',
      'x-tooltip-text': 'Provide any other observations of the treatment that was completed.'
    },
    efficacy_code: {
      type: 'string',
      title: 'Treatment Efficacy Rating',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'efficacy_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Choose the efficacy of the treatment for the area that was treated.'
    },
    management_efficacy_rating: {
      type: 'string',
      title: 'Management Efficacy Rating',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'management_efficacy_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text':
        'Choose the efficacy rating indicating the mortality of all the target species found on the site, including those that were not treated. Eg: 50% of plants on the site have evidence of treatment = Efficacy of 5.'
    },
    evidence_of_treatment: {
      type: 'string',
      title: 'Evidence of treatment?',
      enum: ['Yes', 'No']
    },
    invasive_plants_on_site: {
      type: 'string',
      title: 'Invasive Plants on site',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'monitoring_evidence_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text':
        'Choose one or more option to indicate whether target invasive plants are still found on site following the treatment.'
    },
    treatment_pass: {
      type: 'string',
      title: 'Treatment Pass',
      enum: ['First', 'Second', 'Unknown'],
      'x-tooltip-text':
        'Indicate whether you are monitoring the first or second treatment pass of the calendar year, if known'
    },
    comment: {
      type: 'string',
      title: 'Comment',
      'x-tooltip-text':
        'Add any additional relevant information about the efficacy of the treatment including missed plants, seeds left on site, etc.'
    }
  }
};
//------------------- biocontrol ----------------------

export const Monitoring_BiocontrolRelease_TerrestrialPlant_Information = {
  title: 'Biological Monitoring Information',
  type: 'object',
  required: [
    'agent_destroyed_ind',
    'legacy_presence_ind',
    'biocontrol_present',
    'biological_agent_presence_code',
    'invasive_plant_code',
    'adults_present_ind',
    'tunnels_present_ind',
    'plant_count',
    'start_time',
    'stop_time',
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
              minimum: 0,
              'x-tooltip-text':
                'Enter the total duration in minutes, of all time spent monitoring by all people monitoring (added together).'
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
            bio_agent_location_code: {
              type: 'string',
              title: 'Location agent(s) found',
              'x-enum-code': {
                'x-enum-code-category-name': 'invasives',
                'x-enum-code-header-name': 'location_agents_found_code',
                'x-enum-code-name': 'code_name',
                'x-enum-code-text': 'code_description',
                'x-enum-code-sort-order': 'code_sort_order'
              },
              'x-tooltip-text':
                'Choose one or more general site location characteristics from the drop down to indicate where the biocontrol presence was observed.'
            },
            suitable_collection_site: {
              type: 'string',
              title: 'Suitable For Collection',
              default: 'Unknown',
              enum: ['Unknown', 'Yes', 'No'],
              'x-tooltip-text':
                'Do the current biocontrol agent populations and location indicate that this may be a suitable collection site in the future? Add details in the comment field.'
            },
            actual_biological_agents: {
              type: 'array',
              title: 'Actual Biological Agents',
              items: {
                ...Biological_Agent_Stage
              }
            },
            estimated_biological_agents: {
              type: 'array',
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
    },
    monitoring_method: {
      oneOf: [
        {
          properties: {
            monitoring_method: {
              enum: ['S']
            },
            num_of_sweeps: {
              type: 'number',
              title: 'Number of sweeps',
              minimum: 1
            }
          },
          required: ['num_of_sweeps']
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
    monitoring_type: {
      type: 'string',
      title: 'Monitoring Type',
      enum: ['Timed', 'Count'],
      'x-tooltip-text': 'Choose whether the monitoring duration was timed or by the number of plants checked'
    },
    monitoring_method: {
      type: 'string',
      title: 'Monitoring Method',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'biocontrol_monitoring_methods_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Choose the method used for monitoring from the drop down'
    },
    start_time: {
      type: 'string',
      format: 'date-time',
      title: 'Monitoring Start time'
    },
    stop_time: {
      type: 'string',
      format: 'date-time',
      title: 'Monitoring Stop time '
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
    'monitoring_type',
    'monitoring_method',
    'invasive_plant_code',
    'start_time',
    'stop_time',
    'total_bio_agent_quantity'
  ],
  dependencies: {
    monitoring_method: {
      oneOf: [
        {
          properties: {
            monitoring_method: {
              enum: ['S']
            },
            num_of_sweeps: {
              type: 'number',
              title: 'Number of sweeps',
              minimum: 1
            }
          },
          required: ['num_of_sweeps']
        }
      ]
    },
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
            bio_agent_location_code: {
              type: 'string',
              title: 'Location agent(s) found',
              'x-enum-code': {
                'x-enum-code-category-name': 'invasives',
                'x-enum-code-header-name': 'location_agents_found_code',
                'x-enum-code-name': 'code_name',
                'x-enum-code-text': 'code_description',
                'x-enum-code-sort-order': 'code_sort_order'
              },
              'x-tooltip-text':
                'Choose one or more general site location characteristics from the drop down to indicate where the biocontrol presence was observed.'
            },
            suitable_collection_site: {
              type: 'string',
              title: 'Suitable For Collection',
              enum: ['Unknown', 'Yes', 'No'],
              'x-tooltip-text':
                'Do the current biocontrol agent populations and location indicate that this may be a suitable collection site in the future? Add details in the comment field.'
            },
            actual_biological_agents: {
              type: 'array',
              title: 'Actual Biological Agents',
              items: {
                ...Biological_Agent_Stage
              }
            },
            estimated_biological_agents: {
              type: 'array',
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
    linear_segment: {
      type: 'string',
      title: 'Linear segment',
      default: 'Unknown',
      enum: ['Unknown', 'Yes', 'No'],
      'x-tooltip-text': 'If the invasive plant infestation is primarily linear in nature, choose Yes.'
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
    start_time: {
      type: 'string',
      format: 'date-time',
      title: 'Monitoring Start time'
    },
    stop_time: {
      type: 'string',
      format: 'date-time',
      title: 'Monitoring Stop time '
    },

    biocontrol_present: {
      type: 'boolean',
      default: false,
      title: 'Biocontrol Present',
      'x-tooltip-text':
        'Check this box if any biocontrol agents or sign of agents was noted. Leave unchecked if no sign or agents were found.'
    },
    monitoring_type: {
      type: 'string',
      title: 'Monitoring Type',
      enum: ['Timed', 'Count'],
      'x-tooltip-text': 'Choose whether the monitoring duration was timed or by the number of plants checked'
    },
    monitoring_method: {
      type: 'string',
      title: 'Monitoring Method',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'biocontrol_monitoring_methods_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Choose the method used for monitoring from the drop down'
    },
    plant_count: {
      type: 'number',
      title: 'Plant Count',
      minimum: 0,
      'x-tooltip-text': 'Numeric value (exact or approximate)'
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
