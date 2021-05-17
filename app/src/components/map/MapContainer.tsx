import { DatabaseContext } from 'contexts/DatabaseContext';
import { MapContextMenuData } from 'features/home/map/MapContextMenu';
import { Feature } from 'geojson';
import * as L from 'leaflet';
import axios from 'axios';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet.locatecontrol';
import 'leaflet.locatecontrol/dist/L.Control.Locate.css';
import 'leaflet.locatecontrol/dist/L.Control.Locate.mapbox.css';
import 'leaflet.offline';
import 'leaflet/dist/leaflet.css';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { notifySuccess } from 'utils/NotificationUtils';
import Spinner from 'components/spinner/Spinner';
import { interactiveGeoInputData } from './GeoMeta';
import './MapContainer.css';
import * as turf from '@turf/turf';
import { kml } from '@tmcw/togeojson';
import { DocType } from 'constants/database';

export type MapControl = (map: any, ...args: any) => void;

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

  const layerRef = useRef([]);

  const [drawnItems, setDrawnItems] = useState(new L.FeatureGroup());
  const [geoKeys, setGeoKeys] = useState({});

  const [offlineing, setOfflineing] = useState(false);

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
    return L.tileLayer.offline(
      'https://maps.gov.bc.ca/arcgis/rest/services/province/roads_wm/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 24,
        useCache: true,
        cacheMaxAge: 6.048e8 // 1 week
      }
    );
  };

  const getNRDistricts = () => {
    return L.tileLayer.offline(
      `${geoserver}/geoserver/gwc/service/tms/1.0.0/invasives:WHSE_ADMIN_BOUNDARIES.ADM_NR_DISTRICTS_SPG@EPSG:3857@png/{z}/{x}/{y}.png`,
      {
        opacity: 0.8,
        tms: true
      }
    );
  };

  const getMOTIDistricts = () => {
    return L.tileLayer.offline(
      `${geoserver}/geoserver/gwc/service/tms/1.0.0/invasives:WHSE_ADMIN_BOUNDARIES.TADM_MOT_DISTRICT_BNDRY_POLY@EPSG:900913@png/{z}/{x}/{y}.png`,
      {
        opacity: 0.8,
        tms: true
      }
    );
  };

  const getMOTIRegions = () => {
    return L.tileLayer.offline(
      `${geoserver}/geoserver/gwc/service/tms/1.0.0/invasives:WHSE_ADMIN_BOUNDARIES.TADM_MOT_REGIONAL_BNDRY_POLY@EPSG:900913@png/{z}/{x}/{y}.png`,
      {
        opacity: 0.8,
        tms: true
      }
    );
  };

  const getBEC = () => {
    return L.tileLayer.offline(
      `${geoserver}/geoserver/gwc/service/tms/1.0.0/invasives:WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_POLY@EPSG:900913@png/{z}/{x}/{y}.png`,
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

  const getJurisdiction = () => {
    return L.tileLayer.offline(
      `${geoserver}/geoserver/gwc/service/tms/1.0.0/invasives:jurisdiction@EPSG:900913@png/{z}/{x}/{y}.png`,
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

  const getOGMA = () => {
    return L.tileLayer.offline(
      `${geoserver}/geoserver/gwc/service/tms/1.0.0/invasives:WHSE_LAND_USE_PLANNING.RMP_OGMA_LEGAL_CURRENT_SVW@EPSG:900913@png/{z}/{x}/{y}.png`,
      {
        opacity: 0.8,
        tms: true
      }
    );
  };
  const getWHA = () => {
    return L.tileLayer.offline(
      `${geoserver}/geoserver/gwc/service/tms/1.0.0/invasives:WHSE_WILDLIFE_MANAGEMENT.WCP_WILDLIFE_HABITAT_AREA_POLY@EPSG:900913@png/{z}/{x}/{y}.png`,
      {
        opacity: 0.6,
        tms: true
      }
    );
  };

  const getFSW = () => {
    return L.tileLayer.offline(
      `${geoserver}/geoserver/gwc/service/tms/1.0.0/invasives:WHSE_WILDLIFE_MANAGEMENT.WCP_FISH_SENSITIVE_WS_POLY@EPSG:900913@png/{z}/{x}/{y}.png`,
      {
        opacity: 0.6,
        tms: true
      }
    );
  };

  const getIR = () => {
    return L.tileLayer.offline(
      `${geoserver}/geoserver/gwc/service/tms/1.0.0/invasives:WHSE_ADMIN_BOUNDARIES.CLAB_INDIAN_RESERVES@EPSG:900913@png/{z}/{x}/{y}.png`,
      {
        opacity: 0.6,
        tms: true
      }
    );
  };

  const getUWR = () => {
    return L.tileLayer.offline(
      `${geoserver}/geoserver/gwc/service/tms/1.0.0/invasives:WHSE_WILDLIFE_MANAGEMENT.WCP_UNGULATE_WINTER_RANGE_SP@EPSG:900913@png/{z}/{x}/{y}.png`,
      {
        opacity: 0.6,
        tms: true
      }
    );
  };

  const getNationalParks = () => {
    return L.tileLayer.offline(
      `${geoserver}/geoserver/gwc/service/tms/1.0.0/invasives:WHSE_ADMIN_BOUNDARIES.CLAB_NATIONAL_PARKS@EPSG:900913@png/{z}/{x}/{y}.png`,
      {
        opacity: 0.6,
        tms: true
      }
    );
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

  const getSaveControl = (layerToSave: any) => {
    return L.control.savetiles(layerToSave, {
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
    });
  };

  const getSaveControl2 = (layerToSave: any) => {
    return L.control.savetiles(layerToSave, {
      zoomlevels: [13, 14, 15, 16, 17],
      confirm(layer, successCallback) {
        successCallback(true);
        // TODO: Increment counter global variable
        console.log('increment a counter here');
      }
    });
  };

  // const addASaveTilesControl = (layerSaveControl: any) => {
  //   layerSaveControl.remove(mapRef.current);
  //   if (mapRef.current.getZoom() > 13) {
  //     layerSaveControl.addTo(mapRef.current);
  //   }
  // };

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

      mapRef.current.fitBounds([
        [bboxCoords[1], bboxCoords[0]],
        [bboxCoords[3], bboxCoords[2]]
      ]);
    }
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

  const [currentZoom, setCurrentZoom] = useState(null);
  useEffect(() => {
    //custom on-zoom stuff
  }, [currentZoom]);

  const initMap = () => {
    mapRef.current = L.map(props.mapId, { zoomControl: false }).setView([54, -124], 6);

    setCurrentZoom(mapRef.current.getZoom());
    addContextMenuClickListener();
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
    const motiDistricts = getMOTIDistricts();
    const motiRegions = getMOTIRegions();
    const bec = getBEC();
    const wells = getWells();
    const streams = getStreams();
    const wetlands = getWetlands();
    const riso = getRISO();
    const ipma = getIPMA();
    const uwr = getUWR();
    const nationalParks = getNationalParks();
    const aggregate = getAggregate();
    const ownership = getOwnership();
    const municipalities = getMunicipalites();
    const regionalDistricts = getRegionalDistricts();
    const jurisdictions = getJurisdiction();
    const rfi = getRFI();
    const ogma = getOGMA();
    const wha = getWHA();
    const fsw = getFSW();
    const ir = getIR();

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
      'Road Features Inventory': rfi,
      Biogeoclimatic: bec,
      'MOTI Regions': motiRegions,
      'MOTI Districts': motiDistricts,
      Jurisdictions: jurisdictions,
      'Old Growth Management Areas': ogma,
      'Wildlife Habitat Areas': wha,
      'First Nations Reserves': ir,
      'Fisheries Sensitive Watersheds': fsw,
      'Ungulate Winter Range': uwr,
      'National Parks': nationalParks
    };

    // This layer is on by default
    mapRef.current.addLayer(esriPlacenames);

    const esriBaseLayerControl = getSaveControl2(esriBaseLayer);
    esriBaseLayerControl._map = mapRef.current;
    layerRef.current.push(esriBaseLayerControl);

    const bcBaseLayerControl = getSaveControl2(bcBaseLayer);
    bcBaseLayerControl._map = mapRef.current;
    layerRef.current.push(bcBaseLayerControl);

    addLayerControls(basemaps, overlays);
    setMapBounds(mapRef.current.getBounds());

    mapRef.current.on('dragend', () => {
      props.extentState.setExtent(mapRef.current.getBounds());
    });

    mapRef.current.on('zoomend', () => {
      props.extentState.setExtent(mapRef.current.getBounds());
      setCurrentZoom(mapRef.current.getZoom());
      // addASaveTilesControl(esriSaveTilesControl);
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

    const defaultPopup = (feature, layer, interactObj) => {
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
          L.popup().setLatLng(center).setContent(table).openOn(mapRef.current);
        } else {
          L.popup().setLatLng(center).setContent(content).openOn(mapRef.current);
        }

        interactObj.onClickCallback();
      });
    };

    /**
     * ## contextPopup
     * Configure the click and popup behaviour of
     * downloaded context data.
     * General behaviour of listing all attributes
     * in the popup that do not contain null values.
     * @param feature {object} GeoJSON feature
     * @param layer {object} Leaflet layer object
     * @param interactObj  {object} PouchDB data object
     */
    const contextPopup = (feature, layer, interactObj) => {
      const content = interactObj.popUpComponent(interactObj.description);
      layer.on('click', () => {
        // Formulate a table containing all attributes
        let table = '<table><tr><th>Attribute</th><th>Value</th></tr>';
        Object.keys(feature.properties).forEach((f) => {
          if (feature.properties[f]) {
            table += `<tr><td>${f}</td><td>${feature.properties[f]}</td></tr>`;
          }
        });
        table += '</table>';

        const loc = turf.centroid(feature);
        const center = [loc.geometry.coordinates[1], loc.geometry.coordinates[0]];

        L.popup().setLatLng(center).setContent(table).openOn(mapRef.current);
      });
    };

    props?.interactiveGeometryState?.interactiveGeometry?.forEach((interactObj) => {
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
          if (interactObj.recordDocID === 'offline_data') {
            contextPopup(feature, layer, interactObj);
          } else {
            defaultPopup(feature, layer, interactObj);
          }
        }
      });
    });

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
                L.popup().setLatLng(center).setContent(table).openOn(mapRef.current);
              } else {
                L.popup().setLatLng(center).setContent(content).openOn(mapRef.current);
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
        Object.values(newGeoKeys[key].geo._layers).forEach((layer) => {
          drawnItems.addLayer(layer);
        });
      } else if (newGeoKeys[key].updated === false) {
        return;
      } else {
        // remove old keys (delete step)
        Object.values(newGeoKeys[key].geo._layers).forEach((layer) => {
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

    setGeometryMapBounds();
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

  const [dropSpatial, setDropSpatial] = useState(null);

  const dragEnter = (e) => {
    e.preventDefault();
    const type = e?.dataTransfer?.items[0]?.type;
    switch (type) {
      case 'application/vnd.google-earth.kmz':
        setDropSpatial('Sorry... KMZ files are currently not supported. Please unzip and provide the internal KML.');
        break;
      case 'application/vnd.google-earth.kml+xml':
        setDropSpatial('I love to eat KML files');
        break;
      default:
        setDropSpatial(null);
    }
  };

  const dragLeave = (e) => {
    e.preventDefault();
    setDropSpatial(null);
  };

  const addKML = async (file) => {
    setDropSpatial('Yum yum yum');
    const name = file?.name;
    const layerName = name.replace(/\..*/g, '').replace(/[^\w]/g, '_');
    const xml = await file.text().then((xmlstring) => {
      return xmlstring;
    });
    const dom = new DOMParser().parseFromString(xml, 'application/xml');
    const geojson = kml(dom);

    const bbox = turf.bbox(geojson);
    const corner1 = L.latLng(bbox[1], bbox[0]);
    const corner2 = L.latLng(bbox[3], bbox[2]);
    mapRef.current.flyToBounds([corner1, corner2]);

    if (geojson?.features) {
      await databaseContext.database.upsert('spatial_uploads', (spatial) => {
        // Add a special flag to distinguish from other features
        console.log('spatial_uploads', spatial);
        geojson.features.forEach((_, i) => {
          geojson.features[i].properties.uploadedSpatial = true;
        });
        return {
          ...spatial,
          docType: DocType.SPATIAL_UPLOADS,
          geometry: spatial.geometry ? [...geojson.features, ...spatial.geometry] : geojson.features
        };
      });
    }
    setDropSpatial(null);
  };

  const dragDrop = (e) => {
    e.preventDefault();
    setDropSpatial(null);
    const file = e?.dataTransfer?.files[0];
    const type = file?.type;
    const name = file?.name;

    switch (type) {
      case 'application/vnd.google-earth.kmz':
        setDropSpatial('Yuck! KMZs are nasty');
        break;
      case 'application/vnd.google-earth.kml+xml':
        addKML(file);
        break;
      default:
        setDropSpatial(null);
    }
  };

  /* ## dragOver
    This cancels the default behaviour of trying to open
    the file in the browser window.
    @param e {object} Dragging event
   */
  const dragOver = (e) => e.preventDefault();

  const dropZoneVisible = {
    backgroundColor: 'rgba(255,255,255,0.4)',
    fontSize: '2.5rem',
    fontWeight: 800,
    color: 'white',
    zIndex: 10000,
    position: 'absolute',
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '10rem',
    outline: '1rem dashed white',
    outlineOffset: '-6rem'
  } as React.CSSProperties;

  const dropZoneInvisible = {
    display: 'none'
  };

  const storeLayers = async () => {
    setOfflineing(true);
    /**
     * First calculate bounds to draw and store extent of offline data
     */

    // Calculate the extent
    const bounds = mapRef.current.getBounds();
    const x1 = bounds.getWest();
    const y1 = bounds.getSouth();
    const x2 = bounds.getEast();
    const y2 = bounds.getNorth();
    const extent = [x1, y1, x2, y2] as turf.BBox;
    const layers = [
      {
        name: 'Wells',
        schema: 'WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW',
        url: `https://openmaps.gov.bc.ca/geo/pub/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=pub:WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW&outputFormat=json&srsName=epsg:4326&bbox=${extent},epsg:4326`
      },{
        name: 'Jurisdictions',
        schema: 'invasives:jurisdiction',
        url: `${geoserver}/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=invasives:jurisdiction&outputFormat=json&srsName=epsg:4326&bbox=${extent},epsg:4326`
      }
    ];

    layers.forEach(async (layer, index) => {
      const response = await axios(layer.url);

      await databaseContext.database.upsert('offline_data', (spatial) => {
        return {
          docType: DocType.OFFLINE_DATA,
          geometry:
            spatial.geometry?.features?.length > 0
              ? [...spatial.geometry.features, ...response.data.features]
              : response.data.features
        };
      });

      // If it's the last record
      if (index == layers.length - 1) {
        setOfflineing(false);
      }
    });

    return;
    const poly = turf.bboxPolygon(extent);

    // Add a special flag to distinguish from other features
    poly.properties.offlineExtent = true;
    poly.properties.running = true;

    // Save our extent to the database
    // XXX: Currently this over writes the previous element.
    await databaseContext.database.upsert('offline_extent', (spatial) => {
      return {
        docType: DocType.OFFLINE_EXTENT,
        geometry: spatial.geometry ? [poly, ...spatial.geometry] : [poly]
      };
    });

    /**
     * Second cycle through all layers and store tiles
     */
    layerRef.current.forEach((control, index) => {
      setTimeout(() => {
        control._saveTiles();
        if (index === layerRef.current.length - 1) setOfflineing(false);
      }, 1000 * index);
    });
  };

  // Style the download button
  const storeLayersStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    backgroundColor: 'white',
    color: '#464646',
    width: '2.7rem',
    height: '2.7rem',
    top: '148px',
    left: '5px',
    zIndex: 1000,
    borderRadius: '4px',
    cursor: 'pointer'
  } as React.CSSProperties;

  // Style the image inside the download button
  const iconStyle = {
    transform: 'scale(0.7)',
    opacity: '0.7'
  };

  return (
    <div id={props.mapId} className={props.classes.map} onDragEnter={dragEnter} onDragOver={dragOver} onDrop={dragDrop}>
      // The drop zone for uploading files
      <div style={dropSpatial ? dropZoneVisible : dropZoneInvisible} onDragLeave={dragLeave}>
        {' '}
        {dropSpatial}{' '}
      </div>
      {/* The offload layers button*/}
      <div id="offline-layers-button" title="Offline layers" onClick={storeLayers} style={storeLayersStyle}>
        {/* TODO:
          1. Toggle between spinner and image depending on 'thinking' status
          2. Swap image style based on zoom level
        */}
        {offlineing ? <Spinner></Spinner> : <img src="/assets/icon/download.svg" style={iconStyle}></img>}
      </div>
    </div>
  );
};

export default MapContainer;
