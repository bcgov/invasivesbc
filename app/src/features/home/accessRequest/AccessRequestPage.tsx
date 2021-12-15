import { Capacitor } from '@capacitor/core';
import { AuthStateContext } from 'contexts/authStateContext';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
// import { getEmployers, getFundingAgencies } from './utils/code-utils';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Divider,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  FormControl,
  MenuItem,
  Typography,
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
  const [transferAccess, setTransferAccess] = useState(null);
  const [accountType, setAccountType] = useState(null);
  const [idir, setIdir] = useState(
    authState.keycloak?.obj?.tokenParsed?.preferred_username
      ? authState.keycloak?.obj?.tokenParsed?.preferred_username
      : ''
  );
  const [bceid, setBceid] = useState(null);
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
  const [employer, setEmployer] = React.useState(null);
  const [fundingAgencies, setFundingAgencies] = React.useState<string[]>([]);
  const [requestedRoles, setRequestedRoles] = React.useState<string[]>([]);
  const [fundingAgenciesList, setFundingAgenciesList] = React.useState<any[]>([]);
  const [employersList, setEmployersList] = React.useState<any[]>([]);

  const apiEmployers = api.getEmployers();
  const apiFundingAgencies = api.getFundingAgencies();

  console.log(apiEmployers);
  console.log(apiFundingAgencies);

  const rolesList = [
    {
      name: 'Administrator - Plants Only',
      value: 'administrator_plants'
    },
    {
      name: 'Administrator - Animals Only',
      value: 'administrator_animals'
    },
    {
      name: 'BC Government Staff User - Animals',
      value: 'bcgov_staff_animals'
    },
    {
      name: 'BC Government Staff User - Plants',
      value: 'bcgov_staff_plants'
    },
    {
      name: 'BC Government Staff User - Both',
      value: 'bcgov_staff_both'
    },
    {
      name: 'Contractor Manager - Animals',
      value: 'contractor_manager_animals'
    },
    {
      name: 'Contractor Manager - Plants',
      value: 'contractor_manager_plants'
    },
    {
      name: 'Contractor Manager - Both',
      value: 'contractor_manager_both'
    },
    {
      name: 'Contractor Staff - Animals',
      value: 'contractor_staff_animals'
    },
    {
      name: 'Contractor Staff - Plants',
      value: 'contractor_staff_plants'
    },
    {
      name: 'Contractor Staff - Both',
      value: 'contractor_staff_both'
    },
    {
      name: 'Indigenous/Local Gov/RISO Manager - Animals',
      value: 'indigenous_riso_manager_animals'
    },
    {
      name: 'Indigenous/Local Gov/RISO Manager - Plants',
      value: 'indigenous_riso_manager_plants'
    },
    {
      name: 'Indigenous/Local Gov/RISO Manager - Both',
      value: 'indigenous_riso_manager_both'
    },
    {
      name: 'Indigenous/Local Gov/RISO Staff - Animals',
      value: 'indigenous_riso_staff_animals'
    },
    {
      name: 'Indigenous/Local Gov/RISO Staff - Plants',
      value: 'indigenous_riso_staff_plants'
    },
    {
      name: 'Indigenous/Local Gov/RISO Staff - Both',
      value: 'indigenous_riso_staff_both'
    },
    {
      name: 'Master Administrator',
      value: 'master_administrator'
    }
  ];

  const submitAccessRequest = async () => {
    const accessRequest = {
      idir: idir,
      bceid: bceid,
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phone,
      pacNumber: pacNumber,
      psn1: psn1,
      psn2: psn2,
      fundingAgencies: fundingAgencies.toString(),
      requestedRoles: requestedRoles.toString(),
      status: 'Not Approved'
    };
    const response = await api.submitAccessRequest(accessRequest);
    console.log('Response: ', response);
  };

  useEffect(() => {
    const fetchFundingAgencies = async () => {
      const response = await api.getFundingAgencies();
      setFundingAgenciesList(response);
    };
    const fetchEmployers = async () => {
      const response = await api.getEmployers();
      setEmployersList(response);
    };
    fetchFundingAgencies();
    fetchEmployers();
  }, []);

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTransferAccess(event.target.value);
  };

  const handleAccountRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAccountType(event.target.value);
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

  const handleRequestedRoleChange = (event: SelectChangeEvent<typeof requestedRoles>) => {
    const {
      target: { value }
    } = event;
    setRequestedRoles(typeof value === 'string' ? value.split(',') : value);
  };

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
                            value={bceid}
                            onChange={(e) => setBceid(e.target.value)}
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
                            {employersList.map((employer) => (
                              <MenuItem key={employer.code_id} value={employer.code_name}>
                                {employer.code_description}
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
                          title="Select one or more funding agencies that you collect/provide Invasives content for. May or may not be the same as your employer.">
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
                              <MenuItem key={fundingAgency.code_id} value={fundingAgency.code_name}>
                                {fundingAgency.code_description}
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
                    </Grid>
                    <Grid container direction="row" spacing={5}>
                      <Grid item>
                        <Tooltip placement="left" title="Select one or more roles to request.">
                          <TextField
                            style={{ width: 320 }}
                            classes={{ root: classes.root }}
                            select
                            name="Requested Roles"
                            id="requested-roles"
                            variant="outlined"
                            label="Requested Role(s)"
                            SelectProps={{
                              multiple: true,
                              value: requestedRoles,
                              onChange: handleRequestedRoleChange
                            }}>
                            {rolesList.map((role) => (
                              <MenuItem key={role.value} value={role.value}>
                                {role.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Tooltip>
                      </Grid>
                    </Grid>
                    <Grid container direction="row" spacing={5}>
                      <Grid item>
                        <Typography variant="body1" align="center">
                          Once you submit your access request, you'll need to complete the Invasives training modules to
                          gain access to the application. We will inform you when your access request is approved.
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid
                      container
                      direction="row"
                      spacing={5}
                      alignContent="center"
                      alignItems="center"
                      justifyContent="center">
                      <Grid item>
                        <Button variant="contained" color="primary" onClick={submitAccessRequest}>
                          Submit Access Request
                        </Button>
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
