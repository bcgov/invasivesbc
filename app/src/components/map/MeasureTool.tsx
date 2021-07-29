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

const MeasureTool = (props) => {
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);
  const [aGeoJSON, setGeoJSON] = useState(null);
  const [aKey, setKey] = useState(1);

  // get mouse click location on map
  const map = useMapEvent('click', (e) => {
    const loc = e.latlng;
    //if we're measuring
    if (isMeasuring) {
      // check if start location is null
      if (startLocation == null) {
        // set start location coord
        setStartLocation(loc);
        return;
      }
      // check if end location is null
      if (endLocation == null) {
        // set end location coord
        setEndLocation(loc);
      }
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
    if (aGeoJSON == null && startLocation) {
      setGeoJSON({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [startLocation.lng, startLocation.lat]
        },
        properties: {
          name: 'Dinagat Islands'
        }
      });
    }
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
    }
  }, [startLocation, endLocation]);

  const toggleMeasure = () => {
    setStartLocation(null);
    setEndLocation(null);

    //if (isMeasuring) setGeoJSON(null);
    setIsMeasuring(!isMeasuring);
  };

  return (
    <>
      <Button style={{ height: 100, zIndex: 600 }} variant="contained" onClick={toggleMeasure}>
        toggle measuring tool: {JSON.stringify(isMeasuring)}
      </Button>
      <GeoJSON key={aKey} data={aGeoJSON} style={interactiveGeometryStyle} />
    </>
  );
};

export default MeasureTool;