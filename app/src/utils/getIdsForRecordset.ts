import { RecordSetType } from 'interfaces/UserRecordSet';
import { IFilter } from 'state/actions/userSettings/RecordSet';
import { getCurrentJWT } from 'state/sagas/auth/auth';

type Options = {
  recordSetType: RecordSetType;
  tableFilters: Array<IFilter>;
};
/**
 * @desc Get list of all IDs from a recordset using current filters.
 * @returns {Array<string | number>} Ids for all records matching params for a user with read permissions.
 */
const getIdsForRecordset = async (options: Options): Promise<Array<string | number>> => {
  const { recordSetType, tableFilters } = options;
  const config = (() => {
    switch (recordSetType) {
      case RecordSetType.IAPP:
        return {
          url: `${CONFIGURATION_API_BASE}/api/v2/IAPP`,
          col: 'site_id'
        };
      case RecordSetType.Activity:
        return {
          url: `${CONFIGURATION_API_BASE}/api/v2/activities/`,
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

  if (res?.ok) {
    const data = await res.json();
    const ids = data.result.map((id) => id[config.col]);
    console.log(ids);
    return ids;
  }
  return [];
};

export default getIdsForRecordset;
