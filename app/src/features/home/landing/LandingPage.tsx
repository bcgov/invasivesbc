import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Theme,
  Typography
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { selectAuth } from "../../../state/reducers/auth";
import { useSelector } from "../../../state/utilities/use_selector";
import { selectUserInfo } from "../../../state/reducers/userInfo";
import { selectNetworkConnected } from '../../../state/reducers/network';

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
  const connected = useSelector(selectNetworkConnected);

  const { authenticated, email, displayName, roles } = useSelector(selectAuth);
  const { loaded: userInfoLoaded, activated, accessRequested } = useSelector(selectUserInfo);


  const requestAccess = async () => {
    history.push('/home/access-request');
  };

  // const isUserActivated = () => {
  //   if (!userInfoLoaded) {
  //     return false;
  //   }
  //   return userInfo?.activation_status === 1;
  // };

  const redirectToAgreement = (e) => {
    e.preventDefault();
    history.push('/home/data-sharing-agreement');
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
              <Grid item md={3}>
                <Box overflow="hidden" textOverflow="ellipsis">
                  <Typography>
                    <strong>Name</strong>
                  </Typography>
                  {displayName}
                </Box>
              </Grid>
              <Divider flexItem={true} orientation="vertical" />
              <Grid item md={3}>
                <Box overflow="hidden" textOverflow="ellipsis">
                  <Typography>
                    <strong>Email</strong>
                  </Typography>
                  {email}
                </Box>
              </Grid>
              <Divider flexItem={true} orientation="vertical" />
              <Grid item md={3}>
                <Box overflow="hidden" textOverflow="ellipsis">
                  <Typography>
                    <strong>Username</strong>
                  </Typography>
                  {displayName}
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
                  {activated ? 'Activated' : 'Not Activated'}
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
              {roles.length > 0 && (
                <Grid item md={3}>
                  <Box overflow="hidden" textOverflow="ellipsis">
                    <Typography>
                      <strong>Roles</strong>
                    </Typography>
                    {roles.map((role: any) => {
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
                InvasivesBC has a drinking well warning system built in that will notify the user if
                a <u>mapped</u>{' '}
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
      {roles.length == 0 && (
        <Typography variant="h5">
          <br />
          <strong>To gain full access to the InvasivesBC application, please submit an access request.</strong>
        </Typography>
      )}
      {connected && (
        <>
          {!accessRequested ? (
            <Box mt={2} paddingBottom={'50px'}>
              <Button variant="outlined" color="primary" onClick={requestAccess}>
                Request Access
              </Button>
            </Box>
          ) : (
            !activated &&
            accessRequested && (
              <Box mt={2}>Your access request has been submitted. Check back periodically for access.</Box>
            )
          )}
        </>
      )}
      {!authenticated && (
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

    </Container>
  );
};

export default LandingPage;
