import { DatabaseContext } from 'contexts/DatabaseContext';
import { MapContextMenuData } from 'features/home/map/MapContextMenu';
import { Feature, FeatureCollection, GeoJsonObject } from 'geojson';
import React, { useContext, useEffect, useRef, useState } from 'react';
//import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import './MapContainer2.css';
import * as turf from '@turf/turf';
import { LeafletContextInterface, useLeafletContext } from '@react-leaflet/core';
import {
  GeoJSON,
  MapContainer,
  TileLayer,
  LayersControl,
  Marker,
  useMap,
  FeatureGroup,
  useMapEvents,
  useMapEvent,
  ZoomControl
} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import marker from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { interactiveGeoInputData } from './GeoMeta';
import Spinner from 'components/spinner/Spinner';

// Offline dependencies
import localforage from 'localforage';
import 'leaflet.offline';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { IPointOfInterestSearchCriteria } from 'interfaces/useInvasivesApi-interfaces';
import { useDataAccess } from 'hooks/useDataAccess';
import TempPOILoader from './LayerLoaderHelpers/TempPOILoader';
import { Box, Grid, IconButton } from '@material-ui/core';

// Layer Picker
import LayersIcon from '@material-ui/icons/Layers';

import { LayerPicker } from './LayerPicker/SortableHelper';
import data from './LayerPicker/GEO_DATA.json';
import { DomEvent } from 'leaflet';
import DisplayPosition from './DisplayPosition';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow
});

L.Marker.prototype.options.icon = DefaultIcon;

export type MapControl = (map: any, ...args: any) => void;

// Style the image inside the download button
const iconStyle = {
  transform: 'scale(0.7)',
  opacity: '0.7'
};

const storeLayersStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'absolute',
  backgroundColor: 'white',
  color: '#464646',
  width: '2.7rem',
  height: '2.7rem',
  border: '2px solid rgba(0,0,0,0.2)',
  backgroundClip: 'padding-box',
  top: '10px',
  left: '10px',
  zIndex: 1000,
  borderRadius: '4px',
  cursor: 'pointer'
} as React.CSSProperties;

export const getZIndex = (doc) => {
  const coords = doc.geometry[0]?.geometry.coordinates;
  let zIndex = 100000;
  if (doc.geometry[0].geometry.type === 'Polygon' && coords?.[0]) {
    let highestLat = coords[0].reduce((max, point) => {
      if (point[1] > max) return point[1];
      return max;
    }, 0);
    let lowestLat = coords[0].reduce((min, point) => {
      if (point[1] < min) return point[1];
      return min;
    }, zIndex);

    zIndex = zIndex / (highestLat - lowestLat);
  }
  return zIndex;
};

export interface IMapContainerProps {
  classes?: any;
  mapId: string;
  showDrawControls: boolean;
  pointOfInterestFilter?: IPointOfInterestSearchCriteria;
  geometryState: { geometry: any[]; setGeometry: (geometry: Feature[]) => void };
  interactiveGeometryState?: {
    interactiveGeometry: any;
    setInteractiveGeometry: (interactiveGeometry: GeoJsonObject) => void;
  };
  extentState: { extent: any; setExtent: (extent: any) => void };
  contextMenuState: {
    state: MapContextMenuData;
    setContextMenuState: (contextMenuState: MapContextMenuData) => void;
  };
}

const interactiveGeometryStyle = () => {
  return {
    color: '#ff7800',
    weight: 5,
    opacity: 0.65
  };
};

const MapContainer2: React.FC<IMapContainerProps> = (props) => {
  const databaseContext = useContext(DatabaseContext);
  const drawRef = useRef();
  const [menuState, setMenuState] = useState(false);
  const [drawnItems, setDrawnItems] = useState(new L.FeatureGroup());

  const Offline = () => {
    const map = useMap();
    const offlineLayer = (L.tileLayer as any).offline(
      // 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      // localforage,
      {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abc',
        // minZoom: 13,
        // maxZoom: 19,
        crossOrigin: true
      }
    );
    offlineLayer.addTo(map);

    let [offlineing, setOfflineing] = useState(false);

    const saveBasemapControl = (L.control as any).savetiles(offlineLayer, {
      zoomlevels: [13, 14, 15, 16, 17],
      confirm(_: any, successCallback: any) {
        successCallback(true);
      }
    });

    saveBasemapControl._map = map;

    const storeLayers = async () => {
      setOfflineing(true);
      await saveBasemapControl._saveTiles();
      // XXX: This is firing to quickly
      setOfflineing(false);
    };

    return (
      <div id="offline-layers-button" title="Offline layers" onClick={storeLayers} style={storeLayersStyle}>
        {/* TODO:
          1. Toggle between spinner and image depending on 'offlineing' status
          2. Swap image style based on zoom level
        */}
        {offlineing ? <Spinner></Spinner> : <img src="/assets/icon/download.svg" style={iconStyle}></img>}
      </div>
    );
  };

  const EditTools = () => {
    // This should get the 'FeatureGroup' connected to the tools
    const context = useLeafletContext() as LeafletContextInterface;
    const [geoKeys, setGeoKeys] = useState({});
    // Grab the map object
    let map = useMap();

    // Put new feature into the FeatureGroup
    const onDrawCreate = (e: any) => {
      context.layerContainer.addLayer(e.layer);
      let aGeo = e.layer.toGeoJSON();
      if (e.layerType === 'circle') {
        aGeo = { ...aGeo, properties: { ...aGeo.properties, radius: e.layer.getRadius() } };
      } else if (e.layerType === 'rectangle') {
        aGeo = { ...aGeo, properties: { ...aGeo.properties, isRectangle: true } };
      }
      aGeo = convertLineStringToPoly(aGeo);
      // Drawing one geo wipes all others
      props.geometryState.setGeometry([aGeo]);
    };

    const convertLineStringToPoly = (aGeo: any) => {
      if (aGeo.geometry.type === 'LineString') {
        const buffer = prompt('Enter buffer width (total) in meters', '1');
        const buffered = turf.buffer(aGeo.geometry, parseInt(buffer, 10) / 1000, { units: 'kilometers', steps: 1 });
        const result = turf.featureCollection([buffered, aGeo.geometry]);

        return { ...aGeo, geometry: result.features[0].geometry };
      }

      return aGeo;
    };

    const setGeometryMapBounds = () => {
      if (
        props.geometryState?.geometry?.length &&
        !(props.geometryState?.geometry[0].geometry.type === 'Point' && !props.geometryState?.geometry[0].radius)
      ) {
        const allGeosFeatureCollection = {
          type: 'FeatureCollection',
          features: [...props.geometryState.geometry]
        };
        const bboxCoords = turf.bbox(allGeosFeatureCollection);

        map.fitBounds([
          [bboxCoords[1], bboxCoords[0]],
          [bboxCoords[3], bboxCoords[2]]
        ]);
      }
    };

    const updateMapOnGeometryChange = () => {
      // updates drawnItems with the latest geo changes, attempting to only draw new geos and delete no-longer-present ones
      const newGeoKeys = { ...geoKeys };

      if (props.geometryState) {
        // For each geometry, add a new layer to the drawn features
        props.geometryState.geometry.forEach((collection) => {
          const style = {
            weight: 4,
            opacity: 0.65
          };

          const markerStyle = {
            radius: 10,
            weight: 4,
            stroke: true
          };

          L.geoJSON(collection, {
            style,
            pointToLayer: (feature: any, latLng: any) => {
              if (feature.properties.radius) {
                return L.circle(latLng, { radius: feature.properties.radius });
              } else {
                return L.circleMarker(latLng, markerStyle);
              }
            },
            onEachFeature: (feature: any, layer: any) => {
              drawnItems.addLayer(layer);
            }
          });
        });
      }
      if (props.interactiveGeometryState?.interactiveGeometry) {
        props.interactiveGeometryState.interactiveGeometry.forEach((interactObj) => {
          const key = interactObj.recordDocID || interactObj._id;
          if (newGeoKeys[key] && newGeoKeys[key].hash === JSON.stringify(interactObj) && newGeoKeys[key] !== true) {
            // old unchanged geo, no need to redraw
            newGeoKeys[key] = {
              ...newGeoKeys[key],
              updated: false
            };
            return;
          }

          // else prepare new Geo for drawing:
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

          const geo = L.geoJSON(interactObj.geometry, {
            // Note: the result of this isn't actually used, it seems?
            style,
            pointToLayer: (feature: any, latLng: any) => {
              if (feature.properties.radius) {
                return L.circle(latLng, { radius: feature.properties.radius });
              } else {
                return L.circleMarker(latLng, markerStyle);
              }
            },
            onEachFeature: (feature: any, layer: any) => {
              const content = interactObj.popUpComponent(interactObj.description);
              layer.on('click', () => {
                // Fires on click of single feature

                // Formulate a table containing all attributes
                let table = '<table><tr><th>Attribute</th><th>Value</th></tr>';
                Object.keys(feature.properties).forEach((f) => {
                  if (f !== 'uploadedSpatial') {
                    table += `<tr><td>${f}</td><td>${feature.properties[f]}</td></tr>`;
                  }
                });
                table += '</table>';

                const loc = turf.centroid(feature);
                const center = [loc.geometry.coordinates[1], loc.geometry.coordinates[0]];

                if (feature.properties.uploadedSpatial) {
                  L.popup()
                    .setLatLng(center as L.LatLngExpression)
                    .setContent(table)
                    .openOn(map);
                } else {
                  L.popup()
                    .setLatLng(center as L.LatLngExpression)
                    .setContent(content)
                    .openOn(map);
                }

                interactObj.onClickCallback();
              });
            }
          });
          newGeoKeys[key] = {
            hash: JSON.stringify(interactObj),
            geo: geo,
            updated: true
          };
        });
      }
      // Drawing step:
      Object.keys(newGeoKeys).forEach((key: any) => {
        if (newGeoKeys[key].updated === true) {
          // draw layers to map
          Object.values(newGeoKeys[key].geo._layers).forEach((layer: L.Layer) => {
            drawnItems.addLayer(layer);
          });
        } else if (newGeoKeys[key].updated === false) {
          return;
        } else {
          // remove old keys (delete step)
          Object.values(newGeoKeys[key].geo._layers).forEach((layer: L.Layer) => {
            drawnItems.removeLayer(layer);
          });
          delete newGeoKeys[key];
          return;
        }
        // reset updated status for next refresh:
        delete newGeoKeys[key].updated;
      });

      // update stored geos, mapped by key
      setGeoKeys(newGeoKeys);

      // Update the drawn featres
      setDrawnItems(drawnItems);

      // Update the map with the new drawn feaures
      map = map.addLayer(drawnItems);
    };

    // When the dom is rendered listen for added features
    useEffect(() => {
      map.on('draw:created', onDrawCreate);
      // map.on('draw:editstop', onDrawEditStop);
      // map.on('draw:deleted', onDrawDeleted);
    }, []);

    useEffect(() => {
      if (!map) {
        return;
      }

      if (!props.geometryState?.geometry) {
        return;
      }

      setGeometryMapBounds();
      updateMapOnGeometryChange();
    }, [props.geometryState.geometry, props?.interactiveGeometryState?.interactiveGeometry]);

    // Get out if the tools are already defined.
    if (drawRef.current) return null;

    /**
     * This is where all the editing tool options are defined.
     * See: https://leaflet.github.io/Leaflet.draw/docs/leaflet-draw-latest.html
     */
    const options = {
      edit: {
        featureGroup: context.layerContainer,
        edit: true
      }
    };

    // Create drawing tool control
    drawRef.current = new (L.Control as any).Draw(options);

    // Add drawing tools to the map
    map.addControl(drawRef.current);

    return <div></div>;
  };

  const vanIsland: FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-123.31054687499999, 48.3416461723746],
              [-122.82714843749999, 48.69096039092549],
              [-122.6953125, 49.69606181911566],
              [-125.68359374999999, 50.875311142200765],
              [-129.0673828125, 51.39920565355378],
              [-128.1884765625, 49.55372551347579],
              [-123.31054687499999, 48.3416461723746]
            ]
          ]
        }
      }
    ]
  };

  const setupFeature = (feature, layer) => {
    let popupContent = 'POP UP STUFFFFFFFFFFFFFFFFFFFFFFFFFF';
    for (let i = 0; i < 100; i++) {
      popupContent += '\nFFFFFFFFFFFF';
    }
    layer.bindPopup(popupContent);
  };

  // hack to deal with leaflet getting handed the wrong window size before it calls invalidateSize on load
  const MapResizer = () => {
    const map = useMap();
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return null;
  };

  const [map, setMap] = useState<any>(null);

  return (
    <MapContainer center={[55, -128]} zoom={5} style={{ height: '100%', width: '100%' }} zoomControl={true} whenCreated={setMap}>
      {/* <LayerComponentGoesHere></LayerComponentGoesHere> */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
          flexFlow: 'column wrap',
          height: '70vh'
        }}>
         
        <IconButton
          style={{ 
            margin: '5px',
            background: 'white', 
            zIndex: 500, 
            borderRadius: '15%', 
            border: '1px solid black' }}
          onClick={() => {
            setMenuState(!menuState);
          }}>
          <LayersIcon />
        </IconButton>
        {menuState ? (
          <div style={{ background: 'white', zIndex: 500, width: '400px' }}>
            <LayerPicker data={data} />
          </div>
        ) : (
          <></>
        )}

        <div style={{
          margin: '5px',
          zIndex: 1500, 
          background: 'white', 
          borderRadius: '15%',
          border: '1px solid black'}} >
          {map ? <DisplayPosition map={map} /> : null }
        </div>
      </div>
       
      
      {/* Here is the offline component */}
      <Offline />

      <ZoomControl position='bottomright' />

      {/* Here are the editing tools */}
      {props.showDrawControls && (
        <FeatureGroup>
          <EditTools />
        </FeatureGroup>
      )}

      <MapResizer />

      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Regular Layer">
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
        </LayersControl.BaseLayer>
        <LayersControl.Overlay checked name="Activities">
          {/*<TempPOILoader pointOfInterestFilter={props.pointOfInterestFilter}></TempPOILoader>*/}
          {/* this line below works - its what you need for geosjon*/}
          <GeoJSON data={props.interactiveGeometryState?.interactiveGeometry} style={interactiveGeometryStyle} />
          {/* <GeoJSON data={vanIsland} style={interactiveGeometryStyle} onEachFeature={setupFeature} /> */}
        </LayersControl.Overlay>
      </LayersControl>
    </MapContainer>
  );
};

export default MapContainer2;
