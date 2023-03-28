import { Box, Button, Container, FormControl, InputLabel, MenuItem, Select, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StepperComponent from 'components/activity/StepperComponent';
import ActivityPage from 'features/home/activity/ActivityPage';
import { useDataAccess } from 'hooks/useDataAccess';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { createLinkedActivity } from 'utils/addActivity';
import { ActivitySubtype, ActivityType } from 'sharedAPI';

const useStyles = makeStyles((theme: Theme) => ({
  heading: {
    fontSize: theme.typography.pxToRem(18),
    fontWeight: theme.typography.fontWeightRegular
  },
  mapContainer: {
    height: '600px'
  },
  map: {
    height: '100%',
    width: '100%',
    zIndex: 0
  }
}));

interface IObservationCreationStepperPage {
  classes?: any;
}

/*
  Text for background info/steps to follow at each of the given workflow stages
*/
const getStepContent = (step: number) => {
  switch (step) {
    case 0:
      return 'Please create your observation.';
    case 1:
      return `Thank you for specifying information regarding your observation activity.
              If you wish to you may create a treatment activity associated to this observation.`;
  }
};

const ObservationCreationStepperPage: React.FC<IObservationCreationStepperPage> = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const dataAccess = useDataAccess();
  /*
    This is temporarily defaulted to a plant treatment type because animal forms are not yet complete
  */
  const [treatmentSubtypeToCreate, setTreatmentSubtypeToCreate] = useState(ActivitySubtype.Treatment_ChemicalPlant);
  const [activeStep, setActiveStep] = useState(0);
  const [observation, setObservation] = useState(null);
  const [observationSubtype, setObservationSubtype] = useState(null);
  const [parentFormRef, setParentFormRef] = useState(null);
  const [formHasErrors, setFormHasErrors] = useState(true);

  // Define the steps of the workflow
  const steps = ['Create Observation', 'Create Optional Treatment'];

  /*
    On intial render, get the observation record we are dealing with and store it in state
  */
  // useEffect(() => {
  //   const getObservation = async () => {
  //     //const activity = await databaseContext.database.get(selectedObservationId);
  //     //   setObservationSubtype(activity.activitySubtype);
  //     //   setObservation(activity);
  //   };

  //   if (!observation) {
  //     getObservation();
  //   }
  // }, []);

  useEffect(() => {
    if (!formHasErrors) {
      setActiveStep((prev) => prev + 1);
    }
  }, [formHasErrors]);

  /*
    When we have completed the workflow and wish to create the treatment record,
    set the active activity to the treatment record we are going to be creating and navigate
    to the treatment activity page
  */
  const setActiveActivityAndNavigate = async (doc: any) => {
    alert("we shouldn't be here");
    // await databaseContext.database.upsert(DocType.APPSTATE, (appStateDoc) => {
    //  return { ...appStateDoc, activeActivity: doc._id };
    //});

    history.push(`/home/activity`);
  };

  /*
    When a treatment type is selected, store it in state for later use
  */
  const handleTreatmentSubtypeClick = async (event: any) => {
    event.stopPropagation();

    const dropdownValue = event.target.value === 0 ? ActivitySubtype.Treatment_ChemicalPlant : event.target.value;
    setTreatmentSubtypeToCreate(dropdownValue);
  };

  return (
    <Container className={props.classes.container}>
      <StepperComponent activeStep={activeStep} steps={steps} stepContent={getStepContent(activeStep)} />

      <Box>
        {activeStep === 0 && observation && (
          <>
            <ActivityPage
              classes={classes}
              activityId={observation._id}
              setObservation={setObservation}
              setFormHasErrors={setFormHasErrors}
              setParentFormRef={setParentFormRef}
            />
            <Box mt={5} display="flex" justifyContent="center">
              <Button
                size="large"
                variant="contained"
                color="primary"
                onClick={() => {
                  if (formHasErrors) {
                    parentFormRef?.submit();
                  } else {
                    setActiveStep(activeStep + 1);
                  }
                }}>
                Continue
              </Button>
            </Box>
          </>
        )}

        {activeStep === 1 && (
          <>
            <Box mt={5} display="flex" justifyContent="center">
              <FormControl variant="outlined" style={{ marginRight: 20 }}>
                <InputLabel>Create Treatment</InputLabel>
                {observationSubtype?.includes('Plant') && (
                  <Select
                    value={treatmentSubtypeToCreate}
                    onClick={(e) => e.stopPropagation()}
                    onChange={handleTreatmentSubtypeClick}
                    label="Create Treatment">
                    <MenuItem value={ActivitySubtype.Treatment_ChemicalPlant} onClick={handleTreatmentSubtypeClick}>
                      Chemical Plant
                    </MenuItem>
                    <MenuItem value={ActivitySubtype.Treatment_MechanicalPlant}>Mechanical Plant</MenuItem>
                    <MenuItem value={ActivitySubtype.Treatment_BiologicalPlant}>Biological Plant</MenuItem>
                  </Select>
                )}
              </FormControl>
            </Box>
            <Box mt={5} display="flex" justifyContent="center">
              <Button
                size="large"
                variant="contained"
                startIcon={<ArrowBackIcon />}
                style={{ marginRight: 20 }}
                onClick={() => setActiveStep(activeStep - 1)}>
                Back
              </Button>
              <Button
                size="large"
                variant="contained"
                style={{ marginRight: 20 }}
                onClick={() => history.push('/home/activities')}>
                Skip
              </Button>
              <Button
                size="large"
                variant="contained"
                color="primary"
                onClick={async () => {
                  const linkedActivity = await createLinkedActivity(
                    ActivityType.Treatment,
                    treatmentSubtypeToCreate,
                    observation
                  );
                  //await dataAccess.createActivity(linkedActivity); setActiveActivityAndNavigate(linkedActivity);
                }}>
                Create Associated Treatment
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
};

export default ObservationCreationStepperPage;
