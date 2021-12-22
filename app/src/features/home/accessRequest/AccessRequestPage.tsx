import { AuthStateContext } from 'contexts/authStateContext';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
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
  const [bceid, setBceid] = useState(
    authState.keycloak?.obj?.tokenParsed?.preferred_username
      ? authState.keycloak?.obj?.tokenParsed?.preferred_username
      : ''
  );
  const [bussinessName, setBusinessName] = useState(
    authState.keycloak?.obj?.tokenParsed?.bceid_bussiness_name
      ? authState.keycloak?.obj?.tokenParsed?.bceid_bussiness_name
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
  const [employer, setEmployer] = React.useState(null);
  const [fundingAgencies, setFundingAgencies] = React.useState<string[]>([]);
  const [requestedRoles, setRequestedRoles] = React.useState<string[]>([]);
  const [fundingAgenciesList, setFundingAgenciesList] = React.useState<any[]>([]);
  const [employersList, setEmployersList] = React.useState<any[]>([]);
  const [submitted, setSubmitted] = React.useState(false);
  const [comments, setComments] = React.useState('');

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
      employer: employer?.toString(),
      fundingAgencies: fundingAgencies?.toString(),
      requestedRoles: requestedRoles?.toString(),
      comments: comments,
      status: 'NOT_APPROVED'
    };
    const response = await api.submitAccessRequest(accessRequest);
    setSubmitted(true);
    console.log('Response: ', response);
    localStorage.setItem('accessRequested', 'true');
  };

  const declineAccess = async () => {
    const accessRequest = {
      idir: idir,
      bceid: bceid,
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: null,
      pacNumber: null,
      psn1: null,
      psn2: null,
      employer: null,
      fundingAgencies: null,
      requestedRoles: null,
      comments: null,
      status: 'REMOVED'
    };
    const response = await api.submitAccessRequest(accessRequest);
    setSubmitted(true);
    console.log('Response: ', response);
  };

  const [userInfo, setUserInfo] = useState(undefined);

  useEffect(() => {
    if (userInfo !== undefined) {
      if (userInfo?.idir_account_name) {
        setAccountType('IDIR');
        setIdir(userInfo?.idir_account_name);
      } else if (userInfo?.bceid_business_name) {
        setAccountType('BCeID');
        setBceid(userInfo?.bceid_business_name);
      }

      if (userInfo?.bceid_business_name) {
        setFirstName(userInfo?.bceid_business_name);
      } else {
        userInfo?.first_name && setFirstName(userInfo?.first_name);
      }
      userInfo?.last_name && setLastName(userInfo?.last_name);
      userInfo?.primary_email && setEmail(userInfo?.primary_email);
      userInfo?.work_phone_number && setPhone(userInfo?.work_phone_number);
      userInfo?.pac_number && setPacNumber(userInfo?.pac_number);
      userInfo?.pac_service_number_1 && setPsn1(userInfo?.pac_service_number_1);
      userInfo?.pac_service_number_2 && setPsn2(userInfo?.pac_service_number_2);
      userInfo?.employer && setEmployer(userInfo?.employer);
      userInfo?.funding_agencies && setFundingAgencies(userInfo?.funding_agencies.split(','));
    }
  }, [userInfo]);

  useEffect(() => {
    const userName = authState.keycloak?.obj?.userInfo?.preferred_username;
    const email = authState.keycloak?.obj?.userInfo?.email;
    const fetchFundingAgencies = async () => {
      const response = await api.getFundingAgencies();
      setFundingAgenciesList(response);
    };
    const fetchEmployers = async () => {
      const response = await api.getEmployers();
      setEmployersList(response);
    };
    const fetchAccessRequestData = async () => {
      const response = await api.getAccessRequestData({ username: userName, email: email });
      setUserInfo(response);
    };
    fetchAccessRequestData();
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
            InvasivesBC Access Request
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Card elevation={8}>
            {!submitted && (
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
                        applications. This information will not be shared with any other organization within government
                        or externally with other agencies.
                        <br />
                        <br />
                        If you have more than one IAPP user account (i.e. two or more BCeIDs), please provide a separate
                        form for each account.
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
                          <Tooltip
                            placement="left"
                            title="If your employer or agency were not on our lists, please enter it here.">
                            <TextField
                              style={{ width: 640 }}
                              classes={{ root: classes.root }}
                              multiline
                              rows={4}
                              value={comments}
                              onChange={(e) => setComments(e.target.value)}
                              name="Comments"
                              id="comments"
                              variant="outlined"
                              label="Comments"
                            />
                          </Tooltip>
                        </Grid>
                      </Grid>
                      <Grid container direction="row" spacing={5}>
                        <Grid item>
                          <Typography variant="body1" align="center">
                            We will inform you when the training materials are ready and again when your access is
                            approved
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            )}
            {submitted && (
              <CardContent>
                <Grid container direction="row" spacing={7}>
                  <Grid item>
                    <Typography variant="body1" align="center">
                      Thank you for submitting your request.
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            )}
            <Divider />
            <CardActions>
              <Grid container direction="row" spacing={5} justifyContent="space-between">
                <Grid item>
                  <Button
                    color="primary"
                    variant="outlined"
                    onClick={() => {
                      history.push('/');
                    }}>
                    Back
                  </Button>
                </Grid>
              </Grid>
              <Grid item>
                {!submitted && (
                  <Button
                    style={{ maxWidth: '300px', minWidth: '225px' }}
                    variant="contained"
                    color="primary"
                    onClick={transferAccess === 'yes' ? submitAccessRequest : declineAccess}>
                    {transferAccess === 'yes' ? 'Submit Access Request' : 'Remove me from the list'}
                  </Button>
                )}
              </Grid>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AccessRequestPage;
