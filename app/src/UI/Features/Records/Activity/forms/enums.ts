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

const DisposedMaterialFormat = [
  {
    full_name: 'Number of Plants',
    code: 'plants',
    table: 'PlantDisposalFormat'
  },
  {
    full_name: 'Volume (Cubic Meters)',
    code: 'm^3',
    table: 'PlantDisposalFormat'
  },
  {
    full_name: 'Weight (kg)',
    code: 'Kg',
    table: 'PlantDisposalFormat'
  }
];

const TreatmentPass = [
  {
    full_name: 'First',
    code: 'First',
    table: 'TreatmentPass'
  },
  {
    full_name: 'Second',
    code: 'Second',
    table: 'TreatmentPass'
  },
  {
    full_name: 'Third',
    code: 'Third',
    table: 'TreatmentPass'
  },
  {
    full_name: 'Unknown',
    code: 'Unknown',
    table: 'TreatmentPass'
  }
];

const CardinalDirection = [
  {
    full_name: 'North',
    code: 'N',
    table: 'CardinalDirection'
  },
  {
    full_name: 'Northeast',
    code: 'NE',
    table: 'CardinalDirection'
  },
  {
    full_name: 'East',
    code: 'E',
    table: 'CardinalDirection'
  },
  {
    full_name: 'Southeast',
    code: 'SE',
    table: 'CardinalDirection'
  },
  {
    full_name: 'South',
    code: 'S',
    table: 'CardinalDirection'
  },
  {
    full_name: 'Southwest',
    code: 'SW',
    table: 'CardinalDirection'
  },
  {
    full_name: 'West',
    code: 'W',
    table: 'CardinalDirection'
  },
  {
    full_name: 'Northwest',
    code: 'NW',
    table: 'CardinalDirection'
  },
  {
    full_name: 'Non-Applicable',
    code: 'NA',
    table: 'CardinalDirection'
  }
];

export {
  CardinalDirection,
  DisposedMaterialFormat,
  ObservationType,
  TreatmentPass,
  YesNo,
  YesNoUnknown,
  WaterbodyType,
  WaterLevelManagement
};
