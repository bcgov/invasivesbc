import Accordion from 'UI/Reusable/Accordion/Accordion';
import {
  IPlanMyTripCacheStatus,
  IPlanMyTripCacheStatuses,
  IPlanMyTripRepositoryMetadata
} from 'utils/plan-my-trip-cache';
import { RecordSetType, UserRecordCacheStatus } from 'interfaces/UserRecordSet';
import { Button } from '@mui/material';
import { Delete } from '@mui/icons-material';
import PlanMyTrip from 'state/actions/planMyTrip/PlanMyTrip';
import { RepositoryBoundingBoxSpec } from 'utils/tile-cache';
import MapSlider from 'UI/Features/TileCache/MapSlider';
import { useDispatch, useSelector } from 'utils/use_selector';
import bbox from '@turf/bbox';
import { useEffect, useState } from 'react';
import WellCache from 'state/actions/cache/WellCache';
import TileCache from 'state/actions/cache/TileCache';

type MapPropTypes = {
  trip: IPlanMyTripRepositoryMetadata;
};

type RecordPropTypes = {
  trip: IPlanMyTripRepositoryMetadata;
  recordSetType: RecordSetType;
};
const PmtDownloadRecordset = ({ trip, recordSetType }: RecordPropTypes) => {
  enum Mode {
    CACHED,
    NOT_CACHED,
    NON_EXISTENT
  }
  const dispatch = useDispatch();
  const PREFIX =
    recordSetType === RecordSetType.Activity ? PlanMyTrip.Recordset.ACTIVITY_PRE : PlanMyTrip.Recordset.IAPP_PRE;

  const handleDownload = () => {
    dispatch(PlanMyTrip.Recordset.download(PREFIX + trip.id));
  };

  const handleDelete = () => {
    const cacheKey: keyof IPlanMyTripCacheStatuses =
      recordSetType === RecordSetType.Activity ? 'activityRecordset' : 'iappRecordset';
    dispatch(PlanMyTrip.removeSubCache({ id: trip.id, cache: cacheKey }));
  };

  const handleCreate = () => {
    dispatch(
      PlanMyTrip.Recordset.create({
        tripId: trip.id,
        recordSetType,
        recordName: `${trip.name}`,
        geojson: trip.geojson
      })
    );
  };

  const recordSets = useSelector((state) => state.UserSettings.recordSets ?? {});
  const [mode, setMode] = useState<Mode>(Mode.NOT_CACHED);

  useEffect(() => {
    const id = PREFIX + trip.id;
    if (recordSets?.[id]?.cacheMetadataStatus === UserRecordCacheStatus.CACHED) {
      setMode(Mode.CACHED);
    } else if (recordSets?.[id]) {
      setMode(Mode.NOT_CACHED);
    } else {
      setMode(Mode.NON_EXISTENT);
    }
  }, [recordSets]);

  return (
    <form>
      {
        {
          [Mode.CACHED]: (
            <Button color="error" variant="contained" onClick={handleDelete}>
              Delete Saved Records
            </Button>
          ),
          [Mode.NON_EXISTENT]: (
            <div>
              <p>You do not have an {recordSetType} recordset created for this Trip. Do you want to make one?</p>
              <Button color="primary" variant="contained" onClick={handleCreate}>
                Create {recordSetType} Recordset
              </Button>
            </div>
          ),
          [Mode.NOT_CACHED]: (
            <Button variant="contained" color="primary" onClick={handleDownload}>
              Download Records
            </Button>
          )
        }[mode]
      }
    </form>
  );
};

const PmtDownloadMaps = ({ trip }: MapPropTypes) => {
  const handleDownload = (zoom: number, shape: RepositoryBoundingBoxSpec) => {
    dispatch(
      TileCache.requestCaching({
        description: trip.name,
        id: trip.id,
        bounds: shape,
        maxZoom: zoom
      })
    );
  };
  const dispatch = useDispatch();
  return <MapSlider drawnShape={trip.geojson} handleDownload={handleDownload} />;
};
type WellPropTypes = {
  trip: IPlanMyTripRepositoryMetadata;
};
const PmtWellData = ({ trip }: WellPropTypes) => {
  const dispatch = useDispatch();

  const handleDownload = () => {
    const [minX, minY, maxX, maxY] = bbox(trip.geojson);
    const bounds = {
      minLatitude: minY,
      maxLatitude: maxY,
      minLongitude: minX,
      maxLongitude: maxX
    };
    dispatch(WellCache.requestCaching({ id: trip.id, bounds: bounds }));
  };

  return (
    <Button variant="contained" color="primary" onClick={handleDownload}>
      Download Well Data
    </Button>
  );
};

type WmsPropTypes = {
  trip: IPlanMyTripRepositoryMetadata;
};
const PmtWmsLayers = ({ trip }: WmsPropTypes) => {
  return <div>Data BC Layers</div>;
};

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
              <Button variant="contained" color="error" onClick={onRemove.bind(this, trip.id, cacheKey)}>
                <Delete />
                Delete {TITLE} Cache
              </Button>
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
