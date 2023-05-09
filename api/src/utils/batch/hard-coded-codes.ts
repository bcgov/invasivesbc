//these codes don't exist in the code table for whatever reason

import { CodeEntry } from './definitions';

export const WIND_DIRECTION_CODES: CodeEntry[] = [
  new CodeEntry('wind_direction', 'NA', 'No Wind'),
  new CodeEntry('wind_direction', 'N', 'North'),
  new CodeEntry('wind_direction', 'NE', 'Northeast'),
  new CodeEntry('wind_direction', 'E', 'East'),
  new CodeEntry('wind_direction', 'SE', 'Southeast'),
  new CodeEntry('wind_direction', 'S', 'South'),
  new CodeEntry('wind_direction', 'SW', 'Southwest'),
  new CodeEntry('wind_direction', 'W', 'West'),
  new CodeEntry('wind_direction', 'NE', 'Northwest')
];

export const OBSERVATION_TYPE_CODES: CodeEntry[] = [
  new CodeEntry('observation_type', 'Positive Observation', 'Positive Observation'),
  new CodeEntry('observation_type', 'Negative Observation', 'Negative Observation')
];

export const DISPOSED_MATERIAL_FORMAT_CODES: CodeEntry[] = [
  new CodeEntry('disposed_material_format', 'number of plants', 'number of plants'),
  new CodeEntry('disposed_material_format', 'weight', 'weight'),
  new CodeEntry('disposed_material_format', 'volume (m3)', 'volume (m3)')
];

export const YES_NO_CODES: CodeEntry[] = [new CodeEntry('yes_no', 'Yes', 'Yes'), new CodeEntry('yes_no', 'No', 'No')];

export const BIOCONTROL_MONITORING_TYPE_CODES: CodeEntry[] = [
  new CodeEntry('monitoring_type', 'Count', 'Count'),
  new CodeEntry('monitoring_type', 'Timed', 'Timed')
];

export const WATER_LEVEL_MANAGEMENT_CODES: CodeEntry[] = [
  new CodeEntry('water_level_management', 'Dam', 'Dam'),
  new CodeEntry('water_level_management', 'None', 'None'),
  new CodeEntry('water_level_management', 'Other', 'Other'),
  new CodeEntry('water_level_management', 'Station', 'Station'),
  new CodeEntry('water_level_management', 'Weir', 'Weir')
];
