import { GeoJSON, useMap } from 'react-leaflet';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import center from '@turf/center';
import { set } from 'lodash';

export const OnHoverActivity = (props: any) => {
  const id = useSelector((state: any) => state.Map?.userRecordOnHoverRecordID);
  const row = useSelector((state: any) => state.Map?.userRecordOnHoverRecordRow);
  const geometresForActivity = useSelector((state: any) => state.Map?.userRecordOnHoverRecordRow?.geometry);
  const [centerPointGeometry, setCenterPointGeometry] = useState(null);
  const popupRef = React.useRef(null);
  const map = useMap();

  useEffect(() => {
    try {
      const newGeo = center(geometresForActivity[0] || geometresForActivity);
      if (newGeo) {
        setCenterPointGeometry(newGeo);
      } else {
        setCenterPointGeometry(null);
      }
    } catch (e) {
      console.log('no valid geo to get centerpoint');
      return;
    }

    return () => {
      setCenterPointGeometry(null);
    };
  }, [geometresForActivity]);

  useEffect(() => {
    if (!centerPointGeometry) {
      popupRef?.current?.togglePopup();
      popupRef?.current?.unbindPopup();
      popupRef?.current?.remove();
      return;
    } else {
      if (row.short_id && centerPointGeometry !== null) {
        popupRef.current?.bindPopup(row?.short_id);
      } else {
        popupRef.current?.bindPopup(row?.id || 'IAPP SITE:' + JSON.stringify(row?.site_id));
      }
      popupRef.current?.openPopup();
    }
  }, [centerPointGeometry]);


  map.on('popupopen', function(e) {
    var px = map.project(e.target._popup._latlng); // find the pixel location on the map where the popup anchor is
    px.y += (e.target._popup._container.clientHeight * 6  )
    map.panTo(map.unproject(px),{animate: true}); // pan to new center
});

  return centerPointGeometry !== null ? <GeoJSON ref={popupRef} key={Math.random()} data={centerPointGeometry} /> : null;
};
