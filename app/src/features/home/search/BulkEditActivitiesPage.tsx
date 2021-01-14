import React, { useState, useEffect, useCallback } from 'react';
import { Accordion, CircularProgress, AccordionDetails, Box, Button, Container } from '@material-ui/core';
import { Save } from '@material-ui/icons';
import FormContainer from 'components/form/FormContainer';
import { generateActivityPayload } from 'utils/addActivity';
import { ActivitySubtype, ActivityType } from 'constants/activities';
import { ActivityStatus, FormValidationStatus } from 'constants/activities';
import moment from 'moment';
import { IActivity } from 'interfaces/activity-interfaces';
import { debounced } from 'utils/FunctionUtils';

interface IBulkEditActivitiesPage {
  classes?: any;
}

const BulkEditActivitiesPage: React.FC<IBulkEditActivitiesPage> = (props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [activity, setActivity] = useState(null);

  // This list of activity IDs to edit will eventually be passed into this component
  const activitiesToEdit = [
    '73cb57c3-4255-49ce-b983-e5c65ca7c1d4',
    '0dc1ab65-0caa-4511-b3c5-51ca07a46b4a',
    'f0d29d15-56dd-4d45-a9b4-7cf1f9a26321'
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

  console.log(activity);

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <Container className={props.classes.container}>
      <Box mb={3}>
        <Button variant="contained" color="primary" startIcon={<Save />} onClick={() => {}}>
          Bulk Edit Activities
        </Button>
      </Box>

      <Accordion>
        <AccordionDetails className={props.classes.formContainer}>
          <FormContainer
            activity={activity}
            onFormChange={onFormChange}
            onFormSubmitSuccess={onFormSubmitSuccess}
          />
        </AccordionDetails>
      </Accordion>

      <Box mt={3}>
        <Button variant="contained" color="primary" startIcon={<Save />} onClick={() => {}}>
          Bulk Edit Activities
        </Button>
      </Box>
    </Container>
  );
}

export default BulkEditActivitiesPage;
