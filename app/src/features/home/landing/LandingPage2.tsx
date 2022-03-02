import { Button } from '@mui/material';
import React, { useEffect, useMemo, useRef, useState } from 'react';

const LayerPicker = (props: any) => {
  const [layers, setLayers] = useState([]);
  const [layerProps, setLayerProps] = useState([]);
  //  const [layerComponents, setLayerComponents] = useState({});

  //component start up:
  useEffect(() => {
    setLayers(props.layers);
    setLayerProps(props.layerProps);
    console.log('conmponent start up');
    console.dir(props.layers);
    console.dir(props.layerProps);
  }, []);

  const Layer = (props: any) => {
    const renderCounter = useRef(0);
    renderCounter.current = renderCounter.current + 1;
    return useMemo(() => {
      return (
        <div>
          {'layerName: ' +
            props.layerName +
            ' layerProp: ' +
            props.layerProp +
            ' render count: ' +
            renderCounter.current}
        </div>
      );
    }, [JSON.stringify(props.layerProps)]);
  };

  return useMemo(() => {
    if (layers) {
      return (
        <>
          {layers.map((l) => {
            console.log('layers');
            console.log(l);
            return <Layer key={l} layerName={l} layerProps={layerProps[l]} />;
          })}
        </>
      );
    }
  }, [props.layers, props.layerProps]);
};

export const LandingPage2 = (props) => {
  const [layerProps, setLayerProps] = useState<any>();
  const [layers, setLayers] = useState<any>();

  useEffect(() => {
    setLayerProps({ test1: 'stuff', test2: 'stuff2' });
    setLayers(['test1', 'test2']);
  });

  const modifyLayer2 = () => {
    setLayerProps({ ...layerProps, test2: JSON.stringify(Math.random()) });
  };

  const addLayer = () => {
    setLayers([...layers, 'test' + layers.length]);
    const layername = 'test' + JSON.stringify(layers.length);
    let newProps = { ...layerProps };
    newProps[layername] = 'another';
    setLayerProps(newProps);
  };

  return (
    <>
      <Button onClick={modifyLayer2}>modify layer2 </Button>
      <Button onClick={addLayer}>add layer</Button>
      <div> start stuff </div>
      <LayerPicker layers={layers} layerProps={layerProps} />
      <div> end stuff </div>
    </>
  );
};

export default LandingPage2;
