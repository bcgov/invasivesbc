import React, { useContext } from 'react';
import { IParentLayer, MapRequestContext } from 'contexts/MapRequestsContext';
import { IndependentLayer } from '../LayerLoaderHelpers/IndependentRenderLayers';

const UserUploadedLayers = (props) => {
  const { layers } = useContext(MapRequestContext);
  //--------------- parent layer ---------------
  const userUploadedLayers: IParentLayer = layers[5];
  return (
    <>
      {userUploadedLayers.children.map((layer, index) => (
        <IndependentLayer
          key={index}
          enabled={layer.enabled}
          opacity={layer.opacity}
          geoJSON={layer.geoJSON}
          layer_code={layer.layer_code}
          bcgw_code={layer.bcgw_code}
          layer_mode={layer.layer_mode}
          inputGeo={props.inputGeo}
          color_code={layer.color_code}
          zIndex={userUploadedLayers.zIndex + layer.zIndex}
        />
      ))}
    </>
  );
};

export default UserUploadedLayers;
