import React from 'react';
import { useSelector } from 'react-redux';
import { GeoJSON } from 'react-leaflet';
import { selectActivity } from 'state/reducers/activity';

export const ActivityGeo = (props) => {
  const activityState = useSelector(selectActivity);

  let mode = 'READ';

  switch (mode) {
    case 'READ':
      return <>{activityState?.activity?.geometry ? <GeoJSON data={activityState?.activity?.geometry} /> : <></>}</>;
    default:
      return <></>;
  }
};
