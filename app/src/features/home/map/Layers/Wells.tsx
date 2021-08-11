import buffer from '@turf/buffer';
import { getDataFromDataBC } from 'components/map/WFSConsumer';
import React, { useState, useEffect, useMemo } from 'react';
import { GeoJSON } from 'react-leaflet';
import { Feature } from 'geojson';

export const getWellProximities = (inputGeo: Feature) => {
  let returnVal;

  return returnVal;
};

interface IRenderKeyFeaturesNearFeature {
  inputGeo: Feature;
  dataBCLayerName;
  proximityInMeters: number;
  featureType?: string;
  memoHash?: string;
}
export const RenderKeyFeaturesNearFeature = (props: IRenderKeyFeaturesNearFeature) => {
  const [geosToRender, setGeosToRender] = useState(null);
  const [keyval, setKeyval] = useState(0);

  useEffect(() => {
    console.log('input geo hook');
    console.dir(props.inputGeo);
    if (props.inputGeo) {
      console.log('input geo');
      console.dir(props.inputGeo);
      const bufferedGeo = buffer(props.inputGeo, props.proximityInMeters);
      getDataFromDataBC(props.dataBCLayerName, bufferedGeo).then((returnVal) => {
        console.log('returnval from databc');
        console.dir(returnVal);
        setGeosToRender(returnVal);
        //setKeyval(Math.random()); //NOSONAR
      }, []);
    }
  });
  return <>{geosToRender ? <GeoJSON key={keyval} data={geosToRender}></GeoJSON> : <></>})</>;
};
