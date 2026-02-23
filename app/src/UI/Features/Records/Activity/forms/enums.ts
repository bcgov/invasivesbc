import FormCode from 'interfaces/FormCode';

const YesNoUnknown: Array<FormCode> = [
  {
    full_name: 'Yes',
    code: 'Yes',
    table: 'YesNoUnknown'
  },
  {
    full_name: 'No',
    code: 'No',
    table: 'YesNoUnknown'
  },
  {
    full_name: 'Unknown',
    code: 'Unknown',
    table: 'YesNoUnknown'
  }
];

const YesNo: Array<FormCode> = [
  {
    full_name: 'Yes',
    code: 'Yes',
    table: 'YesNoUnknown'
  },
  {
    full_name: 'No',
    code: 'No',
    table: 'YesNoUnknown'
  }
];

const ObservationType: Array<FormCode> = [
  {
    full_name: 'Positive Observation',
    code: 'Positive',
    table: 'ObservationType'
  },
  {
    full_name: 'Negative Observation',
    code: 'Negative',
    table: 'ObservationType'
  }
];

const WaterbodyType: Array<FormCode> = [
  {
    full_name: 'Bog',
    code: 'Bog',
    table: 'WaterbodyType'
  },
  {
    full_name: 'Confined Pond',
    code: 'Confined Pond',
    table: 'WaterbodyType'
  },
  {
    full_name: 'Discharging Pond',
    code: 'Discharging Pond',
    table: 'WaterbodyType'
  },
  {
    full_name: 'Ditch',
    code: 'Ditch',
    table: 'WaterbodyType'
  },
  {
    full_name: 'Intertidal',
    code: 'Intertidal',
    table: 'WaterbodyType'
  },
  {
    full_name: 'Lake',
    code: 'Lake',
    table: 'WaterbodyType'
  },
  {
    full_name: 'River',
    code: 'River',
    table: 'WaterbodyType'
  },
  {
    full_name: 'Slough',
    code: 'Slough',
    table: 'WaterbodyType'
  },
  {
    full_name: 'Stream',
    code: 'Stream',
    table: 'WaterbodyType'
  }
];

const WaterLevelManagement = [
  {
    full_name: 'Dam',
    code: 'Dam',
    table: 'WaterLevelManagement'
  },
  {
    full_name: 'None',
    code: 'None',
    table: 'WaterLevelManagement'
  },
  {
    full_name: 'Other',
    code: 'Other',
    table: 'WaterLevelManagement'
  },
  {
    full_name: 'Station',
    code: 'Station',
    table: 'WaterLevelManagement'
  },
  {
    full_name: 'Weir',
    code: 'Weir',
    table: 'WaterLevelManagement'
  }
];
export { ObservationType, YesNo, YesNoUnknown, WaterbodyType, WaterLevelManagement };
