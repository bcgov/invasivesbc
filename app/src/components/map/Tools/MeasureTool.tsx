import React, { useState, useEffect, useRef, useContext } from 'react';
import { useMapEvent, GeoJSON, Popup, Marker } from 'react-leaflet';
import { IconButton, Button, makeStyles, Popover, Grid, Typography } from '@material-ui/core';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import utm_zone from './DisplayPosition';
import { polygon, area } from '@turf/turf';
import L from 'leaflet';
import dotMarker from '../Icons/dotMarker.png';
import ruler from '../Icons/ruler.png';
import { ThemeContext } from 'contexts/themeContext';
import { toolStyles } from './Helpers/ToolBtnStyles';

const useStyles = makeStyles((theme) => ({
  typography: {
    paddingLeft: theme.spacing(2),
    fontSize: 16,
    width: 150
  },
  button: {
    display: 'flex',
    justifyContent: 'flex-start',
    width: 150
  }
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

const calc_distance = (lat1: number, lat2: number, lng1: number, lng2: number) => {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const geoJSON_checkDistance = (geometryObj: any, distanceObj: any, locArray: any, isMeasuringDistance: boolean) => {
  if (geometryObj.aGeoJSON == null && locArray[0]) {
    geometryObj.setGeoJSON([
      ...geometryObj.aGeoJSON,
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [locArray[0].lng, locArray[0].lat]
        },
        properties: {
          name: 'Dinagat Islands'
        }
      }
    ]);
  } else if (locArray.length > 1) {
    for (var i = 0; i < locArray.length - 1; i++) {
      if (isMeasuringDistance) {
        geometryObj.setGeoJSON([
          ...geometryObj.aGeoJSON,
          {
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
          }
        ]);
        const distance = calc_distance(
          locArray[i].lat,
          locArray[i + 1].lat,
          locArray[i].lng,
          locArray[i + 1].lng
        ) as any;
        console.log('distance between points: ', distance);
        distanceObj.setTotalDistance(distanceObj.totalDistance + distance);
      }
    }
  }
};

const finishPolygon = (geometryObj: any, polyObj: any, locArray: any) => {
  const tempArr = [];
  for (var i = 0; i < locArray.length; i++) {
    tempArr[i] = [locArray[i].lng, locArray[i].lat];
    if (i === 0) {
      tempArr[locArray.length] = [locArray[i].lng, locArray[i].lat];
    }
  }
  var obj = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [tempArr]
    },
    properties: {
      name: 'Dinagat Islands'
    }
  };
  geometryObj.setGeoJSON([...geometryObj.aGeoJSON, obj]);
  var tempPolygon = polygon([tempArr]);
  polyObj.setPolyArea(area(tempPolygon));
};

const MeasureTool = (props: any) => {
  const classes = useStyles();
  const toolClass = toolStyles();
  const themeContext = useContext(ThemeContext);
  const [isMeasuringDistance, setIsMeasuringDistance] = useState(false);
  const [isMeasuringArea, setIsMeasuringArea] = useState(false);
  const [polyArea, setPolyArea] = useState(0);
  const [aGeoJSON, setGeoJSON] = useState([]);
  const [aKey, setKey] = useState(1);
  const [totalDistance, setTotalDistance] = useState(0);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [locArray, setLocArray] = useState([]);
  const divRef = useRef(null);
  const geometry = { aGeoJSON, setGeoJSON };
  const polyObj = { polyArea, setPolyArea };
  const distance = { totalDistance, setTotalDistance };
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const markerIcon = L.icon({
    iconUrl: dotMarker,
    iconSize: [24, 24]
  });

  // get mouse click location on map
  useMapEvent('click', (e) => {
    const loc = e.latlng;
    //if we're measuring
    if (isMeasuringDistance) {
      setLocArray([...locArray, loc]);
    }
    if (isMeasuringArea) {
      setLocArray([...locArray, loc]);
    }
  });

  useEffect(() => {
    L.DomEvent.disableClickPropagation(divRef.current);
    L.DomEvent.disableScrollPropagation(divRef.current);
  });

  useEffect(() => {
    // need for geoJSON
    setKey(Math.random()); //NOSONAR
  }, [aGeoJSON]);

  // used for measuring distance
  useEffect(() => {
    // we are dropping first point
    geoJSON_checkDistance(geometry, distance, locArray, isMeasuringDistance);
  }, [locArray]);

  function clearMeasure() {
    setPolyArea(0);
    setTotalDistance(0);
    setGeoJSON([]);
    setLocArray([]);
  }
  const toggleMeasureDistance = () => {
    setIsMeasuringArea(false);
    setIsMeasuringDistance(!isMeasuringDistance);
  };
  const toggleMeasureArea = () => {
    setIsMeasuringDistance(false);
    setIsMeasuringArea(!isMeasuringArea);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        ref={divRef}
        className={themeContext.themeType ? toolClass.toolBtnDark : toolClass.toolBtnLight}
        onClick={handleClick}>
        <img className={toolClass.toolImg} src={ruler} />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}>
        <Grid container direction="column">
          <Grid item xs={3}>
            <Button className={classes.button} onClick={toggleMeasureDistance}>
              {isMeasuringDistance ? <RadioButtonCheckedIcon /> : <RadioButtonUncheckedIcon />}
              Distance
            </Button>
          </Grid>

          <Grid item xs={3}>
            {totalDistance !== 0 ? (
              <Typography className={classes.typography}>{totalDistance.toFixed(2)} m</Typography>
            ) : null}
          </Grid>

          <Grid item xs={3}>
            <Button className={classes.button} onClick={toggleMeasureArea}>
              {isMeasuringArea ? <RadioButtonCheckedIcon /> : <RadioButtonUncheckedIcon />}
              Area
            </Button>
          </Grid>

          <Grid item xs={3}>
            {polyArea !== 0 ? (
              <Typography className={classes.typography}>{polyArea.toFixed(2)}m&#178;</Typography>
            ) : null}
          </Grid>

          <Grid item xs={3}>
            {isMeasuringArea ? (
              <Button className={classes.button} onClick={() => finishPolygon(geometry, polyObj, locArray)}>
                Finish Draw
              </Button>
            ) : null}
          </Grid>

          <Grid item xs={3}>
            <Button className={classes.button} onClick={() => clearMeasure()}>
              Clear
            </Button>
          </Grid>
        </Grid>
      </Popover>
      <GeoJSON key={aKey} data={aGeoJSON as any} style={interactiveGeometryStyle}>
        {isMeasuringDistance ? <Popup>{totalDistance.toFixed(1)} meters</Popup> : null}
        {isMeasuringArea ? <Popup>{polyArea.toFixed(2)} meters&#178;</Popup> : null}
      </GeoJSON>

      {isMeasuringArea ? (
        <>
          {locArray.map((item: { lat: any; lng: any }) => (
            <Marker position={[item.lat, item.lng]} icon={markerIcon}></Marker>
          ))}
        </>
      ) : null}
    </>
  );
};

export default MeasureTool;
