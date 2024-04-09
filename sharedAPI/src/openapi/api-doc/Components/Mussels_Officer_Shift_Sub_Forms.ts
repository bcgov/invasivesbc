export const TimeCapture = {
  type: 'string',
  format: 'time'
}

export const DateCapture = {
  type: 'string',
  format: 'date-time'
}
export const Station = {
  type: 'string',
  enum: [
    'Osoyoos',
    'Prince George',
    'Richmond',
    'Vancouver',
    'Victoria',
  ]
}
export const Blowby = {
  type: 'object',
  title: 'invisible',
  properties: {
    reportedToRapp: {
      title: 'Reported to RAPP',
      type: 'boolean',
      default: false
    },
    watercraftComplexity: {
      title: 'Watercraft Complexity',
      type: 'string',
      enum: [
        'Non-motorized',
        'Simple',
        'Complex',
        'Very Complex'
      ]
    },
    blowbyTime: {
      title: 'Blowby Time',
      ...TimeCapture
    }
  },
  required: [
    'reportedToRapp',
    'watercraftComplexity',
    'blowbyTime'
  ]
}

export const ShiftStart = {
  type: 'object',
  properties: {
    shiftStartTime: {
      title: 'Shift Start Time',
      ...DateCapture
    },
    station: {
      title: 'Station',
      ...Station
    },
    shiftStartComments: {
      title: 'Shift Start Comment',
      type: 'string'
    }
  },
  required: [
    'shiftStartTime',
    'station'
  ]
}

export const ShiftEnd = {
  type: 'object',
  properties: {
    shiftEndTime: {
      title: 'Shift end time',
      ...TimeCapture
    },
    k9OnShift: {
      title: '🐕 K9 on Shift',
      type: 'boolean',
      default: false
    },
    boatsInspected: {
      title: '⛵️ Boats Inspected',
      type: 'boolean',
      default: false
    },
    shiftEndComments: {
      title: 'Shift End Comment',
      type: 'string'
    }
  },
  required: [
    'shiftEndTime'
  ]
}

export const ShiftOverview = {
  title: 'Shift Overview',
  type: 'object',
  properties: {
    inspections: {
      title: 'Inspections',
      type: 'object',
      properties: {
        placeHolderText: {
          type: 'null',
          title: 'Officer Inspections'
        }
      }
    },
    Blowbys: {
      title: 'Shift Blowbys',
      type: 'array',
      items: {
        ...Blowby
      }
    },
    shiftInformation: {
      title: 'Shift Information',
      type: 'object',
      properties: {
        shiftStart: {
          title: 'Shift Start',
          ...ShiftStart
        },
        shiftEnd: {
          title: 'Shift End',
          ...ShiftEnd
        }
      }
    }
  }
}
