//these codes don't exist in the code table for whatever reason

import { CodeEntry } from './definitions';

export const WIND_DIRECTION_CODES: CodeEntry[] = [
  new CodeEntry('wind_direction', 'No Wind', 'No Wind'),
  new CodeEntry('wind_direction', 'N', 'North'),
  new CodeEntry('wind_direction', 'NE', 'Northeast'),
  new CodeEntry('wind_direction', 'E', 'East'),
  new CodeEntry('wind_direction', 'SE', 'Southeast'),
  new CodeEntry('wind_direction', 'S', 'South'),
  new CodeEntry('wind_direction', 'SW', 'Southwest'),
  new CodeEntry('wind_direction', 'W', 'West'),
  new CodeEntry('wind_direction', 'NW', 'Northwest')
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

export const WATERBODY_TYPE_CODES: CodeEntry[] = [
  new CodeEntry('waterbody_type_code', 'Bog', 'Bog'),
  new CodeEntry('waterbody_type_code', 'Confined Pond', 'Confined Pond'),
  new CodeEntry('waterbody_type_code', 'Discharging Pond', 'Discharging Pond'),
  new CodeEntry('waterbody_type_code', 'Ditch', 'Ditch'),
  new CodeEntry('waterbody_type_code', 'Intertidal', 'Intertidal'),
  new CodeEntry('waterbody_type_code', 'Lake', 'Lake'),
  new CodeEntry('waterbody_type_code', 'River', 'River'),
  new CodeEntry('waterbody_type_code', 'Slough', 'Slough'),
  new CodeEntry('waterbody_type_code', 'Stream', 'Stream'),
  new CodeEntry('waterbody_type_code', 'Wetland', 'Wetland')
];

export const SUBSTRATE_TYPE_CODES: CodeEntry[] = [
  new CodeEntry('substrate_type_code', 'Clay', 'Clay'),
  new CodeEntry('substrate_type_code', 'Cobble', 'Cobble'),
  new CodeEntry('substrate_type_code', 'Gravel', 'Gravel'),
  new CodeEntry('substrate_type_code', 'Rip-rap', 'Rip-rap'),
  new CodeEntry('substrate_type_code', 'Sand', 'Sand'),
  new CodeEntry('substrate_type_code', 'Silt/Organic', 'Silt/Organic')
];
