import React, { useState, useEffect, useRef } from 'react';
import { useMapEvent, GeoJSON, Popup, Marker, useMapEvents } from 'react-leaflet';
import { IconButton, Button, makeStyles, Popover, Typography } from '@material-ui/core';
import L from 'leaflet';
import dotMarker from './Icons/dotMarker.png';
import ruler from './Icons/ruler.png';

const useStyles = makeStyles((theme) => ({
  image: {
    height: 24,
    width: 24
  },
  rulerButton: {
    margin: '5px',
    background: 'white',
    zIndex: 1500,
    height: '48px', width: '48px',
    borderRadius: '4px',
    "&:hover": {
      background: 'white'
    }
  },
  typography: {
    padding: theme.spacing(2),
  },
}));

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
    const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

const MeasureTool = (props) => {
  const classes = useStyles();
  const [isMeasuringDistance, setIsMeasuringDistance] = useState(false);
  const [isMeasuringArea, setIsMeasuringArea] = useState(false);
  const [aGeoJSON, setGeoJSON] = useState([]);
  var polyJSON = {};
  const [aKey, setKey] = useState(1);
  const [totalDistance, setTotalDistance] = useState(0);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const [locArray, setLocArray] = useState([]);

  const markerIcon = L.icon({
    iconUrl: dotMarker,

    iconSize: [24, 24]
  })

  const divRef = useRef(null);

  useEffect(() => {
    L.DomEvent.disableClickPropagation(divRef.current);
    L.DomEvent.disableScrollPropagation(divRef.current);
  });

  // get mouse click location on map
  const map = useMapEvent('click', (e) => {
    const loc = e.latlng;
    //if we're measuring
    if (isMeasuringDistance) {
      setLocArray([...locArray, loc]);
      return;
    }
    if (isMeasuringArea) {
      setLocArray([...locArray, loc]);
      return
    }
  });

  useEffect(() => {
    // need for geoJSON
    setKey(Math.random());
  }, [aGeoJSON]);

  // used for measuring distance
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
    } else if (locArray.length > 1) {
      for (var i = 0; i < locArray.length - 1; i++) {
        if (isMeasuringDistance) {
          setGeoJSON([...aGeoJSON, {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [
                [locArray[i].lng, locArray[i].lat],
                [locArray[i + 1].lng, locArray[i + 1].lat]
              ]
            },
            properties: {
              name: 'Dinagat Islands'
            }
          }]);
          const distance = calc_distance(locArray[i].lat, locArray[i + 1].lat, locArray[i].lng, locArray[i + 1].lng) as any;
          console.log('distance between points: ', distance);
          setTotalDistance(totalDistance + distance);
        }
      }
    }
  }, [locArray]);

  const toggleMeasureDistance = () => {
    //setStartLocation(null);
    //setEndLocation(null);

    //if (isMeasuring) setGeoJSON(null);
    setIsMeasuringArea(false);
    setIsMeasuringDistance(!isMeasuringDistance);
  };
  const toggleMeasureArea = () => {
    setIsMeasuringDistance(false);
    setIsMeasuringArea(!isMeasuringArea);
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <>
      <IconButton ref={divRef} className={classes.rulerButton} onClick={handleClick}>
        <img className={classes.image} src={ruler} />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Button onClick={toggleMeasureDistance}>Measure Distance:
          {isMeasuringDistance
            ? (<Typography>Enabled</Typography>)
            : (<Typography>Disabled</Typography>)}
        </Button>
        <Button onClick={toggleMeasureArea}>Measure Area:
          {isMeasuringArea
            ? (<Typography>Enabled</Typography>)
            : (<Typography>Disabled</Typography>)}
        </Button>
        {isMeasuringArea ? <Button onClick={() => {
          const tempArr = [];
          for (var i = 0; i < locArray.length; i++) {
            tempArr[i] = [locArray[i].lng, locArray[i].lat];
            if (i === 0) {
              tempArr[locArray.length] = [locArray[i].lng, locArray[i].lat];
            }
          };
          console.log(tempArr);
          var obj = {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [
                tempArr
              ]
            },
            properties: {
              name: 'Dinagat Islands'
            }
          };
          console.log(JSON.stringify(obj));
          setGeoJSON([...aGeoJSON, obj]);
        }}>Finish Polymeasure</Button> : null}
        <br />
        <Button onClick={() => {
          setGeoJSON([]);
          setLocArray([]);
        }}>Clear Measurements</Button>
      </Popover>
      <GeoJSON key={aKey} data={aGeoJSON as any} style={interactiveGeometryStyle}>
        <Popup>{totalDistance.toFixed(1)} meters</Popup>
      </GeoJSON>

      {locArray.map((item: { lat: any; lng: any }) => (
        <Marker position={[item.lat, item.lng]} icon={markerIcon}></Marker>
      ))}

    </>
  );
};

export default MeasureTool;