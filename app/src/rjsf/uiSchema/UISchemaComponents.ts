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
  primary_applicator_employee_code: {},
  secondary_applicator_employee_code: {},
  pesticide_employer_code: {},
  project_management_plan_PMP: {},
  pesticide_use_permit_PUP: {},
  chemical_treatment_method: {},
  temperature: {},
  wind_speed: {},
  wind_direction_code: {},
  humidity: {},
  mix_delivery_rate: {},
  application_rate: {},
  area_treated: {},
  herbicide: {
    items: {
      ...BaseUISchemaComponents.Herbicide
    },
    'ui:column-xs': 12
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
  species_agency_code: {},
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

const UISchemaComponents = {
  Treatment_ChemicalPlant,
  Activity
};

export default UISchemaComponents;
