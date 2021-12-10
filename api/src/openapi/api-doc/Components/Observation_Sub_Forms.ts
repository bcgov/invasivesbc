export const Observation_PlantTerrestrial = {
  title: ' ',
  type: 'object',
  required: ['observation_plant_terrestrial_data', 'invasive_plants'],
  properties: {
    observation_plant_terrestrial_data: {
      type: 'object',
      title: 'Observation Data',
      $ref: '#/components/schemas/ObservationPlantTerrestrialData',
      'x-tooltip-text': 'Please specify your observation specific data'
    },
    invasive_plants: {
      type: 'array',
      default: [{}],
      title: 'Terrestrial Invasive Plants',
      minItems: 1,
      items: {
        $ref: '#/components/schemas/TerrestrialPlants'
      },
      'x-tooltip-text': 'Specify one or more terrestrial invasive plants for this observation'
    }
  }
};
export const Observation_PlantAquatic = {
  title: '‎‎‎‏‏‎ ‎',
  type: 'object',
  required: ['waterbody_data', 'invasive_plants'],
  properties: {
    waterbody_data: {
      type: 'object',
      title: 'Waterbody Data',
      allOf: [
        { $ref: '#/components/schemas/WaterbodyData' },
        {
          properties: {
            water_level_management: {
              type: 'string',
              title: 'Water Level Management',
              enum: ['None', 'Weir', 'Pump Station', 'Dam', 'Other'],
              'x-tooltip-text':
                'Select existing infrastructure, if any, that could allow water level management. If other, specify in comment field'
            },
            substrate_type: {
              type: 'string',
              title: 'Substrate Type',
              enum: ['Silt/Organic', 'Clay', 'Sand', 'Gravel', 'Cobble', 'Rip-rap'],
              'x-tooltip-text': 'Select the most prevalent substrate composition'
            },
            tidal_influence: {
              type: 'string',
              title: 'Tidal Influence',
              enum: ['Yes', 'No', 'Unknown'],
              'x-tooltip-text': 'Indicate if the water level at the observation point is influenced by tides'
            },
            adjacent_land_use: {
              type: 'string',
              title: 'Adjacent Land Use',
              'x-enum-code': {
                'x-enum-code-category-name': 'invasives',
                'x-enum-code-header-name': 'adjacent_land_use_code',
                'x-enum-code-name': 'code_name',
                'x-enum-code-text': 'code_description',
                'x-enum-code-sort-order': 'code_sort_order'
              },
              'x-tooltip-text': 'Select all adjacent land uses that apply and add details in the comment box.'
            },
            inflow_permanent: {
              type: 'string',
              title: 'Inflow (Permanent)',
              'x-enum-code': {
                'x-enum-code-category-name': 'invasives',
                'x-enum-code-header-name': 'inflow_permanent_code',
                'x-enum-code-name': 'code_name',
                'x-enum-code-text': 'code_description',
                'x-enum-code-sort-order': 'code_sort_order'
              },
              'x-tooltip-text':
                'Select one or more inflow types (aka upstream source) and indicate details or name of source water in the comments if known.'
            },
            inflow_other: {
              type: 'string',
              title: 'Inflow (Temp. or seasonal)',
              'x-enum-code': {
                'x-enum-code-category-name': 'invasives',
                'x-enum-code-header-name': 'inflow_temporary_code',
                'x-enum-code-name': 'code_name',
                'x-enum-code-text': 'code_description',
                'x-enum-code-sort-order': 'code_sort_order'
              },
              'x-tooltip-text':
                'Select one or more temporary inflow types and indicate details or name of source water in the comments if known.'
            },
            outflow: {
              type: 'string',
              title: 'Outflow',
              'x-enum-code': {
                'x-enum-code-category-name': 'invasives',
                'x-enum-code-header-name': 'outflow_code',
                'x-enum-code-name': 'code_name',
                'x-enum-code-text': 'code_description',
                'x-enum-code-sort-order': 'code_sort_order'
              },
              'x-tooltip-text':
                'Select one or more outflow types (downstream) and indicate details or name of outflow water in the comments if known.'
            },
            comment: {
              type: 'string',
              title: 'Comment',
              maxLength: 300,
              'x-tooltip-text': 'Add a comment'
            }
          },
          required: ['substrate_type', 'tidal_influence', 'inflow_permanent', 'inflow_other', 'outflow']
        }
      ]
    },
    shoreline_types: {
      type: 'array',
      default: [{}],
      title: 'Shoreline Types',
      items: {
        $ref: '#/components/schemas/ShorelineTypes'
      },
      'x-tooltip-text': 'Specify shoreline types with their respective percentages'
    },
    water_quality: {
      type: 'object',
      title: 'Water Quality',
      $ref: '#/components/schemas/WaterQuality'
    },
    invasive_plants: {
      type: 'array',
      default: [{}],
      minItems: 1,
      title: 'Aquatic Invasive Plant Information',
      items: {
        $ref: '#/components/schemas/AquaticPlants'
      }
    }
  }
};
export const ObservationPlantTerrestrialData = {
  type: 'object',
  required: ['specific_use_code', 'slope_code', 'aspect_code', 'research_detection_ind', 'well_ind'],
  properties: {
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
    slope_code: {
      type: 'string',
      title: 'Slope',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'slope_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'Exact or general slope of the land expressed as a percentage'
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
      },
      'x-tooltip-text': 'Average orientation that slope is facing within the observation area (ie; SE = southeast)'
    },
    research_detection_ind: {
      type: 'string',
      title: 'Research Observation',
      enum: ['Yes', 'No', 'Unknown'],
      default: 'No',
      'x-tooltip-text': 'Is this observation part of a research project? Add details in project code or comments fields'
    },
    well_ind: {
      type: 'string',
      title: 'Visible Well Nearby',
      enum: ['Yes', 'No', 'Unknown'],
      default: 'No',
      'x-tooltip-text': 'Is there a visible well nearby? Indicate the distance from the observation in the comments'
    }
  }
};
