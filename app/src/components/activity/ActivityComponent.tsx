import { Accordion, AccordionDetails, AccordionSummary, Button, Typography } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import FormContainer, { IFormContainerProps } from 'components/form/FormContainer';
import MapContainer, { IMapContainerProps } from 'components/map/MapContainer';
import PhotoContainer, { IPhotoContainerProps } from 'components/photo/PhotoContainer';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext, useEffect, useState } from 'react';
import { notifySuccess } from 'utils/NotificationUtils';
import { useCurrentPosition, useWatchPosition } from '@ionic/react-hooks/geolocation';
import * as turf from '@turf/turf';

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
  const { currentPosition } = useCurrentPosition();
  const [workingPolyline, setWorkingPolyline] = useState([]);

  const databaseContext = useContext(DatabaseContext);

  const isGreaterDistanceThan = (from, to, distance) => {
    var fromAsPoint = turf.point(from);
    var toAsPoint = turf.point(to);

    return turf.distance(fromAsPoint, toAsPoint, { units: 'kilometers' }) > distance;
  };

  const startTrack = async () => {
    startWatch();
    notifySuccess(databaseContext, JSON.stringify('Starting track.'));
  };

  const endTrack = async () => {
    // convert poly to polygon
    if (workingPolyline.length > 2) {
      var line = turf.lineString(workingPolyline);
      var polygon = turf.lineToPolygon(line);
      if (window.confirm('Convert track to polygon?')) {
        notifySuccess(databaseContext, JSON.stringify('Made a polygon!!  ' + JSON.stringify(polygon)));
        clearWatch();
      } else {
        notifySuccess(databaseContext, JSON.stringify('Made a polyine!!  ' + JSON.stringify(line)));
        clearWatch();
      }
    } else {
      if (window.confirm("Sure you're done walkin'?  Didn't collect 2 points.")) {
        alert('Cancelled track.');
        clearWatch();
      }
    }
  };

  useEffect(() => {
    if (watchPosition) {
      if (workingPolyline.length == 0) {
        setWorkingPolyline([[watchPosition.coords.longitude.toFixed(6), watchPosition.coords.latitude.toFixed(6)]]);
      } else {
        try
        {
          if (isGreaterDistanceThan(watchPosition.coords.longitude, watchPosition.coords.latitude, 0.001)) {
            setWorkingPolyline([
              ...workingPolyline,
              [watchPosition.coords.longitude.toFixed(6), watchPosition.coords.latitude.toFixed(6)]
            ]);
          }
        }
        catch(e)
        {
          notifySuccess(databaseContext, JSON.stringify('Computer says no...  ' + JSON.stringify(e)));
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
        <AccordionDetails className={props.classes.mapContainer}>
          <Button variant="contained" color="primary" onClick={startTrack}></Button>
          <Button variant="contained" color="secondary" onClick={endTrack}></Button>
          {JSON.stringify(watchPosition)}
          {JSON.stringify(currentPosition)}
          <MapContainer {...props} />
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
