import { Accordion, AccordionDetails, CircularProgress, AccordionSummary, Box, Typography } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import FormContainer, { IFormContainerProps } from 'components/form/FormContainer';
import PhotoContainer, { IPhotoContainerProps } from 'components/photo/PhotoContainer';
import { ActivitySyncStatus, FormValidationStatus } from 'constants/activities';
import { DatabaseContext } from 'contexts/DatabaseContext';
import 'gridfix.css';
import { useDataAccess } from 'hooks/useDataAccess';
import React, { useContext, useEffect, useState } from 'react';
import { sanitizeRecord } from 'utils/addActivity';

export interface IActivityComponentProps extends IFormContainerProps, IPhotoContainerProps {
  classes?: any;
  activity: any;
  linkedActivity?: any;
  customValidation?: any;
  customErrorTransformer?: any;
  pasteFormData?: Function;
  suggestedJurisdictions?: any[];
  copyFormData?: Function;
  cloneActivityButton?: Function;
  setParentFormRef?: Function;
  hideCheckFormForErrors?: boolean;
  isLoading?: boolean;
}

const ActivityComponent: React.FC<IActivityComponentProps> = (props) => {
  const databaseContext = useContext(DatabaseContext);
  const dataAccess = useDataAccess();

  const onSave = async () => {
    try {
      // NOTE: duplicate code from RecordTables.  Should be moved to a common Actions definitions file
      if (
        props.activity.formStatus !== FormValidationStatus.VALID ||
        props.activity.syncStatus === ActivitySyncStatus.SAVE_SUCCESSFUL
      ) {
        return;
      }
      const dbActivity: any = await dataAccess.getActivityById(props.activity.activityId);
      console.dir('dbActivity', dbActivity);
      const result = await dataAccess.updateActivity(
        sanitizeRecord({
          ...dbActivity,
          sync_status: ActivitySyncStatus.SAVE_SUCCESSFUL
        })
      );
      if (!result?.activity_id) console.log('');
      //notifyError(databaseContext, 'Count not save to database.');
      // else window.location.reload();
    } catch (error) {
      //notifyError(databaseContext, 'Could not save to database.  Are you connected to the internet?');
    }
  };

  if (props.isLoading) {
    return <CircularProgress />;
  }

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
              <FormContainer {...{ ...props, activity: props.linkedActivity, isDisabled: true }} />{' '}
            </AccordionDetails>
          </Accordion>
          {props.linkedActivity.photos?.length > 0 && (
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
      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-photo-content" id="panel-photo-header">
          <Typography className={props.classes.heading}>Activity Photos</Typography>
        </AccordionSummary>
        <AccordionDetails className={props.classes.photoContainer}>
          <PhotoContainer {...props} />
        </AccordionDetails>
      </Accordion>
      <FormContainer {...props} onSave={onSave} />
      <Box display="flex" paddingTop={5} justifyContent="center" width="100%"></Box>
    </>
  );
};

export default ActivityComponent;
