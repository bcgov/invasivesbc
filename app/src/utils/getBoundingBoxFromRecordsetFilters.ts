import bbox from '@turf/bbox';
import getSelectColumnsByRecordSetType from 'sharedAPI/src/getSelectColumnsByRecordSetType';
import { parse } from 'wkt';
import { RepositoryBoundingBoxSpec } from './tile-cache';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import { RecordSetType, UserRecordSet } from 'interfaces/UserRecordSet';

const config = await import('state/configuration/runtime-config');

const getBoundingBoxFromRecordsetFilters = async (recordSet: UserRecordSet): Promise<RepositoryBoundingBoxSpec> => {
  const API_BASE = config.runtimeConfig.API_BASE;

  const { recordSetType } = recordSet;
  const filterObj = {
    recordSetType: recordSetType,
    sortColumn: recordSetType === RecordSetType.Activity ? 'short_id' : 'site_id',
    sortOrder: 'DESC',
    tableFilters: recordSet.tableFilters,
    selectColumns: getSelectColumnsByRecordSetType(recordSetType)
  };
  const url =
    recordSetType === RecordSetType.Activity ? `${API_BASE}/api/v2/activities/bbox` : `${API_BASE}/api/v2/IAPP/bbox`;
  const data = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: await getCurrentJWT(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ filterObjects: [filterObj] })
  }).then((data) => data.json());

  const [minLongitude, minLatitude, maxLongitude, maxLatitude] = bbox(parse(data.bbox));
  return {
    minLatitude,
    maxLatitude,
    minLongitude,
    maxLongitude
  };
};

export default getBoundingBoxFromRecordsetFilters;
