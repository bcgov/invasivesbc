import { Accordion, AccordionDetails, AccordionSummary, Typography, Button, Box } from '@material-ui/core';
import { ExpandMore, FileCopy } from '@material-ui/icons';
import { DocType } from 'constants/database';
import { DatabaseContext } from 'contexts/DatabaseContext';
import FormContainer, { IFormContainerProps } from 'components/form/FormContainer';
import MapContainer, { IMapContainerProps } from 'components/map/MapContainer';
import PhotoContainer, { IPhotoContainerProps } from 'components/photo/PhotoContainer';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { addActivityToDB } from 'utils/addActivity';
import { notifySuccess } from 'utils/NotificationUtils';

export interface IActivityComponentProps extends IMapContainerProps, IFormContainerProps, IPhotoContainerProps {
  classes?: any;
  activity: any;
  customValidation?: any;
  pasteFormData?: Function;
  copyFormData?: Function;
}

const ActivityComponent: React.FC<IActivityComponentProps> = (props) => {
  const databaseContext = useContext(DatabaseContext);
  const [linkedActivityProps, setLinkedActivityProps] = useState(null);
  const history = useHistory();

  useEffect(() => {
    const getActivityData = async () => {
      const appStateResults = await databaseContext.database.find({ selector: { _id: DocType.APPSTATE } });

      if (!appStateResults || !appStateResults.docs || !appStateResults.docs.length) {
        return;
      }

      const activityResults = await databaseContext.database.find({
        selector: { _id: props.activity.formData.activity_type_data.activity_id }
      });

      setLinkedActivityProps({ ...props, activity: activityResults.docs[0], isDisabled: true });
    };

    if (props.activity.activityType === 'Monitoring') {
      getActivityData();
    }
  }, [databaseContext, props]);

  const setActiveActivityAndNavigateToActivityPage = async (doc: any) => {
    await databaseContext.database.upsert(DocType.APPSTATE, (appStateDoc) => {
      return { ...appStateDoc, activeActivity: doc._id };
    });

    history.push(`/home/activity`);
  };

  return (
    <>
      <Box mb={3} display="flex" flexDirection="row-reverse">
        <Button
          variant="contained"
          color="primary"
          startIcon={<FileCopy />}
          onClick={async () => {
            const addedActivity = await addActivityToDB(
              databaseContext,
              props.activity.activityType,
              props.activity.activitySubtype,
              linkedActivityProps && linkedActivityProps.activity || null,
              props.activity
            );
            setActiveActivityAndNavigateToActivityPage(addedActivity);
            notifySuccess(databaseContext, 'Successfully cloned activity.');
          }}>
          Clone Activity
        </Button>
      </Box>

      {/* Display the linked activity record information alongside the actual activity record */}
      {linkedActivityProps && (
        <>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-form-content" id="panel-form-header">
              <Typography className={linkedActivityProps.classes.heading}>Linked Activity Form</Typography>
            </AccordionSummary>
            <AccordionDetails className={linkedActivityProps.classes.formContainer}>
              <FormContainer {...linkedActivityProps} />
            </AccordionDetails>
          </Accordion>
          {linkedActivityProps.activity.photos.length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-photo-content" id="panel-photo-header">
                <Typography className={linkedActivityProps.classes.heading}>Linked Activity Photos</Typography>
              </AccordionSummary>
              <AccordionDetails className={linkedActivityProps.classes.photoContainer}>
                <PhotoContainer {...linkedActivityProps} />
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
