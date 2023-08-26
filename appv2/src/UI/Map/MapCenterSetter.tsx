import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { MAP_TOGGLE_PANNED } from 'state/actions';

export const MapCenterSetter = (props) => {
  const map = useMap();
  const dispatch = useDispatch();

  const { map_center, map_zoom, panned } = useSelector((state: any) => state.Map);

  useEffect(() => {
    if (!panned) {
      map.flyTo(map_center, map_zoom, { animate: true, duration: 7, easeLinearity: .1 });
      dispatch({ type: MAP_TOGGLE_PANNED });
    }
  }, [JSON.stringify(map_center), JSON.stringify(map_zoom), JSON.stringify(panned)]);

  return null;
};
