import { Box, Button, Container, makeStyles, Typography } from '@material-ui/core';
import { ArrowBack, Warning } from '@material-ui/icons';
import React from 'react';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
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

  const navigateToHome = () => {
    history.push('/home');
  };

  const emailSubject = encodeURIComponent('Invasives BC Access Request');
  const emailBody = encodeURIComponent('Please grant me access to the Invasives BC application.');
  const emailHref = `mailto:temp@fakeemailaddress.ca?subject=${emailSubject}&body=${emailBody}`;

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
          <Typography variant="h4">You must request access to view this application by email</Typography>
        </Box>
        <Box mb={4}>
          <Typography variant="body1" component="span">
            <Box>Send an email requesting access to:</Box>
            <Box mb={2} className={classes.emailLink}>
              youremailhere@email.com
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
          <Button variant="text" color="primary" startIcon={<ArrowBack />} onClick={navigateToHome}>
            <Typography variant="body1">Go back to the home page</Typography>
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default AccessDenied;
