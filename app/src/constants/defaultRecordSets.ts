import { ActivityStatus } from 'sharedAPI';
import recordsetColourScheme from './recordsetColourScheme';
import { RecordSetId, RecordSetType, UserRecordCacheStatus, UserRecordSet } from 'interfaces/UserRecordSet';
import { buildTimeConfig } from 'state/configuration/build-time-config';
import { EFilterType } from 'state/actions/userSettings/RecordSet';

const defaultRecordSets: Record<PropertyKey, Partial<UserRecordSet>> = {
  [RecordSetId.Drafts]: {
    id: RecordSetId.Drafts,
    idList: [],
    recordSetType: RecordSetType.Activity,
    recordSetName: 'My Drafts',
    // add draft key
    tableFilters: [
      {
        id: RecordSetId.Drafts,
        field: 'form_status',
        filterType: 'tableFilter' as EFilterType, // For some reason using this directly loads in as undefined, so casting instead.
        filter: ActivityStatus.DRAFT,
        operator: 'CONTAINS',
        operator2: 'AND'
      }
    ],
    colorScheme: recordsetColourScheme,
    cacheMetadataStatus: UserRecordCacheStatus.NOT_ELIGIBLE,
    drawOrder: 1
  },
  [RecordSetId.Activity]: {
    id: RecordSetId.Activity,
    idList: [],
    recordSetType: RecordSetType.Activity,
    recordSetName: 'All InvasivesBC Activities',
    colorScheme: recordsetColourScheme,
    cacheMetadataStatus: UserRecordCacheStatus.NOT_ELIGIBLE,
    drawOrder: 2
  },
  [RecordSetId.IAPP]: {
    recordSetType: RecordSetType.IAPP,
    id: RecordSetId.IAPP,
    idList: [],
    recordSetName: 'All IAPP Records',
    color: '#21f34f',
    drawOrder: 3,
    cacheMetadataStatus: UserRecordCacheStatus.NOT_ELIGIBLE
  }
};

if (buildTimeConfig.MOBILE) {
  defaultRecordSets[RecordSetId.OfflineActivities] = {
    recordSetType: RecordSetType.Activity,
    id: RecordSetId.OfflineActivities,
    idList: [],
    recordSetName: 'All Unsynced Offline Activities',
    cacheMetadataStatus: UserRecordCacheStatus.NOT_ELIGIBLE,
    drawOrder: 4,
    mapToggle: true // by default
  };
}

export default defaultRecordSets;
