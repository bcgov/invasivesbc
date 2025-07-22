import PlanMyTrip from 'state/actions/planMyTrip/PlanMyTrip';
import MapSlider from 'UI/Features/TileCache/MapSlider';
import { IPlanMyTripRepositoryMetadata } from 'utils/plan-my-trip-cache';
import { RepositoryBoundingBoxSpec } from 'utils/tile-cache';
import { useDispatch } from 'utils/use_selector';

type PropTypes = {
  trip: IPlanMyTripRepositoryMetadata;
};
const PmtDownloadMaps = ({ trip }: PropTypes) => {
  const handleDownload = (zoom: number, shape: RepositoryBoundingBoxSpec) => {
    dispatch(
      PlanMyTrip.downloadMapTiles({
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
export default PmtDownloadMaps;
