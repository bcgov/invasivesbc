import { Capacitor } from '@capacitor/core';
import { AuthStateContext } from 'contexts/authStateContext';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Divider,
  FormControlLabel,
  useTheme,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  Chip,
  TextField,
  FormControl,
  Checkbox,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Typography,
  Select,
  InputLabel,
  Tooltip,
  makeStyles
} from '@material-ui/core';
import { SelectChangeEvent } from '@mui/material';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '320px'
  }
}));

interface IAccessRequestPage {
  classes?: any;
}

const AccessRequestPage: React.FC<IAccessRequestPage> = (props) => {
  const history = useHistory();
  const api = useInvasivesApi();
  const authState = useContext(AuthStateContext);
  const classes = useStyles();
  const { userInfo, userInfoLoaded, setUserInfo, setUserInfoLoaded } = useContext(AuthStateContext);
  const [transferAccess, setTransferAccess] = useState(null);
  const [accountType, setAccountType] = useState(null);
  const [idir, setIdir] = useState(
    authState.keycloak?.obj?.tokenParsed?.preferred_username
      ? authState.keycloak?.obj?.tokenParsed?.preferred_username
      : ''
  );
  const [firstName, setFirstName] = React.useState(
    authState.keycloak?.obj?.tokenParsed?.given_name ? authState.keycloak?.obj?.tokenParsed?.given_name : ''
  );
  const [lastName, setLastName] = React.useState(
    authState.keycloak?.obj?.tokenParsed?.family_name ? authState.keycloak?.obj?.tokenParsed?.family_name : ''
  );
  const [email, setEmail] = React.useState(
    authState.keycloak?.obj?.tokenParsed?.email ? authState.keycloak?.obj?.tokenParsed?.email : ''
  );
  const [phone, setPhone] = React.useState('');
  const [pacNumber, setPacNumber] = React.useState('');
  const [psn1, setPsn1] = React.useState('');
  const [psn2, setPsn2] = React.useState('');
  const [agreed, setAgreed] = React.useState(null);
  const [employer, setEmployer] = React.useState(null);
  const [fundingAgencies, setFundingAgencies] = React.useState<string[]>([]);

  const fundingAgenciesList = [];
  const employerList = [];

  const submitAccessRequest = async () => {
    const accessRequest = {
      idir,
      firstName,
      lastName,
      email,
      phone,
      pacNumber,
      psn1,
      psn2,
      fundingAgencies
    };
    console.log('Access request: ', accessRequest);

    // const response = await api.post('/accessRequest', accessRequest);
    // if (response.status === 200) {
    //   history.push('/');
    // }
  };

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTransferAccess(event.target.value);
  };

  const handleAccountRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAccountType(event.target.value);
  };

  const handleAgreedRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAgreed(event.target.value);
  };

  const handleEmployerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmployer(event.target.value);
  };

  const handleFundingAgenciesChange = (event: SelectChangeEvent<typeof fundingAgencies>) => {
    const {
      target: { value }
    } = event;
    setFundingAgencies(typeof value === 'string' ? value.split(',') : value);
  };

  useEffect(() => {
    console.log(authState.keycloak?.obj);
  }, []);

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
                <Grid container direction="column" spacing={3}>
                  <Grid item>
                    {' '}
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
                  </Grid>
                  <Grid item>
                    <Grid container direction="row" spacing={5}>
                      <Grid item>
                        <FormControl component="fieldset">
                          <FormLabel component="legend">Account type</FormLabel>
                          <RadioGroup
                            row
                            aria-label="account-type"
                            name="row-radio-buttons-group"
                            value={accountType}
                            onChange={handleAccountRadioChange}>
                            <FormControlLabel value="IDIR" control={<Radio />} label="IDIR" />
                            <FormControlLabel value="BCeID" control={<Radio />} label="BCeID" />
                          </RadioGroup>
                        </FormControl>
                      </Grid>
                      {accountType === 'IDIR' && (
                        <Grid item>
                          {' '}
                          <TextField
                            value={idir}
                            style={{ width: 320 }}
                            onChange={(e) => setIdir(e.target.value)}
                            required
                            variant="outlined"
                            id="outlined-required"
                            label="IDIR Account Name"
                          />
                        </Grid>
                      )}
                      {accountType === 'BCeID' && (
                        <Grid item>
                          {' '}
                          <TextField
                            required
                            style={{ width: 320 }}
                            variant="outlined"
                            id="outlined-required"
                            label="BCeID Account Name"
                          />
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                  <Grid item>
                    <Grid container direction="row" spacing={5}>
                      <Grid item>
                        <TextField
                          required
                          style={{ width: 320 }}
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          variant="outlined"
                          id="outlined-required"
                          label="First Name"
                        />
                      </Grid>
                      <Grid item>
                        <TextField
                          required
                          style={{ width: 320 }}
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          variant="outlined"
                          id="outlined-required"
                          label="Last Name"
                        />
                      </Grid>
                      <Grid item>
                        <TextField
                          required
                          style={{ width: 320 }}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          variant="outlined"
                          id="outlined-required"
                          label="Primary Email"
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item>
                    <Grid container direction="row" spacing={5}>
                      <Grid item>
                        <TextField
                          variant="outlined"
                          style={{ width: 320 }}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          id="outlined-required"
                          label="Work Phone (optional)"
                        />
                      </Grid>
                      <Grid item>
                        <Tooltip placement="left" title="Who do you work for?">
                          <TextField
                            style={{ width: 320 }}
                            classes={{ root: classes.root }}
                            select
                            name="Employer"
                            id="employer"
                            variant="outlined"
                            label="Employer"
                            SelectProps={{
                              multiple: false,
                              value: employer,
                              onChange: handleEmployerChange
                            }}>
                            {employerList.map((employer) => (
                              <MenuItem key={employer} value={employer}>
                                {employer}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item>
                    <Grid container direction="row" spacing={5}>
                      <Grid item>
                        <Tooltip
                          placement="left"
                          title="Funding agency that you collect/provide Invasives content for. May or may not be the same as your employer.">
                          <TextField
                            style={{ width: 320 }}
                            classes={{ root: classes.root }}
                            select
                            name="Funding Agencies"
                            id="funding-agency"
                            variant="outlined"
                            label="Funding Agencies"
                            SelectProps={{
                              multiple: true,
                              value: fundingAgencies,
                              onChange: handleFundingAgenciesChange
                            }}>
                            {fundingAgenciesList.map((fundingAgency) => (
                              <MenuItem key={fundingAgency} value={fundingAgency}>
                                {fundingAgency}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item>
                    <Grid container direction="row" spacing={5}>
                      <Grid item>
                        <Tooltip placement="left" title="Pesticide Applicator Certificate (PAC) Number">
                          <TextField
                            required
                            value={pacNumber}
                            onChange={(e) => setPacNumber(e.target.value)}
                            style={{ width: 320 }}
                            variant="outlined"
                            id="outlined-required"
                            label="PAC Number"
                          />
                        </Tooltip>
                      </Grid>
                      <Grid item>
                        <Tooltip
                          placement="left"
                          title="Enter the Service licence Number and Company name separated by a dash and no spaces">
                          <TextField
                            required
                            value={psn1}
                            onChange={(e) => setPsn1(e.target.value)}
                            style={{ width: 320 }}
                            variant="outlined"
                            id="outlined-required"
                            label="Pesticide Service Number #1"
                          />
                        </Tooltip>
                      </Grid>
                      <Grid item>
                        <Tooltip
                          placement="left"
                          title="Enter the Service licence Number and Company name separated by a dash and no spaces">
                          <TextField
                            required
                            value={psn2}
                            onChange={(e) => setPsn2(e.target.value)}
                            style={{ width: 320 }}
                            variant="outlined"
                            id="outlined-required"
                            label="Pesticide Service Number #2"
                          />
                        </Tooltip>
                      </Grid>
                      <Grid item>
                        <FormControl component="fieldset">
                          <FormLabel component="legend">
                            I confirm I have completed the InvasivesBC training modules online
                          </FormLabel>
                          <RadioGroup
                            row
                            aria-label="transfer-access"
                            name="row-radio-buttons-group"
                            value={agreed}
                            onChange={handleAgreedRadioChange}>
                            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                            <FormControlLabel value="no" control={<Radio />} label="No" />
                          </RadioGroup>
                        </FormControl>
                      </Grid>
                    </Grid>
                    <Grid container direction="row" spacing={5}>
                      <Grid item>
                        {agreed === 'yes' && (
                          <Button variant="contained" color="primary" onClick={submitAccessRequest}>
                            Submit Access Request
                          </Button>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
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
