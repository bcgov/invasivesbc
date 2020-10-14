import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet.locatecontrol';
import 'leaflet.locatecontrol/dist/L.Control.Locate.css';
import 'leaflet.locatecontrol/dist/L.Control.Locate.mapbox.css';
import 'leaflet.offline';
import './MapContainer.css';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useState, useContext, useEffect } from 'react';

import { ActivityStatus } from 'constants/activities';
import { Geolocation } from '@capacitor/core';
import { notifySuccess } from 'utils/NotificationUtils';

interface IMapContainerProps {
  classes?: any;
  activity?: any;
  geoFeatCollection?: any;
}

//let's try and only let the map get input from props, and write based on them and new shapes drawn
const MapContainer: React.FC<IMapContainerProps> = (props) => {
  const databaseContext = useContext(DatabaseContext);

  const [geo, setGeo] = useState(null);
  const [extent, setExtent] = useState(null);

  /* ## saveGeo
    Save the geometry added by the user
    @param doc {object} The activity data object
    @param geoJSON {object} The geometry in GeoJSON format
  */
  const saveGeo = async (doc: any, geoJSON: any) => {
    // this is what fixed the main map
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

  /* ## setExtent
    Save the map Extent within the database
    @param doc {object} The activity data object
    @param extent {object} The leaflet bounds object
   */
  const saveExtent = async (doc: any, newExtent: any) => {
    await databaseContext.database.upsert(doc._id, (activityDoc) => {
      return { ...activityDoc, mapExtent: newExtent };
    });
  };

  // shared between mapSetup and mapUpdate
  const [drawnItems] = useState(new L.FeatureGroup());

  useEffect(() => {
    if (props?.activity && extent) {
      saveExtent(props.activity, extent);
    }
  }, [extent]);

  const mapSetup = (drawnItemsInput: any) => {
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

    const esriBase = L.tileLayer
      .offline('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 24,
        maxNativeZoom: 17,
        attribution:
          '&copy; <a href="https://www.esri.com/en-us/arcgis/products/location-services/services/basemaps">ESRI Basemap</a>'
      })
      .addTo(map);

    const saveBaseControl = L.control
      .savetiles(esriBase, {
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
      .addTo(map);

    esriBase.on('saveend', (e) => {
      console.log(`Saved ${e.lengthSaved} tiles`);
    });
    esriBase.on('tilesremoved', () => {
      console.log('Removed all tiles');
    });

    const bcBase = L.tileLayer(
      'https://maps.gov.bc.ca/arcgis/rest/services/province/roads_wm/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 24,
        useCache: true,
        cacheMaxAge: 1.72e8 // 48 hours
      }
    );

    map.addLayer(drawnItemsInput);

    var drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        marker: false,
        circle: true
      },
      edit: {
        featureGroup: drawnItemsInput,
        remove: true,
        edit: true
      }
    });

    map.addControl(drawControl);

    /**************************************
     * Basemap offlining
     */
    const baseLayers = {
      'Esri Imagery': esriBase,
      'BC Government': bcBase
    };

    L.control.layers(baseLayers).addTo(map);

    /*
      Move map to previous distination and scale... If available.
    */
    if (props?.activity?.mapExtent) {
      const b = props.activity.mapExtent;
      const bounds = [
        [b._northEast.lat, b._northEast.lng],
        [b._southWest.lat, b._southWest.lng]
      ];
      map.fitBounds(bounds);
    }

    map.on('moveend', () => {
      setExtent(map.getBounds());
    });
    map.on('draw:created', (feature) => {
      console.log('draw:created');
      let aGeo = feature.layer.toGeoJSON();
      if (feature.layerType === 'circle') {
        aGeo = { ...aGeo, properties: { ...aGeo.properties, radius: feature.layer.getRadius() } };
      }
      setGeo(aGeo);
      drawnItemsInput.addLayer(feature.layer);
    });

    map.on('draw:drawstart', function () {
      console.log('draw:drawstart');
      // this works ok in context of needing one geo, nfg if we need to draw a few different things
      drawnItemsInput.clearLayers(); // Clear previous shape
      setGeo(null);
    });

    map.on('draw:editstop', async function (layerGroup) {
      console.log('draw edit stop');
      /*
        The current feature isn't passed to this function
        So grab it from the acetate layer
      */
      let aGeo = drawnItemsInput?.toGeoJSON()?.features[0];

      // If this is a circle feature... Grab the radius and store in the GeoJSON
      if (drawnItemsInput.getLayers()[0]._mRadius) {
        const radius = drawnItemsInput.getLayers()[0]?.getRadius();
        aGeo = { ...aGeo, properties: { ...aGeo.properties, radius: radius } };
      }

      // Save feature
      if (aGeo) {
        setGeo(aGeo);
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

  const mapUpdate = (drawnItemsInput: any) => {
    console.log('map update');
    //    drawnItemsInput.clearLayers(); // Clear previous shape
    const featureCollectionsToDraw = [];
    if (props.activity && props.activity.geometry) {
      console.log('is there a geom for this activity');
      featureCollectionsToDraw.push(props.activity.geometry);
    }

    if (props.geoFeatCollection) {
      featureCollectionsToDraw.push(props.geoFeatCollection);
    }

    if (featureCollectionsToDraw.length > 0) {
      featureCollectionsToDraw.forEach((collection) => {
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
            drawnItemsInput.addLayer(layer);
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
    if (props.geoFeatCollection || props.activity?.geometry) {
      console.log('props changed');
      mapUpdate(drawnItems);
    }
  }, [props]);

  return <div id="map" className={props.classes.map} />;
};

export default MapContainer;
