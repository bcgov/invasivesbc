export const Province = {
  title: 'Province',
  type: 'string',
  enum: ['BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'],
  default: 'BC'
};

export const InspectionTime = {
  title: 'Inspection Time',
  type: 'string',
  format: 'date-time',
}

export const BasicInformation = {
  title: 'Basic Information',
  type: 'object',
  properties: {
    province: {
      title: 'Province',
      type: 'string',
      enum: ['BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'],
      default: 'BC'
    },
    inspection_time: {
      title: 'Inspection Time',
      type: 'string',
      format: 'date-time',
    },
    non_motorized: {
      type: 'integer',
      title: 'Non Motorized'
    },
    motorized: {
      type: 'integer',
      title: 'Motorized'
    },
    simple: {
      type: 'integer',
      title: 'Simple'
    },
    complex: {
      type: 'integer',
      title: 'Complex'
    }
  }
};
