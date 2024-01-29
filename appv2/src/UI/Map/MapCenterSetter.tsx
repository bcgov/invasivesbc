import { useEffect, useLayoutEffect } from 'react';
import { useMap } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { MAP_TOGGLE_PANNED } from 'state/actions';

export const MapCenterSetter = (props) => {
  const map = useMap();
  const dispatch = useDispatch();

  const { map_center, map_zoom, panned, positionTracking, userCoords } = useSelector((state: any) => state.Map);

  useLayoutEffect(() => {
    if (!panned) {
      if(positionTracking && userCoords) {
        //map.flyTo([userCoords.lat, userCoords.long], map.getZoom(), { animate: true, duration: 10, easeLinearity: .1 });
        map.setView([userCoords.lat, userCoords.long], map.getZoom(), { animate: true, duration: 1, easeLinearity: .1 });
      }
      else {
        //map.flyTo(map_center, map_zoom, { animate: true, duration: 10, easeLinearity: .1 });
        map.setView(map_center, 22, { animate: true, duration: 1, easeLinearity: .1 });
      }
      dispatch({ type: MAP_TOGGLE_PANNED });
    }
  }, [JSON.stringify(map_center), JSON.stringify(map_zoom), JSON.stringify(panned)]);

  return null;
};
