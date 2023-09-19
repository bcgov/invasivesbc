import { GeoJSON } from 'react-leaflet';
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

  useEffect(() => {
    try {
      const newGeo = center(geometresForActivity[0]);
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
      if (row.short_id) {
        popupRef.current?.bindPopup(row?.short_id);
      } else {
        popupRef.current?.bindPopup(row?.id);
      }
      popupRef.current?.openPopup();
    }
  }, [centerPointGeometry]);

  return centerPointGeometry !== null ? <GeoJSON ref={popupRef} key={'asdf'} data={centerPointGeometry} /> : null;
};
