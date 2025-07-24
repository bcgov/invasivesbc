import { Button } from '@mui/material';
import bbox from '@turf/bbox';
import PlanMyTrip from 'state/actions/planMyTrip/PlanMyTrip';
import { IPlanMyTripRepositoryMetadata } from 'utils/plan-my-trip-cache';
import { useDispatch } from 'utils/use_selector';

type PropTypes = {
  trip: IPlanMyTripRepositoryMetadata;
};
const PmtWellData = ({ trip }: PropTypes) => {
  const dispatch = useDispatch();

  const handleDownload = () => {
    const [minX, minY, maxX, maxY] = bbox(trip.geojson);
    const bounds = {
      minLatitude: minY,
      maxLatitude: maxY,
      minLongitude: minX,
      maxLongitude: maxX
    };
    dispatch(PlanMyTrip.Wells.download({ tripId: trip.id, bounds }));
  };

  return (
    <Button variant="contained" color="primary" onClick={handleDownload}>
      Download Well Data
    </Button>
  );
};
export default PmtWellData;
