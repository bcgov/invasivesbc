import { Capacitor } from '@capacitor/core';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Divider,
  Grid,
  Theme,
  Typography
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { AuthStateContext } from 'contexts/authStateContext';
import { NetworkContext } from 'contexts/NetworkContext';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import React, { useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import planTripGIF from '../../../gifs/Plan Page.gif';

const useStyles = makeStyles((theme: Theme) => ({
  userInfoItemGrid: {
    display: 'flex',
    flexDirection: 'row',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column'
    }
  },
  cardListItemGrid: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column'
    }
  },
  cardWidth: {
    '@media (min-device-width: 600px)': {
      width: 600
    },
    marginBottom: '2em'
  }
}));

interface ILandingPage {
  classes?: any;
}

const LandingPage: React.FC<ILandingPage> = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const networkContext = useContext(NetworkContext);
  const api = useInvasivesApi();
  const { userInfo, userInfoLoaded, loginUser, keycloak, userRoles } = useContext(AuthStateContext);
  const [accessRequested, setAccessRequested] = React.useState(false);
  const METABASE_URL: string = process.env.METABASE_URL || 'https://metabase-7068ad-dev.apps.silver.devops.gov.bc.ca';

  const isMobile = () => {
    return Capacitor.getPlatform() !== 'web';
  };

  const isAuthenticated = () => {
    return userInfoLoaded || keycloak.obj?.authenticated;
  };

  const requestAccess = async () => {
    if (!isAuthenticated()) {
      // log in user
      await loginUser().then(() => {
        history.push('/home/access-request');
      });
    } else {
      history.push('/home/access-request');
    }
  };

  const isUserActivated = () => {
    if (!userInfoLoaded) {
      return false;
    }
    return userInfo?.activation_status === 1;
  };

  const redirectToAgreement = (e) => {
    e.preventDefault();
    history.push('/home/data-sharing-agreement');
  };

  useEffect(() => {
    hasRequestedAccess();
  }, [keycloak?.obj?.authenticated, userInfoLoaded, api, userInfo?.email, userInfo?.preferred_username]);

  const hasRequestedAccess = async () => {
    // If no user is logged in, return false
    if (!keycloak?.obj?.authenticated) {
      setAccessRequested(false);
      return;
    }
    if (keycloak.obj?.authenticated && userInfo.preferred_username && userInfo.email) {
      // If user is logged in, check if they have requested access
      const response = await api.getAccessRequestData({
        username: userInfo.preferred_username
      });
      const accessRequest = response;
      if (accessRequest) {
        if (!accessRequest.primary_email || (accessRequest !== {} && accessRequest.status === 'DECLINED')) {
          setAccessRequested(false);
          return;
        }
        if (accessRequest !== {} && accessRequest.status !== 'DECLINED') {
          setAccessRequested(true);
          return;
        }
      }
    }
  };

  /*
    Generate reusable card component with info to guide users through the app
  */
  const getCardData = (heading: string, subheading: string, content: string, footerText: string, url: string) => {
    return (
      <Card className={classes.cardWidth}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            {heading}
          </Typography>
          <Typography color="textSecondary" gutterBottom>
            {subheading}
          </Typography>
          <Typography variant="body2" component="p">
            {content}
            <Accordion>
              <AccordionSummary>Expand for Demo</AccordionSummary>
              <AccordionDetails>
                <img src={planTripGIF} alt="loading..." />
              </AccordionDetails>
            </Accordion>
          </Typography>
        </CardContent>
        <CardActions>
          <Button onClick={() => history.push(url)} size="small">
            {footerText}
          </Button>
        </CardActions>
      </Card>
    );
  };

  return (
    <Container className={props.classes.container}>
      <Box display="flex" justifyContent="space-between">
        <Typography variant="h4">Welcome to the InvasivesBC Application BETA!</Typography>
      </Box>
      {userInfoLoaded && (
        <>
          <Box mt={2}>
            <Typography variant="h5">User Information</Typography>
            <br />
            <Grid className={classes.userInfoItemGrid} container spacing={2}>
              {userInfo?.first_name && userInfo?.last_name && (
                <Grid item md={3}>
                  <Box overflow="hidden" textOverflow="ellipsis">
                    <Typography>
                      <strong>Name</strong>
                    </Typography>
                    {userInfo?.first_name + ' ' + userInfo?.last_name}
                  </Box>
                </Grid>
              )}
              <Divider flexItem={true} orientation="vertical" />
              <Grid item md={3}>
                <Box overflow="hidden" textOverflow="ellipsis">
                  <Typography>
                    <strong>Email</strong>
                  </Typography>
                  {userInfo?.email}
                </Box>
              </Grid>
              <Divider flexItem={true} orientation="vertical" />
              <Grid item md={3}>
                <Box overflow="hidden" textOverflow="ellipsis">
                  <Typography>
                    <strong>Username</strong>
                  </Typography>
                  {userInfo?.preferred_username}
                </Box>
              </Grid>
            </Grid>
          </Box>
          <Box mt={6}>
            <Grid className={classes.userInfoItemGrid} container spacing={2}>
              <Grid item md={3}>
                <Box overflow="hidden" textOverflow="ellipsis">
                  <Typography>
                    <strong>Activation Status</strong>
                  </Typography>
                  {isUserActivated() ? 'Activated' : 'Not Activated'}
                </Box>
              </Grid>
              <Divider flexItem={true} orientation="vertical" />
              <Grid item md={3}>
                <Box overflow="hidden" textOverflow="ellipsis">
                  <Typography>
                    <strong>Access Requested</strong>
                  </Typography>
                  {accessRequested ? 'Yes' : 'No'}
                </Box>
              </Grid>
              <Divider flexItem={true} orientation="vertical" />
              {userRoles.length > 0 && (
                <Grid item md={3}>
                  <Box overflow="hidden" textOverflow="ellipsis">
                    <Typography>
                      <strong>Roles</strong>
                    </Typography>
                    {userRoles.map((role: any) => {
                      return <span key={role.role_id}>{role.role_description + '\n'}</span>;
                    })}
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
          <Box mt={8}>
            <Divider />
          </Box>
          <Box mt={10}>
            <u>
              <strong>PRIVACY REQUIREMENTS AND LEGAL DISCLAIMER: </strong>
            </u>
          </Box>
          <Box mt={4}>
            <ul>
              <li>
                Names, addresses or other information that could be used to identify an individual that is not
                registered as a user in this system are not permitted and will be deleted from a record if found. Eg: a
                location description that contains an address or a person's name.
              </li>
              <li>
                InvasivesBC has a drinking well warning system built in that will notify the user if a <u>mapped</u>{' '}
                well or water license is located within close proximity to the geometry of the record being entered.
                This tool is to be used for information only, and the absence of a well warning does NOT confirm there
                are not wells or water licences in close proximity. Many wells and water licences are unmapped in BC. It
                remains the responsibility of the pesticide applicator to confirm water sources and wells prior to
                application of pesticides, and not rely solely on the well indicator in InvasivesBC.
              </li>
            </ul>
          </Box>
          <Box mt={4}>
            By using this application, you agree to&nbsp;
            <a href="" onClick={redirectToAgreement}>
              the Data Sharing Agreement
            </a>
          </Box>
          <Box mt={8}>
            <u>
              <strong>FOR MORE INFORMATION: </strong>
            </u>
          </Box>
          <Box mt={4}>
            For training materials and more info:{' '}
            <a
              href="https://www2.gov.bc.ca/gov/content/environment/plants-animals-ecosystems/invasive-species"
              target="_blank"
              rel="noreferrer">
              www2.gov.bc.ca/gov/content/environment/plants-animals-ecosystems/invasive-species
            </a>
          </Box>
          <Box mt={4}>
            Or email us at <a href="mailto:InvasivesBC@gov.bc.ca">InvasivesBC@gov.bc.ca</a>
          </Box>
        </>
      )}
      {!userInfoLoaded && keycloak?.obj?.authenticated && (
        <Box mt={2}>
          <Typography variant="h5">User Information</Typography>
          <br />
          <Grid className={classes.userInfoItemGrid} container spacing={2}>
            <Grid item md={3}>
              <Box overflow="hidden" textOverflow="ellipsis">
                <Typography>
                  <strong>Name</strong>
                </Typography>
                {keycloak?.obj?.tokenParsed?.name}
              </Box>
            </Grid>
            <Divider flexItem={true} orientation="vertical" />
            <Grid item md={3}>
              <Box overflow="hidden" textOverflow="ellipsis">
                <Typography>
                  <strong>Email</strong>
                </Typography>
                {keycloak?.obj?.tokenParsed?.email}
              </Box>
            </Grid>
            <Divider flexItem={true} orientation="vertical" />
            <Grid item md={3}>
              <Box overflow="hidden" textOverflow="ellipsis">
                <Typography>
                  <strong>Username</strong>
                </Typography>
                {keycloak?.obj?.tokenParsed?.preferred_username}
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}
      {!userInfoLoaded && keycloak?.obj?.authenticated && (
        <Typography variant="h5">
          <br />
          <strong>To gain full access to the InvasivesBC application, please submit an access request.</strong>
        </Typography>
      )}
      {networkContext.connected && (
        <>
          {!accessRequested ? (
            <Box mt={2} paddingBottom={'50px'}>
              <Button variant="outlined" color="primary" onClick={requestAccess}>
                Request Access
              </Button>
            </Box>
          ) : (
            !isUserActivated() &&
            accessRequested && (
              <Box mt={2}>Your access request has been submitted. Check back periodically for access.</Box>
            )
          )}
        </>
      )}
      {!keycloak.obj.authenticated && (
        <>
          <Box mt={8}>
            <Divider />
          </Box>
          <Box mt={8}>
            <strong>
              <i>InvasivesBC</i> is British Columbia's province-wide mapping and data collection system for invasive
              species.
            </strong>
          </Box>
          <Box mt={8}>
            <u>
              <strong>IF YOU ARE A NEW USER: </strong>
            </u>
          </Box>
          <Box mt={4}>
            <strong>To request access: </strong> click the “REQUEST ACCESS” button at the top of the page and fill out
            the request access form. Please note that the employer and funding agency information provided will be used
            to autofill those fields into the activity forms, therefore it is important you complete the full access
            form with your current employer and all potential funding agencies. An active IDIR or Business BCEID is
            required to request access.
          </Box>
          <Box mt={8}>
            <u>
              <strong>IF YOU ARE AN EXISTING USER: </strong>
            </u>
          </Box>
          <Box mt={4}>
            <strong>To log in: </strong> click the person icon at the top right of the page and select "log in".
          </Box>
          <Box mt={4}>
            <strong>To update or change your account details: </strong> log in and then choose "update my info" from the
            person icon on the top right.
          </Box>
          <Box mt={8}>
            <u>
              <strong>FOR MORE INFORMATION: </strong>
            </u>
          </Box>
          <Box mt={4}>
            For training materials and more info:{' '}
            <a
              href="https://www2.gov.bc.ca/gov/content/environment/plants-animals-ecosystems/invasive-species"
              target="_blank"
              rel="noreferrer">
              www2.gov.bc.ca/gov/content/environment/plants-animals-ecosystems/invasive-species
            </a>
          </Box>
          <Box mt={4}>
            Or email us at <a href="mailto:InvasivesBC@gov.bc.ca">InvasivesBC@gov.bc.ca</a>
          </Box>
        </>
      )}

      {/* {userInfoLoaded && isUserActivated() && (
        <>
          <Box mt={12}>
            <Typography variant="h5">What Would You Like To Do?</Typography>
            <br />
          </Box>

          {isMobile() && (
            <Grid className={classes.cardListItemGrid}>
              {getCardData(
                'Plan a Trip/Fetch Cached Records',
                'Points of Interest, Past Activity Records, Layers',
                `Heading out into the field and wish to gather information regarding your
           trip before going offline?`,
                'Plan your trip now',
                '/home/plan'
              )}

              {getCardData(
                'Create a Local Activity',
                'Observations, Transects, Biological Dispersals',
                'In the field and wish to record an observation record or create a transect?',
                'Create a local activity now',
                '/home/activities'
              )}
              {getCardData(
                'Search',
                'Cached Observations, Treatments and Monitorings',
                'Need to view previously created and cached activity records?',
                'Search cached activities now',
                '/home/search'
              )}
            </Grid>
          )}

          <Grid className={classes.cardListItemGrid}>
            {getCardData(
              'View Fetched Records on Map',
              'IAPP Sites, Activities on Main Map',
              'Want to see all the data you have fetched on a single map?',
              'View the main map now',
              '/home/map'
            )}
            {getCardData(
              'Continue Creating an Activity',
              'Pause and Resume Activity Creation',
              'Had to take a break and come back to creating an activity?',
              'Resume current activity creation now',
              '/home/activity'
            )}
          </Grid>
        </>
      )} */}
    </Container>
  );
};

export default LandingPage;
