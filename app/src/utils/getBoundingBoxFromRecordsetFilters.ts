import bbox from '@turf/bbox';
import { RecordSetType, UserRecordSet } from 'interfaces/UserRecordSet';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import { getSelectColumnsByRecordSetType } from 'state/sagas/map/dataAccess';
import { parse } from 'wkt';
import { RepositoryBoundingBoxSpec } from './tile-cache';

const getBoundingBoxFromRecordsetFilters = async (recordSet: UserRecordSet): Promise<RepositoryBoundingBoxSpec> => {
  const filterObj = {
    recordSetType: recordSet.recordSetType,
    sortColumn: 'short_id',
    sortOrder: 'DESC',
    tableFilters: recordSet.tableFilters,
    selectColumns: getSelectColumnsByRecordSetType(RecordSetType.Activity)
  };

  const data = await fetch(`${CONFIGURATION_API_BASE}/api/v2/activities/bbox`, {
    method: 'POST',
    headers: {
      Authorization: await getCurrentJWT(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ filterObjects: [filterObj] })
  }).then((data) => data.json());

  const [minX, minY, maxX, maxY] = bbox(parse(data.bbox));
  return {
    minLatitude: minY,
    maxLatitude: maxY,
    minLongitude: minX,
    maxLongitude: maxX
  };
};

export default getBoundingBoxFromRecordsetFilters;
