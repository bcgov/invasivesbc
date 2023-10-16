import centroid from '@turf/centroid';
import L from 'leaflet';
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { useSelector } from 'react-redux';
import ActivityIconUrl from 'UI/Icons/activity-icon.png';
import IappIconUrl from 'UI/Icons/iapp-icon.png';


const IappIcon = L.icon({
  iconUrl: IappIconUrl,
  iconSize: [20, 30],
  iconAnchor: [10, 30]
});

const ActivityIcon = L.icon({
  iconUrl: ActivityIconUrl,
  iconSize: [20, 30],
  iconAnchor: [10, 30]
});




export const SelectedRecordIndicator = (props) => {
  const activityGeometry = useSelector((state: any) => state.ActivityPage?.activity?.geometry);
  const activityShortID = useSelector((state: any) => state.ActivityPage?.activity?.short_id);

  const IAPPgeometry = useSelector((state: any) => state.IAPPSitePage?.site?.geom);
  const IAPPSiteID = useSelector((state: any) => state.IAPPSitePage?.site?.site_id)

  return (
    <>
      {activityGeometry && activityGeometry[0] ? (
        <Marker
          key={Math.random()}
          icon={ActivityIcon}
          position={[
            centroid(activityGeometry[0]).geometry.coordinates[1],
            centroid(activityGeometry[0]).geometry.coordinates[0]
          ]}>
          <Popup closeButton={false}>{activityShortID}</Popup>
        </Marker>
      ) : (
        <></>
      )}

      {IAPPgeometry ? (
        <Marker
          key={'iappselectmarker'}
          icon={IappIcon}
          position={[
            centroid(IAPPgeometry).geometry.coordinates[1],
            centroid(IAPPgeometry).geometry.coordinates[0]
          ]}>
          <Popup closeButton={false}>{IAPPSiteID}</Popup>
        </Marker>
      ) : (
        <></>
      )}
    </>
  );
};
