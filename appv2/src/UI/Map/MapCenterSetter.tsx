import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { useSelector } from 'react-redux';
import { selectMap } from 'state/reducers/map';

export const MapCenterSetter = (props) => {
  const map = useMap();

  const mapState = useSelector(selectMap);

  useEffect(() => {
    map.flyTo(mapState.map_center, mapState.map_zoom, { animate: true, duration: 2 });
  }, [JSON.stringify(mapState.map_center), JSON.stringify(mapState.map_zoom)]);

  return null;
};
