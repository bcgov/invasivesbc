import { Capacitor } from '@capacitor/core';
import { AuthStateContext } from 'contexts/authStateContext';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import React, { useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
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
  makeStyles,
  Theme,
  Typography
} from '@material-ui/core';

interface IAccessRequestPage {
  classes?: any;
}

const AccessRequestPage: React.FC<IAccessRequestPage> = (props) => {
  const history = useHistory();
  const api = useInvasivesApi();
  const { userInfo, userInfoLoaded, setUserInfo, setUserInfoLoaded } = useContext(AuthStateContext);
  /*
    Generate reusable card component with info to guide users through the app
  */

  return (
    <Container className={props.classes.container}>
      <Box display="flex" justifyContent="space-between">
        <Typography variant="h4">Welcome to the !</Typography>
      </Box>

      {userInfoLoaded && (
        <Box mt={2}>
          <Typography variant="h5">User Information</Typography>
          <br />
          <Grid container spacing={2}>
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
    </Container>
  );
};

export default AccessRequestPage;
