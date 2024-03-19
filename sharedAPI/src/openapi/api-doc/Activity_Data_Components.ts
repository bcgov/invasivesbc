import { Jurisdiction, ProjectCode } from './Components/General_Sub_Forms.js';

export const Activity = {
  title: 'Basic Information',
  type: 'object',
  required: [
    'invasive_species_agency_code',
    'jurisdictions',
    'activity_date_time',
    'latitude',
    'longitude',
    'utm_zone',
    'employer_code',
    'utm_easting',
    'utm_northing',
    'reported_area',
    'location_description'
  ],
  properties: {
    activity_date_time: {
      type: 'string',
      format: 'date-time',
      title: 'Date and Time',
      'x-tooltip-text': 'Date and time of the activity'
    },
    latitude: {
      type: 'number',
      title: 'Latitude (°)',
      'x-tooltip-text': 'Latitude of the anchor point for the specified geometry'
    },
    longitude: {
      type: 'number',
      title: 'Longitude (°)',
      'x-tooltip-text': 'Longitude of the anchor point for the specified geometry'
    },
    utm_zone: {
      type: 'string',
      title: 'UTM Zone',
      'x-tooltip-text': 'UTM Zone of the anchor point for the specified geometry'
    },
    utm_easting: {
      type: 'number',
      title: 'UTM Easting',
      'x-tooltip-text': 'UTM Easting of the anchor point for the specified geometry'
    },
    utm_northing: {
      type: 'number',
      title: 'UTM Northing',
      'x-tooltip-text': 'UTM Northing of the anchor point for the specified geometry'
    },
    reported_area: {
      type: 'number',
      title: 'Area (m\u00B2)',
      minimum: 1,
      'x-tooltip-text': 'Area of the activity automatically created from the geometry in square metres'
    },
    employer_code: {
      type: 'string',
      title: 'Employer',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'employer_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text': 'The company or agency that the person(s) completing the activity is directly employed by'
    },
    invasive_species_agency_code: {
      type: 'string',
      title: 'Funding Agency',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'invasive_species_agency_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      },
      'x-tooltip-text':
        'Choose the organization that is paying for the work to be done. If multiple funders exist or in cases when an agency has been hired to manage the work on behalf of the primary funding agency, multiple Funding Agencies may be chosen.'
    },
    location_description: {
      type: 'string',
      title: 'Location Description',
      maxLength: 2000,
      minLength: 5,
      default: '',
      'x-tooltip-text':
        'Text entry to provide location directions. Locations should start general and get more specific'
    },
    access_description: {
      type: 'string',
      title: 'Access Description',
      maxLength: 2000,
      default: '',
      'x-tooltip-text': 'Text entry to provide access directions.'
    },
    jurisdictions: {
      type: 'array',
      default: [{}],
      title: 'Jurisdictions',
      items: {
        ...Jurisdiction
      },
      'x-tooltip-text': 'Specify one or more jurisdictions for this activity'
    },
    project_code: {
      type: 'array',
      title: 'Project Code',
      default: [{}],
      items: {
        ...ProjectCode
      },
      'x-tooltip-text':
        'Optional field that can be added to a record to enable searching/sorting for records with that project code entered later. Multiple project codes may be added eg. project areas, contract identifiers. Replaces "paper file ID" field used in IAPP'
    },
    general_comment: {
      type: 'string',
      title: 'Comment',
      maxLength: 2000,
      default: '',
      'x-tooltip-text':
        'Plain text description of any supporting information about the observation that is not captured elsewhere (up to 2000 characters)'
    }
  }
};
