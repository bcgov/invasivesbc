import React, { useState } from 'react';
import { Paper, Typography, IconButton } from '@material-ui/core';
import { LayerGroup, useMapEvents, WMSTileLayer } from 'react-leaflet';
import { Util } from 'leaflet';
import Accordion from '@material-ui/core/Accordion';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import LayersIcon from '@material-ui/icons/Layers';
import lodashGroupBy from 'lodash.groupby';
import { LayersControlProvider } from './layerControlContext';

import createControlledLayer from './controlledLayer';
import { DataBCLayer, LayerMode } from '../LayerLoaderHelpers/DataBCRenderLayer';

// Classes used by Leaflet to position controls
const POSITION_CLASSES = {
  bottomleft: 'leaflet-bottom leaflet-left',
  bottomright: 'leaflet-bottom leaflet-right',
  topleft: 'leaflet-top leaflet-left',
  topright: 'leaflet-top leaflet-right'
};

function LayerControl({ position, data }) {
  const [collapsed, setCollapsed] = useState(true);
  const [layers, setLayers] = useState([]);
  const positionClass = (position && POSITION_CLASSES[position]) || POSITION_CLASSES.topright;

  const map = useMapEvents({
    //layerremove: () => {},
    //layeradd: () => {}
    /*overlayadd: (layer, extra) => {
       
     }*/
  });
  const onLayerClick = (layerObj) => {
    if (map?.hasLayer(layerObj.layer)) {
      map.removeLayer(layerObj.layer);
      setLayers(
        layers.map((layer) => {
          if (layer.id === layerObj.id)
            return {
              ...layer,
              checked: false
            };
          return layer;
        })
      );
    } else {
      map.addLayer(layerObj.layer);
      setLayers(
        layers.map((layer) => {
          if (layer.id === layerObj.id)
            return {
              ...layer,
              checked: true
            };
          return layer;
        })
      );
    }
  };

  const onGroupAdd = (layer, name, group) => {
    setLayers((_layers) => [
      ..._layers,
      {
        layer,
        group,
        name,
        checked: map?.hasLayer(layer),
        id: Util.stamp(layer)
      }
    ]);
  };

  const groupedLayers = lodashGroupBy(layers, 'group');

  return (
    <LayersControlProvider
      value={{
        layers,
        addGroup: onGroupAdd
      }}>
      <div className={positionClass}>
        <div className="leaflet-control leaflet-bar">
          {
            <Paper
              onMouseEnter={() => setCollapsed(false)}
              onMouseLeave={() => setCollapsed(true)}
              // className={classes.container}
            >
              {collapsed && (
                <IconButton>
                  <LayersIcon fontSize="default" />
                </IconButton>
              )}
              {!collapsed &&
                Object.keys(groupedLayers).map((section, index) => (
                  <Accordion key={`${section} ${index}`}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel1a-content"
                      id="panel1a-header">
                      <Typography>{section}</Typography>
                    </AccordionSummary>
                    {groupedLayers[section]?.map((layerObj) => (
                      <>
                        <Checkbox
                          checked={layerObj.enabled}
                          onChange={() => onLayerClick(layerObj)}
                          name="checkedB"
                          color="primary"
                        />
                        {console.dir(layerObj)}
                        {console.dir(groupedLayers)}
                        <AccordionDetails>
                          <Accordion>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={layerObj.enabled}
                                  onChange={() => onLayerClick(layerObj)}
                                  name="checkedB"
                                  color="primary"
                                />
                              }
                              label={layerObj.name}
                            />
                          </Accordion>
                        </AccordionDetails>
                      </>
                    ))}
                  </Accordion>
                ))}
            </Paper>
          }
        </div>
        {console.log('render')}
        {data.map((parent) => (
          <>
            {console.log(parent)}
            <GroupedLayer name={parent.id} group={parent.id}>
              <LayerGroup>
                {parent.children.map((child) => {
                  <LayerGroup>
                    <DataBCLayer layerName={child.BCGWcode} mode={LayerMode.WMSOnline} />;
                  </LayerGroup>;
                })}
              </LayerGroup>
            </GroupedLayer>
          </>
        ))}
      </div>
    </LayersControlProvider>
  );
}

const GroupedLayer = createControlledLayer(function addGroup(layersControl, layer, name, group) {
  layersControl.addGroup(layer, name, group);
});

export default LayerControl;
export { GroupedLayer };
