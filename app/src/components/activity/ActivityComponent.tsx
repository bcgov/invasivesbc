import { Accordion, AccordionDetails, AccordionSummary, Button, Grid, Typography } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import FormContainer, { IFormContainerProps } from 'components/form/FormContainer';
import MapContainer2, { IMapContainerProps } from 'components/map/MapContainer2';
import PhotoContainer, { IPhotoContainerProps } from 'components/photo/PhotoContainer';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext, useEffect, useState } from 'react';
import { notifySuccess } from 'utils/NotificationUtils';
import { useCurrentPosition, useWatchPosition } from '@ionic/react-hooks/geolocation';
import * as turf from '@turf/turf';
import { Feature } from 'geojson';
import { Capacitor } from '@capacitor/core';

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
  const { currentPosition: watchPosition, startWatch, clearWatch } = useWatchPosition();
  const { getPosition } = useCurrentPosition();
  const [workingPolyline, setWorkingPolyline] = useState([]);
  const databaseContext = useContext(DatabaseContext);

  useEffect(() => {
    if (Capacitor.getPlatform() != 'web') {
      getPosition();
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
    startWatch({ enableHighAccuracy: true });
    notifySuccess(databaseContext, JSON.stringify('Starting track.'));
  };

  const endTrack = async () => {
    // convert poly to polygon
    if (workingPolyline.length >= 4) {
      var line = turf.lineString(workingPolyline);
      var polygon = turf.lineToPolygon(line);
      if (window.confirm('Convert track to polygon?')) {
        props.geometryState.setGeometry([polygon as any]);
        notifySuccess(databaseContext, JSON.stringify('Made a polygon!!  '));
        clearWatch();
      } else {
        notifySuccess(databaseContext, JSON.stringify('Made a polyine!!  '));
        clearWatch();
      }
    } else {
      if (window.confirm("Sure you're done walkin'?  Didn't collect 4 points.")) {
        alert('Cancelled track.');
        clearWatch();
      }
    }
  };

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
              <FormContainer {...{ ...props, activity: props.linkedActivity, isDisabled: true }} />
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
          <Grid xs={12} alignItems="flex-start" container>
            <Grid xs={2} item>
              <Button variant="contained" color="primary" onClick={startTrack}>
                Record a Polygon!
              </Button>
            </Grid>
            <Grid xs={2} item>
              <Button disabled={true} variant="contained" color="primary" onClick={startTrack}>
                Record Buffered Line!
              </Button>
            </Grid>
            <Grid xs={2} item>
              <Button variant="contained" color="secondary" onClick={endTrack}>
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
    </>
  );
};

export default ActivityComponent;
