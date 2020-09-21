import './Login.scss';
import React from 'react';
import { Redirect } from 'react-router-dom';
import { Container, Grid, Button, CircularProgress } from '@material-ui/core';
import useKeycloakWrapper from 'hooks/useKeycloakWrapper';
import { useQuery } from 'hooks/useQuery';

const Login = () => {
  const { redirect } = useQuery();
  const keyCloakWrapper = useKeycloakWrapper();
  const keycloak = keyCloakWrapper.obj;

  if (!keycloak) {
    return <CircularProgress></CircularProgress>;
  }

  if (keycloak?.authenticated) {
    // already logged in
    return <Redirect to={redirect || '/home'} />;
  }

  return (
    <Container className="unauth">
      <h1>Invasives BC</h1>
      <Grid container direction="row">
        <Grid item xs={1} md={3} />
        <Grid item xs={12} md={6} className="block">
          <Button variant="contained" color="primary" onClick={() => keycloak.login()}>
            Sign In
          </Button>
          <p className="or">Or</p>
          <Button
            className="border border-dark"
            variant="outlined"
            color="secondary"
            onClick={() => keycloak.register()}>
            Sign Up
          </Button>
        </Grid>
        <Grid item xs={1} md={3} />
      </Grid>
    </Container>
  );
};

export default Login;
