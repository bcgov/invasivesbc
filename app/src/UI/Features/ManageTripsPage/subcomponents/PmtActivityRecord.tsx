import { IPlanMyTripRepositoryMetadata } from 'utils/plan-my-trip-cache';

type PropTypes = {
  trip: IPlanMyTripRepositoryMetadata;
};
const PmtActivityRecord = ({ trip }: PropTypes) => {
  return <div>Activity Record</div>;
};
export default PmtActivityRecord;
