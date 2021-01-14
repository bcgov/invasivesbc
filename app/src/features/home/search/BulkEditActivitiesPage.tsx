import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Accordion, CircularProgress, AccordionDetails, Box, Button, Container } from '@material-ui/core';
import { Save } from '@material-ui/icons';
import FormContainer from 'components/form/FormContainer';
import { generateActivityPayload } from 'utils/addActivity';
import { ActivitySubtype, ActivityType } from 'constants/activities';
import { ActivityStatus, FormValidationStatus } from 'constants/activities';
import { IActivity } from 'interfaces/activity-interfaces';
import { debounced } from 'utils/FunctionUtils';
import { getActivityByIdFromApi } from 'utils/getActivity';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import { ICreateOrUpdateActivity } from 'interfaces/useInvasivesApi-interfaces';
import { notifySuccess, notifyError } from 'utils/NotificationUtils';
import { DatabaseContext } from 'contexts/DatabaseContext';

interface IBulkEditActivitiesPage {
  classes?: any;
}

const BulkEditActivitiesPage: React.FC<IBulkEditActivitiesPage> = (props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [activity, setActivity] = useState(null);
  const invasivesApi = useInvasivesApi();
  const databaseContext = useContext(DatabaseContext);

  // This list of activity IDs to edit will eventually be passed into this component
  const activityIdsToEdit = [
    '73cb57c3-4255-49ce-b983-e5c65ca7c1d4',
    'bcb3d181-fe7f-429d-85e8-aa38261ef16d'
  ];

  useEffect(() => {
    const doc: IActivity = generateActivityPayload(
      {},
      null,
      ActivityType.Observation_BulkEdit,
      ActivitySubtype.Observation_PlantTerrestrial_BulkEdit
    );

    setActivity(doc);
    setIsLoading(false);
  }, []);

  /**
   * Bulk edit the activities selected with the newly selected dropdown field values
   */
  const handleBulkEdit = async () => {
    await Promise.all(activityIdsToEdit.map(async (activityId: any) => {
      try {
        const doc = await getActivityByIdFromApi(invasivesApi, activityId);

        const updatedActivityFormData = {
          ...doc.formData,
          activity_data: { ...doc.formData.activity_data, ...activity.formData.activity_data },
          activity_type_data: { ...doc.formData.activity_type_data, ...activity.formData.activity_type_data },
          activity_subtype_data: { ...doc.formData.activity_subtype_data, ...activity.formData.activity_subtype_data }
        };

        const updatedActivity: ICreateOrUpdateActivity = {
          activity_id: doc.activityId,
          created_timestamp: doc.dateCreated,
          activity_type: doc.activityType,
          activity_subtype: doc.activitySubtype,
          geometry: doc.geometry,
          media: doc.photos.map((photo: any) => {
            return { file_name: photo.filepath, encoded_file: photo.dataUrl };
          }),
          form_data: updatedActivityFormData
        };

        await invasivesApi.updateActivity(updatedActivity);
        notifySuccess(databaseContext, `Successfully updated activity ${activityId}.`);
      } catch (error) {
        notifyError(databaseContext, `Failed to update activity ${activityId}.`);
      }
    }));
  };

  /**
   * Save the form whenever it changes.
   *
   * Note: debouncing will prevent this from running more than once per `100` milliseconds.
   *
   * @param {*} event the form change event
   */
  const onFormChange = useCallback(
    debounced(100, (event: any) => {
      return setActivity({
        ...activity,
        formData: event.formData,
        status: ActivityStatus.EDITED,
        dateUpdated: new Date(),
        formStatus: FormValidationStatus.NOT_VALIDATED
      });
    }),
    [activity]
  );

  /**
   * Save the form when it is submitted.
   *
   * Note: this runs after validation has run, and only if there were no errors.
   *
   * @param {*} event the form submit event
   */
  const onFormSubmitSuccess = (event: any, formRef: any) => {
    formRef.setState({ ...formRef.state, schemaValidationErrors: [], schemaValidationErrorSchema: {} }, () => {
      setActivity({
        ...activity,
        formData: event.formData,
        status: ActivityStatus.EDITED,
        dateUpdated: new Date(),
        formStatus: FormValidationStatus.VALID
      });
    });
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <Container className={props.classes.container}>
      <Box mb={3}>
        <Button variant="contained" color="primary" startIcon={<Save />} onClick={handleBulkEdit}>
          Bulk Edit Activities
        </Button>
      </Box>

      <Accordion>
        <AccordionDetails className={props.classes.formContainer}>
          <FormContainer
            activity={activity}
            onFormChange={onFormChange}
            onFormSubmitSuccess={onFormSubmitSuccess}
            hideErrorCheckButton={true}
          />
        </AccordionDetails>
      </Accordion>

      <Box mt={3}>
        <Button variant="contained" color="primary" startIcon={<Save />} onClick={handleBulkEdit}>
          Bulk Edit Activities
        </Button>
      </Box>
    </Container>
  );
}

export default BulkEditActivitiesPage;
