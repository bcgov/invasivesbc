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



import {
  ActivityStatus,
} from 'constants/activities'
import { Geolocation } from '@capacitor/core';

interface IMapContainerProps {
  classes?: any;
  activity?: any;
}


const MapContainer: React.FC<IMapContainerProps> = (props) => {

  const databaseContext = useContext(DatabaseContext);

  const [geo, setGeo] = useState(null)

  const [extent, setExtent] = useState(null)

  /* ## saveGeo
    Save the geometry added by the user
    @param doc {object} The activity data object
    @param geoJSON {object} The geometry in GeoJSON format
  */
  const saveGeo = async (doc: any, geoJSON: any) => {
    await databaseContext.database.upsert(doc._id, (activityDoc) => {
      return { ...activityDoc, geometry: [geoJSON], status: ActivityStatus.EDITED, dateUpdated: new Date() };
    });
  };

  useEffect(() => {
    if(props && geo) {
      saveGeo(props.activity, geo)
    }
  },[geo])

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


  useEffect(() => {
    if(props && extent) {
      saveExtent(props.activity, extent)
    }
  },[extent])

  const renderMap = () => {
    console.log('Map componentDidMount!');

    var map = L.map('map', { zoomControl: false }).setView([55, -123], 5);
    // On init setup

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const options = {
      icon: 'bullseye',
      flyTo: true,
      iconElementTag: 'div'
    };

    L.control.locate(options).addTo(map);

    const esriBase = L.tileLayer.offline(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 24,
        maxNativeZoom: 17,
        attribution: '&copy; <a href="https://www.esri.com/en-us/arcgis/products/location-services/services/basemaps">ESRI Basemap</a>'
      }
    ).addTo(map);

    const saveBaseControl = L.control.savetiles(esriBase, {
      zoomlevels: [13,14,15,16,17],
      confirm (layer, succescallback) {
        if (window.confirm(`Save ${layer._tilesforSave.length} tiles`)) {
          succescallback();
        }
      },
      confirmRemoval (layer, succescallback) {
        if (window.confirm('Remove all the stored tiles')) {
          succescallback();
        }
      },
      saveText: '<span title="Save me some basemap">&#128190;</span>',
      rmText: '<span title="Delete all stored basemap tiles">&#128465;</span>'
    }).addTo(map);

    // const esriBase = L.tileLayer(
    //   'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    //   {
    //     maxZoom: 24,
    //     maxNativeZoom: 17
    //   }
    // ).addTo(map);

    const bcBase = L.tileLayer(
      'https://maps.gov.bc.ca/arcgis/rest/services/province/roads_wm/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 24,
        useCache: true,
        cacheMaxAge: 1.72e8 // 48 hours
      }
    );

    var drawnItems = new L.FeatureGroup();

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

    /**************************************
     * Basemap offlining
     */

    const baseLayers = {
      'Esri Imagery': esriBase,
      'BC Government': bcBase
    };

    L.control.layers(baseLayers).addTo(map);

    /*
      Load last feature... If available.
    */
    if(props.activity && props.activity.geometry)
    {
        const style = {
          color: "#ff7800",
          weight: 4,
          opacity: 0.65
        };

        const markerStyle = {
          radius: 10,
          weight: 4,
          stroke: true
        }
 
        L.geoJSON(props.activity.geometry,{
          style: style,
          pointToLayer: (feature: any, latLng: any) => {
            if (feature.properties.radius) {
              return L.circle(latLng,{radius: feature.properties.radius});
            } else {
              return L.circleMarker(latLng,markerStyle);
            }
          },
          onEachFeature: function (_: any,layer: any) {
            drawnItems.addLayer(layer);
          }
        });

    }

    /*
      Move map to previous distination and scale... If available.
    */
    if(props?.activity?.mapExtent) {
      const b = props.activity.mapExtent;
      const bounds = [
        [b._northEast.lat,b._northEast.lng],
        [b._southWest.lat,b._southWest.lng]
      ]
      map.fitBounds(bounds);
    }


    map.on('moveend',() => {
      setExtent(map.getBounds());
    });

    map.on('draw:created', (feature) => {
      let aGeo = feature.layer.toGeoJSON() // convert feature to geojson

      // If a circle... store the radius in the geojson
      if(feature.layerType === 'circle') {
        aGeo = {...aGeo, properties: {...aGeo.properties, radius: feature.layer.getRadius()}};
      }
      setGeo(aGeo) // Save feature
      drawnItems.addLayer(feature.layer); // Add feature to acetate layer
    });

    map.on('draw:drawstart', function () {
      drawnItems.clearLayers(); // Clear previous shape
      setGeo(null)
    });

    map.on('draw:editstop', async function (layerGroup) {
      /*
        The current feature isn't passed to this function
        So grab from the acetate layer
      */ 
      let aGeo = drawnItems?.toGeoJSON()?.features[0];

      // If this is a circle feature... Grab the radius and store in the GeoJSON
      if (drawnItems.getLayers()[0]._mRadius) {
        const radius = drawnItems.getLayers()[0]?.getRadius();
        aGeo = {...aGeo, properties: {...aGeo.properties, radius: radius}};
      }

      if (aGeo) { setGeo(aGeo) } // Save feature
    });

    map.on('draw:deleted', function () {
      console.log('deleted');
      setGeo('{}')
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

  useEffect(() => {
    if (!databaseContext.database) {
      // database not ready
      return;
    }

    renderMap();
  }, [databaseContext]);

  return <div id="map" className={props.classes.map} />;
};

export default MapContainer;
