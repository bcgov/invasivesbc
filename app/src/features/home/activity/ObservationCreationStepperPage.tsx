import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Box,
  Step,
  StepLabel,
  Typography,
  Stepper,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Select,
  makeStyles
} from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useQuery } from 'hooks/useQuery';
import { addLinkedActivityToDB } from 'utils/addActivity';
import { ActivityType, ActivitySubtype } from 'constants/activities';
import { DatabaseContext } from 'contexts/DatabaseContext';
import ActivityPage from 'features/home/activity/ActivityPage';
import { DocType } from 'constants/database';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  heading: {
    fontSize: theme.typography.pxToRem(18),
    fontWeight: theme.typography.fontWeightRegular
  },
  mapContainer: {
    height: '600px'
  },
  map: {
    height: '100%',
    width: '100%'
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
  const queryParams = useQuery();
  const history = useHistory();
  const databaseContext = useContext(DatabaseContext);

  /*
    This is temporarily defaulted to a plant treatment type because animal forms are not yet complete
  */
  const [treatmentSubtypeToCreate, setTreatmentSubtypeToCreate] = useState(ActivitySubtype.Treatment_ChemicalPlant);
  const [activeStep, setActiveStep] = useState(0);
  const [observation, setObservation] = useState(null);
  const [observationSubtype, setObservationSubtype] = useState(null);

  // Define the steps of the workflow
  const steps = [
    'Create Observation',
    'Create Optional Treatment'
  ];

  // Extract the selected observation id
  const selectedObservationId = queryParams.observation;

  /*
    On intial render, get the observation record we are dealing with and store it in state
  */
  useEffect(() => {
    const getObservation = async () => {
      const activity = await databaseContext.database.get(selectedObservationId);

      setObservationSubtype(activity.activitySubtype);
      setObservation(activity);
    };

    if (!observation) {
      getObservation();
    }
  }, []);

  /*
    When we have completed the workflow and wish to create the treatment record,
    set the active activity to the treatment record we are going to be creating and navigate
    to the treatment activity page
  */
  const setActiveActivityAndNavigate = async (doc: any) => {
    await databaseContext.database.upsert(DocType.APPSTATE, (appStateDoc) => {
      return { ...appStateDoc, activeActivity: doc._id };
    });

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
      <Box>
        <Stepper activeStep={activeStep} orientation="horizontal" style={{ backgroundColor: 'transparent' }}>
          {steps.map((step) => (
            <Step key={step}>
              <StepLabel>
                <Typography variant="h4">{step}</Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box mt={3}>
          <Typography style={{ textAlign: 'center' }}>{getStepContent(activeStep)}</Typography>

          {activeStep === 0 && observation && (
            <>
              <ActivityPage classes={classes} activityId={observation._id} setObservation={setObservation} />
              <Box mt={5} display="flex" justifyContent="center">
                <Button
                  size="large"
                  variant="contained"
                  color="primary"
                  onClick={() => setActiveStep(activeStep + 1)}>
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
                    const addedActivity = await addLinkedActivityToDB(
                      databaseContext,
                      ActivityType.Treatment,
                      treatmentSubtypeToCreate,
                      observation
                    );
                    setActiveActivityAndNavigate(addedActivity);
                  }}>
                  Create Associated Treatment
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default ObservationCreationStepperPage;
