import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Button } from '@material-ui/core';
import useKeycloakWrapper from 'hooks/useKeycloakWrapper';

interface ILandingPage {
  classes?: any;
}

const LandingPage: React.FC<ILandingPage> = (props) => {
  const keycloak = useKeycloakWrapper();

  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const loadUserInfo = async () => {
      const user = await keycloak.obj?.loadUserInfo();
      setUserInfo(user);
    };

    if (!window['cordova']) {
      loadUserInfo();
    }
  }, [keycloak.obj]);

  /*
    Function to logout current user by wiping their keycloak access token
  */
  const logoutUser = () => {
    keycloak.obj.logout();
  };

  return (
    <Container className={props.classes.container}>
      <Box display="flex" justifyContent="space-between">
        <Typography variant="h4">Welcome to the InvasivesBC Application</Typography>
        {userInfo && (
          <Button variant="contained" color="primary" size="large" onClick={logoutUser}>
            Logout
          </Button>
        )}
      </Box>

      {userInfo && (
        <Box mt={4}>
          <Typography variant="h5">User Information</Typography>
          <br />
          <Typography>
            <b>Name:</b> {userInfo.name}
          </Typography>
          <Typography>
            <b>Email:</b> {userInfo.email}
          </Typography>
          <Typography>
            <b>Username:</b> {userInfo.preferred_username}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default LandingPage;
