import { NullSwitch } from "./Mussels_Sub_Form"
import { Observation_Mussels_Information } from "./Observation_Sub_Forms"
/** @desc Reusable Time String input field */
export const TimeCapture = {
  type: 'string',
  format: 'time'
}
/** @desc Reusable date-time input field */
export const DateCapture = {
  type: 'string',
  format: 'date-time'
}
/**
 * @desc Station Workers are assigned to at start of day
 * TODO: Convert Populate fields from API
 */
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
    },
    reportedToRapp: {
      title: '📝 Reported to RAPP',
      ...NullSwitch
    },
  },
  required: [
    'reportedToRapp',
    'watercraftComplexity',
    'blowbyTime'
  ]
}

export const ShiftStartSection = {
  type: 'object',
  properties: {
    shiftStartTime: {
      title: 'Shift Start Time',
      ...DateCapture
    },
    shiftStartComments: {
      title: 'Shift Start Comment',
      type: 'string'
    },
    station: {
      title: 'Station',
      ...Station
    },
  },
  required: [
    'shiftStartTime',
    'station'
  ]
}

export const ShiftEndSection = {
  type: 'object',
  properties: {
    k9OnShift: {
      title: '🐕 K9 on Shift',
      ...NullSwitch
    },
    boatsInspected: {
      title: '⛵️ Boats Inspected',
      ...NullSwitch
    },
    shiftEndTime: {
      title: 'Shift end time',
      ...TimeCapture
    },
    shiftEndComments: {
      title: 'Shift End Comment',
      type: 'string'
    }
  },
  required: [
    'shiftEndTime',
    'boatsInspected',
    'k9OnShift'
  ]
}

/**
 * @desc Overview for an inspect officers work.
 * Captures the high level information surrounding the shift, containing relevant collections of
 * Blow-bys and Boat Inspections.
 */
export const ShiftOverview = {
  title: 'Shift Overview',
  type: 'object',
  properties: {
    inspections: {
      title: 'Inspections',
      type: 'array',
      items: {
        ...Observation_Mussels_Information,
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
          ...ShiftStartSection
        },
        shiftEnd: {
          title: 'Shift End',
          ...ShiftEndSection
        }
      }
    }
  }
}
