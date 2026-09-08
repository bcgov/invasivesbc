import {
  IappRecordsetIcon,
  InvasivesRecordsetIcon,
  OfflineMapIcon,
  WellIcon
} from 'UI/Features/ManageTripsPage/iconography';
import HoverTooltip from 'UI/Reusable/HoverTooltip/HoverTooltip';
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
      <HoverTooltip tooltipText={`InvasivesBC Recordest: ${activityRecordset}`}>
        <InvasivesRecordsetIcon color={getColor(activityRecordset)} />
      </HoverTooltip>
      <HoverTooltip tooltipText={`IAPP Recordset: ${iappRecordset}`}>
        <IappRecordsetIcon color={getColor(iappRecordset)} />
      </HoverTooltip>
      <HoverTooltip tooltipText={`Well Data: ${wellData}`}>
        <WellIcon color={getColor(wellData)} />
      </HoverTooltip>
      <HoverTooltip tooltipText={`Offline Map: ${mapTiles}`}>
        <OfflineMapIcon color={getColor(mapTiles)} />
      </HoverTooltip>
    </>
  );
};

export default MyTripAtAGlance;
