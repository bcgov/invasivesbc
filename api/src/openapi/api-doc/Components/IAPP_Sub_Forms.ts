export const IAPP_Site = {
  title: 'IAPP Site',
  description: 'Legacy IAPP Site',
  type: 'object',
  required: [
    'site_id',
    'aspect_code',
    'original_bec_id',
    'map_sheet',
    'specific_use_code',
    'soil_texture_code',
    'slope_code',
    'site_elevation'
  ],
  properties: {
    site_id: {
      type: 'string',
      title: 'Site ID',
      maxLength: 30
    },
    aspect_code: {
      type: 'string',
      title: 'Aspect',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'aspect_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      }
    },
    original_bec_id: {
      type: 'string',
      title: 'BEC ID',
      maxLength: 30
    },
    map_sheet: {
      type: 'string',
      title: 'Map Sheet',
      maxLength: 30
    },
    specific_use_code: {
      type: 'string',
      title: 'Specific Use',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'specific_use_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Notable land uses or attributes within the observation area'
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
      }
    },
    slope_code: {
      type: 'string',
      title: 'Slope (%)',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'slope_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      }
    },
    site_elevation: {
      type: 'string',
      title: 'Elevation',
      maxLength: 30
    },
    surveys: {
      type: 'array',
      default: [{}],
      items: {
        $ref: '#/components/schemas/IAPP_Survey'
      }
    }
  }
};
export const IAPP_Survey = {
  title: 'IAPP Survey',
  description: 'IAPP Survey',
  type: 'object',
  required: ['survey_id'],
  properties: {
    survey_id: {
      type: 'string',
      title: 'Survey ID',
      maxLength: 30
    },
    survey_date: {
      type: 'string',
      title: 'Survey Date',
      maxLength: 30
    },
    reported_area: {
      type: 'number',
      title: 'Area (m\u00B2)',
      minimum: 1
    },
    map_code: {
      type: 'string',
      title: 'Map Code',
      maxLength: 30
    },
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
    invasive_plant_code: {
      type: 'string',
      title: 'Invasive Plant',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'invasive_plant_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      }
    },
    common_name: {
      type: 'string',
      title: 'Common Name'
    },
    species: {
      type: 'string',
      title: 'Species'
    },
    genus: {
      type: 'string',
      title: 'Genus',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'invasive_plant_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      }
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
      }
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
      }
    },
    observation_type_code: {
      type: 'string',
      title: 'Type',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'observation_type_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      default: 'OP'
    },
    general_comment: {
      type: 'string',
      title: 'Comment',
      maxLength: 300
    },
    employer_code: {
      type: 'string',
      title: 'Employer'
    },
    weeds_found: {
      type: 'string',
      title: 'Weeds Found'
    },
    project_code: {
      type: 'array',
      title: 'Project Code',
      default: [{}],
      items: {
        $ref: '#/components/schemas/ProjectCode'
      },
      'x-tooltip-text':
        'Optional field that can be added to a record to enable searching/sorting for records with that project code entered later. Multiple project codes may be added eg. project areas, contract identifiers. Replaces "paper file ID" field used in IAPP'
    },
    jurisdictions: {
      type: 'array',
      default: [{}],
      title: 'Jurisdictions',
      minimum: 1,
      maximum: 3,
      items: {
        type: 'object',
        properties: {
          jurisdiction_code: {
            type: 'string',
            title: 'Jurisdiction Code'
          },
          percentage: {
            type: 'number',
            title: 'Percentage',
            minimum: 0,
            maximum: 100
          }
        }
      }
    }
  }
};
export const IAPP_Treatment = {
  title: 'IAPP Treatment Common Properties',
  type: 'object',
  required: ['treatment_id', 'treatment_date', 'invasive_species_agency_code'],
  properties: {
    treatment_id: {
      type: 'string',
      title: 'Treatment ID'
    },
    treatment_date: {
      type: 'string',
      title: 'Treatment Date'
    },
    map_code: {
      type: 'string',
      title: 'Map Code'
    },
    reported_area: {
      type: 'number',
      title: 'Reported Area (m\u00B2)',
      minimum: 1
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
      }
    },
    common_name: {
      type: 'string',
      title: 'Common Name'
    },
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
    project_code: {
      type: 'array',
      title: 'Project Code',
      default: [{}],
      items: {
        $ref: '#/components/schemas/ProjectCode'
      },
      'x-tooltip-text':
        'Optional field that can be added to a record to enable searching/sorting for records with that project code entered later. Multiple project codes may be added eg. project areas, contract identifiers. Replaces "paper file ID" field used in IAPP'
    },
    general_comment: {
      type: 'string',
      title: 'Comment',
      maxLength: 300
    }
  }
};
export const IAPP_Monitoring = {
  title: 'IAPP Treatment Monitoring Common Properties',
  type: 'object',
  properties: {
    monitoring_id: {
      type: 'string',
      title: 'Monitoring ID'
    },
    monitoring_date: {
      type: 'string',
      title: 'Monitoring Date'
    },
    efficacy_code: {
      type: 'string',
      title: 'Efficacy Rating',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'efficacy_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      }
    },
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
    employer: {
      type: 'string',
      title: 'Employer'
    },
    project_code: {
      type: 'array',
      title: 'Project Code',
      items: {
        $ref: '#/components/schemas/ProjectCode'
      }
    },
    general_comment: {
      type: 'string',
      title: 'Comment',
      maxLength: 300
    },
    'x-tooltip-text':
      'Optional field that can be added to a record to enable searching/sorting for records with that project code entered later. Multiple project codes may be added eg. project areas, contract identifiers. Replaces "paper file ID" field used in IAPP'
  }
};
export const IAPP_Mechanical_Treatment = {
  title: 'Mechanical Treatment Information',
  type: 'object',
  allOf: [
    {
      $ref: '#/components/schemas/IAPP_Treatment'
    }
  ],
  properties: {
    mechanical_id: {
      type: 'string',
      title: 'Mechanical ID'
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
      }
    },
    monitoring: {
      type: 'array',
      default: [{}],
      title: 'Monitoring',
      items: {
        type: 'object',
        anyOf: [
          {
            $ref: '#/components/schemas/IAPP_Mechanical_Monitoring'
          }
        ]
      }
    }
  }
};
export const IAPP_Chemical_Treatment = {
  title: 'Chemical Treatment Information',
  type: 'object',
  allOf: [
    {
      $ref: '#/components/schemas/IAPP_Treatment'
    }
  ],
  properties: {
    chemical_method_code: {
      type: 'string',
      title: 'Chemical Treatment Method',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'chemical_method_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      }
    },
    service_license_number: {
      type: 'string',
      title: 'Service License #'
    },
    pmp_confirmation_number: {
      type: 'string',
      title: 'PMP Confirmation #'
    },
    pmra_reg_number: {
      type: 'string',
      title: 'PMRA Reg #'
    },
    pup_number: {
      type: 'string',
      title: 'PUP #'
    },
    treatment_time: {
      type: 'string',
      title: 'Treatment Time'
    },
    liquid_herbicide_code: {
      type: 'string',
      title: 'Liquid Herbicide',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'liquid_herbicide_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      }
    },
    herbicide_description: {
      type: 'string',
      title: 'Description'
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
    temperature: {
      type: 'number',
      title: 'Temperature (C°)',
      'x-tooltip-text': 'Measured in degrees celcius at time of treatment (ideally between 15 and 22 degrees)'
    },
    wind_speed: {
      type: 'number',
      title: 'Wind Speed (km/h)',
      minimum: 0,
      'x-tooltip-text': 'Wind speed in km/hr at time of treatment'
    },
    wind_direction: {
      type: 'string',
      title: 'Wind Direction'
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
    monitoring: {
      type: 'array',
      default: [{}],
      title: 'Monitoring',
      items: {
        type: 'object',
        anyOf: [
          {
            $ref: '#/components/schemas/IAPP_Chemical_Monitoring'
          }
        ]
      }
    }
  }
};
export const IAPP_Biological_Treatment = {
  title: 'Biological Treatment Information',
  type: 'object',
  allOf: [
    {
      $ref: '#/components/schemas/IAPP_Treatment'
    }
  ],
  properties: {
    collection_date: {
      type: 'string',
      title: 'Collection Date'
    },
    bioagent_source: {
      type: 'string',
      title: 'Bioagent Source'
    },
    treatment_issues_code: {
      type: 'string',
      title: 'Treatment Issue',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'treatment_issues_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      default: 'NA',
      'x-tooltip-text': 'Environmental condition that may effect survival of biocontrol'
    },
    classified_area_code: {
      type: 'string',
      title: 'Classified Area',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'classified_area_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Classification of type of biological treatment - ie research, primary'
    },
    release_quantity: {
      type: 'number',
      title: 'Release Quantity',
      minimum: 1,
      maximum: 100000,
      default: 1,
      'x-tooltip-text':
        'Number is derived by an actual sub-sample count and multiplied by the total number of plants/plant parts the agent resides upon or within, e.g 5 larvae within a gall X 10 galls = 50 larvae'
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
      'x-tooltip-text': 'Agent source location and organization (50 characters)'
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
    bioagent_maturity_status_code: {
      type: 'string',
      title: 'Biological Agent Status',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'bioagent_maturity_status_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Primary, secondary or tertiary agent'
    },
    monitoring: {
      type: 'array',
      default: [{}],
      title: 'Monitoring',
      items: {
        type: 'object',
        anyOf: [
          {
            $ref: '#/components/schemas/IAPP_Biological_Monitoring'
          }
        ]
      }
    }
  }
};
export const IAPP_Mechanical_Monitoring = {
  title: 'IAPP Mechanical Treatment Monitoring',
  type: 'object',
  allOf: [
    {
      $ref: '#/components/schemas/IAPP_Monitoring'
    }
  ]
};
export const IAPP_Chemical_Monitoring = {
  title: 'IAPP Chemical Treatment Monitoring',
  type: 'object',
  allOf: [
    {
      $ref: '#/components/schemas/IAPP_Monitoring'
    }
  ]
};
export const IAPP_Biological_Monitoring = {
  title: 'IAPP Biological Treatment Monitoring',
  type: 'object',
  allOf: [
    {
      $ref: '#/components/schemas/IAPP_Monitoring'
    },
    {
      $ref: '#/components/schemas/Monitoring_BiologicalTerrestrialPlant'
    }
  ]
};
export const IAPP_Biological_Dispersal = {
  title: 'Biological Dispersal Information',
  type: 'object',
  allOf: [
    {
      $ref: '#/components/schemas/IAPP_Monitoring'
    },
    {
      $ref: '#/components/schemas/Monitoring_BiologicalTerrestrialPlant'
    }
  ],
  properties: {
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
    }
  }
};
export const PointOfInterest_IAPP_Site = {
  type: 'object',
  properties: {
    point_of_interest_data: {
      $ref: '#/components/schemas/Point_Of_Interest'
    },
    point_of_interest_type_data: {
      $ref: '#/components/schemas/IAPP_Site'
    },
    surveys: {
      type: 'array',
      default: [{}],
      title: 'Surveys',
      description: 'Legacy IAPP Surveys from this point of interest',
      items: {
        $ref: '#/components/schemas/IAPP_Survey'
      }
    },
    mechanical_treatments: {
      type: 'array',
      default: [{}],
      title: 'Mechanical Treatments',
      description: 'Legacy IAPP Mechanical Treatments',
      items: {
        $ref: '#/components/schemas/IAPP_Mechanical_Treatment'
      }
    },
    chemical_treatments: {
      type: 'array',
      default: [{}],
      title: 'Mechanical Treatments',
      description: 'Legacy IAPP Mechanical Treatments',
      items: {
        $ref: '#/components/schemas/IAPP_Chemical_Treatment'
      }
    },
    biological_treatments: {
      type: 'array',
      default: [{}],
      title: 'Biological Treatments',
      description: 'Legacy IAPP Biological Treatments',
      items: {
        $ref: '#/components/schemas/IAPP_Biological_Treatment'
      }
    },
    biological_dispersals: {
      type: 'array',
      default: [{}],
      title: 'Biological Dispersals',
      description: 'Legacy IAPP Biological Dispersals',
      items: {
        $ref: '#/components/schemas/IAPP_Biological_Dispersals'
      }
    }
  }
};

export const IAPP_Biological_Dispersals = { type: 'object' };
