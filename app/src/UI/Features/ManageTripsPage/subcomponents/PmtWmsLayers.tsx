import { IPlanMyTripRepositoryMetadata } from 'utils/plan-my-trip-cache';

type PropTypes = {
  trip: IPlanMyTripRepositoryMetadata;
};
const PmtWmsLayers = ({ trip }: PropTypes) => {
  return <div>Data BC Layers</div>;
};
export default PmtWmsLayers;
