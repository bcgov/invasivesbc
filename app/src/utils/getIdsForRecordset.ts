import { RecordSetType, UserRecordSet } from 'interfaces/UserRecordSet';
import { getCurrentJWT } from 'state/sagas/auth/auth';

interface Options {
  API_BASE: string;
}
/**
 * @desc Get list of all IDs from a recordset using current filters.
 * @returns {Array<string | number>} Ids for all records matching params for a user with read permissions.
 */
const getIdsForRecordset = async (record: UserRecordSet, options: Options): Promise<Array<string | number>> => {
  const { recordSetType, tableFilters } = record;
  const config = (() => {
    switch (recordSetType) {
      case RecordSetType.IAPP:
        return {
          url: `${options.API_BASE}/api/v2/IAPP`,
          col: 'site_id'
        };
      case RecordSetType.Activity:
        return {
          url: `${options.API_BASE}/api/v2/activities/`,
          col: 'activity_id'
        };
    }
  })();

  const filterObjects = { selectColumns: [config.col], tableFilters, limit: 999999 };
  const res = await fetch(config.url, {
    method: 'POST',
    headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ filterObjects: [filterObjects] })
  });

  if (!res?.ok) throw Error('Network Call Failed');
  const data = await res.json();
  const ids = data.result.map((id) => id[config.col]);
  return ids;
};

export default getIdsForRecordset;
