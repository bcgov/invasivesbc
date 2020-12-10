import { Button, Grid, Input, makeStyles, Slider, Zoom } from '@material-ui/core';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { MapContextMenuData } from 'features/home/map/MapContextMenu';
import { Feature } from 'geojson';
import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet.locatecontrol';
import 'leaflet.locatecontrol/dist/L.Control.Locate.css';
import 'leaflet.locatecontrol/dist/L.Control.Locate.mapbox.css';
import 'leaflet.offline';
import 'leaflet/dist/leaflet.css';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { notifySuccess } from 'utils/NotificationUtils';
import { interactiveGeoInputData } from './GeoMeta';
import './MapContainer.css';

import * as turf from '@turf/turf';

export type MapControl = (map: any, ...args: any) => void;

export interface IMapContainerProps {
  classes?: any;
  mapId: string;
  geometryState: { geometry: any[]; setGeometry: (geometry: Feature[]) => void };
  interactiveGeometryState?: {
    interactiveGeometry: any[];
    setInteractiveGeometry: (interactiveGeometry: interactiveGeoInputData[]) => void;
  };
  extentState: { extent: any; setExtent: (extent: any) => void };
  contextMenuState: {
    state: MapContextMenuData;
    setContextMenuState: (contextMenuState: MapContextMenuData) => void;
  };
}
enum mapMode  {
  default = 'default',
  editGeo = 'editGeo'
}

const MapContainer: React.FC<IMapContainerProps> = (props) => {
  const databaseContext = useContext(DatabaseContext);
  //other state:

  //nfg:
  //const [mode, setMode] = useState(null)
  //for some reason works:
  let mode = null
  const setMode = (aMode: mapMode) => {mode = aMode}

  const [layerBeingEdited, setLayerBeingEdited] = useState(null)
  const [geoBeingEdited, setGeoBeingEdited] = useState(null)
  const [editHandler, setEditHandler] = useState(null);

  const useStyles = makeStyles((theme) => ({
    button: {
      //padding: theme.spacing(2),
      color: theme.palette.text.secondary,
      height: 100
      // width: 80
    },
    buttonGrid: {
      //      flexGrow: 5,
      display: 'flex',
      padding: theme.spacing(2),
      width: 520,
      height: 100,
      color: theme.palette.text.secondary
    }
  }));
  const classes = useStyles();

  const mapRef = useRef(null);

  //do we need these?
  const [readOnlyDrawnItems, setReadOnlyDrawnItems] = useState(new L.FeatureGroup());
  const [editableDrawnItems, setEditableDrawnItems] = useState(new L.FeatureGroup());
  const [editedDrawnItems, setEditedDrawnItems] = useState(new L.FeatureGroup());

  const addContextMenuClickListener = () => {
    mapRef.current.on('contextmenu', (e) => {
      props.contextMenuState.setContextMenuState({ isOpen: true, lat: e.latlng.lat, lng: e.latlng.lng });
    });
  };

  const getESRIBaseLayer = () => {
    return L.tileLayer.offline(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 24,
        maxNativeZoom: 17,
        attribution:
          '&copy; <a href="https://www.esri.com/en-us/arcgis/products/location-services/services/basemaps">ESRI Basemap</a>'
      }
    );
  };

  const getBCGovBaseLayer = () => {
    return L.tileLayer('https://maps.gov.bc.ca/arcgis/rest/services/province/roads_wm/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 24,
      useCache: true,
      cacheMaxAge: 6.048e8 // 1 week
    });
  };

  const addZoomControls = () => {
    const zoomControlOptions = { position: 'bottomleft' };

    mapRef.current.addControl(L.control.zoom(zoomControlOptions));
  };

  const addDrawControls = () => {
    const drawControlOptions = new L.Control.Draw({
      position: 'topright',
      draw: {
        marker: false,
        circle: true
      },
      edit: {
        featureGroup: readOnlyDrawnItems,
        remove: true,
        edit: true
      }
    });

    mapRef.current.addControl(drawControlOptions);
  };

  const addLocateControls = () => {
    const locateControlOptions = {
      icon: 'bullseye',
      flyTo: true,
      iconElementTag: 'div'
    };

    mapRef.current.addControl(L.control.locate(locateControlOptions));
  };

  const addSaveTilesControl = (layerToSave: any) => {
    mapRef.current.addControl(
      L.control.savetiles(layerToSave, {
        zoomlevels: [13, 14, 15, 16, 17],
        confirm(layer, succescallback) {
          if (window.confirm(`Save ${layer._tilesforSave.length} tiles`)) {
            succescallback(notifySuccess(databaseContext, `Saved ${layer._tilesforSave.length} tiles`));
          }
        },
        confirmRemoval(layer, succescallback) {
          if (window.confirm('Remove all the stored tiles')) {
            succescallback(notifySuccess(databaseContext, `Removed tiles`));
          }
        },
        saveText: '<span title="Save me some basemap">&#128190;</span>',
        rmText: '<span title="Delete all stored basemap tiles">&#128465;</span>'
      })
    );
  };

  const setMapBounds = (extent) => {
    if (!extent) {
      return;
    }

    const bounds = [
      [extent._northEast.lat, extent._northEast.lng],
      [extent._southWest.lat, extent._southWest.lng]
    ];

    mapRef.current.fitBounds(bounds);
  };

  const addLayerControls = (baseLayerControlOptions: any) => {
    mapRef.current.addControl(L.control.layers(baseLayerControlOptions));
  };

  const initMap = () => {
    mapRef.current = L.map(props.mapId, { zoomControl: false }).setView([55, -128], 10);

    addContextMenuClickListener();

    addZoomControls();

    addLocateControls();

    addDrawControls();

    const esriBaseLayer = getESRIBaseLayer();
    const bcBaseLayer = getBCGovBaseLayer();

    // Set initial base map
    esriBaseLayer.addTo(mapRef.current);

    addLayerControls({
      'Esri Imagery': esriBaseLayer,
      'BC Government': bcBaseLayer
    });

    addSaveTilesControl(esriBaseLayer);

    setMapBounds(mapRef.current.getBounds());

    mapRef.current.on('dragend', () => {
      props.extentState.setExtent(mapRef.current.getBounds());
    });

    mapRef.current.on('zoomend', () => {
      props.extentState.setExtent(mapRef.current.getBounds());
    });

    mapRef.current.on('draw:created', (feature) => {
      let aGeo = feature.layer.toGeoJSON();

      if (feature.layerType === 'circle') {
        aGeo = { ...aGeo, properties: { ...aGeo.properties, radius: feature.layer.getRadius() } };
      }

      // Note that drawing one wipes all others:
      props.geometryState.setGeometry([aGeo]);
    });

    mapRef.current.on('draw:drawstart', function () {
      //props.geometryState.setGeometry([]);
    });

    mapRef.current.on('draw:editstop', async function (layerGroup) {
      // The current feature isn't passed to this function, so grab it from the acetate layer
      let aGeo = editableDrawnItems?.toGeoJSON()?.features[0];
      console.log('i finished editing')

      // If this is a circle feature... Grab the radius and store in the GeoJSON
      if (editableDrawnItems.getLayers()[0]._mRadius) {
        const radius = editableDrawnItems.getLayers()[0]?.getRadius();
        aGeo = { ...aGeo, properties: { ...aGeo.properties, radius: radius } };
      }

      // Save edited feature
      if (aGeo) {
        props.geometryState.setGeometry([aGeo]);
      }
    });

    /*
    mapRef.current.on((e) =>  {
      console.log('event!')
      console.dir(e)

    })
    */

    mapRef.current.on('draw:deleted', function () {
      props.geometryState.setGeometry([]);
    });
    // event fired on disabling edit
    mapRef.current.on('layeradd', async function (layerGroup) {
      // The current feature isn't passed to this function, so grab it from the acetate layer
      if(mode && mode === mapMode.editGeo)
      {
        let aGeo = editedDrawnItems?.toGeoJSON()?.features[0];
        console.dir(aGeo)

        // If this is a circle feature... Grab the radius and store in the GeoJSON
        if (editedDrawnItems.getLayers()[0]._mRadius) {
          const radius = editableDrawnItems.getLayers()[0]?.getRadius();
          aGeo = { ...aGeo, properties: { ...aGeo.properties, radius: radius } };
        }

        // Save edited feature
        if (aGeo) {
          props.geometryState.setGeometry([aGeo]);
        }

      }
    });

    // event fired on disabling edit
    mapRef.current.on('editable:disable', async function (layerGroup) {
      // The current feature isn't passed to this function, so grab it from the acetate layer
      let aGeo = editableDrawnItems?.toGeoJSON()?.features[0];
      console.log('i finished editing!')

      // If this is a circle feature... Grab the radius and store in the GeoJSON
      if (editableDrawnItems.getLayers()[0]._mRadius) {
        const radius = editableDrawnItems.getLayers()[0]?.getRadius();
        aGeo = { ...aGeo, properties: { ...aGeo.properties, radius: radius } };
      }

      // Save edited feature
      if (aGeo) {
        props.geometryState.setGeometry([aGeo]);
      }
    });
  };

  const updateMapOnGeometryChange = () => {
    // Clear the drawn features
    setReadOnlyDrawnItems(readOnlyDrawnItems.clearLayers());

    /*if (props.geometryState) {
      // For each geometry, add a new layer to the drawn features
      props.geometryState.geometry.forEach((collection) => {
        const style = {
          // color: '#ff7800',
          weight: 4,
          opacity: 0.65
        };

        const markerStyle = {
          radius: 10,
          weight: 4,
          stroke: true
        };

        L.geoJSON(collection, {
          style: style,
          pointToLayer: (feature: any, latLng: any) => {
            if (feature.properties.radius) {
              return L.circle(latLng, { radius: feature.properties.radius });
            } else {
              return L.circleMarker(latLng, markerStyle);
            }
          },
          onEachFeature: function (feature: any, layer: any) {
            readOnlyDrawnItems.addLayer(layer);
          }
        });
      });
    }
    */
    if (props.interactiveGeometryState) {
      props.interactiveGeometryState.interactiveGeometry.forEach((interactObj) => {
        const style = {
          color: interactObj.color,
          weight: 4,
          opacity: 0.65
        };

        const markerStyle = {
          radius: 10,
          weight: 4,
          stroke: true
        };

        L.geoJSON(interactObj.geometry, {
          style: style,
          pointToLayer: (feature: any, latLng: any) => {
            if (feature.properties.radius) {
              return L.circle(latLng, { radius: feature.properties.radius });
            } else {
              return L.circleMarker(latLng, markerStyle);
            }
          },
          onEachFeature: function (feature: any, layer: any) {
            if (interactObj.isEditable) {
              editableDrawnItems.addLayer(layer);
            } else {
              readOnlyDrawnItems.addLayer(layer);
            }
            let content = interactObj.popUpComponent(interactObj.description);
            layer.on('click', function (e) {
              // Fires on click of single feature
              interactObj.onClickCallback();
              if (feature.geometry.type !== 'Polygon') {
                L.popup()
                  .setLatLng([feature.geometry.coordinates[1], feature.geometry.coordinates[0]])
                  //.setContent(interactObj.popUpComponent)
                  .setContent(content)
                  .openOn(mapRef.current);
              }

              console.log('1')
              if (interactObj.isEditable) {
                console.log('2')
                //only allow one edit at a time:
                if (editHandler) {
                  console.log('disabling old handler')
                  editHandler.editing.disable();
              setMode(mapMode.default)
                }
                console.log('setting mode to edit')
              setMode(mapMode.editGeo)
              editedDrawnItems.addLayer(layer)
                //set the new handler and enable
                let handler = e.target;
                handler.editing.enable();
                setEditHandler(handler);
              }
            });
          }
        });
      });
    }

    // Update the drawn featres
    setReadOnlyDrawnItems(readOnlyDrawnItems);

    // Update the map with the new drawn feaures
    mapRef.current = mapRef.current.addLayer(readOnlyDrawnItems);
    mapRef.current = mapRef.current.addLayer(editableDrawnItems);
  };

  useEffect(() => {
    initMap();

    return () => {
      if (!mapRef.current) {
        return;
      }

      mapRef.current.remove();
    };
  }, [databaseContext]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    if (!props.geometryState?.geometry) {
      return;
    }

    updateMapOnGeometryChange();
    //this geo is now a one way push back to parent container
  //}, [props.geometryState.geometry, editHandler]);
  }, [editHandler]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    if (!props.extentState?.extent) {
      return;
    }

    setMapBounds(props.extentState.extent);
  }, [props.extentState.extent]);

  var div = L.DomUtil.get('overlay'); // this must be an ID, not class!
  //L.DomEvent.on(div, 'mousewheel', L.DomEvent.stopPropagation);
  //L.DomEvent.on(div, 'click', L.DomEvent.stopPropagation);

  // this var is used to keep track of draw handler so we can cancel
  const [currentDrawingHandler, setCurrentDrawingHandler] = useState(null);

  // because we use the same types for some actions we need to track our intent:
  const [currentActionType, setCurrentActionType] = useState(null);

  const startDrawingAndSetHandler = (drawType: any) => {
    let poly = new L.Draw.Polyline(mapRef.current);
    if (currentDrawingHandler) {
      currentDrawingHandler.disable();
    }

    setCurrentDrawingHandler(poly);
    poly.enable();
  };

  const polyline = () => {
    let poly = new L.Draw.Polyline(mapRef.current);
    if (currentDrawingHandler) {
      currentDrawingHandler.disable();
    }

    setCurrentDrawingHandler(poly);
    poly.enable();
  };

  const polygon = () => {
    let poly = new L.Draw.Polygon(mapRef.current);
    setCurrentDrawingHandler(poly);
    poly.enable();
  };

  const square = () => {
    let poly = new L.Draw.Rectangle(mapRef.current);
    setCurrentDrawingHandler(poly);
    poly.enable();
  };

  const waypoint = () => {
    let poly = new L.Draw.Polyline(mapRef.current);
    setCurrentDrawingHandler(poly);
    setCurrentActionType('waypoint');
    mapRef.current.on('draw:drawstop', (e) => {
      //console.dir(e);
      //console.dir(props.geometryState.geometry);
      //var buffered = turf.buffer(props.geometryState.geometry as unknown as Feature, 500, {units: 'miles'});
      //console.dir(buffered)
    });
    poly.enable();
  };

  const cancel = () => {
    if (currentDrawingHandler) {
      currentDrawingHandler.disable();
    }
  };

  return (
    <>
      <div id="overlay" className="overlay">
        {/*</div><Grid direction="row" alignContent="flex-start" alignItems="stretch" className={classes.buttonGrid} spacing={2}>*/}
        <Grid className={classes.buttonGrid} spacing={2}>
          <Grid xs={3} className={classes.button} item>
            <Button
              //disabled={isDisabled}:w

              variant="contained"
              color="primary"
              //startIcon={<Sync className={clsx(syncing && 'rotating')}></Sync>
              onClick={polyline}>
              PolyLine
            </Button>
          </Grid>
          <Grid xs={3} className={classes.button} item>
            <Button
              //disabled={isDisabled}
              variant="contained"
              color="primary"
              //startIcon={<Sync className={clsx(syncing && 'rotating')}></Sync>
              onClick={waypoint}>
              Waypoint
            </Button>
            <Slider step={10} marks min={10} max={110}></Slider>
          </Grid>
          <Grid xs={3} className={classes.button} item>
            <Button
              //disabled={isDisabled}
              variant="contained"
              color="primary"
              //startIcon={<Sync className={clsx(syncing && 'rotating')}
              onClick={polygon}>
              Polygon
            </Button>
          </Grid>
          <Grid xs={3} className={classes.button} item>
            <Button
              //disabled={isDisabled}
              variant="contained"
              color="primary"
              //startIcon={<Sync className={clsx(syncing && 'rotating')}
              onClick={square}>
              Square
            </Button>
          </Grid>
          <Grid xs={3} className={classes.button} item>
            <Button
              disabled={true}
              variant="contained"
              color="primary"
              //startIcon={<Sync className={clsx(syncing && 'rotating')}
              onClick={cancel}>
              New Parent Activity
            </Button>
          </Grid>
          <Grid xs={3} className={classes.button} item>
            <Button
              disabled={true}
              variant="contained"
              color="primary"
              //startIcon={<Sync className={clsx(syncing && 'rotating')}
              onClick={cancel}>
              New Child Activity
            </Button>
          </Grid>
          <Grid xs={3} className={classes.button} item>
            <Button
              disabled={false}
              variant="contained"
              color="primary"
              //startIcon={<Sync className={clsx(syncing && 'rotating')}
              onClick={cancel}>
              Choose Tools
            </Button>
          </Grid>
          <Grid xs={3} className={classes.button} item>
            <Button
              //disabled={isDisabled}
              variant="contained"
              color="primary"
              //startIcon={<Sync className={clsx(syncing && 'rotating')}
              onClick={cancel}>
              Cancel
            </Button>
          </Grid>
        </Grid>
      </div>
      <div id={props.mapId} className={props.classes.map} />;
    </>
  );
};

export default MapContainer;
