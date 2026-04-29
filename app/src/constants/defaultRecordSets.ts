import { ActivityStatus } from 'sharedAPI';
import { RECORD_COLOURS } from './colors';
import EFilterType from './EFilterType';
import { RecordSetId, RecordSetType, UserRecordCacheStatus, UserRecordSet } from 'interfaces/UserRecordSet';
import { buildTimeConfig } from 'state/configuration/build-time-config';

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
        operator2: 'AND',
        hidden: true
      }
    ],
    cacheMetadataStatus: UserRecordCacheStatus.NOT_ELIGIBLE,
    mapToggle: false,
    color: RECORD_COLOURS[0],
    labelToggle: false,
    drawOrder: 1
  },
  [RecordSetId.Activity]: {
    id: RecordSetId.Activity,
    idList: [],
    recordSetType: RecordSetType.Activity,
    recordSetName: 'All InvasivesBC Activities',
    cacheMetadataStatus: UserRecordCacheStatus.NOT_ELIGIBLE,
    mapToggle: false,
    labelToggle: false,
    color: RECORD_COLOURS[0],
    drawOrder: 2
  },
  [RecordSetId.IAPP]: {
    recordSetType: RecordSetType.IAPP,
    id: RecordSetId.IAPP,
    idList: [],
    recordSetName: 'All IAPP Records',
    color: '#21f34f',
    mapToggle: false,
    labelToggle: false,
    drawOrder: 3,
    cacheMetadataStatus: UserRecordCacheStatus.NOT_ELIGIBLE
  }
};

if (buildTimeConfig.MOBILE) {
  defaultRecordSets[RecordSetId.OfflineActivities] = {
    recordSetType: RecordSetType.Activity,
    id: RecordSetId.OfflineActivities,
    idList: [],
    recordSetName: 'All Offline Activities',
    cacheMetadataStatus: UserRecordCacheStatus.NOT_ELIGIBLE,
    drawOrder: 4,
    mapToggle: true, // by default
    color: RECORD_COLOURS[0],
    labelToggle: false
  };
}

export default defaultRecordSets;
