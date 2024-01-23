import center from '@turf/center';
import React, { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import { useSelector } from 'react-redux';

export const OnHoverActivity = (props: any) => {
  const quickPanToRecord = useSelector((state: any) => state.Map?.quickPanToRecord);

  const row = useSelector((state: any) => state.Map?.userRecordOnHoverRecordRow);
  const geometresForActivity = useSelector((state: any) => state.Map?.userRecordOnHoverRecordRow?.geometry);
  const [centerPointGeometry, setCenterPointGeometry] = useState(null);
  const popupRef = React.useRef(null);

  useEffect(() => {
    try {
      const newGeo = center(geometresForActivity[0] || geometresForActivity);
      if (newGeo && quickPanToRecord) {
        setCenterPointGeometry(newGeo);
      } else {
        setCenterPointGeometry(null);
      }
    } catch (e) {
      //console.log('no valid geo to get centerpoint');
      return;
    }

    return () => {
      setCenterPointGeometry(null);
    };
  }, [JSON.stringify(geometresForActivity), JSON.stringify(quickPanToRecord)]);

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



  return centerPointGeometry !== null ? <GeoJSON ref={popupRef} key={Math.random()} data={centerPointGeometry} /> : null;
};
