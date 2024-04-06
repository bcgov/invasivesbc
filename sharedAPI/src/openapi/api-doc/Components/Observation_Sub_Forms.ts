export const Observation_PlantTerrestrial_Information = {
  type: 'object',
  title: 'Observation Plant Terrestrial Information',
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
    suitable_for_biocontrol_agent: {
      type: 'string',
      title: 'Suitable for biocontrol agent(s)',
      enum: ['Unknown', 'Yes', 'No'],
      default: 'Unknown',
      'x-tooltip-text':
        'Choose Yes if the infestation is large, evenly infested and the site is secure from future disturbance.'
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
      title: 'Slope (%)',
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

export const Observation_PlantAquatic_Information = {
  type: 'object',
  title: 'Observation Plant Aquatic Information',
  properties: {
    suitable_for_biocontrol_agent: {
      type: 'string',
      title: 'Suitable for biocontrol agent(s)',
      enum: ['Unknown', 'Yes', 'NO'],
      default: 'Unknown',
      'x-tooltip-text':
        'Choose Yes if the infestation is large, evenly infested and the site is secure from future disturbance.'
    }
  }
};

export const Observation_Mussels_Information = {
  type: 'object',
  title: 'ObservationMusselsInformation',
  properties: {
    mussels_were_found: {
      type: 'string',
      title: 'Mussels were found',
      enum: ['Unknown', 'Yes', 'NO'],
      default: 'Unknown',
      'x-tooltip-text':
        'Choose Yes if mussels were found. If no mussels were found, choose No and provide details in the comments field.'
    }
  }
};
