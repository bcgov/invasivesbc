// Component to display the boundary for a given RecordSet's boundary filter
// Boundaries come from localstorage / userSettings state

import { FeatureCollection } from '@turf/helpers';
import React, { useCallback, useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import { useSelector } from 'react-redux';
import { selectUserSettings } from 'state/reducers/userSettings';

export const BoundaryLayerDisplayForRecordSetToggle: React.FC<any> = (props) => {
  const [displayGeoJSONArray, setDisplayGeoJSONArray] = useState([]);
  const userSettingsState = useSelector(selectUserSettings);

  useEffect(() => {
    if(!userSettingsState?.recordSets || !userSettingsState?.boundaries)
    {
      return;
    }
    const recordSetsAsArray = Object.keys(userSettingsState?.recordSets).map((key) => {
      return userSettingsState.recordSets[key];
    });
    if (!Array.isArray(recordSetsAsArray)) {
      console.log('im out');
      return null;
    }

    const recordSetsWithBoundaries = recordSetsAsArray?.filter((recordSet) => {
      return recordSet?.searchBoundary;
    });
    const geoJSONArray = recordSetsWithBoundaries?.map((recordSet) => {
      const metaDataToDisplay = recordSet.recordSetName;
      const geosInRecordset = recordSet.searchBoundary.geos || [];
      const geosInBoundaries =
        userSettingsState?.boundaries?.filter((boundary) => {
          return boundary.server_id === recordSet.searchBoundary.server_id;
        })[0]?.geos || [];
      let geometries = [];
      geometries.push(...geosInRecordset);
      geometries.push(...geosInBoundaries);

      const featureCollection = {
        type: 'FeatureCollection',
        features: geometries.map((geometry) => {
          return {
            ...geometry,
            properties: {
              name: metaDataToDisplay
            }
          };
        })
      };
      if (geometries.length > 0 && recordSet?.mapToggle) {
        return featureCollection as FeatureCollection;
      }
    });

    let newState = geoJSONArray.filter((geoJSON) => {
      return geoJSON !== undefined;

    });

    setDisplayGeoJSONArray(newState);
  }, [userSettingsState.recordSets, userSettingsState.boundaries]);

  return (
    <>
      {displayGeoJSONArray.map((geoJSON) => {
        return (
          <GeoJSON
            style={{
              stroke: true,
              color: 'yellow',
              weight: 1,
              opacity: 0.5,
              fill: true,
              fillColor: 'yellow',
              fillOpacity: 0.1
            }}
            key={geoJSON.features[0].properties.name}
            data={geoJSON.features}
          />
        );
      })}
    </>
  );
};
