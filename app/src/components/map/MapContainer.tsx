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
import { kml } from '@tmcw/togeojson';
import { DocType } from 'constants/database';
import { CompassCalibrationOutlined } from '@material-ui/icons';

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
      `${geoserver}/geoserver/gwc/service/tms/1.0.0/invasives:WHSE_ADMIN_BOUNDARIES.ADM_NR_DISTRICTS_SPG@EPSG:900913@png/{z}/{x}/{y}.png`,
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

  /**
   * XXX: Testing of a layer group
   */
  const getTesting = () => {
    return L.tileLayer.offline(
      `${geoserver}/geoserver/gwc/service/tms/1.0.0/testing@EPSG:900913@png/{z}/{x}/{y}.png`,
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

    // addZoomControls();

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
    const aggregate = getAggregate();
    const ownership = getOwnership();
    const municipalities = getMunicipalites();
    const regionalDistricts = getRegionalDistricts();
    const rfi = getRFI();
    const ogma = getOGMA();
    const wha = getWHA();
    const fsw = getFSW();
    const ir = getIR();
    const testing = getTesting();

    const overlays = {
      Placenames: esriPlacenames,
      Wells: wells,
      'Gravel Pits': aggregate,
      'Streams': streams,
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
      'Old Growth Management Areas': ogma,
      'Wildlife Habitat Areas': wha,
      'First Nations Reserves': ir,
      'Fisheries Sensitive Watersheds': fsw,
      'testing group': testing
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

  return (
    <div id={props.mapId} className={props.classes.map} onDragEnter={dragEnter} onDragOver={dragOver} onDrop={dragDrop}>
      <div style={dropSpatial ? dropZoneVisible : dropZoneInvisible} onDragLeave={dragLeave}>
        {' '}
        {dropSpatial}{' '}
      </div>
    </div>
  );
};

export default MapContainer;
