import { MapRequestContext } from 'contexts/MapRequestsContext';
import React, { useContext } from 'react';
import { DataBCLayer } from './LayerLoaderHelpers/DataBCRenderLayer';
import { IndependentLayer } from './LayerLoaderHelpers/IndependentRenderLayers';

export const RenderLayers = (props) => {
  const mapLayersContext = useContext(MapRequestContext);
  const { layersSelected } = mapLayersContext;

  return (
    <>
      {layersSelected.map((parent) => (
        <>
          {parent.children.map(
            (child) =>
              child.enabled && (
                <>
                  {child.source === 'databc' ? (
                    <DataBCLayer
                      opacity={child.opacity}
                      bcgw_code={child.bcgw_code}
                      layer_mode={child.layer_mode}
                      inputGeo={props.inputGeo}
                      setWellIdandProximity={props.setWellIdandProximity}
                      color_code={child.color_code}
                      zIndex={parent.zIndex + child.zIndex}
                    />
                  ) : (
                    <IndependentLayer
                      layer_id={child.id}
                      search_feature={child.source}
                      opacity={child.opacity}
                      layer_code={child.layer_code}
                      color_code={child.color_code}
                      zIndex={child.zIndex}
                    />
                  )}
                </>
              )
          )}
        </>
      ))}
    </>
  );
};
