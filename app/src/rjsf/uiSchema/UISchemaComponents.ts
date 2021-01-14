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
  applicator1_first_name: {},
  applicator1_last_name: {},
  applicator1_licence_number: {},
  applicator2_first_name: {},
  applicator2_last_name: {},
  applicator2_licence_number: {},
  pesticide_employer_code: {},
  chemical_method_code: {},
  temperature: {},
  humidity: {},
  pest_management_plan: {},
  invasive_plants: {
    items: {
      ...BaseUISchemaComponents.InvasivePlants
    }
  },
  treatment_issues_code: {},
  herbicide: {
    items: {
      ...BaseUISchemaComponents.Herbicide
    }
  },
  wind_speed: {},
  wind_direction_code: {},
  pesticide_use_permit_PUP: {}
};

const Treatment_ChemicalPlant_BulkEdit = {
  pesticide_employer_code: {},
  pest_management_plan: {},
  treatment_issues_code: {},
  chemical_method_code: {},
  wind_direction_code: {},
  invasive_plants: {
    items: {
      ...BaseUISchemaComponents.InvasivePlants
    }
  },
  humidity: {}
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
  invasive_species_agency_code: {},
  jurisdiction_code: {},
  general_comment: {
    'ui:widget': 'textarea'
  },
  access_description: {
    'ui:widget': 'textarea'
  },
  paper_file_id: {
    items: {
      ...BaseUISchemaComponents.PaperFileID
    }
  }
};

const Activity_BulkEdit = {
  invasive_species_agency_code: {},
  jurisdiction_code: {}
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
