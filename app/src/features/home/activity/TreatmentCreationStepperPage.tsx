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
import { ActivitySubtype, ActivityType } from 'constants/activities';
import { generateActivityPayload, addClonedActivityToDB, addLinkedActivityToDB } from 'utils/addActivity';
import { DatabaseContext } from 'contexts/DatabaseContext';
import ActivityPage from 'features/home/activity/ActivityPage';
import { getActivityByIdFromApi } from 'utils/getActivity';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import moment from 'moment';
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

interface ITreatmentCreationStepperPage {
  classes?: any;
}

/*
  Text for background info/steps to follow at each of the given workflow stages
*/
const getStepContent = (step: number) => {
  switch (step) {
    case 0:
      return 'Which treatment activity type would you like to create?';
    case 1:
      return 'Is this the first treatment of the year on the targeted invasive species?';
    case 2:
      return `Does the selected observation accurately represent the current size and shape
              of the treatment area? If the area has expanded then please select No.`;
    case 3:
      return 'Please create an overarching observation.';
    case 4:
      return `Thank you for specifying information regarding your treatment activity.
              You may proceed to creating your treatment now.`;
  }
};

const TreatmentCreationStepperPage: React.FC<ITreatmentCreationStepperPage> = (props) => {
  const queryParams = useQuery();
  const classes = useStyles();
  const history = useHistory();
  const invasivesApi = useInvasivesApi();
  const databaseContext = useContext(DatabaseContext);

  /*
    This is temporarily defaulted to a plant treatment type because animal forms are not yet complete
  */
  const [treatmentSubtypeToCreate, setTreatmentSubtypeToCreate] = useState(ActivitySubtype.Treatment_ChemicalPlant);
  const [activeStep, setActiveStep] = useState(0);
  const [prevStep, setPrevStep] = useState(null);
  const [observation, setObservation] = useState(null);
  const [observationGeos, setObservationGeos] = useState([]);
  const [observationSubtype, setObservationSubtype] = useState(null);

  // Define the steps of the workflow
  const steps = [
    'Specify Treatment Type',
    'Specify Treatment Number',
    'Confirm Treatment Area',
    'Create Observation',
    'Create Treatment'
  ];

  // Extract the selected observation ids
  const selectedObservationIds = queryParams.observations ? queryParams.observations.split(',') : [];

  /*
    On initial render, get the activity data (primarily geometry information)
    for each of the selected observations to display on map later

    If only one observation is selected initially, set it as the active observation
    because we enable users to not have to specify an overarching observation
    when they have only selected one initially
  */
  useEffect(() => {
    const getGeometriesOfSelectedObservations = async () => {
      await Promise.all(
        selectedObservationIds.map(async (oId: any) => {
          const activity = await getActivityByIdFromApi(invasivesApi, oId);

          if (selectedObservationIds.length === 1) {
            setObservation(activity);
          }

          setObservationSubtype(activity.activitySubtype);
          setObservationGeos((obsGeos: any) => obsGeos.concat(activity.geometry[activity.geometry.length - 1]));
        })
      );
    };

    getGeometriesOfSelectedObservations();
  }, []);

  /*
    Anytime we change the active step of our workflow:
      - If the previous step happens to now be the same as the active step, modify the previous step
      - If the active step is step 3 and we don't have an observation record created for the user to
        create as their overarching observation, generate it using the geometry info from the previously
        selected observation records
  */
  useEffect(() => {
    const createNewObservation = async () => {
      const formData = {
        activity_data: {
          activity_date_time: moment(new Date()).format()
        }
      };

      const activityPayload = generateActivityPayload(
        formData,
        observationGeos,
        ActivityType.Observation,
        observationSubtype
      );

      /*
        Using the clone activity functionality to create a brand new activity
        with geometry information prepopulated. Generate the payload above
        and then just create a new activity
        (even though it is not actually cloning an existing activity record)
      */
      const activity = await addClonedActivityToDB(databaseContext, activityPayload);

      setObservation(activity);
    };

    if (activeStep === 3 && !observation) {
      createNewObservation();
    }

    if (prevStep === activeStep) {
      setPrevStep(activeStep - 1);
    }
  }, [activeStep]);

  /*
    When a treatment type is selected, store it in state for later use
  */
  const handleTreatmentSubtypeClick = async (event: any) => {
    event.stopPropagation();

    const dropdownValue = event.target.value === 0 ? ActivitySubtype.Treatment_ChemicalPlant : event.target.value;
    setTreatmentSubtypeToCreate(dropdownValue);
  };

  /*
    When we have completed the workflow and are ready to create the treatment record,
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
    Remove an activity from PouchDB, and also clear the local state of the observation activity
    Typically used when user navigates away from the create observation step of the workflow
    (in order to not create unused activity records)
  */
  const removeActivity = async (activity: PouchDB.Core.RemoveDocument) => {
    const dbDoc = await databaseContext.database.get(activity._id);
    await databaseContext.database.remove(dbDoc);

    setObservation(null);
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

          {activeStep === 0 && (
            <Box justifyContent="center" mt={5} display="flex">
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
              <Button
                size="large"
                variant="contained"
                color="primary"
                onClick={() => {
                  setPrevStep(activeStep);
                  setActiveStep(activeStep + 1);
                }}>
                Continue
              </Button>
            </Box>
          )}

          {activeStep === 1 && (
            <Box mt={5} display="flex" justifyContent="center">
              <Button
                size="large"
                variant="contained"
                startIcon={<ArrowBackIcon />}
                style={{ marginRight: 20 }}
                onClick={() => setActiveStep(prevStep)}>
                Back
              </Button>
              <Button
                style={{ marginRight: 20 }}
                size="large"
                variant="contained"
                onClick={() => {
                  setPrevStep(activeStep);
                  if (selectedObservationIds.length === 1) {
                    setActiveStep(activeStep + 1);
                  } else {
                    setActiveStep(activeStep + 2);
                  }
                }}>
                No
              </Button>
              <Button
                size="large"
                variant="contained"
                color="primary"
                onClick={() => {
                  setPrevStep(activeStep);
                  setActiveStep(activeStep + 2);
                }}>
                Yes
              </Button>
            </Box>
          )}

          {activeStep === 2 && (
            <Box mt={5} display="flex" justifyContent="center">
              <Button
                size="large"
                variant="contained"
                startIcon={<ArrowBackIcon />}
                style={{ marginRight: 20 }}
                onClick={() => setActiveStep(prevStep)}>
                Back
              </Button>
              <Button
                style={{ marginRight: 20 }}
                size="large"
                variant="contained"
                onClick={() => {
                  setPrevStep(activeStep);
                  setActiveStep(activeStep + 1);
                }}>
                No
              </Button>
              <Button
                size="large"
                variant="contained"
                color="primary"
                onClick={() => {
                  setPrevStep(activeStep);
                  setActiveStep(activeStep + 2);
                }}>
                Yes
              </Button>
            </Box>
          )}

          {activeStep === 3 && observation && (
            <>
              <ActivityPage classes={classes} activityId={observation._id} setObservation={setObservation} />
              <Box mt={5} display="flex" justifyContent="center">
                <Button
                  size="large"
                  variant="contained"
                  startIcon={<ArrowBackIcon />}
                  style={{ marginRight: 20 }}
                  onClick={() => {
                    removeActivity(observation);
                    setActiveStep(prevStep);
                  }}>
                  Back
                </Button>
                <Button
                  size="large"
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setPrevStep(activeStep);
                    setActiveStep(activeStep + 1);
                  }}>
                  Continue
                </Button>
              </Box>
            </>
          )}

          {activeStep === 4 && (
            <Box mt={5} display="flex" justifyContent="center">
              <Button
                size="large"
                variant="contained"
                startIcon={<ArrowBackIcon />}
                style={{ marginRight: 20 }}
                onClick={() => setActiveStep(prevStep)}>
                Back
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
                Create Treatment
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default TreatmentCreationStepperPage;
