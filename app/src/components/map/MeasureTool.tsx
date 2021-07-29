import React, { useState, useEffect } from 'react';
import { useMapEvent, GeoJSON } from 'react-leaflet';
import { Button } from '@material-ui/core';

const interactiveGeometryStyle = () => {
  return {
    color: '#ff7800',
    weight: 5,
    opacity: 1,
    stroke: true,
    strokeWidth: 10
  };
};

const calc_distance = 
  (lat1: number, lat2: number, lng1: number, lng2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
}

const MeasureTool = (props) => {
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);
  const [aGeoJSON, setGeoJSON] = useState([]);
  const [aKey, setKey] = useState(1);
  var distance = 0;

  const [locArray, setLocArray] = useState([]);
  console.log(locArray);
  console.log('distance',distance);

  // get mouse click location on map
  const map = useMapEvent('click', (e) => {
    const loc = e.latlng;
    //if we're measuring
    if (isMeasuring) {
      setLocArray([...locArray, loc]);
      /*
      // check if start location is null
      if (startLocation == null && locArray[0] != null) {
        // set start location coord
        setStartLocation(locArray[0]);
      }
      // check if end location is null
      if (endLocation == null) {
        // set end location coord
        setEndLocation(loc);
      }*/
      return;
    }
  });

  useEffect(() => {
    // toggle isMeasur if startLocation and endLocation have values
    if (isMeasuring && startLocation && endLocation) {
      toggleMeasure();
    }
  }, [startLocation, endLocation]);

  useEffect(() => {
    // need for geoJSON
    setKey(Math.random());
    //alert(JSON.stringify(aGeoJSON));
  }, [aGeoJSON]);

  useEffect(() => {
    // we are dropping first point
    if (aGeoJSON == null && locArray[0]) {
      setGeoJSON([...aGeoJSON, {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [locArray[0].lng, locArray[0].lat]
        },
        properties: {
          name: 'Dinagat Islands'
        }
      }]);
    }
    if (locArray.length > 1) {
      for (var i = 0; i < locArray.length-1; i++) {
        setGeoJSON([...aGeoJSON, {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [locArray[i].lng, locArray[i].lat],
              [locArray[i+1].lng, locArray[i+1].lat]
            ]
          },
          properties: {
            name: 'Dinagat Islands'
          }
        }]);
        console.log('distance ',calc_distance(locArray[0].lat,locArray[1].lat,locArray[0].lng,locArray[1].lng));
      } 
    }
    /*
    if (aGeoJSON && endLocation) {
      setGeoJSON({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [startLocation.lng, startLocation.lat],
            [endLocation.lng, endLocation.lat]
          ]
        },
        properties: {
          name: 'Dinagat Islands'
        }
      });
    }*/
  }, [locArray]);

  const toggleMeasure = () => {
    //setStartLocation(null);
    //setEndLocation(null);

    //if (isMeasuring) setGeoJSON(null);
    setIsMeasuring(!isMeasuring);
  };

  return (
    <>
      <Button style={{ height: 100, zIndex: 600 }} variant="contained" onClick={toggleMeasure}>
        toggle measuring tool: {JSON.stringify(isMeasuring)}
      </Button>
      <GeoJSON key={aKey} data={aGeoJSON as any} style={interactiveGeometryStyle} />
    </>
  );
};

export default MeasureTool;