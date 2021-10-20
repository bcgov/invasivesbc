import { Accordion, AccordionSummary, Checkbox, FormControlLabel, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { updateChild } from './LayerPicker';
import { getChild } from './SortLayerOrder';

const getChildLayerModes = (geoData: Object[], parentID: string, childID: string) => {
  const server = getChild(geoData, parentID, childID).layers?.server;
  const local = getChild(geoData, parentID, childID).layers?.local;
  var tempArr = [];

  if (server && local) {
    Object.entries(server).forEach(([key, value]) => {
      if (key !== 'expanded' && value === true) tempArr.push({ layer_type: key });
    });
    Object.entries(local).forEach(([key, value]) => {
      if (key !== 'expanded' && value === true) tempArr.push({ layer_type: key });
    });
  }

  return tempArr;
};

export const getAllEnabledLayerModes = (geoData: any[]) => {
  var tempArr = [];
  geoData.forEach((parent: any) => {
    var layerObj = [];
    parent.children.map((child: any) => {
      var layers = getChildLayerModes(geoData, parent.id, child.id);
      if (layers.length > 0) {
        layerObj.push({
          bcgw_code: child.bcgw_code,
          enabled: child.enabled,
          layers: layers,
          opacity: child.opacity
        });
      } else {
        layerObj.push({
          bcgw_code: child.bcgw_code,
          enabled: child.enabled,
          opacity: child.opacity,
          color: child.color_code ? child.color_code : null
        });
      }
    });
    if (layerObj.length > 0)
      tempArr.push({
        id: parent.id,
        children: layerObj
      });
  });
  return tempArr;
};

export const sanitizedLayers = (geoData: any[]) => {
  var layerModes = getAllEnabledLayerModes(geoData);
  var tempArr = [];

  layerModes.forEach((parent) => {
    parent.children.map((child) => {
      if (child.layers?.length > 0) {
        child.layers.map((layer) => {
          tempArr.push({
            name: child.bcgw_code,
            enabled: child.enabled,
            type: layer.layer_type,
            opacity: child.opacity
          });
        });
      }

      if (child.bcgw_code === 'LEAN_ACTIVITIES' || child.bcgw_code === 'LEAN_POI') {
        tempArr.push({
          name: child.bcgw_code,
          enabled: child.enabled,
          opacity: child.opacity,
          color: child.color
        });
      }
    });
  });

  return tempArr;
};

export const OnlineLayersSelector = ({ parent, child, objectState, setObjectState }) => {
  const [server, setServer] = useState(getChild(objectState, parent.id, child.id).layers.server);

  useEffect(() => {
    setServer(getChild(objectState, parent.id, child.id).layers.server);
  }, [child]);

  const onServerAccordionChange = (event: any, expanded: any) => {
    updateChild(
      parent.id,
      child.id,
      {
        layers: {
          ...getChild(objectState, parent.id, child.id).layers,
          server: {
            expanded: expanded,
            wms_online: getChild(objectState, parent.id, child.id).layers.server.wms_online,
            wfs_online: getChild(objectState, parent.id, child.id).layers.server.wfs_online,
            vector_tiles_online: getChild(objectState, parent.id, child.id).layers.server.vector_tiles_online
          }
        }
      },
      { objectState, setObjectState }
    );
  };

  return (
    <>
      {/* Vector Tiles */}
      <Accordion expanded={server.expanded} onChange={onServerAccordionChange}>
        <AccordionSummary>
          <Typography>Server</Typography>
        </AccordionSummary>
        <FormControlLabel
          label="WMS"
          control={
            <Checkbox
              checked={server.wms_online}
              onChange={() => {
                updateChild(
                  parent.id,
                  child.id,
                  {
                    layers: {
                      ...getChild(objectState, parent.id, child.id).layers,
                      server: {
                        expanded: getChild(objectState, parent.id, child.id).layers.server.expanded,
                        wms_online: !getChild(objectState, parent.id, child.id).layers.server.wms_online,
                        wfs_online: getChild(objectState, parent.id, child.id).layers.server.wfs_online,
                        vector_tiles_online: getChild(objectState, parent.id, child.id).layers.server
                          .vector_tiles_online
                      }
                    }
                  },
                  { objectState, setObjectState }
                );
              }}
            />
          }
        />
        <FormControlLabel
          label="Vector Tile"
          control={
            <Checkbox
              checked={server.vector_tiles_online}
              onChange={() => {
                updateChild(
                  parent.id,
                  child.id,
                  {
                    layers: {
                      ...getChild(objectState, parent.id, child.id).layers,
                      server: {
                        expanded: getChild(objectState, parent.id, child.id).layers.server.expanded,
                        wms_online: getChild(objectState, parent.id, child.id).layers.server.wms_online,
                        wfs_online: getChild(objectState, parent.id, child.id).layers.server.wfs_online,
                        vector_tiles_online: !getChild(objectState, parent.id, child.id).layers.server
                          .vector_tiles_online
                      }
                    }
                  },
                  { objectState, setObjectState }
                );
              }}
            />
          }
        />
        <FormControlLabel
          label="WFS"
          control={
            <Checkbox
              checked={server.wfs_online}
              onChange={() => {
                updateChild(
                  parent.id,
                  child.id,
                  {
                    layers: {
                      ...getChild(objectState, parent.id, child.id).layers,
                      server: {
                        expanded: getChild(objectState, parent.id, child.id).layers.server.expanded,
                        wms_online: getChild(objectState, parent.id, child.id).layers.server.wms_online,
                        wfs_online: !getChild(objectState, parent.id, child.id).layers.server.wfs_online,
                        vector_tiles_online: getChild(objectState, parent.id, child.id).layers.server
                          .vector_tiles_online
                      }
                    }
                  },
                  { objectState, setObjectState }
                );
              }}
            />
          }
        />
      </Accordion>
    </>
  );
};

export const OfflineLayersSelector = ({ parent, child, objectState, setObjectState }) => {
  const [local, setLocal] = useState(child.layers.local);

  useEffect(() => {
    setLocal(child.layers.local);
  }, [child]);

  const onLocalAccordionChange = (event: any, expanded: any) => {
    updateChild(
      parent.id,
      child.id,
      {
        layers: {
          ...getChild(objectState, parent.id, child.id).layers,
          local: {
            expanded: expanded,
            wfs_offline: getChild(objectState, parent.id, child.id).layers.local.wfs_offline,
            vector_tiles_offline: getChild(objectState, parent.id, child.id).layers.local.vector_tiles_offline
          }
        }
      },
      { objectState, setObjectState }
    );
  };

  return (
    <>
      {/* Vector Tiles */}
      <Accordion expanded={local.expanded} onChange={onLocalAccordionChange}>
        <AccordionSummary>
          <Typography>Local</Typography>
        </AccordionSummary>
        <FormControlLabel
          label="vector_tile"
          control={
            <Checkbox
              checked={local.vector_tiles_offline}
              onChange={() =>
                updateChild(
                  parent.id,
                  child.id,
                  {
                    layers: {
                      ...getChild(objectState, parent.id, child.id).layers,
                      local: {
                        expanded: getChild(objectState, parent.id, child.id).layers.local.expanded,
                        wfs_offline: getChild(objectState, parent.id, child.id).layers.local.wfs_offline,
                        vector_tiles_offline: !getChild(objectState, parent.id, child.id).layers.local
                          .vector_tiles_offline
                      }
                    }
                  },
                  { objectState, setObjectState }
                )
              }
            />
          }
        />
        <FormControlLabel
          label="WFS"
          control={
            <Checkbox
              checked={local.wfs_offline}
              onChange={() =>
                updateChild(
                  parent.id,
                  child.id,
                  {
                    layers: {
                      ...getChild(objectState, parent.id, child.id).layers,
                      local: {
                        expanded: getChild(objectState, parent.id, child.id).layers.local.expanded,
                        wfs_offline: !getChild(objectState, parent.id, child.id).layers.local.wfs_offline,
                        vector_tiles_offline: getChild(objectState, parent.id, child.id).layers.local
                          .vector_tiles_offline
                      }
                    }
                  },
                  { objectState, setObjectState }
                )
              }
            />
          }
        />
      </Accordion>
    </>
  );
};
