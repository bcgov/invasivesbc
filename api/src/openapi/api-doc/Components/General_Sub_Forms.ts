import {
  IAPP_Biological_Dispersals,
  IAPP_Biological_Treatment,
  IAPP_Chemical_Treatment,
  IAPP_Mechanical_Treatment,
  IAPP_Site,
  IAPP_Survey
} from './IAPP_Sub_Forms';

export const Error = {
  description: 'Error response object',
  properties: {
    status: {
      type: 'number'
    },
    message: {
      type: 'string'
    },
    errors: {
      type: 'array',
      items: {
        type: 'string'
      }
    }
  }
};
export const Media = {
  title: 'Media',
  description: 'List of Media',
  type: 'object',
  properties: {
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
  }
};
export const ProjectCode = {
  type: 'object',
  properties: {
    description: {
      type: 'string',
      title: 'Description',
      maxLength: 50
    }
  }
};
export const Microsite_Conditions = {
  type: 'object',
  title: 'Microsite Conditions',
  required: [],
  properties: {
    mesoslope_position_code: {
      type: 'string',
      title: 'Mesoslope Position',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'mesoslope_position_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Select the most representative mesoslope condition'
    },
    site_surface_shape_code: {
      type: 'string',
      title: 'Site Surface Shape',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'site_surface_shape_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Select the most representative slope shape'
    }
  }
};
export const Biological_Agent_Stage = {
  type: 'object',
  title: ' ',
  properties: {
    biological_agent_stage_code: {
      type: 'string',
      title: 'Biological Agent Stage',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'biological_agent_stage_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Life stage of biocontrol agent'
    },
    release_quantity: {
      type: 'number',
      title: 'Bioagent Quantity',
      minimum: 1,
      maximum: 100000,
      default: 1,
      'x-tooltip-text': 'Number of agents released (exact or approximate)'
    }
  },
  required: ['biological_agent_stage_code', 'release_quantity']
};
export const Weather_Conditions = {
  type: 'object',
  title: 'Weather Conditions',
  required: ['temperature', 'cloud_cover_code', 'precipitation_code', 'wind_speed'],
  dependencies: {
    wind_speed: {
      oneOf: [
        {
          properties: {
            wind_speed: {
              not: { const: 0 }
            }
          },
          required: ['wind_aspect']
        }
      ]
    }
  },
  properties: {
    temperature: {
      type: 'number',
      title: 'Temperature (C)',
      'x-tooltip-text': 'Enter the highest temperature (in Celcius) that occurred during the collection period.'
    },
    cloud_cover_code: {
      type: 'string',
      title: 'Cloud Cover',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'cloud_cover_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Enter the average cloud cover over the duration of the collection'
    },
    precipitation_code: {
      type: 'string',
      title: 'Precipitation',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'precipitation_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Enter the average preciptation over the duration of the collection'
    },
    wind_speed: {
      type: 'number',
      title: 'Wind Speed (km/h)',
      minimum: 0,
      default: 0,
      'x-tooltip-text': 'Enter the average wind over the duration of the collection'
    },
    wind_aspect: {
      type: 'number',
      minimum: 0,
      default: 0,
      title: 'Wind Aspect',
      'x-tooltip-text': 'Describe the direction the wind is coming from in degrees'
    },
    weather_comments: {
      type: 'string',
      title: 'Weather Comments',
      'x-tooltip-text': ''
    }
  }
};
export const Target_Plant_Phenology_Item = {
  title: ' ',
  type: 'object',
  properties: {
    phenology_details_recorded: {
      title: 'Phenology Details Recorded',
      type: 'boolean'
    },
    target_plant_height: {
      title: 'Target Plant Height (cm)',
      type: 'number',
      minimum: 0,
      'x-tooltip-text': 'Record of height of up to 10 of the tallest plants at the location in cm'
    }
  },
  dependencies: {
    phenology_details_recorded: {
      oneOf: [
        {
          properties: {
            phenology_details_recorded: {
              const: true
            },
            winter_dormant: {
              title: 'Winter Dormant',
              type: 'number',
              minimum: 0
            },
            seedlings: {
              title: 'Seedlings',
              type: 'number',
              minimum: 0
            },
            rosettes: {
              title: 'Rosettes',
              type: 'number',
              minimum: 0
            },
            bolts: {
              title: 'Bolts',
              type: 'number',
              minimum: 0
            },
            flowering: {
              title: 'Flowering',
              type: 'number',
              minimum: 0
            },
            seeds_forming: {
              title: 'Seeds Forming',
              type: 'number',
              minimum: 0
            },
            senescent: {
              title: 'Senescent',
              type: 'number',
              minimum: 0
            }
          },
          required: ['senescent', 'seeds_forming', 'flowering', 'bolts', 'rosettes', 'seedlings', 'winter_dormant']
        },
        {
          properties: {
            phenology_details_recorded: {
              const: false
            }
          }
        }
      ]
    }
  },
  required: ['phenology_details_recorded']
};
export const Target_Plant_Phenology = {
  title: 'Target Plant Phenology',
  type: 'object',
  properties: {
    Target_Plant_Phenology_Array: {
      type: 'array',
      title: ' ',
      default: [{}],
      maxItems: 10,
      items: {
        ...Target_Plant_Phenology_Item
      }
    }
  }
};
export const Spread_Results = {
  title: 'Spread Results',
  type: 'object',
  required: ['spread_details_recorded'],
  properties: {
    spread_details_recorded: {
      title: 'Spread Details Recorded',
      type: 'boolean'
    }
  },
  dependencies: {
    spread_details_recorded: {
      oneOf: [
        {
          properties: {
            spread_details_recorded: {
              const: true
            },
            agent_density: {
              title: '% Agent Density',
              type: 'number',
              minimum: 0,
              maximum: 100,
              'x-tooltip-text': '% Agent density is: Total # agents at the site ÷ total # plants with agents) x 100'
            },
            plant_attack: {
              title: '% Plant Attack',
              type: 'number',
              minimum: 0,
              maximum: 100,
              'x-tooltip-text': '% Attack is: Total # agents at the site ÷ total # plants with agents, x 100'
            },
            max_spread_distance: {
              title: 'Max Spread Distance (m)',
              type: 'number',
              minimum: 0,
              'x-tooltip-text': 'Distance (m): Record the greatest distance the agent has spread over the site.'
            },
            max_spread_aspect: {
              title: 'Max Spread Aspect (degrees)',
              type: 'number',
              minimum: 0,
              'x-tooltip-text':
                'Aspect (degrees): Record the direction/aspect of the greatest distance the agent has spread.'
            }
          },
          required: ['max_spread_aspect', 'max_spread_distance', 'plant_attack', 'agent_density']
        },
        {
          spread_details_recorded: {
            const: false
          }
        }
      ]
    }
  }
};
export const Agent_Quantity_And_Life_Stage = {
  title: 'Agent Quantity And Life Stage',
  type: 'object',
  required: ['biological_agent_number', 'biological_agent_stage_code'],
  properties: {
    biological_agent_number: {
      type: 'number',
      minimum: 0,
      title: 'Biological Agent Quantity',
      'x-tooltip-text': 'Quantity of biocontrol agent'
    },
    biological_agent_stage_code: {
      type: 'string',
      title: 'Biological Agent Stage',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'biological_agent_stage_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Life stage of biocontrol agent'
    }
  }
};
export const Jurisdiction = {
  type: 'object',
  required: ['jurisdiction_code', 'percent_covered'],
  properties: {
    jurisdiction_code: {
      type: 'string',
      title: 'Jurisdiction',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'jurisdiction_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Entity that owns or is responsible for the land base or water body'
    },
    percent_covered: {
      type: 'number',
      title: 'Percent Covered',
      maximum: 100,
      minimum: 1,
      'x-tooltip-text': 'Percent covered by this jurisdiction'
    }
  }
};
export const ShorelineTypes = {
  type: 'object',
  properties: {
    shoreline_type: {
      type: 'string',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'shoreline_type_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      title: 'Shoreline Type',
      'x-tooltip-text':
        'Describe shoreline composition adjacent to observation (e.g. rip rap, road/parking lot, overhanging natural riparian veg, turf, fence, etc)'
    },
    percent_covered: {
      type: 'number',
      title: 'Percent Covered',
      maximum: 100,
      'x-tooltip-text': 'Percent covered by this shoreline type'
    }
  }
};
export const TerrestrialPlants = {
  type: 'object',
  required: ['invasive_plant_code', 'occurrence', 'voucher_specimen_collected', 'edna_sample'],
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
      'x-tooltip-text':
        'Target invasive plant species for this observation at this location. Create a separate observation for any other species at this location'
    },
    occurrence: {
      type: 'string',
      title: 'Occurrence',
      enum: ['Positive occurrence', 'Negative occurrence'],
      default: 'Positive occurrence',
      'x-tooltip-text':
        'The observation describes the presence or absence of target invasive plants within a defined area'
    }
  },
  dependencies: {
    occurrence: {
      oneOf: [
        {
          properties: {
            occurrence: {
              enum: ['Positive occurrence']
            },
            edna_sample: {
              title: 'eDNA sample',
              type: 'string',
              enum: ['Yes', 'No'],
              default: 'No',
              'x-tooltip-text':
                'Genetic material that can be extracted from bulk environmental samples such as water and soil.'
            },
            invasive_plant_density_code: {
              type: 'string',
              title: 'Density',
              'x-enum-code': {
                'x-enum-code-category-name': 'invasives',
                'x-enum-code-header-name': 'invasive_plant_density_code',
                'x-enum-code-name': 'code_name',
                'x-enum-code-text': 'code_description',
                'x-enum-code-sort-order': 'code_sort_order'
              },
              'x-tooltip-text': 'Average number of individual plants per square meter expressed as a density class code'
            },
            invasive_plant_distribution_code: {
              type: 'string',
              title: 'Distribution',
              'x-enum-code': {
                'x-enum-code-category-name': 'invasives',
                'x-enum-code-header-name': 'invasive_plant_distribution_code',
                'x-enum-code-name': 'code_name',
                'x-enum-code-text': 'code_description',
                'x-enum-code-sort-order': 'code_sort_order'
              },
              'x-tooltip-text':
                'Description of the average arrangement of invasive plant clusters within the observation area expressed as a distribution code'
            },
            plant_life_stage_code: {
              type: 'string',
              title: 'Life Stage',
              'x-enum-code': {
                'x-enum-code-category-name': 'invasives',
                'x-enum-code-header-name': 'plant_life_stage_code',
                'x-enum-code-name': 'code_name',
                'x-enum-code-text': 'code_description',
                'x-enum-code-sort-order': 'code_sort_order'
              },
              'x-tooltip-text': 'Average phenological stage of plant; rosette, flowering, etc'
            },
            voucher_specimen_collected: {
              type: 'string',
              title: 'Voucher Specimen Collected',
              enum: ['Yes', 'No'],
              default: 'No',
              'x-tooltip-text': 'Ideal to collect entire plant structure for verification purposes.'
            }
          },
          dependencies: {
            voucher_specimen_collected: {
              oneOf: [
                {
                  properties: {
                    voucher_specimen_collected: {
                      enum: ['Yes']
                    },
                    voucher_specimen_collection_information: {
                      type: 'object',
                      title: 'Voucher Specimen Collection Information',
                      required: [
                        'voucher_sample_id',
                        'date_voucher_collected',
                        'accession_number',
                        'name_of_herbarium',
                        'voucher_verification_completed_by',
                        'exact_utm_coords',
                        'date_voucher_verified'
                      ],
                      properties: {
                        voucher_sample_id: {
                          title: 'Voucher Sample ID',
                          type: 'string',
                          'x-tooltip-text': 'Unique identifier for each voucher collected.'
                        },
                        date_voucher_collected: {
                          title: 'Date Voucher Collected',
                          type: 'string',
                          format: 'date'
                        },
                        date_voucher_verified: {
                          title: 'Date voucher verified',
                          type: 'string',
                          format: 'date'
                        },
                        name_of_herbarium: {
                          title: 'Name of Herbarium',
                          type: 'string'
                        },
                        accession_number: {
                          title: 'Accession number',
                          type: 'string'
                        },
                        voucher_verification_completed_by: {
                          type: 'object',
                          title: 'Voucher verification completed by',
                          required: ['person_name', 'organization'],
                          properties: {
                            person_name: {
                              type: 'string',
                              title: 'Name'
                            },
                            organization: {
                              type: 'string',
                              title: 'Organization'
                            }
                          }
                        },
                        exact_utm_coords: {
                          title: 'Exact UTM coordinates of voucher collection site',
                          type: 'object',
                          required: ['utm_zone', 'utm_easting', 'utm_northing'],
                          properties: {
                            utm_zone: {
                              title: 'UTM Zone',
                              type: 'number'
                            },
                            utm_easting: {
                              title: 'UTM Easting',
                              type: 'number'
                            },
                            utm_northing: {
                              title: 'UTM Northing',
                              type: 'number'
                            }
                          }
                        }
                      }
                    }
                  },
                  required: ['voucher_specimen_collection_information']
                },
                {
                  properties: {
                    voucher_specimen_collected: {
                      enum: ['No']
                    }
                  }
                }
              ]
            },
            edna_sample: {
              oneOf: [
                {
                  properties: {
                    edna_sample: {
                      enum: ['Yes']
                    },
                    enda_sample_information: {
                      type: 'object',
                      title: 'eDNA Sample Information',
                      properties: {
                        edna_sample_id: {
                          title: 'eDNA sample ID',
                          type: 'number'
                        },
                        genetic_structure_collected: {
                          title: 'Genetic Structure Collected',
                          type: 'string'
                        }
                      },
                      required: ['edna_sample_id', 'genetic_structure_collected']
                    }
                  },
                  required: ['enda_sample_information']
                },
                {
                  properties: {
                    edna_sample: {
                      enum: ['No']
                    }
                  }
                }
              ]
            }
          },
          required: [
            'invasive_plant_density_code',
            'invasive_plant_distribution_code',
            'plant_life_stage_code',
            'voucher_specimen_collected'
          ]
        },
        {
          properties: {
            occurrence: {
              enum: ['Negative occurrence']
            }
          }
        }
      ]
    }
  }
};
export const AquaticAnimals = {
  type: 'object',
  properties: {
    invasive_animal_code: {
      type: 'string',
      title: 'Invasive animal',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'invasive_animal_code_aquatic',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      }
    },
    early_detection_rapid_resp_ind: {
      type: 'string',
      title: 'Early Detection',
      enum: ['Yes', 'No', 'Unknown'],
      default: 'No'
    },
    negative_obs_ind: {
      type: 'string',
      title: 'Negative Observation',
      enum: ['Yes', 'No', 'Unknown'],
      default: 'No'
    },
    life_stage: {
      type: 'string',
      title: 'Life Stage',
      enum: ['Fry', 'Juvenile', 'Parr', 'Adult', 'Not Specified']
    },
    sex: {
      type: 'string',
      title: 'Sex',
      enum: ['Male', 'Female', 'Undetermined']
    },
    reproductive_maturity: {
      type: 'string',
      title: 'Reproductive Maturity',
      enum: ['Immature', 'Maturing', 'Mature', 'Spawning', 'Spent', 'Undetermined']
    },
    length: {
      type: 'string',
      title: 'Length (mm)'
    },
    length_method: {
      type: 'string',
      title: 'Length Method',
      enum: ['Fork Length', 'Total Length']
    },
    weight: {
      type: 'string',
      title: 'Weight (g)'
    },
    behaviour: {
      type: 'string',
      title: 'Behaviour',
      enum: ['Migration', 'Spawning', 'Incubation', 'Rearing']
    },
    condition: {
      type: 'string',
      title: 'Condition',
      enum: ['Alive', 'Dead', 'Injured', 'Sick']
    },
    captured: {
      type: 'string',
      title: 'Captured',
      enum: ['Yes', 'No', 'Unknown'],
      default: 'No'
    },
    disposed: {
      type: 'string',
      title: 'Disposed',
      enum: ['Yes', 'No', 'Unknown'],
      default: 'No'
    },
    specimen_id: {
      type: 'string',
      title: 'Specimen ID'
    },
    sample_collected: {
      type: 'string',
      title: 'Sample Collected',
      enum: ['Yes', 'No', 'Unknown'],
      default: 'No'
    },
    sample_id: {
      type: 'string',
      title: 'Sample ID'
    },
    sample_type: {
      type: 'string',
      title: 'Sample Type',
      enum: ['Scales', 'Bones', 'Fin Rays', 'Vertebrae', 'Otoliths', 'Tissue', 'Stomach']
    },
    age_analysis: {
      type: 'number',
      title: 'Age Analysis'
    },
    genetic_analysis: {
      type: 'string',
      title: 'Genetic Analysis'
    }
  }
};
export const AquaticPlants = {
  type: 'object',
  required: ['observation_type', 'invasive_plant_code'],
  properties: {
    sample_point_id: {
      type: 'string',
      title: 'Sample Point ID',
      'x-tooltip-text':
        'For Presence Surveys. Number each sample point in the same waterbody (e.g. 001, 002, 003, etc). Do not use for Extent Surveys'
    },
    invasive_plant_code: {
      type: 'string',
      title: 'Invasive Plant',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'invasive_plant_aquatic_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text':
        'For Presence survey: select species observed at coordinates. For Extent Survey: select target species for survey'
    },
    observation_type: {
      type: 'string',
      title: 'Observation Type',
      enum: ['Positive Observation', 'Negative Observation'],
      default: 'Positive Observation',
      'x-tooltip-text': 'The observation describes the absence of target invasive plants within a defined area'
    }
  },
  dependencies: {
    observation_type: {
      oneOf: [
        {
          properties: {
            observation_type: {
              enum: ['Negative Observation']
            }
          }
        },
        {
          properties: {
            observation_type: {
              enum: ['Positive Observation']
            },
            invasive_plant_density_code: {
              type: 'string',
              title: 'Density',
              'x-enum-code': {
                'x-enum-code-category-name': 'invasives',
                'x-enum-code-header-name': 'invasive_plant_density_code',
                'x-enum-code-name': 'code_name',
                'x-enum-code-text': 'code_description',
                'x-enum-code-sort-order': 'code_sort_order'
              },
              'x-tooltip-text': 'Average number of individual plants per square meter expressed as a density class code'
            },
            invasive_plant_distribution_code: {
              type: 'string',
              title: 'Distribution',
              'x-enum-code': {
                'x-enum-code-category-name': 'invasives',
                'x-enum-code-header-name': 'invasive_plant_distribution_code',
                'x-enum-code-name': 'code_name',
                'x-enum-code-text': 'code_description',
                'x-enum-code-sort-order': 'code_sort_order'
              },
              'x-tooltip-text':
                'Description of the average arrangement of invasive plant clusters within the observation area expressed as a distribution code'
            },
            plant_life_stage_code: {
              type: 'string',
              title: 'Life Stage',
              'x-enum-code': {
                'x-enum-code-category-name': 'invasives',
                'x-enum-code-header-name': 'plant_life_stage_code',
                'x-enum-code-name': 'code_name',
                'x-enum-code-text': 'code_description',
                'x-enum-code-sort-order': 'code_sort_order'
              },
              'x-tooltip-text': 'Average phenological stage of plant; rosette, flowering, etc'
            },
            voucher_specimen_collected: {
              type: 'string',
              title: 'Voucher Specimen Collected',
              enum: ['Yes', 'No'],
              'x-tooltip-text': 'If specimen collected, provide details in observation comments'
            },
            edna_sample: {
              type: 'string',
              title: 'eDNA Sample',
              enum: ['Yes', 'No'],
              default: 'No',
              'x-tooltip-text':
                'Genetic material that can be extracted from bulk environmental samples such as water and soil'
            }
          },
          required: [
            'edna_sample',
            'invasive_plant_density_code',
            'voucher_specimen_collected',
            'plant_life_stage_code',
            'invasive_plant_distribution_code'
          ],
          dependencies: {
            voucher_specimen_collected: {
              oneOf: [
                {
                  properties: {
                    voucher_specimen_collected: {
                      enum: ['Yes']
                    },
                    genetic_sample_id: {
                      type: 'string',
                      title: 'Genetic Sample ID',
                      'x-tooltip-text':
                        'Unique identifier for each voucher collected. Helpful to include abbreviation of waterbody name'
                    },
                    genetic_structure_collected: {
                      type: 'string',
                      title: 'Genetic Structure Collected',
                      'x-tooltip-text':
                        'Describe plant parts collected. Ideal to collect entire plant structure for verification purposes'
                    }
                  },
                  required: ['genetic_structure_collected', 'genetic_sample_id']
                },
                {
                  properties: {
                    voucher_specimen_collected: {
                      enum: ['No']
                    }
                  }
                }
              ]
            },
            edna_sample: {
              oneOf: [
                {
                  properties: {
                    edna_sample: {
                      enum: ['Yes']
                    },
                    enda_sample_information: {
                      type: 'object',
                      title: 'eDNA Sample Information',
                      properties: {
                        edna_sample_id: {
                          title: 'eDNA sample ID',
                          type: 'number'
                        },
                        sample_type: {
                          title: 'Sample Type',
                          type: 'string',
                          enum: ['water', 'soil', 'plant material', 'animal material'],
                          default: 'water'
                        },
                        field_replicates_num: {
                          title: 'Number of field replicates',
                          type: 'number'
                        },
                        control_sample_taken: {
                          title: 'Control sample taken',
                          type: 'string',
                          enum: ['Yes', 'No'],
                          default: ['No']
                        }
                      },
                      required: ['edna_sample_id', 'sample_type']
                    }
                  },
                  required: ['enda_sample_information']
                },
                {
                  properties: {
                    edna_sample: {
                      enum: ['No']
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    }
  }
};
export const Herbicide = {
  type: 'object',
  required: [
    'herbicide_code',
    'herbicide_type',
    'area_treated',
    'application_rate',
    'herbicide_amount',
    'mix_delivery_rate'
  ],
  properties: {
    herbicide_type: {
      title: 'Herbicide Type',
      type: 'string',
      enum: ['liquid', 'granular'],
      'x-tooltip-text': 'Choose whether the herbicide being used is liquid or granular'
    },
    herbicide_code: {
      type: 'string',
      title: 'Herbicide',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'liquid_herbicide_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      }
    },
    area_treated: {
      type: 'number',
      title: 'Area Treated (Ha)'
    },
    application_rate: {
      type: 'number',
      title: 'Application Rate (L/ha)',
      format: 'float',
      minimum: 0,
      'x-tooltip-text': 'Recommended label rate for herbicide (L/ha) used for this treatment'
    },
    herbicide_amount: {
      type: 'number',
      title: 'Amount of Mix Used (L)',
      format: 'float',
      minimum: 0,
      'x-tooltip-text': 'Volume in litres (ie 5.1 L) of herbicide and water mix'
    },
    mix_delivery_rate: {
      type: 'number',
      title: 'Delivery Rate of Mix (L/ha)',
      format: 'float',
      minimum: 0,
      'x-tooltip-text': 'Calibrated delivery rate of the device used to apply herbicide in L/ha'
    },
    dilution: {
      type: 'number',
      title: 'Dilution %',
      minimum: 0,
      'x-tooltip-text': 'Percent (%) of product in the mix'
    },
    specific_treatment_area: {
      type: 'number',
      title: 'Specific Treatment Area (ha)',
      minimum: 0,
      'x-tooltip-text':
        'Area of the chemical treatment (ha) automatically calculated from the application and delivery rates used during chemical treatment'
    }
  },
  dependencies: {
    herbicide_type: {
      oneOf: [
        {
          properties: {
            herbicide_type: {
              enum: ['liquid']
            }
          }
        },
        {
          properties: {
            herbicide_type: {
              enum: ['granular']
            },
            application_rate: {
              title: 'Application Rate (g/ha)'
            },
            herbicide_amount: {
              title: 'Amount of Mix Used (g)'
            },
            mix_delivery_rate: {
              title: 'Delivery Rate of Mix (g/ha)'
            }
          }
        }
      ]
    }
  }
};
export const TransectInvasivePlants = {
  type: 'object',
  required: [
    'invasive_plant_code',
    'invasive_plant_density_code',
    'invasive_plant_distribution_code',
    'soil_texture_code',
    'linear_infestation',
    'biological_agent_code'
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
      'x-tooltip-text': 'Target invasive plant species at this location'
    },
    invasive_plant_density_code: {
      type: 'string',
      title: 'Density',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'invasive_plant_density_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Average number of individual plants per square meter expressed as a density class code'
    },
    invasive_plant_distribution_code: {
      type: 'string',
      title: 'Distribution',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'invasive_plant_distribution_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text':
        'Description of the average arrangement of invasive plant clusters within the observation area expressed as a distribution code'
    },
    soil_texture_code: {
      type: 'string',
      title: 'Soil Texture',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'soil_texture_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text':
        'Relative amount of sand, silt, clay, organic matter, and bedrock throughout the observation area'
    },
    linear_infestation: {
      type: 'string',
      title: 'Linear',
      enum: ['Unknown', 'Yes', 'No'],
      default: 'Unknown',
      'x-tooltip-text': 'If the infestation distribution is linear, select Yes'
    },
    biological_agent_code: {
      type: 'string',
      title: 'Proposed Biological Agent',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'biological_agent_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Genus species code of the agent (ie ALTICAR [Altica carduorum])'
    }
  }
};
export const InvasivePlants = {
  type: 'object',
  required: ['invasive_plant_code'],
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
      'x-tooltip-text': 'Invasive plant species observed at this location'
    }
  }
};
export const Persons = {
  type: 'object',
  required: ['person_name'],
  properties: {
    person_name: {
      type: 'string',
      title: 'Person Name',
      'x-tooltip-text': 'Name of person'
    }
  }
};
export const TransectData = {
  type: 'object',
  title: ' ',
  required: [
    'utm_zone',
    'transect_start_date_time',
    'transect_end_date_time',
    'project_number',
    'surveyor1_name',
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
  ],
  properties: {
    utm_zone: {
      type: 'number',
      title: 'UTM Zone',
      enum: [7, 8, 9, 10, 11],
      'x-tooltip-text': 'Provincial UTM Zone (7, 8, 9, 10, 11)'
    },
    transect_start_date_time: {
      type: 'string',
      format: 'date-time',
      title: 'Start Date and Time',
      'x-tooltip-text': 'Start time and date of the collection'
    },
    transect_end_date_time: {
      type: 'string',
      format: 'date-time',
      title: 'End Date and Time',
      'x-tooltip-text': 'End time and date of the collection'
    },
    project_number: {
      type: 'string',
      title: 'Project Number',
      'x-tooltip-text': 'The unique project or reference number (ie ABC123)'
    },
    surveyor1_name: {
      type: 'string',
      title: 'Surveyor 1 Name',
      'x-tooltip-text': 'Name of the primary surveyor'
    },
    surveyor2_name: {
      type: 'string',
      title: 'Surveyor 2 Name',
      'x-tooltip-text': 'Name of the secondary surveyor'
    },
    field_recorder_name: {
      type: 'string',
      title: 'Field Recorder Name',
      'x-tooltip-text': 'Name of the field recorder'
    },
    research_trial_code: {
      type: 'string',
      title: 'Research Trial',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'research_trial_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text':
        'Is this observation part of a research project or trial. If yes, add details in Project Code or Comments fields'
    },
    realm_code: {
      type: 'string',
      title: 'Realm/Class',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'realm_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Ecosystem classification'
    },
    site_aspect: {
      type: 'number',
      title: 'Site Aspect',
      minimum: 0,
      maximum: 359,
      'x-tooltip-text': 'Specify (in degrees) the direction that the slope is facing'
    },
    site_aspect_variability: {
      type: 'string',
      title: 'Site Aspect Variability',
      enum: ['Unknown', 'Yes', 'No'],
      default: 'No',
      'x-tooltip-text': 'If the plant infestation extends into multiple aspects, select Yes'
    },
    site_slope: {
      type: 'number',
      title: 'Site Slope',
      minimum: 0,
      maximum: 50,
      'x-tooltip-text': 'Use a clinometer to obtain the percent of the slope for the site'
    },
    site_slope_variability: {
      type: 'string',
      title: 'Site Slope Variability',
      enum: ['Unknown', 'Yes', 'No'],
      default: 'No',
      'x-tooltip-text': 'If a plant infestation extends over more than one significant slope, select Yes'
    },
    site_elevation: {
      type: 'number',
      title: 'Site Elevation',
      minimum: 0,
      maximum: 4000,
      'x-tooltip-text': 'Use a GPS to obtain and record the average elevation'
    },
    precipitation_code: {
      type: 'string',
      title: 'Precipitation',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'precipitation_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Select the most representative precipitation state'
    },
    burn_severity_code: {
      type: 'string',
      title: 'Burn Severity',
      enum: ['Yes', 'No Burn'],
      default: 'No Burn',
      'x-tooltip-text': 'Has the observation area been burnt?'
    },
    ecological_moisture_regime_code: {
      type: 'string',
      title: 'Ecological Moisture',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'ecological_moisture_regime_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Select the average ecological moisture'
    },
    mesoslope_position_code: {
      type: 'string',
      title: 'Mesoslope Position',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'mesoslope_position_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Select the most representative mesoslope condition'
    },
    site_surface_shape_code: {
      type: 'string',
      title: 'Site Surface Shape',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'site_surface_shape_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Select the most representative slope shape'
    },
    soil_properties_code: {
      type: 'string',
      title: 'Soil Properties',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'soil_properties_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Select the most representative soil property'
    },
    surface_substrate_code: {
      type: 'string',
      title: 'Surface Substrate',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'surface_substrate_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Select the most representative subsurface condition'
    },
    site_activity_disturbance: {
      type: 'string',
      title: 'Site Activity/Disturbance',
      enum: ['Unknown', 'Yes', 'No'],
      default: 'No',
      'x-tooltip-text': 'If the site is disturbed, select Yes'
    },
    disturbance_site_defunct: {
      type: 'string',
      title: 'Disturbance Site Defunct',
      enum: ['Unknown', 'Yes', 'No'],
      default: 'No',
      'x-tooltip-text': 'If the site is defunct, select Yes'
    },
    disturbance_condition_code: {
      type: 'string',
      title: 'Disturbance Condition',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'disturbance_condition_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Select the most representative disturbance condition'
    },
    disturbance_type_code: {
      type: 'string',
      title: 'Disturbance Type',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'disturbance_type_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Select the most representative disturbance type'
    },
    invasive_plant_change_code: {
      type: 'string',
      title: 'Invasive Plant Change',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'invasive_plant_change_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Select the observed change on all species'
    },
    target_plant_change_code: {
      type: 'string',
      title: 'Target Plant Change',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'target_plant_change_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Select the observed change on the target species'
    },
    treatment_seeded: {
      type: 'string',
      title: 'Treatment Seeded',
      enum: ['Unknown', 'Yes', 'No'],
      default: 'No',
      'x-tooltip-text': 'If the observation area has been seeded, select Yes'
    },
    density_count_type_code: {
      type: 'string',
      title: 'Density Count Type',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'density_count_type_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Specify the density type'
    },
    trace_plants: {
      type: 'string',
      title: 'Trace Plants',
      enum: ['Unknown', 'Present', 'Absent'],
      default: 'Absent',
      'x-tooltip-text': 'If the observation has trace plants present, select Present'
    },
    growth_pattern: {
      type: 'string',
      title: 'Growth Pattern',
      enum: ['Unknown', 'Single', 'Patches'],
      default: 'Unknown',
      'x-tooltip-text': 'Select the growth pattern on the target species'
    },
    frame_size_code: {
      type: 'string',
      title: 'Frame Size',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'frame_size_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Set the frame size for the collections'
    },
    biocontrol_noted_code: {
      type: 'string',
      title: 'Biocontrol Noted',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'biocontrol_noted_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text':
        'If biological control agents are noted while completing the transects, select Yes and record the species found in the comments'
    },
    photoplot_start: {
      type: 'string',
      title: 'Photoplot Start',
      enum: ['Unknown', 'Yes', 'No'],
      default: 'Unknown',
      'x-tooltip-text': 'If photos were taken at the start point, select Yes'
    },
    photoplot_end: {
      type: 'string',
      title: 'Photoplot End',
      enum: ['Unknown', 'Yes', 'No'],
      default: 'Unknown',
      'x-tooltip-text': 'If photos were taken at the end point, select Yes'
    },
    photoplot_aerials: {
      type: 'string',
      title: 'Photoplot Aerials',
      enum: ['Unknown', 'Yes', 'No'],
      default: 'Unknown',
      'x-tooltip-text': 'Were aerial photos taken at 0, 10, 20, 30, 40, and 50m? If so, select Yes'
    },
    photoplot_full_25m: {
      type: 'string',
      title: 'Photoplot Full at 25m',
      'x-tooltip-text': 'Provide the Full Photoplot form number'
    },
    plot_location: {
      type: 'string',
      title: 'Plot Location',
      enum: ['Left', 'Middle', 'Right'],
      default: 'Left',
      'x-tooltip-text': 'Set your plot location in relation to the transect'
    },
    veg_transect_sampler: {
      type: 'string',
      title: 'Vegetation Sampler',
      'x-tooltip-text': 'Initials of the sampler'
    },
    veg_transect_recorder: {
      type: 'string',
      title: 'Vegetation Recorder',
      'x-tooltip-text': 'Initials of the recorder'
    }
  }
};
export const TransectLine = {
  type: 'object',
  title: 'Transect Line Information',
  required: [
    'transect_line_id',
    'transect_comment',
    'start_x_utm',
    'start_y_utm',
    'end_x_utm',
    'end_y_utm',
    'transect_length',
    'transect_bearing'
  ],
  properties: {
    transect_line_id: {
      type: 'string',
      title: 'Transect Line ID',
      'x-tooltip-text': 'Provide a unique transect line identifier (ie ABC123)'
    },
    transect_comment: {
      type: 'string',
      title: 'Comment',
      'x-tooltip-text': 'Provide a comment specific to the transect line'
    },
    start_x_utm: {
      type: 'number',
      title: 'Start UTM Easting',
      'x-tooltip-text': 'Provide a UTM start Easting coordinate'
    },
    start_y_utm: {
      type: 'number',
      title: 'Start UTM Northing',
      'x-tooltip-text': 'Provide a UTM start Northing coordinate'
    },
    end_x_utm: {
      type: 'number',
      title: 'End UTM Easting',
      'x-tooltip-text': 'Provide a UTM end Easting coordinate'
    },
    end_y_utm: {
      type: 'number',
      title: 'End UTM Northing',
      'x-tooltip-text': 'Provide a UTM end Northing coordinate'
    },
    transect_length: {
      type: 'number',
      title: 'Transect Length (m)',
      'x-tooltip-text': 'Transect length in meters based on distance between start and end points'
    },
    transect_bearing: {
      type: 'number',
      title: 'Transect Bearing (Degrees)',
      'x-tooltip-text': 'Transect bearing in degrees based on the vector from start and end points'
    }
  }
};
export const FireMonitoringTransectPoints = {
  type: 'object',
  required: [
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
    'veg_transect_litter'
  ],
  properties: {
    sample_point_id: {
      type: 'string',
      title: 'Sample Point ID',
      'x-tooltip-text': 'Provide a unique transect point identifier (ie ABC123)'
    },
    offset_distance: {
      type: 'number',
      title: 'Plot Distance',
      'x-tooltip-text': 'Provide the offset distance from the start point'
    },
    utm_x: {
      type: 'number',
      title: 'Offset Point UTM Easting',
      'x-tooltip-text': 'UTM Easting point at the offset distance'
    },
    utm_y: {
      type: 'number',
      title: 'Offset Point UTM Northing',
      'x-tooltip-text': 'UTM Northing point at the offset distance'
    },
    veg_transect_native_forbs: {
      type: 'number',
      title: 'Vegetation Native Forbs',
      'x-tooltip-text': 'Number of native forbs observed'
    },
    veg_transect_grasses: {
      type: 'number',
      title: 'Vegetation Grasses',
      'x-tooltip-text': 'Number of grasses observed'
    },
    veg_transect_bare_ground: {
      type: 'number',
      title: 'Vegetation Bare Ground Patches',
      'x-tooltip-text': 'Number of bare ground patches observed'
    },
    veg_transect_shrubs: {
      type: 'number',
      title: 'Vegetation Shrubs/Trees',
      'x-tooltip-text': 'Number of shrubs/trees observed'
    },
    veg_transect_bryophytes: {
      type: 'number',
      title: 'Vegetation Bryophytes',
      'x-tooltip-text': 'Number of bryophytes observed'
    },
    veg_transect_litter: {
      type: 'number',
      title: 'Vegetation Litter',
      'x-tooltip-text': 'Number of litter observed'
    },
    invasive_plants: {
      type: 'array',
      default: [{}],
      title: 'Invasive Plants',
      minItems: 1,
      items: {
        $ref: '#/components/schemas/InvasivePlants'
      },
      'x-tooltip-text': 'List all the invasive plant species at this location'
    }
  }
};
export const Point_Of_Interest = {
  title: 'Basic Information',
  description: 'Basic information captured for all points of interest',
  type: 'object',
  required: [
    'invasive_species_agency_code',
    'jurisdiction_code',
    'point_of_interest_status',
    'access_description',
    'media_indicator',
    'created_date_on_device',
    'updated_date_on_device'
  ],
  properties: {
    invasive_species_agency_code: {
      type: 'string',
      title: 'Agency',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'invasive_species_agency_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      }
    },
    jurisdiction_code: {
      type: 'string',
      title: 'Jurisdiction',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'jurisdiction_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      }
    },
    point_of_interest_status: {
      type: 'string',
      title: 'Point of interest status',
      enum: ['sync', 'done', 'pending', 'errors']
    },
    general_comment: {
      type: 'string',
      title: 'Comment',
      maxLength: 300
    },
    access_description: {
      type: 'string',
      title: 'Access Description',
      maxLength: 300
    },
    media_indicator: {
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
    project_code: {
      type: 'array',
      title: 'Project Code',
      default: [{}],
      items: {
        $ref: '#/components/schemas/ProjectCode'
      }
    }
  }
};
export const FireMonitoringTransectLines = {
  type: 'object',
  required: ['transect_line', 'fire_monitoring_transect_points'],
  properties: {
    transect_line: {
      ...TransectLine
    },
    fire_monitoring_transect_points: {
      type: 'array',
      default: [{}],
      title: 'Transect Points Information',
      items: {
        ...FireMonitoringTransectPoints
      }
    }
  }
};
export const PointOfInterest_IAPP_Site = {
  type: 'object',
  properties: {
    point_of_interest_data: {
      ...Point_Of_Interest
    },
    point_of_interest_type_data: {
      ...IAPP_Site
    },
    surveys: {
      type: 'array',
      default: [{}],
      title: 'Surveys',
      description: 'Legacy IAPP Surveys from this point of interest',
      items: {
        ...IAPP_Survey
      }
    },
    mechanical_treatments: {
      type: 'array',
      default: [{}],
      title: 'Mechanical Treatments',
      description: 'Legacy IAPP Mechanical Treatments',
      items: {
        ...IAPP_Mechanical_Treatment
      }
    },
    chemical_treatments: {
      type: 'array',
      default: [{}],
      title: 'Mechanical Treatments',
      description: 'Legacy IAPP Mechanical Treatments',
      items: {
        ...IAPP_Chemical_Treatment
      }
    },
    biological_treatments: {
      type: 'array',
      default: [{}],
      title: 'Biological Treatments',
      description: 'Legacy IAPP Biological Treatments',
      items: {
        ...IAPP_Biological_Treatment
      }
    },
    biological_dispersals: {
      type: 'array',
      default: [{}],
      title: 'Biological Dispersals',
      description: 'Legacy IAPP Biological Dispersals',
      items: {
        ...IAPP_Biological_Dispersals
      }
    }
  }
};
export const ChemicalTreatment_Species_Codes = {
  type: 'object',
  properties: {
    chemical_method_direct: {
      type: 'string',
      title: 'Invasive Plant',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'chemical_method_direct',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Direct Chemical Application Method'
    },
    herbicide_type_code: {
      type: 'string',
      title: 'Invasive Plant',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'herbicide_type_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Herbicide Type (liquid or granular)'
    },
    calculation_type_code: {
      type: 'string',
      title: 'Invasive Plant',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'calculation_type_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Type of calculation for herbicide'
    },
    chemical_method_spray: {
      type: 'string',
      title: 'Invasive Plant',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'chemical_method_spray',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Direct Chemical Application Spray'
    },
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
      'x-tooltip-text': 'Target invasive plant species being treated at this location'
    },
    liquid_herbicide_code: {
      type: 'string',
      title: 'Herbicide (liquid)',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'liquid_herbicide_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      }
    },
    granular_herbicide_code: {
      type: 'string',
      title: 'Herbicide (granular)',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'granular_herbicide_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      }
    }
  }
};
