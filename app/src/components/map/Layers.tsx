import { MapRequestContext } from 'contexts/MapRequestsContext';
import React, { useContext } from 'react';
import { DataBCLayer } from './LayerLoaderHelpers/DataBCRenderLayer';
import { IndependentLayer } from './LayerLoaderHelpers/IndependentRenderLayers';

const Layers = (props: any) => {
  const { layers } = useContext(MapRequestContext);

  return (
    <>
      {layers.map((parent) => (
        <div key={Math.random()}>
          {parent.children.map(
            (child) =>
              child.enabled &&
              (child.bcgw_code ? (
                <div key={Math.random()}>
                  <DataBCLayer
                    opacity={child.opacity}
                    bcgw_code={child.bcgw_code}
                    layer_mode={child.layer_mode}
                    dataBCAcceptsGeometry={child.dataBCAcceptsGeometry}
                    simplifyPercentage={child.simplifyPercentage}
                    inputGeo={props.inputGeo}
                    color_code={child.color_code}
                    zIndex={parent.zIndex + child.zIndex}
                  />
                </div>
              ) : (
                <div key={Math.random()}>
                  <IndependentLayer
                    opacity={child.opacity}
                    layer_code={child.layer_code}
                    bcgw_code={child.bcgw_code}
                    activity_subtype={child.activity_subtype}
                    poi_type={child.poi_type}
                    layer_mode={child.layer_mode}
                    inputGeo={props.inputGeo}
                    color_code={child.color_code}
                    zIndex={parent.zIndex + child.zIndex}
                  />
                </div>
              ))
          )}
        </div>
      ))}
    </>
  );
};

export default Layers;
