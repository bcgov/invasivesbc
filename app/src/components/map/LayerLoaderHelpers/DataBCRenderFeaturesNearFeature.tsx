import buffer from '@turf/buffer';
import { getDataFromDataBC } from 'components/map/WFSConsumer';
import React, { useState, useEffect, useMemo } from 'react';
import { GeoJSON } from 'react-leaflet';
import { Feature, Geometry } from 'geojson';
import { Layer } from 'leaflet';

interface IRenderKeyFeaturesNearFeature {
  inputGeo: Feature;
  dataBCLayerName;
  proximityInMeters: number;
  featureType?: string;
  memoHash?: string;
  customOnEachFeature?: any;
}
export const RenderKeyFeaturesNearFeature = (props: IRenderKeyFeaturesNearFeature) => {
  const [geosToRender, setGeosToRender] = useState(null);
  const [keyval, setKeyval] = useState(0);

  const onEachFeature = props.customOnEachFeature
    ? props.customOnEachFeature
    : (feature: Feature<Geometry, any>, layer: Layer) => {
        const popupContent = `
    <div>
        <p>${feature.id}</p>                  
        <p>${JSON.stringify(feature)}</p>                  
    </div>
        `;
        layer.bindPopup(popupContent);
      };

  useEffect(() => {
    if (props.inputGeo && !geosToRender) {
      const bufferedGeo = buffer(props.inputGeo, props.proximityInMeters / 1000);
      getDataFromDataBC(props.dataBCLayerName, bufferedGeo).then((returnVal) => {
        console.log(JSON.stringify(returnVal));
        setGeosToRender(returnVal);
        setKeyval(Math.random()); //NOSONAR
      }, []);
    }
  });
  return (
    <>
      {geosToRender && keyval ? (
        <GeoJSON key={keyval} onEachFeature={onEachFeature} data={geosToRender}></GeoJSON>
      ) : (
        <></>
      )}
      )
    </>
  );
};
