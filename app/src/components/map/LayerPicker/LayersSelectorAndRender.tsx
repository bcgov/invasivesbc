import { Accordion, AccordionSummary, Checkbox, FormControlLabel, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { updateChild } from './LayerPicker';
import { getChild } from './SortLayerOrder';

const getChildLayerModes = (geoData: Object[], parentID: string, childID: string) => {
  const server = getChild(geoData, parentID, childID).layers.server;
  const local = getChild(geoData, parentID, childID).layers.local;
  var tempArr = [];

  Object.entries(server).forEach(([key, value]) => {
    switch (key) {
      case 'expanded':
        break;
      default:
        if (value === true) tempArr.push({ layer_type: key });
        break;
    }
  });
  Object.entries(local).forEach(([key, value]) => {
    switch (key) {
      case 'expanded':
        break;
      default:
        if (value === true) tempArr.push({ layer_type: key });
        break;
    }
  });

  return tempArr;
};

export const getAllEnabledLayerModes = (geoData: Object[], parent: Object, child: Object) => {
  var tempArr = [];
  geoData.map((parent: any) => {
    var children = [];
    parent.children.map((child: any) => {
      var layers = getChildLayerModes(geoData, parent.id, child.id);
      if (layers.length > 0)
        children.push({
          id: child.id,
          layers: getChildLayerModes(geoData, parent.id, child.id)
        });
    });
    if (children.length > 0)
      tempArr.push({
        id: parent.id,
        children: children
      });
  });
  if (tempArr.length > 0) return tempArr;
  return null;
};

export const OnlineLayersSelector = ({ parent, child, objectState, setObjectState }) => {
  const [server, setServer] = useState(child.layers.server);

  useEffect(() => {
    setServer(child.layers.server);
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
            wms: getChild(objectState, parent.id, child.id).layers.server.wms,
            vector_tile: getChild(objectState, parent.id, child.id).layers.server.vector_tile,
            rendered_geojson: getChild(objectState, parent.id, child.id).layers.server.rendered_geojson,
            activities: getChild(objectState, parent.id, child.id).layers.server.activities,
            poi: getChild(objectState, parent.id, child.id).layers.server.poi
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
              checked={server.wms}
              onChange={() =>
                updateChild(
                  parent.id,
                  child.id,
                  {
                    layers: {
                      ...getChild(objectState, parent.id, child.id).layers,
                      server: {
                        expanded: getChild(objectState, parent.id, child.id).layers.server.expanded,
                        wms: !getChild(objectState, parent.id, child.id).layers.server.wms,
                        vector_tile: getChild(objectState, parent.id, child.id).layers.server.vector_tile,
                        rendered_geojson: getChild(objectState, parent.id, child.id).layers.server.rendered_geojson,
                        activities: getChild(objectState, parent.id, child.id).layers.server.activities,
                        poi: getChild(objectState, parent.id, child.id).layers.server.poi
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
          label="Vector Tile"
          control={
            <Checkbox
              checked={server.vector_tile}
              onChange={() =>
                updateChild(
                  parent.id,
                  child.id,
                  {
                    layers: {
                      ...getChild(objectState, parent.id, child.id).layers,
                      server: {
                        expanded: getChild(objectState, parent.id, child.id).layers.server.expanded,
                        wms: getChild(objectState, parent.id, child.id).layers.server.wms,
                        vector_tile: !getChild(objectState, parent.id, child.id).layers.server.vector_tile,
                        rendered_geojson: getChild(objectState, parent.id, child.id).layers.server.rendered_geojson,
                        activities: getChild(objectState, parent.id, child.id).layers.server.activities,
                        poi: getChild(objectState, parent.id, child.id).layers.server.poi
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
          label="Rendered GeoJSON"
          control={
            <Checkbox
              checked={server.rendered_geojson}
              onChange={() =>
                updateChild(
                  parent.id,
                  child.id,
                  {
                    layers: {
                      ...getChild(objectState, parent.id, child.id).layers,
                      server: {
                        expanded: getChild(objectState, parent.id, child.id).layers.server.expanded,
                        wms: getChild(objectState, parent.id, child.id).layers.server.wms,
                        vector_tile: getChild(objectState, parent.id, child.id).layers.server.vector_tile,
                        rendered_geojson: !getChild(objectState, parent.id, child.id).layers.server.rendered_geojson,
                        activities: getChild(objectState, parent.id, child.id).layers.server.activities,
                        poi: getChild(objectState, parent.id, child.id).layers.server.poi
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
          label="Activities"
          control={
            <Checkbox
              checked={server.activities}
              onChange={() =>
                updateChild(
                  parent.id,
                  child.id,
                  {
                    layers: {
                      ...getChild(objectState, parent.id, child.id).layers,
                      server: {
                        expanded: getChild(objectState, parent.id, child.id).layers.server.expanded,
                        wms: getChild(objectState, parent.id, child.id).layers.server.wms,
                        vector_tile: getChild(objectState, parent.id, child.id).layers.server.vector_tile,
                        rendered_geojson: getChild(objectState, parent.id, child.id).layers.server.rendered_geojson,
                        activities: !getChild(objectState, parent.id, child.id).layers.server.activities,
                        poi: getChild(objectState, parent.id, child.id).layers.server.poi
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
          label="Point of Interest"
          control={
            <Checkbox
              checked={server.poi}
              onChange={() =>
                updateChild(
                  parent.id,
                  child.id,
                  {
                    layers: {
                      ...getChild(objectState, parent.id, child.id).layers,
                      server: {
                        expanded: getChild(objectState, parent.id, child.id).layers.server.expanded,
                        wms: getChild(objectState, parent.id, child.id).layers.server.wms,
                        vector_tile: getChild(objectState, parent.id, child.id).layers.server.vector_tile,
                        rendered_geojson: getChild(objectState, parent.id, child.id).layers.server.rendered_geojson,
                        activities: getChild(objectState, parent.id, child.id).layers.server.activities,
                        poi: !getChild(objectState, parent.id, child.id).layers.server.poi
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
            vector_tile: getChild(objectState, parent.id, child.id).layers.local.vector_tile,
            rendered_geojson: getChild(objectState, parent.id, child.id).layers.local.rendered_geojson,
            activities: getChild(objectState, parent.id, child.id).layers.local.activities,
            poi: getChild(objectState, parent.id, child.id).layers.local.poi
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
              checked={local.vector_tile}
              onChange={() =>
                updateChild(
                  parent.id,
                  child.id,
                  {
                    layers: {
                      ...getChild(objectState, parent.id, child.id).layers,
                      local: {
                        expanded: getChild(objectState, parent.id, child.id).layers.local.expanded,
                        vector_tile: !getChild(objectState, parent.id, child.id).layers.local.vector_tile,
                        rendered_geojson: getChild(objectState, parent.id, child.id).layers.local.rendered_geojson,
                        activities: getChild(objectState, parent.id, child.id).layers.local.activities,
                        poi: getChild(objectState, parent.id, child.id).layers.local.poi
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
          label="Rendered GeoJSON"
          control={
            <Checkbox
              checked={local.rendered_geojson}
              onChange={() =>
                updateChild(
                  parent.id,
                  child.id,
                  {
                    layers: {
                      ...getChild(objectState, parent.id, child.id).layers,
                      local: {
                        expanded: getChild(objectState, parent.id, child.id).layers.local.expanded,
                        vector_tile: getChild(objectState, parent.id, child.id).layers.local.vector_tile,
                        rendered_geojson: !getChild(objectState, parent.id, child.id).layers.local.rendered_geojson,
                        activities: getChild(objectState, parent.id, child.id).layers.local.activities,
                        poi: getChild(objectState, parent.id, child.id).layers.local.poi
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
          label="Activities"
          control={
            <Checkbox
              checked={local.activities}
              onChange={() =>
                updateChild(
                  parent.id,
                  child.id,
                  {
                    layers: {
                      ...getChild(objectState, parent.id, child.id).layers,
                      local: {
                        expanded: getChild(objectState, parent.id, child.id).layers.local.expanded,
                        vector_tile: getChild(objectState, parent.id, child.id).layers.local.vector_tile,
                        rendered_geojson: getChild(objectState, parent.id, child.id).layers.local.rendered_geojson,
                        activities: !getChild(objectState, parent.id, child.id).layers.local.activities,
                        poi: getChild(objectState, parent.id, child.id).layers.local.poi
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
          label="Point of Interest"
          control={
            <Checkbox
              checked={local.poi}
              onChange={() =>
                updateChild(
                  parent.id,
                  child.id,
                  {
                    layers: {
                      ...getChild(objectState, parent.id, child.id).layers,
                      local: {
                        expanded: getChild(objectState, parent.id, child.id).layers.local.expanded,
                        vector_tile: getChild(objectState, parent.id, child.id).layers.local.vector_tile,
                        rendered_geojson: getChild(objectState, parent.id, child.id).layers.local.rendered_geojson,
                        activities: getChild(objectState, parent.id, child.id).layers.local.activities,
                        poi: !getChild(objectState, parent.id, child.id).layers.local.poi
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
