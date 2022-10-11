import { Persons } from './Components/General_Sub_Forms';

export const Observation = {
  title: 'Observation Information',
  type: 'object',
  required: ['activity_persons'],
  properties: {
    pre_treatment_observation: {
      title: 'Pre-treatment Observation',
      type: 'string',
      enum: ['Yes', 'No', 'Unknown'],
      default: 'Unknown',
      'x-tooltip-text': 'Choose yes if this observation was completed directly before a treatment'
    },
    activity_persons: {
      type: 'array',
      default: [{}],
      minItems: 1,
      title: 'Observation Person(s)',
      items: {
        ...Persons
      },
      'x-tooltip-text': 'Name of person(s) doing the observation'
    }
  }
};

export const Monitoring = {
  title: 'Monitoring Information',
  type: 'object',
  required: ['linked_id', 'activity_persons'],
  properties: {
    linked_id: {
      type: 'string',
      title: 'Linked Treatment ID',
      'x-tooltip-text': 'Identifier of linked treatment record'
    },
    activity_persons: {
      type: 'array',
      default: [{}],
      title: 'Monitoring Person(s)',
      items: {
        ...Persons
      },
      'x-tooltip-text': 'Name of person(s) doing monitoring'
    }
  }
};

export const Monitoring_Biocontrol = {
  title: 'Monitoring Information',
  type: 'object',
  required: ['activity_persons'],
  properties: {
    legacy_iapp_id: {
      type: 'number',
      maximum: 999999,
      minimum: 10000,
      title: 'Legacy IAPP Release ID',
      'x-tooltip-text': 'IAPP site ID'
    },
    activity_persons: {
      type: 'array',
      default: [{}],
      title: 'Monitoring Person(s)',
      items: {
        ...Persons
      },
      'x-tooltip-text': 'Name of person(s) doing monitoring'
    }
  }
};

export const Monitoring_Biocontrol_Release = {
  title: 'Monitoring Information',
  type: 'object',
  required: ['activity_persons', 'linked_id'],
  properties: {
    legacy_iapp_id: {
      type: 'number',
      maximum: 999999,
      minimum: 10000,
      title: 'Legacy IAPP Release ID',
      'x-tooltip-text': 'IAPP site ID'
    },
    linked_id: {
      type: 'string',
      title: 'Linked Treatment ID',
      'x-tooltip-text': 'Identifier of linked treatment record'
    },
    activity_persons: {
      type: 'array',
      default: [{}],
      title: 'Monitoring Person(s)',
      items: {
        ...Persons
      },
      'x-tooltip-text': 'Name of person(s) doing monitoring'
    }
  }
};

export const Treatment = {
  title: 'Treatment Information',
  type: 'object',
  required: ['activity_persons'],
  properties: {
    activity_persons: {
      type: 'array',
      default: [{}],
      title: 'Treatment Person(s)',
      items: {
        ...Persons
      },
      'x-tooltip-text': 'Name of person(s) doing treatment'
    }
  }
};

export const Treatment_Chemical = {
  title: 'Treatment Information',
  type: 'object',
  required: ['activity_persons'],
  properties: {
    activity_persons: {
      type: 'array',
      default: [{}],
      title: 'Treatment Person(s)',
      items: {
        allOf: [
          { ...Persons },
          {
            properties: {
              applicator_license: {
                type: 'string',
                title: 'Pesticide Applicator Certificate Number',
                'x-tooltip-text': 'Valid pesticide applicator certificate number'
              }
            }
          }
        ]
      },
      'x-tooltip-text': 'Name of person(s) doing treatment'
    }
  }
};

export const Collection = {
  title: 'Collection Information',
  type: 'object',
  required: ['activity_persons'],
  properties: {
    activity_persons: {
      type: 'array',
      default: [{}],
      title: 'Name(s) of Person(s) doing the collection',
      items: {
        ...Persons
      },
      'x-tooltip-text': 'Name of person(s) doing the observation'
    }
  }
};
