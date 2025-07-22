import { IPlanMyTripRepositoryMetadata } from 'utils/plan-my-trip-cache';

type PropTypes = {
  trip: IPlanMyTripRepositoryMetadata;
};
const PmtIappRecord = ({ trip }: PropTypes) => {
  return <div>IAPP Record</div>;
};
export default PmtIappRecord;
