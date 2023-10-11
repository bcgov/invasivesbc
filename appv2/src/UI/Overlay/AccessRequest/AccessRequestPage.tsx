import { useInvasivesApi } from 'hooks/useInvasivesApi';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Container,
  Divider,
  FormControlLabel,
  FormLabel,
  Grid,
  InputLabel,
  Radio,
  RadioGroup,
  TextField,
  FormControl,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
  Tooltip,
  Theme
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { SelectChangeEvent } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectAuth } from 'state/reducers/auth';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '320px'
  }
}));

interface IAccessRequestPage {
  classes?: any;
  location?: any;
}

const AccessRequestPage: React.FC<IAccessRequestPage> = (props) => {
  const history = useHistory();
  const api = useInvasivesApi();
  const classes = useStyles();
  const [transferAccess] = useState('yes');
  const [accountType, setAccountType] = useState('');

  const authState = useSelector(selectAuth);

  const [idir, setIdir] = useState(authState.username ? authState.username : '');
  const [bceid, setBceid] = useState(authState.username ? authState.username : '');
  const [firstName, setFirstName] = React.useState(
    authState.displayName.split(' ')[1] ? authState.displayName.split(' ')[1] : ''
  );
  const [lastName, setLastName] = React.useState(
    authState.displayName.split(' ')[0].replace(',', '') ? authState.displayName.split(',')[0].replace(',', '') : ''
  );
  const [email, setEmail] = React.useState(authState.email ? authState.email : '');
  const idir_userid = authState?.idir_user_guid ? authState?.idir_user_guid : '';
  const bceid_userid = authState?.bceid_user_guid ? authState?.bceid_user_guid : '';
  const [phone, setPhone] = React.useState('');
  const [pacNumber, setPacNumber] = React.useState<number>(null);
  const [psn1, setPsn1] = React.useState('');
  const [psn2, setPsn2] = React.useState('');
  const [employer, setEmployer] = React.useState([]);
  const [fundingAgencies, setFundingAgencies] = React.useState<string[]>([]);
  const [requestedRoles, setRequestedRoles] = React.useState<string[]>([]);
  const [fundingAgenciesList, setFundingAgenciesList] = React.useState<any[]>([]);
  const [employersList, setEmployersList] = React.useState<any[]>([]);
  const [submitted, setSubmitted] = React.useState(false);
  const [comments, setComments] = React.useState('');
  const [roles, setRoles] = React.useState<any[]>([]);

  // Validation Error Messages
  const [idirErrorText, setIdirErrorText] = React.useState('');
  const [bceidErrorText, setBceidErrorText] = React.useState('');
  const [firstNameErrorText, setFirstNameErrorText] = React.useState('');
  const [lastNameErrorText, setLastNameErrorText] = React.useState('');
  const [emailErrorText, setEmailErrorText] = React.useState('');
  const [employerErrorText, setEmployerErrorText] = React.useState('');
  const [fundingAgenciesErrorText, setFundingAgenciesErrorText] = React.useState('');
  const [requestedRolesErrorText, setRequestedRolesErrorText] = React.useState('');

  let isUpdating = false;

  const isValid = (decline: Boolean = false, valid: Boolean = true): Boolean => {
    let requiredFields = [
      { value: firstName, error: setFirstNameErrorText, text: 'Please enter First name ' },
      { value: lastName, error: setLastNameErrorText, text: 'Please enter Last name ' },
      { value: email, error: setEmailErrorText, text: 'Please enter primary Email ' },
    ];
    // if not declining check more fields
    if (!decline) {
      requiredFields.push(
        { value: employer, error: setEmployerErrorText, text: 'Please enter Employer ' },
        { value: fundingAgencies?.join(), error: setFundingAgenciesErrorText, text: 'Please enter 1 or more Funding Agencies ' },
        { value: requestedRoles?.join(), error: setRequestedRolesErrorText, text: 'Please enter 1 or more Requested Roles ' },
      );
    }

    if (accountType === 'IDIR') {
      requiredFields.push({ value: idir, error: setIdirErrorText, text: 'Please enter IDIR name ' });
    } else {
      requiredFields.push({ value: bceid, error: setBceidErrorText, text: 'Please enter BCeID ' });

    }

    requiredFields.map((field) => {
      if (!field.value || field.value.length === 0) {
        field.error(field.text);
        valid = false;
      } else {
        field.error('');
      }
    });

    return valid;
  };

  const submitAccessRequest = async () => {
    if (isValid()) {
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
        status: 'NOT_APPROVED',
        idirUserId: idir_userid,
        bceidUserId: bceid_userid
      };
      await api.submitAccessRequest(accessRequest);
      setSubmitted(true);
    }
  };

  const submitUpdateRequest = async () => {
    if (isValid()) {
      const updateRequest = {
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
        status: 'NOT_APPROVED',
        idirUserId: idir_userid,
        bceidUserId: bceid_userid
      };
      await api.submitUpdateRequest(updateRequest);
      setSubmitted(true);
    }
  };

  const declineAccess = async () => {
    if (isValid(true)) {
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
        employer: '',
        fundingAgencies: '',
        requestedRoles: null,
        comments: null,
        status: 'REMOVED',
        idir_userid: null,
        bceid_userid: null
      };
      await api.submitAccessRequest(accessRequest);
      setSubmitted(true);
    }
  };

  if (props?.location?.state?.updateInfo && props?.location?.state?.updateInfo === true) {
    isUpdating = true;
  } else {
    isUpdating = false;
  }

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
      userInfo?.employer && setEmployer(userInfo?.employer.split(','));
      userInfo?.funding_agencies && setFundingAgencies(userInfo?.funding_agencies.split(','));
      userInfo?.requested_roles && setRequestedRoles(userInfo?.requested_roles.split(','));
    }
  }, [userInfo]);

  useEffect(() => {
    const userName = authState.username;
    const fetchFundingAgencies = async () => {
      const response = await api.getFundingAgencies();
      setFundingAgenciesList(response);
    };
    const fetchEmployers = async () => {
      const response = await api.getEmployers();
      setEmployersList(response);
    };
    const fetchAccessRequestData = async () => {
      const response = await api.getAccessRequestData({ username: userName });
      setUserInfo(response);
    };
    fetchAccessRequestData();
    fetchFundingAgencies();
    fetchEmployers();
    api.getRoles().then((response) => {
      if (userInfo?.requested_roles.indexOf('administrator') == -1)
        setRoles(response.filter(res => res.role_name.indexOf('administrator') == -1));
      else
        setRoles(response);
    });
  }, []);

  const handleAccountRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAccountType(event.target.value);
  };

  const handleEmployerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmployer(event.target.value);
  };

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  const getAgencyDescription = (name: string): string => fundingAgenciesList.find(({ code_name }) => code_name === name)?.code_description;

  const getEmployerDescription = (name: string): string => employersList.find(({ code_name }) => code_name === name)?.code_description;

  const getRoleDescription = (name: string): string => roles.find(({ role_name }) => role_name === name)?.role_description;

  const handleRequestedRoleChange = (event: SelectChangeEvent<typeof requestedRoles>) => {
    const {
      target: { value }
    } = event;
    setRequestedRoles(typeof value === 'string' ? value.split(',') : value);
  };

  const handleFundingAgenciesChange = (event: SelectChangeEvent<typeof fundingAgencies>) => {
    const {
      target: { value },
    } = event;
    setFundingAgencies(typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <Container>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography variant="h4" align="center">
            InvasivesBC Access Request
          </Typography>
        </Grid>
        <Grid item xs={12} style={{ marginBottom: 50 }}>
          <Card elevation={8}>
            {!submitted && (
              <CardContent>
                {/* {!isUpdating && (
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
                )}
                {transferAccess === 'no' && (
                  <Typography variant="body1" align="center">
                    You will be removed from the InvasivesBC lists moving forward. You may, of course, rejoin us at any
                    time.
                  </Typography>
                )} */}
                {(transferAccess === 'yes' || isUpdating) && (
                  <Grid container direction="column" spacing={3}>
                    {!isUpdating && (
                      <Grid item>
                        {' '}
                        <Typography variant="body1" align="center">
                          The following information is required to properly establish your access to the new InvasivesBC
                          applications. This information will not be shared with any other organization within
                          government or externally with other agencies.
                          <br />
                          <br />
                          If you have more than one IAPP user account (i.e. two or more BCeIDs), please provide a
                          separate form for each account.
                          <br />
                        </Typography>
                      </Grid>
                    )}
                    {isUpdating && (
                      <Grid item>
                        <Typography variant="body1" align="center">
                          Please update any necessary fields if they have changed since you submitted your access
                          request. Your information will be updated upon review.
                        </Typography>
                      </Grid>
                    )}
                    {!isUpdating && (
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
                                error={!!idirErrorText}
                                id="idir"
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
                                error={!!bceidErrorText}
                                id="bceid"
                                label="BCeID Account Name"
                              />
                            </Grid>
                          )}
                        </Grid>
                      </Grid>
                    )}
                    <Grid item>
                      <Grid container direction="row" spacing={5}>
                        <Grid item>
                          <TextField
                            required
                            style={{ width: 320 }}
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            variant="outlined"
                            error={!!firstNameErrorText}
                            id="first-name"
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
                            error={!!lastNameErrorText}
                            id="last-name"
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
                            error={!!emailErrorText}
                            id="primary-email"
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
                            id="work-phone"
                            label="Work Phone (optional)"
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item>
                      <Grid container direction="row" spacing={5}>
                        <Grid item>
                          <Tooltip placement="left" title="Who do you work for?">
                            <>
                              <InputLabel htmlFor="employer">
                                Employer
                              </InputLabel>
                              <Select
                                label="Employer"
                                id="employer"
                                required
                                // variant="outlined"
                                style={{ width: 1000 }}
                                multiple
                                value={employer}
                                error={!!employerErrorText}
                                onChange={handleEmployerChange}
                                input={<OutlinedInput label="Employer" />}
                                renderValue={(selected) => (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => (
                                      <Chip key={value} label={getEmployerDescription(value)} />
                                    ))}
                                  </Box>
                                )}
                                MenuProps={MenuProps}
                              >
                                {employersList.map((employer) => (
                                  <MenuItem
                                    key={employer.code_id}
                                    value={employer.code_name}
                                  >
                                    {employer.code_description}
                                  </MenuItem>
                                ))}
                              </Select>
                            </>
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
                            <>
                              <InputLabel htmlFor="funding-agency">
                                Funding Agencies
                              </InputLabel>
                              <Select
                                label="Funding Agencies"
                                id="funding-agency"
                                required
                                // variant="outlined"
                                style={{ width: 1000 }}
                                multiple
                                value={fundingAgencies}
                                error={!!fundingAgenciesErrorText}
                                onChange={handleFundingAgenciesChange}
                                input={<OutlinedInput label="Funding" />}
                                renderValue={(selected) => (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => (
                                      <Chip key={value} label={getAgencyDescription(value)} />
                                    ))}
                                  </Box>
                                )}
                                MenuProps={MenuProps}
                              >
                                {fundingAgenciesList.map((fundingAgency) => (
                                  <MenuItem
                                    key={fundingAgency.code_id}
                                    value={fundingAgency.code_name}
                                  >
                                    {fundingAgency.code_description}
                                  </MenuItem>
                                ))}
                              </Select>
                            </>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item>
                      <Grid container direction="row" spacing={5} style={{ marginBottom: '10px' }}>
                        <Grid item>
                          <Tooltip placement="left" title="Pesticide Applicator Certificate (PAC) Number">
                            <TextField
                              value={pacNumber}
                              type={'number'}
                              onChange={(e) => {
                                const inputnumber = Number.parseInt(e.target.value);
                                if (inputnumber) {
                                  setPacNumber(inputnumber);
                                }
                              }}
                              style={{ width: 320 }}
                              variant="outlined"
                              id="pac-number"
                              label="PAC Number"
                            />
                          </Tooltip>
                        </Grid>
                        <Grid item>
                          <Tooltip
                            placement="left"
                            title="Enter the Service licence Number and Company name separated by a dash and no spaces">
                            <TextField
                              value={psn1}
                              onChange={(e) => setPsn1(e.target.value)}
                              style={{ width: 320 }}
                              variant="outlined"
                              id="psn1"
                              label="Pesticide Service Number #1"
                            />
                          </Tooltip>
                        </Grid>
                        <Grid item>
                          <Tooltip
                            placement="left"
                            title="Enter the Service licence Number and Company name separated by a dash and no spaces">
                            <TextField
                              value={psn2}
                              onChange={(e) => setPsn2(e.target.value)}
                              style={{ width: 320 }}
                              variant="outlined"
                              id="psn2"
                              label="Pesticide Service Number #2"
                            />
                          </Tooltip>
                        </Grid>
                      </Grid>
                      <Grid item>
                        <Grid container direction="row" spacing={5}>
                          <Grid item>
                            <Tooltip
                              placement="left"
                              title="Select one or more roles to request.">
                              <>
                                <InputLabel htmlFor="requested-roles">
                                  Requested roles
                              </InputLabel>
                                <Select
                                  label="Requested roles"
                                  id="requested-roles"
                                  required
                                  // variant="outlined"
                                  style={{ width: 1000 }}
                                  multiple
                                  value={requestedRoles}
                                  error={!!requestedRolesErrorText}
                                  onChange={handleRequestedRoleChange}
                                  input={<OutlinedInput label="Requested roles" />}
                                  renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                      {selected.map((value) => (
                                        <Chip key={value} label={getRoleDescription(value)} />
                                      ))}
                                    </Box>
                                  )}
                                  MenuProps={MenuProps}
                                >
                                  {roles.map((role) => (
                                    <MenuItem
                                      key={role.role_id}
                                      value={role.role_name}
                                    >
                                      {role.role_description}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </>
                            </Tooltip>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid container direction="row" spacing={5}>
                        <Grid item style={{ marginBottom: '10px', marginTop: '10px' }}>
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
                          {!isUpdating && (
                            <Typography variant="body1" align="center">
                              We will inform you when the training materials are ready and again when your access is
                              approved
                            </Typography>
                          )}
                          {isUpdating && (
                            <Typography variant="body1" align="center">
                              We will inform you when your information has been updated.
                            </Typography>
                          )}
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
                    {!isUpdating && (
                      <Typography variant="body1" align="center">
                        Thank you for submitting your request.
                      </Typography>
                    )}
                    {isUpdating && (
                      <Typography variant="body1" align="center">
                        Your request to update your information has been received. We will inform you when your
                        information has been updated.
                      </Typography>
                    )}
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
                {!submitted && !isUpdating && (
                  <Button
                    style={{ maxWidth: '300px', minWidth: '225px' }}
                    variant="contained"
                    color="primary"
                    onClick={transferAccess === 'yes' ? submitAccessRequest : declineAccess}>
                    {transferAccess === 'yes' ? 'Submit Access Request' : 'Remove me from the list'}
                  </Button>
                )}
                {!submitted && isUpdating && (
                  <Button
                    style={{ maxWidth: '300px', minWidth: '225px' }}
                    variant="contained"
                    color="primary"
                    onClick={submitUpdateRequest}>
                    Submit Update Request
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
