import { RecordSetType, UserRecordSet } from 'interfaces/UserRecordSet';
import { getCurrentJWT } from 'state/sagas/auth/auth';

const config = await import('state/configuration/runtime-config');
const API_BASE = config.runtimeConfig.API_BASE;
const API_V2_BASE = config.runtimeConfig.API_V2_BASE;

/**
 * @desc Get list of all IDs from a recordset using current filters.
 * @returns {Array<string | number>} Ids for all records matching params for a user with read permissions.
 */
const getIdsForRecordset = async (record: UserRecordSet): Promise<Array<string | number>> => {
  const { ids_to_filter, recordSetType, tableFilters } = record;
  const config = (() => {
    switch (recordSetType) {
      case RecordSetType.IAPP:
        return {
          url: `${API_BASE}/api/v2/IAPP`,
          col: 'site_id'
        };
      case RecordSetType.Activity:
        return {
          url: `${API_V2_BASE}/recordset/rows`,
          col: 'activity_id'
        };
    }
  })();

  const filterObjects = { ids_to_filter, selectColumns: [config.col], tableFilters, limit: 999999 };

  const res = await fetch(config.url, {
    method: 'POST',
    headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ filterObjects: [filterObjects] })
  });

  if (!res?.ok) throw Error('Network Call Failed');
  const data = await res.json();

  // IAPP Activities come in a result wrapper, where IBC records come direct
  const ids = data?.result?.map((id) => id[config.col]) ?? data;
  return ids;
};

export default getIdsForRecordset;
