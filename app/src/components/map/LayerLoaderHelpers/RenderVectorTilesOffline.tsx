import React, { useContext, useState } from 'react';
import { useMapEvent } from 'react-leaflet';
import { DatabaseContext2, query, QueryType } from '../../../contexts/DatabaseContext2';
import { GeoJSONVtLayer } from './GeoJsonVtLayer';

export const RenderVectorTilesOffline = (props) => {
  const databaseContext = useContext(DatabaseContext2);
  const [geosToRender, setGeosToRender] = useState(null);

  const options = {
    maxZoom: 24,
    tolerance: 3,
    debug: 0,
    style: {
      fillColor: '#1EB300',
      color: '#F2FF00',
      stroke: true,
      opacity: props.opacity,
      fillOpacity: props.opacity - 0.1,
      weight: 5
    }
  };

  const getVectorTiles = async () => {
    // first, selecting large grid items with well layer name
    const largeGridRes = await query(
      {
        type: QueryType.RAW_SQL,
        sql: `SELECT * FROM LARGE_GRID_LAYER_DATA;`
      },
      databaseContext
    );

    if (!largeGridRes) {
      return null;
    }

    //create a string containing all large grid item ids that we got
    let largeGridItemIdString = '(';
    let largeGridResIndex = 0;
    largeGridRes.forEach((gridItem) => {
      if (largeGridResIndex === largeGridRes.length - 1) {
        largeGridItemIdString += gridItem.id + ')';
      } else {
        largeGridItemIdString += gridItem.id + ',';
      }
      largeGridResIndex++;
    });

    //select small grid items with current layer name and large grid items id
    const smallGridRes = await query(
      {
        type: QueryType.RAW_SQL,
        sql: `SELECT * FROM SMALL_GRID_LAYER_DATA WHERE layerName IN ('${props.dataBCLayerName}') AND largeGridID IN ${largeGridItemIdString};`
      },
      databaseContext
    );

    //foreach small grid item that we got,
    //add features inside of the item to the array of features
    let allFeatures = [];
    smallGridRes.forEach((row) => {
      const featuresInArea = JSON.parse(row.featuresInArea);
      allFeatures = allFeatures.concat(featuresInArea);
    });

    setGeosToRender({
      type: 'FeatureCollection',
      features: allFeatures
    });
  };

  useMapEvent('moveend', () => {
    getVectorTiles();
  });

  return <>{geosToRender && <GeoJSONVtLayer geoJSON={geosToRender} options={options} />}</>;
};
