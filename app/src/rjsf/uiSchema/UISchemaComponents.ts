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
      'signage_on_site'
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
    'signage_on_site': {}
  },
  'waterbody_data': {
    ...BaseUISchemaComponents.TwoColumnStyle
  },
  'water_quality': {
    ...BaseUISchemaComponents.TwoColumnStyle
  },
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
  'ui:order':['treatment_chemicalplant_information','waterbody_data','water_quality','treatment_information']
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
  'utm_easting': {
    'ui:readonly': true
  },
  'utm_northing': {
    'ui:readonly': true
  },
  'utm_zone': {
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
    'project_code'
  ]
};

const Activity_BulkEdit = {
  'invasive_species_agency_code': {
    'ui:widget': 'single-select-autocomplete'
  },
  'jurisdiction_code': {
    'ui:widget': 'single-select-autocomplete'
  },
 'ui:order':['invasive_species_agency_code','jurisdiction_code']
};

// tentative definition.  RecordTable needs refactoring to match
const RecordTable = {
  title: 'Record Table',
  description: 'Table to display arbitrary data, grouped by columns and rows',
  properties: {
    tableName: {
      title: 'Table Name',
      type: 'string',
      default: ''
    },
    keyField: {
      title: 'Key Field',
      description: "Field/Column name which uniquely defines each table row (whether it's a visible column or not)",
      type: 'string',
      default: '_id'
    },
    rows: {
      type: 'array',
      description: 'Array of data objects in their default ordering which compose the rows of the table'
    },
    headers: {
      type: 'array',
      description: 'Array of header definitions composing the columns of the table',
      items: {
        $ref: '#/components/schemas/RecordTableHeader'
      }
    },
    tableSchemaType: {
      // might remove this, and use inheritance instead
      type: 'array',
      description:
        'Array of schema names which will be used to auto-import matching header field definitions.  Only imports headers with ids matching fields in the given schemas'
    },
    actions: {
      title: 'Actions',
      description: 'Actions which can be applied to contents of the table (buttons, links, interactions)',
      type: 'object',
      properties: {
        edit: {
          allOf: {
            $ref: '#/components/schemas/RecordTableAction'
          }
        },
        delete: {
          allOf: {
            $ref: '#/components/schemas/RecordTableAction'
          }
        }
      }
    },
    expansion: {
      title: 'Expansion',
      description: 'Defines how the table expands/contracts',
      type: 'object',
      properties: {
        enabled: {
          title: 'Expandable',
          description: 'Whether the table itself can be expanded and collapsed, or should just remain expanded',
          type: 'boolean',
          default: true
        },
        expanded: {
          title: 'Expanded',
          description: 'Default starting expanded/collapsed state of the table, before user interaction',
          type: 'boolean',
          default: true
        }
      }
    },
    sorting: {
      title: 'Sorting',
      description: 'Defines the way the table is sorted',
      type: 'object',
      properties: {
        enabled: {
          type: 'boolean',
          default: true
        },
        column: {
          title: 'Default Sorting Column',
          description: 'Column to initially sort by, which defaults to the first column'
        },
        order: {
          default: 'asc',
          enum: ['asc', 'desc']
        }
      }
    },
    dropdown: {
      title: 'Expandable Dropdown',
      description: 'Defines expandable dropdown behavior when clicking a row',
      type: 'object',
      properties: {
        enabled: {
          type: 'boolean',
          default: true
        },
        limit: {
          title: 'Total Expanded Row Limit',
          description:
            'Total number of rows expandable at a time.  Value of 0 allows unlimited.  (Set to disable dropdown to remove entirely)',
          default: 1,
          enum: [0, 1] // for now
        },
        component: {
          description: 'Component defining the dropdown of each row'
        },
        onToggle: {
          description: 'Function to call every time a row is expanded/contracted',
          type: 'function'
        },
        showActions: {
          type: 'boolean',
          default: true,
          description: "Whether to display actions of type 'row' in the dropdown or not."
        }
      }
    },
    overflow: {
      title: 'Overflow',
      description: 'Defines behavior of overflows from large text fields',
      type: 'object',
      properties: {
        enabled: {
          type: 'boolean',
          default: true
        },
        charLimit: {
          type: 'numeric',
          default: 50,
          description: 'Character limit for overflows'
        }
      }
    },
    selection: {
      title: 'Record Selection',
      description: 'Defines record selection behavior',
      type: 'object',
      properties: {
        enabled: {
          type: 'boolean',
          default: true
        }
      }
    },
    pagination: {
      title: 'Pagination',
      description: 'Defines paging behavior, rows per page, etc',
      type: 'object',
      properties: {
        enabled: {
          type: 'boolean',
          default: true
        },
        displayType: {
          type: 'string',
          default: 'overflow',
          enum: ['overflow']
        },
        rowsPerPage: {
          title: 'Rows Per Page',
          description: 'Rows to display per page',
          type: 'object',
          properties: {
            enabled: {
              type: 'boolean',
              description: 'Shows all rows when disabled',
              default: true
            },
            enableOptions: {
              type: 'boolean',
              description: 'Allows user control of number of rows per page',
              default: false
            },
            default: {
              description: 'Default rows per page, before user interaction',
              type: 'numeric',
              default: 10,
              enum: [10, 25, 50] // available options
            }
          }
        },
        limit: {
          title: 'Limit',
          description: 'Hard limit on total allowable rows per table. (0 for unlimited)',
          default: 0
        },
        padEmptyRows: {
          type: 'boolean',
          default: true,
          description:
            'Whether to pad empty rows in a table with whitespace to maintain same size between pages (typically only applicable to last page)'
        }
      }
    },
    filtering: {
      title: 'Filtering',
      description: 'Defines table filtering behavior',
      type: 'object',
      properties: {
        enabled: {
          type: 'boolean',
          default: false // not currently implemented
        },
        column: {
          description: 'Column to initially sort by, which defaults to the first column'
        },
        limit: {
          title: 'Total Expanded Row Limit',
          description:
            'Total number of rows expandable at a time.  Value of 0 allows unlimited.  (Set to disabled to remove entirely)',
          default: 1,
          enum: [0, 1] // for now
        }
      }
    }
  }
};

const RecordTableAction = {
  title: 'Record Table Action',
  type: 'object',
  properties: {
    key: {
      type: 'string'
    },
    enabled: {
      type: 'boolean',
      default: true
    },
    action: {
      type: 'function',
      description: 'Function to run on activation'
    },
    label: {
      type: 'string'
    },
    icon: {},
    bulkAction: {
      type: 'boolean',
      description: 'Whether this is an action which applies to the whole table'
    },
    rowAction: {
      type: 'boolean',
      description: 'Whether the action applies to individual rows'
    },
    bulkCondition: {
      type: 'function',
      description: 'Function which determines whether a bulk action is currently invalid'
    },
    rowCondition: {
      type: 'function',
      description: 'Function which determines whether a row action is currently invalid'
    },
    displayInvalid: {
      type: 'string',
      enum: ['error', 'disable', 'hidden'],
      description:
        'How to handle invalid actions.  Display an error, disable it (greyed out), or hide the action button'
    },
    invalidError: {
      type: 'string',
      description: 'Invalid action error text, when display is set to error'
    }
  }
};

const RecordTableHeader = {
  title: 'Record Table Header',
  type: 'object',
  properties: {
    id: {
      type: 'string'
    },
    title: {
      type: 'string',
      description: 'Title override, defaults to the capitalized id'
    },
    align: {
      type: 'string',
      enum: ['left', 'right']
    },
    type: {
      type: 'string',
      default: 'string',
      enum: ['string', 'number']
    },
    defaultOrder: {
      type: 'string',
      default: 'asc',
      enum: ['asc', 'desc']
    },
    valueMap: {
      type: 'object',
      description: 'Map from raw values to their replacements',
      properties: {}
    },
    tooltip: {
      type: 'string'
    },
    padding: {
      type: 'string',
      default: 'normal'
    },
    className: {
      type: 'string'
    }
  }
};

const MonitoringActivity = {
  ...Activity,
  'access_description': {
    ...Activity.access_description,
    'ui:readonly': true
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
    'access_description',
    'jurisdiction_code']
};

const UISchemaComponents = {
  Treatment_ChemicalPlant,
  Treatment_ChemicalPlantAquatic,
  Activity,
  MonitoringActivity,
  Activity_BulkEdit,
  Treatment_ChemicalPlant_BulkEdit
};

export default UISchemaComponents;
