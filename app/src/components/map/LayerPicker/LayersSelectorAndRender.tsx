import { Accordion, AccordionSummary, Checkbox, FormControlLabel } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { updateChild } from './LayerPicker';
import { getChild } from './SortLayerOrder';

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
          <FormControlLabel
            label="Server"
            control={
              <Checkbox
                checked={server.wms && server.vector_tile && server.rendered_geojson && server.activities && server.poi}
              />
            }
          />
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
          <FormControlLabel
            label="Local"
            control={
              <Checkbox
                checked={local.wms && local.vector_tile && local.rendered_geojson && local.activities && local.poi}
              />
            }
          />
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
