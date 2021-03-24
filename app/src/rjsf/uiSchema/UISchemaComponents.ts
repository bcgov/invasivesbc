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
  activity_id: {
    'ui:readonly': true
  },
  applicator1_name: {},
  applicator1_license: {},
  applicator2_name: {},
  applicator2_license: {},
  pesticide_employer_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  pesticide_user_license_number: {},
  chemical_method_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  temperature: {},
  humidity: {},
  pest_management_plan: {
    'ui:widget': 'single-select-autocomplete'
  },
  invasive_plant_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  herbicide: {
    items: {
      ...BaseUISchemaComponents.Herbicide
    }
  },
  wind_speed: {},
  wind_direction_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  pesticide_use_permit_PUP: {},
  signage_on_site: {}
};

const Treatment_ChemicalPlant_BulkEdit = {
  pesticide_employer_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  pest_management_plan: {
    'ui:widget': 'single-select-autocomplete'
  },
  pesticide_use_permit_PUP: {},
  treatment_issues_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  chemical_method_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  herbicide: {
    items: {
      ...BaseUISchemaComponents.Herbicide
    }
  },
  invasive_plant_code: {
    'ui:widget': 'single-select-autocomplete'
  }
};

const Activity = {
  activity_date_time: {
    'ui:widget': 'datetime'
  },
  latitude: {
    'ui:readonly': true
  },
  longitude: {
    'ui:readonly': true
  },
  reported_area: {
    'ui:readonly': true
  },
  invasive_species_agency_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  jurisdictions: {
    items: {
      ...BaseUISchemaComponents.Jurisdictions
    }
  },
  general_comment: {},
  access_description: {
    'ui:widget': 'textarea'
  },
  project_code: {
    items: {
      ...BaseUISchemaComponents.ProjectCode
    }
  }
};

const Activity_BulkEdit = {
  invasive_species_agency_code: {
    'ui:widget': 'single-select-autocomplete'
  },
  jurisdiction_code: {
    'ui:widget': 'single-select-autocomplete'
  }
};

const MonitoringActivity = {
  ...Activity,
  access_description: {
    ...Activity.access_description,
    'ui:readonly': true
  },
  jurisdiction_code: {
    'ui:disabled': true
  }
};

const UISchemaComponents = {
  Treatment_ChemicalPlant,
  Activity,
  MonitoringActivity,
  Activity_BulkEdit,
  Treatment_ChemicalPlant_BulkEdit
};

export default UISchemaComponents;
