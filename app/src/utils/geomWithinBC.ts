import booleanContains from '@turf/boolean-contains';

/**
 * @desc Handler function for evaluating user defined shape is within BC
 * @param geometry Users current shape
 * @returns If entirety of user defined shape is within British Columbia
 */
function* geomWithinBC(geometry) {
  let BC_AREA: Record<string, any> | null = null;
  try {
    BC_AREA = (yield import('../state/sagas/activity/_bcArea')).default;
  } catch (e) {
    console.error('Could not load BC geometry file, unable to validate bounds');
  }
  if (BC_AREA !== null) {
    return booleanContains(BC_AREA.features[0] as any, geometry as any);
  }
  return false;
}

export default geomWithinBC;
