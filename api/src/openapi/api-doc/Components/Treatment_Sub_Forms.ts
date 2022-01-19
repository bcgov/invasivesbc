import { Agent_Quantity_And_Life_Stage, Biological_Agent_Stage } from './General_Sub_Forms';

//--------------------- Chemical ---------------------
export const Treatment_ChemicalAnimalTerrestrial = {
  title: 'Terrestrial Animal Chemical Treatment',
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
export const Treatment_ChemicalPlant_Information = {
  type: 'object',
  title: 'Chemical Treatment Information',
  required: [
    'applicator1_name',
    'applicator1_license',
    'pesticide_employer_code',
    'chemical_method_code',
    'temperature',
    'wind_speed',
    'wind_direction_code',
    'signage_on_site',
    'application_start_time'
  ],
  properties: {
    pesticide_employer_code: {
      type: 'string',
      title: 'Service License Number and Company Name',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'service_license_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Select from current/valid employer/organization names'
    },
    pesticide_use_permit_PUP: {
      type: 'string',
      title: 'Pesticide Use Permit',
      default: 'none',
      'x-tooltip-text': 'Enter applicable number if treatment is being completed under pesticide use permit'
    },
    pest_management_plan: {
      type: 'string',
      title: 'Pest Management Plan',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'pest_management_plan',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Enter applicable number if treatment is being completed under a pest management plan'
    },
    unlisted_drop_down: {
      type: 'string',
      title: 'Unlisted Drop Down'
    },
    temperature: {
      type: 'number',
      title: 'Temperature (C°)',
      'x-tooltip-text': 'Measured in degrees celcius at time of treatment (ideally between 15 and 22 degrees)'
    },
    wind_speed: {
      type: 'number',
      title: 'Wind Speed (km/h)',
      minimum: 0,
      default: 0,
      'x-tooltip-text': 'Wind speed in km/hr at time of treatment'
    },
    wind_direction_code: {
      type: 'string',
      title: 'Wind Direction',
      enum: ['No Wind', 'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
      'x-tooltip-text': 'Cardinal wind direction at time of treatment'
    },
    humidity: {
      type: 'number',
      title: 'Humidity',
      enum: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
      'x-tooltip-text': 'Relative humidity expressed as a percentage'
    },
    signage_on_site: {
      type: 'string',
      title: 'Treatment Notice Signs',
      enum: ['Yes', 'No', 'Unknown'],
      default: 'Yes',
      'x-tooltip-text':
        'Indicate if treatment sign(s) were installed at entrance point to the treatment area. If no, indicate in the comments why not'
    },
    application_start_time: {
      type: 'string',
      format: 'date-time',
      title: 'Application Start Time'
    }
  }
};

//--------------------- Mechanical ---------------------
export const Treatment_MechanicalPlant_Information = {
  type: 'array',
  title: 'Mechanical Treatments',
  default: [{}],
  minItems: 1,
  items: {
    type: 'object',
    title: 'Mechanical Treatment Information',
    required: [
      'invasive_plant_code',
      'treated_area',
      'mechanical_method_code',
      'mechanical_disposal_code',
      'disposed_material'
    ],
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
        'x-tooltip-text': 'Target invasive plant species treated at this location'
      },
      treated_area: {
        type: 'number',
        title: 'Treated Area (m2)',
        'x-tooltip-text': 'Treated Area (m2)'
      },
      mechanical_method_code: {
        type: 'string',
        title: 'Mechanical Method',
        'x-enum-code': {
          'x-enum-code-category-name': 'invasives',
          'x-enum-code-header-name': 'mechanical_method_code',
          'x-enum-code-name': 'code_name',
          'x-enum-code-text': 'code_description',
          'x-enum-code-sort-order': 'code_sort_order'
        },
        'x-tooltip-text': 'Specific treatment technique, device or method'
      },
      mechanical_disposal_code: {
        type: 'string',
        title: 'Disposal Method',
        'x-enum-code': {
          'x-enum-code-category-name': 'invasives',
          'x-enum-code-header-name': 'mechanical_disposal_code',
          'x-enum-code-name': 'code_name',
          'x-enum-code-text': 'code_description',
          'x-enum-code-sort-order': 'code_sort_order'
        },
        'x-tooltip-text': 'Indicate disposal method'
      },
      disposed_material: {
        type: 'object',
        title: 'Disposed material',
        dependencies: {
          disposed_material_input_format: {
            oneOf: [
              {
                properties: {
                  disposed_material_input_format: {
                    enum: ['weight']
                  },
                  disposed_material_input_number: {
                    title: 'Disposed Material (kg)'
                  }
                }
              },
              {
                properties: {
                  disposed_material_input_format: {
                    enum: ['number of plants']
                  },
                  disposed_material_input_number: {
                    title: 'Disposed Material Number'
                  }
                }
              }
            ]
          }
        },
        properties: {
          disposed_material_input_format: {
            type: 'string',
            title: 'Disposed Material Format',
            enum: ['number of plants', 'weight']
          },
          disposed_material_input_number: {
            title: 'Disposed Material Number',
            type: 'number',
            minimum: 0
          }
        },
        required: ['disposed_material_input_number', 'disposed_material_input_format']
      }
    }
  }
};
export const Treatment_MechanicalAnimalTerrestrial = {
  title: 'Terrestrial Animal Mechanical Treatment',
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

//--------------------- Biocontrol ---------------------
export const Biocontrol_Release_Information = {
  title: 'Biological Treatment Information',
  type: 'object',
  required: [
    'invasive_plant_code',
    'release_quantity',
    'mortality',
    'agent_source',
    'collection_date',
    'plant_collected_from',
    'total_release_quantity',
    'biological_agent_code',
    'biological_agent_stage_code'
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
      'x-tooltip-text': 'Target invasive plant species treated at this location'
    },
    mortality: {
      type: 'number',
      title: 'Mortality',
      'x-tooltip-text': 'Number of agents dead at time of release'
    },
    agent_source: {
      type: 'string',
      title: 'Agent Source',
      maxLength: 50,
      'x-tooltip-text':
        'etails of where the agents were collected or reared. Include IAPP site ID, InvasivesBC Collection # or description of location if source is outside of BC.'
    },
    collection_date: {
      title: 'Collection Date',
      type: 'string',
      format: 'date-time'
    },
    plant_collected_from: {
      type: 'string',
      title: 'Plant Collected From'
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
    biological_agent_stages: {
      type: 'array',
      default: [{}],
      minItems: 1,
      title: 'Biological Agent Stages',
      items: {
        ...Biological_Agent_Stage
      }
    },
    total_release_quantity: {
      type: 'number',
      title: 'Total Release Quantity'
    },
    linear_segment: {
      type: 'string',
      title: 'Linear segment',
      default: 'Unknown',
      enum: ['Unknown', 'Yes', 'No'],
      'x-tooltip-text': 'If the invasive plant infestation is primarily linear in nature, choose Yes.'
    }
  }
};
export const Biocontrol_Collection_Information = {
  title: 'Biocontrol Collections',
  type: 'array',
  default: [{}],
  minimum: 1,
  items: {
    title: 'Collection Details',
    type: 'object',
    required: [
      'invasive_plant_code',
      'biological_agent_code',
      'collection_method',
      'collection_type',
      'start_time',
      'stop_time'
    ],
    dependencies: {
      collection_type: {
        oneOf: [
          {
            properties: {
              collection_type: {
                enum: ['Count']
              },
              plant_count: {
                type: 'number',
                title: 'Plant Count',
                minimum: 1
              }
            },
            required: ['plant_count']
          },
          {
            properties: {
              collection_type: {
                enum: ['Timed']
              },
              plant_count: {
                title: 'Count Duration (minutes)',
                type: 'number',
                minimum: 0,
                'x-tooltip-text':
                  'Enter the total duration in minutes, of all time spent collection by all people collecting (added together).'
              }
            }
          }
        ]
      },
      collection_method: {
        oneOf: [
          {
            properties: {
              collection_method: {
                enum: ['Cs']
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
      historical_iapp_site_id: {
        type: 'number',
        minimum: 0,
        title: 'Historical IAPP site ID',
        'x-tooltip-text':
          'Record number from historical Invasive  Alien Plant Program (IAPP) data, if known, to enable tracing to historical biocontrol records. '
      },
      collection_type: {
        type: 'string',
        title: 'Collection Type',
        enum: ['Timed', 'Count']
      },
      collection_method: {
        type: 'string',
        title: 'Collection Method',
        'x-enum-code': {
          'x-enum-code-category-name': 'invasives',
          'x-enum-code-header-name': 'biocontrol_collection_code',
          'x-enum-code-name': 'code_name',
          'x-enum-code-text': 'code_description',
          'x-enum-code-sort-order': 'code_sort_order'
        }
      },
      start_time: {
        type: 'string',
        format: 'date-time',
        title: 'Start time collecting'
      },
      stop_time: {
        type: 'string',
        format: 'date-time',
        title: 'Stop time collecting'
      },
      actual_quantity_and_life_stage_of_agent_collected: {
        type: 'array',
        title: 'Actual Quantity and Life Stage of Agent Collected',
        items: {
          ...Agent_Quantity_And_Life_Stage
        },
        'x-tooltip-text':
          'The quantity of the biocontrol agent collected in the life stage it was collected. If it was a life stage within a gall the number of galls would the quantity collected. This may not be the ACTUAL (TRUE) quantities of the collection noting that some agents collected in seedheads or galls may have more than one agent or no agents / part collected. '
      },
      estimated_quantity_and_life_stage_of_agent_collected: {
        type: 'array',
        title: 'Estimated Quantity and Life Stage of Agent Collected',
        items: {
          ...Agent_Quantity_And_Life_Stage
        },
        'x-tooltip-text':
          'When plant parts are collected with agents within those plant parts, an estimate of the quantity of the biocontrol agent collected in the life stage it was collected if required.'
      },
      comment: {
        type: 'string',
        title: 'Comment',
        'x-tooltip-text': 'Any comments of particular interest regarding this collection that does not fit elsewhere.'
      }
    }
  }
};
