/**
 * This file should contain any UI Schema items that have one or more nested elements.
 *
 * Example of schema item with nested element:
 *
 * const Obj = {
 *   some_nested_field: {
 *      ...nested_field_properties
 *   }
 * }
 */

import BaseUISchemaComponents from 'rjsf/uiSchema/BaseUISchemaComponents';

const Treatment_ChemicalPlant = {
  'treatment_chemicalplant_information': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    'applicator1_name': {},
    'applicator1_license': {},
    'applicator2_name': {},
    'applicator2_license': {},
    'pesticide_employer_code': {
      'ui:widget': 'single-select-autocomplete'
    },
    'pesticide_user_license_number': {},
    'chemical_method_code': {
      'ui:widget': 'single-select-autocomplete'
    },
    'temperature': {
      validateOnBlur: true
    },
    'humidity': {},
    'pest_management_plan': {
      'ui:widget': 'single-select-autocomplete'
    },
    'invasive_plant_code': {
      'ui:widget': 'single-select-autocomplete'
    },
    'herbicide': {
      items: {
        ...BaseUISchemaComponents.Herbicide
      }
    },
    'wind_speed': {
      validateOnBlur: true
    },
    'wind_direction_code': {
      'ui:widget': 'single-select-autocomplete'
    },
    'pesticide_use_permit_PUP': {},
    'signage_on_site': {},
    'ui:order':[
      'applicator1_name',
      'applicator1_license',
      'applicator2_name',
      'applicator2_license',
      'pesticide_employer_code',
      'pesticide_user_license_number',
      'chemical_method_code',
      'temperature',
      'humidity',
      'pest_management_plan',
      'invasive_plant_code',
      'herbicide',
      'wind_speed',
      'wind_direction_code',
      'pesticide_use_permit_PUP',
      'signage_on_site',
      'application_start_time'
    ]
  },

  'treatment_information': {
    'invasive_plants_information': {
      items: {
        'herbicide': {
          items: {
            'herbicide_type': { 'ui:widget': 'single-select-autocomplete' },
            'herbicide_information': {
              ...BaseUISchemaComponents.TwoColumnStyle
            }
          }
        }
      }
    }
  },
  'ui:order':['treatment_chemicalplant_information','treatment_information']
};

const Treatment_ChemicalPlant_BulkEdit = {
  'pesticide_employer_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'pest_management_plan': {
    'ui:widget': 'single-select-autocomplete'
  },
  'pesticide_use_permit_PUP': {},
  'treatment_issues_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'chemical_method_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'herbicide': {
    items: {
      ...BaseUISchemaComponents.Herbicide
    }
  },
  'invasive_plant_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'ui:order':[
    'pesticide_employer_code',
    'pest_management_plan',
    'pesticide_use_permit_PUP',
    'treatment_issues_code',
    'chemical_method_code',
    'herbicide',
    'invasive_plant_code'
  ]
};

const Treatment_ChemicalPlantAquatic = {
  'treatment_chemicalplant_information': {
    ...BaseUISchemaComponents.ThreeColumnStyle,
    'applicator1_name': {},
    'applicator1_license': {},
    'applicator2_name': {},
    'applicator2_license': {},
    'pesticide_employer_code': {
      'ui:widget': 'single-select-autocomplete'
    },
    'pesticide_user_license_number': {},
    'chemical_method_code': {
      'ui:widget': 'single-select-autocomplete'
    },
    'temperature': {
      validateOnBlur: true
    },
    'humidity': {},
    'pest_management_plan': {
      'ui:widget': 'single-select-autocomplete'
    },
    'invasive_plant_code': {
      'ui:widget': 'single-select-autocomplete'
    },
    'wind_speed': {
      validateOnBlur: true
    },
    'wind_direction_code': {
      'ui:widget': 'single-select-autocomplete'
    },
    'pesticide_use_permit_PUP': {},
    'signage_on_site': {}
  },
  'shoreline_types':{},
  'treatment_information': {
    'invasive_plants_information': {
      items: {
        'herbicide': {
          items: {
            herbicide_type: { 'ui:widget': 'single-select-autocomplete' },
            
            herbicide_information: {
              ...BaseUISchemaComponents.TwoColumnStyle
            }
          }
        }
      }
    }
  },
  'ui:order':['treatment_chemicalplant_information','shoreline_types','treatment_information']
};

const Activity = {
  'activity_date_time': {
    'ui:widget': 'datetime'
  },
  'latitude': {
    'ui:readonly': true
  },
  'longitude': {
    'ui:readonly': true
  },
  'utm_zone': {
    'ui:readonly': true
  },
  'utm_easting': {
    'ui:readonly': true
  },
  'utm_northing': {
    'ui:readonly': true
  },
  'reported_area': {
    'ui:readonly': true
  },
  'well_id': {
    'ui:readonly': true
  },
  'well_proximity': {
    'ui:readonly': true
  },
  'employer_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'invasive_species_agency_code': {
    'ui:widget': 'multi-select-autocomplete'
  },
  'jurisdictions': {
    items: {
      ...BaseUISchemaComponents.Jurisdictions
    }
  },
  'general_comment': {},
  'location_description': {
    'ui:widget': 'textarea'
  },
  'access_description': {
    'ui:widget': 'textarea'
  },
  'project_code': {
    items: {
      ...BaseUISchemaComponents.ProjectCode
    }
  },
  'ui:order':[
    'activity_date_time',
    'latitude',
    'longitude',
    'utm_zone',
    'utm_easting',
    'utm_northing',
    'reported_area',
    'well_id',
    'well_proximity',
    'employer_code',
    'invasive_species_agency_code',
    'jurisdictions',
    'location_description',
    'access_description',
    'general_comment',
    'project_code'
  ]
};

const MonitoringActivity = {
  ...Activity,
  'access_description': {
    ...Activity.access_description,
    // 'ui:readonly': true
  },
  'jurisdiction_code': {
    'ui:disabled': true
  },
  'ui:order':[
    'activity_date_time',
    'latitude',
    'longitude',
    'utm_easting',
    'utm_northing',
    'utm_zone',
    'reported_area',
    'well_id',
    'well_proximity',
    'employer_code',
    'invasive_species_agency_code',
    'jurisdictions',
    'general_comment',
    'location_description',
    'access_description',
    'project_code',
    'jurisdiction_code']
};

const Monitoring = {
  activity_id: { // treatment id
    'ui:widget': 'single-select-autocomplete'
  }
}

const UISchemaComponents = {
  Treatment_ChemicalPlant,
  Treatment_ChemicalPlantAquatic,
  Activity,
  MonitoringActivity,
  Monitoring,
  Treatment_ChemicalPlant_BulkEdit
};

export default UISchemaComponents;
