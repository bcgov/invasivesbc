import { Button } from '@mui/material';
import { RecordSetType, UserRecordCacheStatus } from 'interfaces/UserRecordSet';
import { useEffect, useState } from 'react';
import PlanMyTrip from 'state/actions/planMyTrip/PlanMyTrip';
import { IPlanMyTripCacheStatuses, IPlanMyTripRepositoryMetadata } from 'utils/plan-my-trip-cache';
import { useDispatch, useSelector } from 'utils/use_selector';

type PropTypes = {
  trip: IPlanMyTripRepositoryMetadata;
  recordSetType: RecordSetType;
};
const PmtDownloadRecordset = ({ trip, recordSetType }: PropTypes) => {
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
export default PmtDownloadRecordset;
