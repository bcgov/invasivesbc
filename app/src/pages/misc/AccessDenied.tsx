import { Box, Button, Container, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ArrowBack, Login, Warning } from '@mui/icons-material';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AUTH_SIGNIN_REQUEST } from 'state/actions';

const useStyles = makeStyles((theme: Theme) => ({
  warningIcon: {
    verticalAlign: 'middle',
    fontSize: '3rem',
    marginRight: '1rem'
  },
  emailLink: {
    color: theme.palette.primary.main,
    textDecoration: 'none'
  }
}));

const AccessDenied = () => {
  const classes = useStyles();

  const history = useHistory();

  const dispatch = useDispatch();

  const navigateToHome = () => {
    history.push('/home/landing');
  };

  const login = () => {
    dispatch({ type: AUTH_SIGNIN_REQUEST });
  };

  const emailSubject = encodeURIComponent('InvasivesBC Access Request');
  const emailBody = encodeURIComponent(
    `I wish to be granted access to the InvasivesBC application, find
    below my IDIR or BCeID username.`
  );
  const emailHref = `mailto:invasivesbc@gov.bc.ca?subject=${emailSubject}&body=${emailBody}`;
  return (
    <Container>
      <Box my={6}>
        <Box mb={3}>
          <Typography variant="h1">
            <Warning className={classes.warningIcon} />
            Email for access
          </Typography>
        </Box>
        <Box mb={4}>
          <Typography variant="h4">
            You must request access by email to view this application. Please provide your IDIR/BCeID username in the
            email body.
          </Typography>
        </Box>
        <Box mb={4}>
          <Typography variant="body1" component="span">
            <Box>Send an email requesting access to:</Box>
            <Box mb={2} className={classes.emailLink}>
              invasivesbc@gov.bc.ca
            </Box>
            <Box mb={2}>or</Box>
            <Box>
              <a className={classes.emailLink} href={emailHref}>
                Click Here
              </a>
            </Box>
          </Typography>
        </Box>
        <Box mb={3}>
          <Typography variant="body1">
            Authorization is a one time process, after which your IDIR/BCeID will be enabled for future logins.
          </Typography>
          <Typography variant="body1">
            If this is your first time logging into the InvasivesBC application, you will need to send an email to the
            above address to complete your authorization and gain access to the site.
          </Typography>
        </Box>
        <Box>
          <Button variant="text" color="primary" startIcon={<Login />} onClick={login}>
            <Typography variant="body1">Log in to view page</Typography>
          </Button>
          or
          <Button variant="text" color="primary" startIcon={<ArrowBack />} onClick={navigateToHome}>
            <Typography variant="body1">Go back to the home page</Typography>
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default AccessDenied;
