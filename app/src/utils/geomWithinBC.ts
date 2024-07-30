import { BC_AREA } from 'sharedAPI';
import booleanContains from '@turf/boolean-contains';

function* geomWithinBC(geometry) {
  let BC_BACKUP;
  if (BC_AREA === null) {
    try {
      BC_BACKUP = (yield import('../state/sagas/activity/_bcArea')).default;
    } catch (e) {
      console.error('Could not load BC geometry file, unable to validate bounds');
    }
  }
  if (BC_AREA !== null) {
    return booleanContains(BC_AREA.features[0] as any, geometry as any);
  } else if (BC_BACKUP !== null) {
    return booleanContains(BC_BACKUP.features[0] as any, geometry as any);
  }
  return false;
}

export default geomWithinBC;
