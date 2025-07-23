import Accordion from 'UI/Reusable/Accordion/Accordion';
import {
  IPlanMyTripCacheStatus,
  IPlanMyTripCacheStatuses,
  IPlanMyTripRepositoryMetadata
} from 'utils/plan-my-trip-cache';
import PmtDownloadMaps from './PmtDownloadMaps';
import PmtWmsLayers from './PmtWmsLayers';
import PmtWellData from './PmtWellData';
import PmtDownloadRecordset from './PmtDownloadRecordset';
import { RecordSetType } from 'interfaces/UserRecordSet';

type PropTypes = {
  trip: IPlanMyTripRepositoryMetadata;
  onRemove: (id: string, cache: keyof IPlanMyTripCacheStatuses) => void;
  cacheKey: keyof IPlanMyTripCacheStatuses;
};
const PmtCacheStatus = ({ trip, onRemove, cacheKey }: PropTypes) => {
  const TITLE = {
    mapTiles: 'Offline Maps',
    wmsLayer: 'DataBC Layers',
    wellData: 'Well Data',
    activityRecordset: 'Activity Records',
    iappRecordset: 'IAPP Record'
  }[cacheKey];

  return (
    <div>
      <Accordion title={`${TITLE}: ${trip.cacheStatuses[cacheKey]}`}>
        {
          {
            [IPlanMyTripCacheStatus.CACHED]: (
              <button onClick={onRemove.bind(this, trip.id, cacheKey)}>Delete {TITLE} Data</button>
            ),
            [IPlanMyTripCacheStatus.IN_PROGRESS]: <p>In Progress...</p>,
            [IPlanMyTripCacheStatus.UNAVAILABLE]: <p>Unavailable for offline storage</p>,
            [IPlanMyTripCacheStatus.NOT_CACHED]: {
              mapTiles: <PmtDownloadMaps trip={trip} />,
              wmsLayer: <PmtWmsLayers trip={trip} />,
              wellData: <PmtWellData trip={trip} />,
              activityRecordset: <PmtDownloadRecordset trip={trip} recordSetType={RecordSetType.Activity} />,
              iappRecordset: <PmtDownloadRecordset trip={trip} recordSetType={RecordSetType.IAPP} />
            }[cacheKey]
          }[trip.cacheStatuses[cacheKey]]
        }
      </Accordion>
    </div>
  );
};
export default PmtCacheStatus;
