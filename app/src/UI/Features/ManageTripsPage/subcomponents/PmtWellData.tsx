import { IPlanMyTripCacheStatuses, IPlanMyTripRepositoryMetadata } from 'utils/plan-my-trip-cache';

type PropTypes = {
  trip: IPlanMyTripRepositoryMetadata;
};
const PmtWellData = ({ trip }: PropTypes) => {
  return <div>Well Data</div>;
};
export default PmtWellData;
