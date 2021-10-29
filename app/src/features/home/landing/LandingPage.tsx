import React, { useEffect, useState, useContext } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  makeStyles,
  Theme,
  Divider,
  Accordion,
  AccordionDetails,
  AccordionSummary
} from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import planTripGIF from '../../../gifs/Plan Page.gif';
import { AuthStateContext } from 'contexts/authStateContext';
import { Capacitor } from '@capacitor/core';
import { useInvasivesApi } from 'hooks/useInvasivesApi';

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
  const api = useInvasivesApi();
  const { userInfo, userInfoLoaded, setUserInfo, setUserInfoLoaded } = useContext(AuthStateContext);

  const loadUserFromCache = async () => {
    try {
      // Try to fetch user info from cache and set it to userInfo
      console.log('Attempting to get user info from cache in context...');
      api.getUserInfoFromCache().then((res: any) => {
        if (res) {
          console.log('User info found in cache from context');
          setUserInfo(res.userInfo);
          setUserInfoLoaded(true);
        } else {
          console.log('No cached user info');
        }
      });
    } catch (error) {
      console.log('Error: ', error);
    }
  };

  useEffect(() => {
    if (Capacitor.getPlatform() !== 'web' && !userInfoLoaded) {
      loadUserFromCache();
    }
  }, [userInfoLoaded]);

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
        <Box mt={2}>
          <Typography variant="h5">User Information</Typography>
          <br />
          <Grid className={classes.userInfoItemGrid} container spacing={2}>
            <Grid item md={2}>
              <Box overflow="hidden" textOverflow="ellipsis">
                <Typography>Name</Typography>
                {userInfo.name}
              </Box>
            </Grid>
            <Divider flexItem={true} orientation="vertical" />
            <Grid item md={2}>
              <Box overflow="hidden" textOverflow="ellipsis">
                <Typography>Email</Typography>
                {userInfo.email}
              </Box>
            </Grid>
            <Divider flexItem={true} orientation="vertical" />
            <Grid item md={2}>
              <Box overflow="hidden" textOverflow="ellipsis">
                <Typography>Username</Typography>
                {userInfo.preferred_username}
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}
      {/*
      <Box mt={4}>
        <Typography variant="h5">What Would You Like To Do?</Typography>
        <br />
      </Box>

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
      </Grid>

      <Grid className={classes.cardListItemGrid}>
        {getCardData(
          'Search',
          'Cached Observations, Treatments and Monitorings',
          'Need to view previously created and cached activity records?',
          'Search cached activities now',
          '/home/search'
        )}

        {getCardData(
          'Create Treatments and Monitorings',
          'Treatments and Monitorings from Cached Activities',
          `Need to create a treatment based off existing observation records,
           or create a monitoring for an existing treatment?`,
          'Create a treatment or monitoring now',
          '/home/references'
        )}
      </Grid>

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
        */}
    </Container>
  );
};

export default LandingPage;
