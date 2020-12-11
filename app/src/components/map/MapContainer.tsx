import { Button, Grid, IconButton, Input, makeStyles, Paper, Slider, Zoom } from '@material-ui/core';
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

import EditIcon from '@material-ui/icons/Edit';
import HighlightOffIcon from '@material-ui/icons/HighlightOff'
import LinearScaleIcon from '@material-ui/icons/LinearScale';
import RoomIcon from '@material-ui/icons/Room';
import Crop169Icon from '@material-ui/icons/Crop169';
import * as turf from '@turf/turf';
import DoneIcon from '@material-ui/icons/Done';

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
enum mapMode {
  default = 'default',
  editGeo = 'editGeo'
}

const MapContainer: React.FC<IMapContainerProps> = (props) => {
  const databaseContext = useContext(DatabaseContext);
  //other state:

  //  const [mode, setMode] = useState(() => mapMode.default)

  //  const [mode, setMode] = useState(null)
  let mode = mapMode.default;
  const setMode = (aMode: mapMode) => {
    mode = aMode;
  };

  const [layerBeingEdited, setLayerBeingEdited] = useState(null);
  const [geoBeingEdited, setGeoBeingEdited] = useState(null);
  const [editHandler, setEditHandler] = useState(null);

  const useStyles = makeStyles((theme) => ({
    button: {
      //padding: theme.spacing(2),
      color: theme.palette.text.secondary,
      // width: 80
    },
    buttonGrid: {
      //      flexGrow: 5,
      display: 'flex',
      justifyContent: 'center',
      padding: theme.spacing(2),
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

    mapRef.current.on('draw:deleted', function () {
      props.geometryState.setGeometry([]);
    });
    // event fired on disabling edit
    mapRef.current.on('layerremove', async function (layerGroup) {
      // The current feature isn't passed to this function, so grab it from the acetate layer
      if (sessionStorage.getItem('mode') === 'edit') {
        let aGeo = editedDrawnItems?.toGeoJSON()?.features[0];

        console.log('new edited drawn items')
        console.dir(editedDrawnItems)
        // If this is a circle feature... Grab the radius and store in the GeoJSON
        if (editedDrawnItems.getLayers()[0]._mRadius) {
          const radius = editableDrawnItems.getLayers()[0]?.getRadius();
          aGeo = { ...aGeo, properties: { ...aGeo.properties, radius: radius } };
        }

        console.dir(aGeo)
        // Save edited feature
        if (aGeo) {
          props.geometryState.setGeometry([aGeo]);
        }
      }
    });
  };

  const updateMapOnGeometryChange = () => {
    // Clear the drawn features
    setReadOnlyDrawnItems(readOnlyDrawnItems.clearLayers());

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

              if (interactObj.isEditable) {
                //only allow one edit at a time:
                if (editHandler) {
                  editHandler.editing.disable();
                  //                  setMode(mapMode.default);
                }
                //setMode(mapMode.editGeo);

                //if (mode === mapMode.editGeo) {
                if (sessionStorage.getItem('mode') === 'edit') {
                  editedDrawnItems.addLayer(layer);
                  console.log('old drawn items')
                  console.dir(editedDrawnItems)
                  //set the new handler and enable
                  let handler = e.target;
                  handler.editing.enable();
                  setEditHandler(handler);
                }
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
    console.log('rerender')
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
    poly.enable();
  };


  const acceptChange = () => {

    console.dir(editedDrawnItems)


    let layer = editedDrawnItems.getLayers()[0]
    console.dir(layer)
    editedDrawnItems.removeLayer(layer)

  }

  const cancel = () => {
    if (currentDrawingHandler) {
      currentDrawingHandler.disable();
    }
  };

  return (
    <>
      <div id={props.mapId} className={props.classes.map} />
      {/*<div id="overlay" className="overlay">*/}
      <div id="overlay">
        {/*</div><Grid direction="row" alignContent="flex-start" alignItems="stretch" className={classes.buttonGrid} spacing={2}>*/}
        <Grid alignItems="center" className={classes.buttonGrid} xs={12} spacing={2} container>
          <Grid className={classes.button} item>
            <Paper elevation={10}>
            <IconButton
              //disabled={isDisabled}:w

              color="primary"
              //startIcon={<Sync className={clsx(syncing && 'rotating')}></Sync>
              onClick={() => {
                setMode(mapMode.editGeo);
                sessionStorage.setItem('mode', 'edit');
              }}>
              <EditIcon />
            </IconButton>
            </Paper>
          </Grid>
          <Grid className={classes.button} item>
            <Paper elevation={10}>
            <IconButton
              //disabled={isDisabled}:w

              color="primary"
              //startIcon={<Sync className={clsx(syncing && 'rotating')}></Sync>
              onClick={() => {
                setMode(mapMode.default);
                sessionStorage.removeItem('mode');
                acceptChange();
              }}>
              <DoneIcon />
            </IconButton>
            </Paper>
          </Grid>
          <Grid className={classes.button} item>
            <Paper elevation={10}>
            <IconButton
              //disabled={isDisabled}:w

              color="primary"
              //startIcon={<Sync className={clsx(syncing && 'rotating')}></Sync>
              onClick={() => {
                console.log('stop edit')
                setMode(mapMode.default);
                sessionStorage.removeItem('mode')
              }}>
              <HighlightOffIcon />
            </IconButton>
            </Paper>
          </Grid>
          <Grid className={classes.button} item>
            <Paper elevation={10}>
            <IconButton
              //disabled={isDisabled}:w

              color="primary"
              //startIcon={<Sync className={clsx(syncing && 'rotating')}></Sync>
              onClick={() => {
                setMode(mapMode.editGeo);
                sessionStorage.setItem('mode', 'edit');
              }}>
              <RoomIcon />
            </IconButton>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default MapContainer;
