import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Grid, Typography } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import FormContainer, { IFormContainerProps } from 'components/form/FormContainer';
import MapContainer, { IMapContainerProps } from 'components/map/MapContainer2';
import PhotoContainer, { IPhotoContainerProps } from 'components/photo/PhotoContainer';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext, useEffect, useState } from 'react';
import { notifySuccess } from 'utils/NotificationUtils';
import { Geolocation } from '@capacitor/geolocation';
//import { useCurrentPosition, useWatchPosition } from '@ionic/react-hooks/geolocation';
import * as turf from '@turf/turf';
import { Feature } from 'geojson';
import MapContainer2 from 'components/map/MapContainer2';
import { useHistory } from 'react-router-dom';

export interface IActivityComponentProps extends IMapContainerProps, IFormContainerProps, IPhotoContainerProps {
  classes?: any;
  activity: any;
  linkedActivity?: any;
  customValidation?: any;
  customErrorTransformer?: any;
  pasteFormData?: Function;
  copyFormData?: Function;
  cloneActivityButton?: Function;
  setParentFormRef?: Function;
  hideCheckFormForErrors?: boolean;
}

const ActivityComponent: React.FC<IActivityComponentProps> = (props) => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const watchPosition = Geolocation.watchPosition;
  const startWatch = watchPosition;
  const clearWatch = Geolocation.clearWatch;
  const [workingPolyline, setWorkingPolyline] = useState([]);
  const databaseContext = useContext(DatabaseContext);

  const getLocation = async () => {
    const position = await Geolocation.getCurrentPosition();
    setCurrentPosition(position);
  };

  useEffect(() => {
    try {
      // getPosition();
    } catch (e) {
      console.log('unable to get position');
    }
  }, []);

  const isGreaterDistanceThan = (from, to, distance) => {
    let returnVal = null;
    try {
      var fromAsPoint = turf.point(from);
      var toAsPoint = turf.point(to);

      returnVal = turf.distance(fromAsPoint, toAsPoint, { units: 'kilometers' }) > distance;
    } catch (e) {
      console.dir(e);
    }
    return returnVal;
  };

  const startTrack = async () => {
    try {
      //  startWatch({ enableHighAccuracy: true });
    } catch (e) {
      console.log('unable to start watch');
    }
    notifySuccess(databaseContext, JSON.stringify('Starting track.'));
  };

  const endTrack = async () => {
    try {
      // convert poly to polygon
      if (workingPolyline.length >= 4) {
        var line = turf.lineString(workingPolyline);
        var polygon = turf.lineToPolygon(line);
        if (window.confirm('Convert track to polygon?')) {
          props.geometryState.setGeometry([polygon as any]);
          notifySuccess(databaseContext, JSON.stringify('Made a polygon!!  '));
          // clearWatch();
        } else {
          notifySuccess(databaseContext, JSON.stringify('Made a polyine!!  '));
          /// clearWatch();
        }
      } else {
        if (window.confirm("Sure you're done walkin'?  Didn't collect 4 points.")) {
          alert('Cancelled track.');
          //  clearWatch();
        }
      }
    } catch (e) {
      console.log('error stopping track');
    }
  };

  /*
  useEffect(() => {
    if (watchPosition) {
      if (workingPolyline.length == 0) {
        let newPolyline = [[watchPosition.coords.longitude, watchPosition.coords.latitude]];
        setWorkingPolyline(newPolyline);

        const userTrack: Feature = JSON.parse(
          `
          {
            "type": "Feature",
            "geometry": {
              "type": "LineString",
              "coordinates": ` +
            JSON.stringify(newPolyline) +
            `
            },
            "properties": {
            }
          }
          `
        );

        props.geometryState.setGeometry([userTrack as any]);
      } else {
        try {
          if (
            isGreaterDistanceThan(
              [watchPosition.coords.longitude, watchPosition.coords.latitude],
              workingPolyline[workingPolyline.length - 1],
              0.001
            )
          ) {
            setWorkingPolyline([...workingPolyline, [watchPosition.coords.longitude, watchPosition.coords.latitude]]);

            const userTrack = JSON.parse(
              `
          {
            "type": "Feature",
            "geometry": {
              "type": "LineString",
              "coordinates": ` +
                JSON.stringify(workingPolyline) +
                `
            },
            "properties": {
            }
          }
          `
            );
            props.geometryState.setGeometry([userTrack as any]);
          }
        } catch (e) {
          notifySuccess(databaseContext, JSON.stringify('Computer says no.  ' + JSON.stringify(e)));
        }
      }
    }
  }, [watchPosition]);
  */

  const history = useHistory();
  return (
    <>
      {props.cloneActivityButton && props.cloneActivityButton()}

      {/* Display the linked activity record information alongside the actual activity record */}
      {props.linkedActivity && (
        <>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-form-content" id="panel-form-header">
              <Typography className={props.classes.heading}>Linked Activity Form</Typography>
            </AccordionSummary>
            <AccordionDetails className={props.classes.formContainer}>
              <>{/*  <FormContainer {...{ ...props, activity: props.linkedActivity, isDisabled: true }} /> */}</>
            </AccordionDetails>
          </Accordion>
          {props.linkedActivity.photos.length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-photo-content" id="panel-photo-header">
                <Typography className={props.classes.heading}>Linked Activity Photos</Typography>
              </AccordionSummary>
              <AccordionDetails className={props.classes.photoContainer}>
                <PhotoContainer {...{ ...props, activity: props.linkedActivity, isDisabled: true }} />
              </AccordionDetails>
            </Accordion>
          )}
        </>
      )}

      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-map-content" id="panel-map-header">
          <Typography className={props.classes.heading}>Map</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid alignItems="flex-start" container>
            <Grid xs={2} item>
              <Button disabled={true} variant="contained" color="primary" onClick={startTrack}>
                Record a Polygon!
              </Button>
            </Grid>
            <Grid xs={2} item>
              <Button disabled={true} variant="contained" color="primary" onClick={startTrack}>
                Record Buffered Line!
              </Button>
            </Grid>
            <Grid xs={2} item>
              <Button disabled={true} variant="contained" color="secondary" onClick={endTrack}>
                End Track Recording
              </Button>
            </Grid>
            <Grid xs={12} className={props.classes.mapContainer} item>
              <MapContainer2 {...props} />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-form-content" id="panel-form-header">
          <Typography className={props.classes.heading}>Activity Form</Typography>
        </AccordionSummary>
        <AccordionDetails className={props.classes.formContainer}>
          <FormContainer {...props} />
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-photo-content" id="panel-photo-header">
          <Typography className={props.classes.heading}>Activity Photos</Typography>
        </AccordionSummary>
        <AccordionDetails className={props.classes.photoContainer}>
          <PhotoContainer {...props} />
        </AccordionDetails>
      </Accordion>
      <Box display="flex" paddingTop={5} justifyContent="center" width="100%">
        <Button
          color="primary"
          style={{ width: 200, height: 100 }}
          variant="contained"
          onClick={() => history.push('/home/activities')}>
          I'm done here
        </Button>
      </Box>
    </>
  );
};

export default ActivityComponent;
