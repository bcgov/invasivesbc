import { Tooltip } from '@mui/material';
import {
  IappRecordsetIcon,
  InvasivesRecordsetIcon,
  OfflineMapIcon,
  WellIcon
} from 'UI/Features/ManageTripsPage/iconography';
import { IPlanMyTripCacheStatus, IPlanMyTripCacheStatuses } from 'utils/plan-my-trip-cache';

type PropTypes = {
  statuses: IPlanMyTripCacheStatuses;
};
/**
 * @desc Displays Cache statuses through Iconography / Colour.
 */
const MyTripAtAGlance = ({ statuses }: PropTypes) => {
  const getColor = (status: IPlanMyTripCacheStatus) => {
    switch (status) {
      case IPlanMyTripCacheStatus.CACHED:
        return 'primary';
      case IPlanMyTripCacheStatus.IN_PROGRESS:
      case IPlanMyTripCacheStatus.DELETING:
        return 'secondary';
      case IPlanMyTripCacheStatus.FAILED:
        return 'error';
      case IPlanMyTripCacheStatus.UNAVAILABLE:
      case IPlanMyTripCacheStatus.NOT_CACHED:
      case IPlanMyTripCacheStatus.NO_DATA:
        return 'disabled';
    }
  };
  const { activityRecordset, iappRecordset, mapTiles, wellData } = statuses;
  return (
    <>
      <Tooltip classes={{ tooltip: 'toolTip' }} title={`InvasivesBC Recordest: ${activityRecordset}`}>
        <InvasivesRecordsetIcon color={getColor(activityRecordset)} />
      </Tooltip>
      <Tooltip classes={{ tooltip: 'toolTip' }} title={`IAPP Recordset: ${iappRecordset}`}>
        <IappRecordsetIcon color={getColor(iappRecordset)} />
      </Tooltip>
      <Tooltip classes={{ tooltip: 'toolTip' }} title={`Offline Map: ${mapTiles}`}>
        <OfflineMapIcon color={getColor(mapTiles)} />
      </Tooltip>
      <Tooltip classes={{ tooltip: 'toolTip' }} title={`Well Data: ${wellData}`}>
        <WellIcon color={getColor(wellData)} />
      </Tooltip>
    </>
  );
};

export default MyTripAtAGlance;
