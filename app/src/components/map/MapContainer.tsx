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
  showDrawControls: boolean;
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

const host = window.location.hostname;
let geoserver;
switch (true) {
  case /^localhost/.test(host):
    geoserver = 'http://localhost:8080';
    break;
  case /^dev.*/.test(host):
    geoserver = 'https://invasivesbci-geoserver-dev-7068ad-dev.apps.silver.devops.gov.bc.ca';
    break;
  case /^test.*/.test(host):
    geoserver = 'https://invasivesbci-geoserver-tst-7068ad-tst.apps.silver.devops.gov.bc.ca';
    break;
  case /^invasivesbc.*/.test(host):
    geoserver = 'https://invasivesbci-geoserver-7068ad.apps.silver.devops.gov.bc.ca';
    break;
}

const MapContainer: React.FC<IMapContainerProps> = (props) => {
  const databaseContext = useContext(DatabaseContext);

  const mapRef = useRef(null);

  const [drawnItems, setDrawnItems] = useState(new L.FeatureGroup());

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

  const getESRIPlacenames = () => {
    return L.tileLayer.offline(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 24,
        maxNativeZoom: 17
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

  const getNRDistricts = () => {
    return L.tileLayer.offline(
      `${geoserver}/geoserver/gwc/service/tms/1.0.0/invasives:WHSE_ADMIN_BOUNDARIES.ADM_NR_DISTRICTS_SPG@EPSG:900913@png/{z}/{x}/{y}.png`,
      {
        opacity: 0.8,
        tms: true
      }
    );
  };

  const getWells = () => {
    return L.tileLayer.offline(
      `${geoserver}/geoserver/gwc/service/tms/1.0.0/invasives:WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW@EPSG:900913@png/{z}/{x}/{y}.png`,
      {
        opacity: 0.8,
        tms: true
      }
    );
  };

  const getStreams = () => {
    return L.tileLayer.offline(
      `${geoserver}/geoserver/gwc/service/tms/1.0.0/invasives:WHSE_BASEMAPPING.FWA_STREAM_NETWORKS_SP@EPSG:900913@png/{z}/{x}/{y}.png`,
      {
        opacity: 0.8,
        tms: true
      }
    );
  };

  const getWetlands = () => {
    return L.tileLayer.offline(
      `${geoserver}/geoserver/gwc/service/tms/1.0.0/invasives:WHSE_BASEMAPPING.FWA_WETLANDS_POLY@EPSG:900913@png/{z}/{x}/{y}.png`,
      {
        opacity: 0.8,
        tms: true
      }
    );
  };

  const getOwnership = () => {
    return L.tileLayer.offline(
      `${geoserver}/geoserver/gwc/service/tms/1.0.0/invasives:WHSE_TANTALIS.TA_SURFACE_OWNERSHIP_SVW@EPSG:900913@png/{z}/{x}/{y}.png`,
      {
        opacity: 0.4,
        tms: true
      }
    );
  };

  const getRFI = () => {
    return L.tileLayer.offline(
      `${geoserver}/geoserver/gwc/service/tms/1.0.0/invasives:WHSE_IMAGERY_AND_BASE_MAPS.MOT_ROAD_FEATURES_INVNTRY_SP@EPSG:900913@png/{z}/{x}/{y}.png`,
      {
        opacity: 0.8,
        tms: true
      }
    );
  };

  const getRegionalDistricts = () => {
    return L.tileLayer.offline(
      `${geoserver}/geoserver/gwc/service/tms/1.0.0/invasives:WHSE_LEGAL_ADMIN_BOUNDARIES.ABMS_REGIONAL_DISTRICTS_SP@EPSG:900913@png/{z}/{x}/{y}.png`,
      {
        opacity: 0.4,
        tms: true
      }
    );
  };

  const getMunicipalites = () => {
    return L.tileLayer.offline(
      `${geoserver}/geoserver/gwc/service/tms/1.0.0/invasives:WHSE_LEGAL_ADMIN_BOUNDARIES.ABMS_MUNICIPALITIES_SP@EPSG:900913@png/{z}/{x}/{y}.png`,
      {
        opacity: 0.4,
        tms: true
      }
    );
  };

  const getRISO = () => {
    return L.tileLayer.offline(
      `${geoserver}/geoserver/gwc/service/tms/1.0.0/invasives:regional_invasive_species_organization_areas@EPSG:900913@png/{z}/{x}/{y}.png`,
      {
        opacity: 0.6,
        tms: true
      }
    );
  };

  const getAggregate = () => {
    return L.tileLayer.offline(
      `${geoserver}/geoserver/gwc/service/tms/1.0.0/invasives:aggregate_tenures@EPSG:900913@png/{z}/{x}/{y}.png`,
      {
        opacity: 0.8,
        tms: true
      }
    );
  };
  const getIPMA = () => {
    return L.tileLayer.offline(
      `${geoserver}/geoserver/gwc/service/tms/1.0.0/invasives:invasive_plant_management_areas@EPSG:900913@png/{z}/{x}/{y}.png`,
      {
        opacity: 0.6,
        tms: true
      }
    );
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
        featureGroup: drawnItems,
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

  const addLayerControls = (baseLayerControlOptions: any, overlayControlOptions: any) => {
    mapRef.current.addControl(
      L.control.layers(baseLayerControlOptions, overlayControlOptions, { position: 'topleft' })
    );
  };

  const initMap = () => {
    mapRef.current = L.map(props.mapId, { zoomControl: false }).setView([55, -128], 10);

    addContextMenuClickListener();

    addZoomControls();

    addLocateControls();

    if (props.showDrawControls) {
      addDrawControls();
    }

    const esriBaseLayer = getESRIBaseLayer();
    const esriPlacenames = getESRIPlacenames();
    const bcBaseLayer = getBCGovBaseLayer();

    // Set initial base map
    esriBaseLayer.addTo(mapRef.current);

    const basemaps = {
      'Esri Imagery': esriBaseLayer,
      'BC Government': bcBaseLayer
    };

    const nRDistricts = getNRDistricts();
    const wells = getWells();
    const streams = getStreams();
    const wetlands = getWetlands();
    const riso = getRISO();
    const ipma = getIPMA();
    const aggregate = getAggregate();
    const ownership = getOwnership();
    const municipalities = getMunicipalites();
    const regionalDistricts = getRegionalDistricts();
    const rfi = getRFI();

    const overlays = {
      Placenames: esriPlacenames,
      Wells: wells,
      'Gravel Pits': aggregate,
      Streams: streams,
      Wetlands: wetlands,
      Ownership: ownership,
      'Invasive Plant Management Areas': ipma,
      'Regional Invasive Species Organization Areas': riso,
      'Natural Resource Districts': nRDistricts,
      Municipalites: municipalities,
      'Regional Districts': regionalDistricts,
      'Road Features Inventory': rfi
    };

    mapRef.current.addLayer(esriPlacenames);

    addSaveTilesControl(esriBaseLayer);

    addLayerControls(basemaps, overlays);

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
      } else if (feature.layerType === 'rectangle') {
        aGeo = { ...aGeo, properties: { ...aGeo.properties, isRectangle: true } };
      }

      aGeo = convertLineStringToPoly(aGeo);

      // Drawing one geo wipes all others
      props.geometryState.setGeometry([aGeo]);
    });

    const convertLineStringToPoly = (aGeo: any) => {
      if (aGeo.geometry.type === 'LineString') {
        const buffer = prompt('Enter buffer width (total) in meters', '1');
        const buffered = turf.buffer(aGeo.geometry, parseInt(buffer, 10) / 1000, { units: 'kilometers', steps: 1 });
        const result = turf.featureCollection([buffered, aGeo.geometry]);

        return { ...aGeo, geometry: result.features[0].geometry };
      }

      return aGeo;
    };

    mapRef.current.on('draw:editstop', async () => {
      // The current feature isn't passed to this function, so grab it from the acetate layer
      let aGeo = drawnItems?.toGeoJSON()?.features[0];

      // If this is a circle feature... Grab the radius and store in the GeoJSON
      if (drawnItems.getLayers()[0]._mRadius) {
        const radius = drawnItems.getLayers()[0]?.getRadius();
        aGeo = { ...aGeo, properties: { ...aGeo.properties, radius } };
      }

      aGeo = convertLineStringToPoly(aGeo);

      // Save edited feature
      if (aGeo) {
        props.geometryState.setGeometry([aGeo]);
      }
    });

    mapRef.current.on('draw:deleted', () => {
      const aGeo = drawnItems?.toGeoJSON()?.features[0];

      props.geometryState.setGeometry(
        props.geometryState.geometry?.filter((geo) => JSON.stringify(geo) === JSON.stringify(aGeo))
      );
    });
  };

  const updateMapOnGeometryChange = () => {
    // Clear the drawn features
    setDrawnItems(drawnItems.clearLayers());

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
            const content = interactObj.popUpComponent(interactObj.description);
            layer.on('click', () => {
              // Fires on click of single feature
              interactObj.onClickCallback();
              if (feature.geometry.type !== 'Polygon') {
                L.popup()
                  .setLatLng([feature.geometry.coordinates[1], feature.geometry.coordinates[0]])
                  .setContent(content)
                  .openOn(mapRef.current);
              } else {
                // If polygon use the first point as the coordinate for popup
                L.popup()
                  .setLatLng([feature.geometry.coordinates[0][0][1], feature.geometry.coordinates[0][0][0]])
                  .setContent(content)
                  .openOn(mapRef.current);
              }
            });
          }
        });
      });
    }

    // Update the drawn featres
    setDrawnItems(drawnItems);

    // Update the map with the new drawn feaures
    mapRef.current = mapRef.current.addLayer(drawnItems);
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
  }, [props.geometryState.geometry, props?.interactiveGeometryState?.interactiveGeometry]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    if (!props.extentState?.extent) {
      return;
    }

    setMapBounds(props.extentState.extent);
  }, [props.extentState.extent]);

  return (<div id={props.mapId} className={props.classes.map}>
    <div id='feed-me'></div>
    <div id='yum-yum'></div>
  </div>);
};

export default MapContainer;
