import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet.locatecontrol';
import 'leaflet.locatecontrol/dist/L.Control.Locate.css';
import 'leaflet.locatecontrol/dist/L.Control.Locate.mapbox.css';
import './MapContainer.css';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useState, useContext, useEffect } from 'react';

import { ActivityStatus } from 'constants/activities';
import { Geolocation } from '@capacitor/core';

interface IMapContainerProps {
  classes?: any;
  activity?: any;
  kmlAsGeoFeatCollection?: any;
}

//let's try and only let the map get input from props, and write based on them and new shapes drawn
const MapContainer: React.FC<IMapContainerProps> = (props) => {
  const databaseContext = useContext(DatabaseContext);

  const [geo, setGeo] = useState(null);

  const saveGeo = async (doc: any, geoJSON: any) => {
    if (props.activity) {
      await databaseContext.database.upsert(doc._id, (activityDoc) => {
        return { ...activityDoc, geometry: [geoJSON], status: ActivityStatus.EDITED, dateUpdated: new Date() };
      });
    }
  };

  //hook to db persist new user drawn geometries
  useEffect(() => {
    if (props && geo) {
      saveGeo(props.activity, geo);
    }
  }, [geo]);


  const checkIfCircle = (radius: number, xy: [number]) => {
    let aGeo = geo;
    return aGeo;
  };


  // shared between mapSetup and mapUpdate
  let initDrawnItems = new L.FeatureGroup();
  const [drawnItems] = useState(initDrawnItems);

  const mapSetup = (drawnItems: any) => {
    console.log('Map componentDidMount!');

    var map = L.map('map', { zoomControl: false }).setView([55, -128], 10);
    // On init setup

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const options = {
      icon: 'bullseye',
      flyTo: true,
      iconElementTag: 'div'
    };

    L.control.locate(options).addTo(map);

    const esriBase = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 24,
        maxNativeZoom: 17
      }
    );

    const bcBase = L.tileLayer(
      'https://maps.gov.bc.ca/arcgis/rest/services/province/roads_wm/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 24,
        useCache: true,
        cacheMaxAge: 1.72e8 // 48 hours
      }
    ).addTo(map);

    map.addLayer(drawnItems);

    var drawControl = new L.Control.Draw({
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

    map.addControl(drawControl);

    const baseLayers = {
      'Esri Imagery': esriBase,
      'BC Government': bcBase
    };

    L.control.layers(baseLayers).addTo(map);

    map.on('draw:created', (feature) => {
      let aGeo = feature.layer.toGeoJSON();
      if (feature.layerType === 'circle') {
        aGeo = { ...aGeo, properties: { ...aGeo.properties, radius: feature.layer.getRadius() } };
      }
      setGeo(aGeo);
      drawnItems.addLayer(feature.layer);
    });

    map.on('draw:drawstart', function () {
      drawnItems.clearLayers(); // Clear previous shape
      setGeo(null);
    });

    map.on('draw:editstop', async function (layerGroup) {
      const feature = drawnItems?.toGeoJSON()?.features[0];
      if (feature) {
        setGeo(feature);
      }
    });

    map.on('draw:deleted', function () {
      console.log('deleted');
      setGeo('{}');
    });

    /*
    map.on('draw:editstart', function (event) {
      console.log('editstart',event);
    });

    map.on('draw:editmove', function () {
      console.log('editmove');
    });

    map.on('draw:editresize', function () {
      console.log('editresize');
    });

    map.on('draw:editvertex', function () {
      console.log('editvertex');
    });

    map.on('draw:drawvertex', function (layerGroup) {
      console.log('drawvertex',layerGroup);
    });

    map.on('draw:drawstop', function (layerGroup) {
      console.log('stopped');
    });

    map.on('draw:deletestart', function () {
      console.log('deletestart');
    });

    map.on('draw:deletestop', function () {
      console.log('deletestop');
    });
    */
  };

  const mapUpdate = (drawnItems: any) => {
//    drawnItems.clearLayers(); // Clear previous shape
    const featureCollectionsToDraw = [];
    if (props.activity && props.activity.geometry) {
      featureCollectionsToDraw.push(props.activity.geometry);
    }

    if (props.kmlAsGeoFeatCollection) {
      featureCollectionsToDraw.push(props.kmlAsGeoFeatCollection);
    }

    if (featureCollectionsToDraw.length > 0) {
      featureCollectionsToDraw.map((collection) => {
        const style = {
          color: '#ff7800',
          weight: 4,
          opacity: 0.65
        };

        const markerStyle = {
          radius: 10,
          weight: 4,
          stroke: true
        };

        console.dir(collection);

        L.geoJSON(collection, {
          style: style,
          pointToLayer: (feature: any, latLng: any) => {
            if (feature.properties.radius) {
              return L.circle(latLng, { radius: feature.properties.radius });
            } else {
              return L.circleMarker(latLng, markerStyle);
            }
          },
          onEachFeature: function (_: any, layer: any) {
            console.dir(layer);
            drawnItems.addLayer(layer);
          }
        });
      });
    }
  };

  //initial hook to set up leaflet map, the delay on waiting for db avoids a bug where leaflet doesnt
  //resize/render right on first load
  useEffect(() => {
    if (!databaseContext.database) {
      // database not ready
      return;
    }
    mapSetup(drawnItems);
  }, [databaseContext]);

  // the hook to fire if the props change (activity being passed, featurecollection from KML, etc)
  useEffect(() => {
    if (props.kmlAsGeoFeatCollection) {
      mapUpdate(drawnItems);
    }
  }, [props]);

  return <div id="map" className={props.classes.map} />;
};

export default MapContainer;
