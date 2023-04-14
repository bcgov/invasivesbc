import { Accordion, AccordionDetails, Box, Button, CircularProgress, Container } from '@mui/material';
import { Save } from '@mui/icons-material';
import FormContainer from 'components/form/FormContainer';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import { useQuery } from 'hooks/useQuery';
import { IActivity } from 'interfaces/activity-interfaces';
import React, { useEffect, useState } from 'react';
import { getJurisdictionPercentValidator } from 'rjsf/business-rules/customValidation';
import { populateTransectLineAndPointData } from 'rjsf/business-rules/populateCalculatedFields';
import { generateActivityPayload } from 'utils/addActivity';
import { getActivityByIdFromApi, getICreateOrUpdateActivity } from 'utils/getActivity';
import { ActivityStatus, ActivitySubtype, ActivityType, FormValidationStatus } from 'sharedAPI';

interface IBulkEditActivitiesPage {
  isAlreadySubmitted?: boolean;
  classes?: any;
}

const BulkEditActivitiesPage: React.FC<IBulkEditActivitiesPage> = (props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [activity, setActivity] = useState(null);
  const invasivesApi = useInvasivesApi();
  const queryParams = useQuery();

  const [parentFormRef, setParentFormRef] = useState(null);

  const activityIdsToEdit = queryParams.activities ? queryParams.activities.split(',') : [];

  useEffect(() => {
    /*
      Identify the activity type and subtype from the activities selected for bulk edit
      Generate an empty bulk edit version of the corresponding activity for editing purposes
    */
    const setupActivityDataToEdit = async () => {
      const { activityType, activitySubtype } = await getActivityByIdFromApi(invasivesApi, activityIdsToEdit[0]);
      const editActivityType = `${activityType}_BulkEdit` as ActivityType;
      const editActivitySubtype = `${activitySubtype}_BulkEdit` as ActivitySubtype;
      const doc: IActivity = generateActivityPayload({}, null, editActivityType, editActivitySubtype);

      setActivity(doc);
      setIsLoading(false);
    };

    setupActivityDataToEdit();
  }, [activityIdsToEdit, invasivesApi]);

  /*
    Function that runs if the form submit fails and has errors
  */
  const onFormSubmitError = () => {};

  /**
   * Save the form when it is submitted.
   * Bulk edit the activities selected with the newly selected dropdown field values.
   *
   * @param {*} event the form submit event
   */
  const onFormSubmitSuccess = async (event: any) => {
    await Promise.all(
      activityIdsToEdit.map(async (activityId: any) => {
        try {
          const doc = await getActivityByIdFromApi(invasivesApi, activityId);

          const updatedActivityFormData = {
            ...doc.formData,
            activity_data: { ...doc.formData.activity_data, ...event.formData.activity_data },
            activity_type_data: { ...doc.formData.activity_type_data, ...event.formData.activity_type_data },
            activity_subtype_data: { ...doc.formData.activity_subtype_data, ...event.formData.activity_subtype_data }
          };

          await invasivesApi.updateActivity(getICreateOrUpdateActivity(doc, updatedActivityFormData));
        } catch (error) {}
      })
    );
  };

  /**
   * Save the form whenever it changes.
   *
   * Note: debouncing will prevent this from running more than once per `100` milliseconds.
   *
   * @param {*} event the form change event
   */
  const onFormChange = (event: any) => {
    let updatedActivitySubtypeData = { ...event.formData.activity_subtype_data };
    updatedActivitySubtypeData = populateTransectLineAndPointData(updatedActivitySubtypeData);

    return setActivity({
      ...activity,
      formData: { ...event.formData, activity_subtype_data: updatedActivitySubtypeData },
      status: ActivityStatus.DRAFT,
      dateUpdated: new Date(),
      formStatus: FormValidationStatus.NOT_VALIDATED
    });
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <Container className={props.classes.container}>
      <Box mb={3}>
        <Button variant="contained" color="primary" startIcon={<Save />} onClick={() => parentFormRef?.submit()}>
          Bulk Edit Activities
        </Button>
      </Box>

      <Accordion>
        <AccordionDetails className={props.classes.formContainer}>
          <FormContainer
            canBeSubmittedWithoutErrors={() => false}
            isAlreadySubmitted={() => false}
            activity={activity}
            onFormChange={onFormChange}
            onFormSubmitSuccess={onFormSubmitSuccess}
            customValidation={getCustomValidator([getJurisdictionPercentValidator()])}
            setParentFormRef={setParentFormRef}
            onFormSubmitError={onFormSubmitError}
            hideCheckFormForErrors={true}
          />
        </AccordionDetails>
      </Accordion>

      <Box mt={3}>
        <Button variant="contained" color="primary" startIcon={<Save />} onClick={() => parentFormRef?.submit()}>
          Bulk Edit Activities
        </Button>
      </Box>
    </Container>
  );
};

export default BulkEditActivitiesPage;
