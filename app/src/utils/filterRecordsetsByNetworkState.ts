import { UserRecordCacheStatus, UserRecordSet } from 'interfaces/UserRecordSet';

/**
 * @desc Filter Recordset keys based on network status of user. Convert Obj keys to array.
 * @param recordSets Recordsets cached to users redux state
 * @param userOffline Current Network state of user,
 * @returns Users accessible recordsets
 */
const filterRecordsetsByNetworkState = (recordSets: Record<string, UserRecordSet>, userOffline: boolean): string[] => {
  return Object.keys(recordSets).filter((set) => {
    if (userOffline) {
      return recordSets[set].cacheMetadata.status === UserRecordCacheStatus.CACHED;
    }
    return true;
  });
};

export default filterRecordsetsByNetworkState;
