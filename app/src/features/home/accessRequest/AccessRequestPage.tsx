import { Capacitor } from '@capacitor/core';
import { AuthStateContext } from 'contexts/authStateContext';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import React, { useContext, useEffect, useState } from 'react';
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
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  makeStyles,
  Radio,
  RadioGroup,
  TextField,
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
  const [transferAccess, setTransferAccess] = useState(null);
  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTransferAccess(event.target.value);
  };
  /*
    Generate reusable card component with info to guide users through the app
  */

  return (
    <Container className={props.classes.container}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography variant="h4" align="center">
            Access Request
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Card elevation={8}>
            <CardContent>
              <FormControl component="fieldset">
                <FormLabel component="legend">
                  Do you wish to transfer your IAPP access to InvasivesBC when it replaces IAPP?
                </FormLabel>
                <RadioGroup
                  row
                  aria-label="transfer-access"
                  name="row-radio-buttons-group"
                  value={transferAccess}
                  onChange={handleRadioChange}>
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
              {transferAccess === 'no' && (
                <Typography variant="body1" align="center">
                  You will be removed from the InvasivesBC lists moving forward. You may, of course, rejoin us at any
                  time.
                </Typography>
              )}
              {transferAccess === 'yes' && (
                <>
                  <Typography variant="body1" align="center">
                    The following information is required to properly establish your access to the new InvasivesBC
                    applications. This information will not be shared with any other organization within government or
                    externally with other agencies.
                    <br />
                    <br />
                    If you have more than one IAPP user account (i.e. two or more BCeIDs), please provide a separate
                    form for each account.
                    <br />
                    <br />
                    At this time, all user accounts will be granted "Data Entry" access similar to that of IAPP.
                    Additional Management and Administrative Roles will be determined at a later date.
                    <br />
                  </Typography>
                  <Box
                    component="form"
                    sx={{
                      '& .MuiTextField-root': { m: 1, width: '25ch' }
                    }}
                    noValidate
                    autoComplete="off">
                    <TextField required variant="outlined" id="outlined-required" label="IDIR Account Name" />
                    <TextField required variant="outlined" id="outlined-required" label="BCeID Account Name" />
                  </Box>
                </>
              )}
            </CardContent>
            <Divider />
            <CardActions>
              <Button
                color="primary"
                variant="outlined"
                onClick={() => {
                  history.push('/');
                }}>
                Back
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AccessRequestPage;
