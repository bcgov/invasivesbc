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
import axios from 'axios';

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

  const fundingAgenciesList = [
    'Agriculture and Agri-Food Canada',
    'Apollo Forest Products Ltd.',
    'ATCO Wood Products Ltd.',
    'BC Hydro and Power Authority',
    'BC Oil and Gas Commission',
    'Bella Bella Asset Holdings Ltd.',
    'British Columbia Transmission Corporation',
    'Canfor',
    'Carrier Lumber Ltd.',
    'CP Rail',
    'Department of National Defense',
    'Diamond Head Consulting Ltd',
    'Ducks Unlimited Canada - Canards Illimites Canada',
    'Fish and Wildlife Compensation Program - Columbia Basin',
    'FortisBC Inc',
    'Gibraltar Mines Ltd.',
    'Gorman Brothers Lumber Ltd.',
    'Kinder Morgan Canada',
    'Lakeland Mills Ltd.',
    'Louisiana-Pacific Canada Ltd.',
    'Lower Kootenay Band',
    'Lower North Thompson Community Forest Society',
    'Meadow Creek Cedar Ltd.',
    'Mill & Timber Products Ltd.',
    'Osoyoos Indian Band',
    'Parks Canada',
    'Pope and Talbot Ltd.',
    'Private',
    'Richmond Plywood Corporation Limited',
    'Royal BC Museum',
    'Sechelt Indian Government District',
    'Skeetchestn Indian Band',
    'Slocan Integral Forestry Cooperative',
    'Spectra Energy',
    'Teal Cedar Products Ltd.',
    'Terasen Gas Inc',
    'The Nature Conservancy of Canada',
    'The Nature Trust of BC',
    'Thompson Rivers University',
    'Thompson Nicola Invasive Plant Management Committee',
    'Tobacco Plains Indian Band',
    'Tolko',
    "Ts'elxweyeqw Tribe Management Ltd",
    'University of British Columbia',
    'West Fraser Mills',
    'Western Forest Products Inc.',
    'Weyerhaeuser Company Limited',
    'Woodlots',
    'Wynndel Box & Lumber Co. Ltd.',
    'BC Ministry of Advanced Education and Skills Training',
    'BC Ministry of Agriculture, Food and Fisheries',
    'BC Attorney General',
    'BC Ministry of Children & Family Development',
    "BC Ministry of Citizens' Services",
    'BC Ministry of Education',
    'BC Ministry of Energy, Mines and Low Carbon Innovation',
    'BC Ministry of Environment & Climate Change Strategy',
    'BC Ministry of Finance',
    'BC Ministry of Forests, Lands, Natural Resource Operations and Rural Development',
    'BC Ministry of Health',
    'BC Ministry of Indigenous Relations & Reconciliation',
    'BC Ministry of Jobs, Economic Recovery and Innovation',
    'BC Ministry of Labour',
    'BC Ministry of Mental Health & Addictions',
    'BC Ministry of Municipal Affairs',
    'BC Ministry of Public Safety & Solicitor General & Emergency B.C.',
    'BC Ministry of Social Development & Poverty Reduction',
    'BC Ministry of Tourism, Arts, Culture and Sport',
    'BC Ministry of Transportation & Infrastructure',
    'District of 100 Mile House',
    'City of Abbotsford',
    'Village of Alert Bay',
    'Village of Anmore',
    'City of Armstrong',
    'Village of Ashcroft',
    'District of Barriere',
    'Village of Belcarra',
    'Island Municipality of Bowen Island',
    'City of Burnaby',
    'Village of Burns Lake',
    'Village of Cache Creek',
    'City of Campbell River',
    'Village of Canal Flats',
    'City of Castlegar',
    'District of Central Saanich',
    'Villiage of Chase',
    'District of Chetwynd',
    'City of Chilliwack',
    'District of Clearwater',
    'Villiage of Clinton',
    'District of Coldstream',
    'City of Colwood',
    'Town of Comox',
    'City of Coquitlam',
    'City of Courtenay',
    'City of Cranbrook',
    'Town of Creston',
    'City of Dawson Creek',
    'City of Delta',
    'City of Duncan',
    'District of Elkford',
    'City of Enderby',
    'Township of Esquimalt',
    'City of Fernie',
    'District of Fort St. James',
    'City of Fort St. John',
    'Village of Fraser Lake',
    'Village of Fruitvale',
    'Town of Gibsons',
    'Village of Gold River',
    'Town of Golden',
    'City of Grandforks',
    'Village of Granisle',
    'City of Greenwood',
    'Village of Harrison Hot Springs',
    'Village of Hazelton',
    'District of Highlands',
    'District of Hope',
    'District of Houston',
    "District of Hudson's Hope",
    'District of Invermere',
    'Mountain Resort Municipality of Jumbo Glacier',
    'City of Kamloops',
    'Village of Kaslo',
    'City of Kelowna',
    'District of Kent',
    'Village of Keremeos',
    'City of Kimberley',
    'District of Kitimat',
    'Town of Ladysmith',
    'District of Lake Country',
    'Town of Lake Cowichan',
    'City of Langford',
    'City of Langley',
    'Township of Langley',
    'District of Lantzville',
    'District of Lillooet',
    'Village of Lions Bay',
    'District of Logan Lake',
    'Village of Lumby',
    'Village of Lytton',
    'District of Mackenzie',
    'City of Maple Ridge',
    'Village of Masset',
    'Village of McBride',
    'City of Merritt',
    'District of Metchosin',
    'Village of Midway',
    'City of Mission',
    'Village of Montrose',
    'Village of Nakusp',
    'City of Nanaimo',
    'City of Nelson',
    'Village of New Denver',
    'District of New Hazelton',
    'City of New Westminister',
    'District of North Cowichan',
    'District of North Saanich',
    'City of North Vancouver',
    'District of North Vancouver',
    'Northern Rockies Regional Municipality',
    'District of Oak Bay',
    'Town of Oliver',
    'Town of Osoyoos',
    'City of Parksville',
    'District of Peachland',
    'Village of Pemberton',
    'City of Penticton',
    'City of Pitt Meadows',
    'City of Port Alberni',
    'Village of Port Alice',
    'Village of Port Clements',
    'City of Port Coquitlam',
    'District of Port Edward',
    'District of Port Hardy',
    'Town of Port McNeill',
    'City of Port Moody',
    'Village of Pouce Coupe',
    'City of Powell River',
    'City of Prince George',
    'City of Prince Rupert',
    'Town of Princeton',
    'Town of Qualicum Beach',
    'Village of Queen Charlotte',
    'City of Quesnel',
    'Village of Radium Hot Springs',
    'City of Revelstoke',
    'City of Richmond',
    'City of Rossland',
    'District of Saanich',
    'Village of Salmo',
    'City of Salmon Arm',
    'Village of Sayward',
    'District of Sechelt',
    'Sechelt Indian Government District',
    'District of Sicamous',
    'Town of Sidney',
    'Village of Silverton',
    'Village of Slocan',
    'Town of Smithers'
  ];
  const employerList = [
    'Parks Canada',
    'BC Ministry of Advanced Education and Skills Training',
    'BC Ministry of Agriculture, Food and Fisheries',
    'BC Attorney General',
    'BC Ministry of Children & Family Development',
    'BC Ministry of Citizens Services',
    'BC Ministry of Education',
    'BC Ministry of Energy, Mines and Low Carbon Innovation',
    'BC Ministry of Environment & Climate Change Strategy',
    'BC Ministry of Finance',
    'BC Ministry of Forests, Lands, Natural Resource Operations and Rural Development',
    'BC Ministry of Health',
    'BC Ministry of Indigenous Relations & Reconciliation',
    'BC Ministry of Jobs, Economic Recovery and Innovation',
    'BC Ministry of Labour',
    'BC Ministry of Mental Health & Addictions',
    'BC Ministry of Municipal Affairs',
    'BC Ministry of Public Safety & Solicitor General & Emergency B.C.',
    'BC Ministry of Social Development & Poverty Reduction',
    'BC Ministry of Tourism, Arts, Culture and Sport',
    'BC Ministry of Transportation & Infrastructure',
    'District of 100 Mile House',
    'City of Abbotsford',
    'Village of Alert Bay',
    'Village of Anmore',
    'City of Armstrong',
    'Village of Ashcroft',
    'District of Barriere',
    'Village of Belcarra',
    'Island Municipality of Bowen Island',
    'City of Burnaby',
    'Village of Burns Lake',
    'Village of Cache Creek',
    'City of Campbell River',
    'Village of Canal Flats',
    'City of Castlegar',
    'District of Central Saanich',
    'Villiage of Chase',
    'District of Chetwynd',
    'City of Chilliwack',
    'District of Clearwater',
    'Villiage of Clinton',
    'District of Coldstream',
    'City of Colwood',
    'Town of Comox',
    'City of Coquitlam',
    'City of Courtenay',
    'City of Cranbrook',
    'Town of Creston',
    'City of Dawson Creek',
    'City of Delta',
    'City of Duncan',
    'District of Elkford',
    'City of Enderby',
    'Township of Esquimalt',
    'City of Fernie',
    'District of Fort St. James',
    'City of Fort St. John',
    'Village of Fraser Lake',
    'Village of Fruitvale',
    'Town of Gibsons',
    'Village of Gold River',
    'Town of Golden',
    'City of Grandforks',
    'Village of Granisle',
    'City of Greenwood',
    'Village of Harrison Hot Springs',
    'Village of Hazelton',
    'District of Highlands',
    'District of Hope',
    'District of Houston',
    'District of Hudsons Hope',
    'District of Invermere',
    'Mountain Resort Municipality of Jumbo Glacier',
    'City of Kamloops',
    'Village of Kaslo',
    'City of Kelowna',
    'District of Kent',
    'Village of Keremeos',
    'City of Kimberley',
    'District of Kitimat',
    'Town of Ladysmith',
    'District of Lake Country',
    'Town of Lake Cowichan',
    'City of Langford',
    'City of Langley',
    'Township of Langley',
    'District of Lantzville',
    'District of Lillooet',
    'Village of Lions Bay',
    'District of Logan Lake',
    'Village of Lumby',
    'Village of Lytton',
    'District of Mackenzie',
    'City of Maple Ridge',
    'Village of Masset',
    'Village of McBride',
    'City of Merritt',
    'District of Metchosin',
    'Village of Midway',
    'City of Mission',
    'Village of Montrose',
    'Village of Nakusp',
    'City of Nanaimo',
    'City of Nelson',
    'Village of New Denver',
    'District of New Hazelton',
    'City of New Westminister',
    'District of North Cowichan',
    'District of North Saanich',
    'City of North Vancouver',
    'District of North Vancouver',
    'Northern Rockies Regional Municipality',
    'District of Oak Bay',
    'Town of Oliver',
    'Town of Osoyoos',
    'City of Parksville',
    'District of Peachland',
    'Village of Pemberton',
    'City of Penticton',
    'City of Pitt Meadows',
    'City of Port Alberni',
    'Village of Port Alice',
    'Village of Port Clements',
    'City of Port Coquitlam',
    'District of Port Edward',
    'District of Port Hardy',
    'Town of Port McNeill',
    'City of Port Moody',
    'Village of Pouce Coupe',
    'City of Powell River',
    'City of Prince George',
    'City of Prince Rupert',
    'Town of Princeton',
    'Town of Qualicum Beach',
    'Village of Queen Charlotte',
    'City of Quesnel',
    'Village of Radium Hot Springs',
    'City of Revelstoke',
    'City of Richmond',
    'City of Rossland',
    'District of Saanich',
    'Village of Salmo',
    'City of Salmon Arm',
    'Village of Sayward',
    'District of Sechelt',
    'Sechelt Indian Government District',
    'District of Sicamous',
    'Town of Sidney',
    'Village of Silverton',
    'Village of Slocan',
    'Town of Smithers',
    'District of Sooke',
    'Township of Spallumcheen',
    'District of Sparwood',
    'District of Squamish',
    'District of Stewart',
    'District of Summerland',
    'Mountain Resort Municipality of Sun Peaks',
    'City of Surrey',
    'Village of Tahsis',
    'District of Taylor',
    'Village of Telkwa',
    'City of Terrace',
    'District of Tofino',
    'City of Trail',
    'District of Tumbler Ridge',
    'District of Ucluelet',
    'Village of Valemount',
    'City of Vancouver',
    'District of Vanderhoof',
    'City of Vernon',
    'City of Victoria',
    'Town of View Royal',
    'Village of Warfield',
    'City of West Kelowna',
    'District of West Vancouver',
    'Resort Municipality of Whistler',
    'City of White Rock',
    'City of Williams Lake',
    'Village of Zeballos',
    'Boundary Invasive Species Society',
    'Cariboo Chilcotin Coast Invasive Plant Committee Society',
    'Central Kootenay Invasive Species Society',
    'Coastal Invasive Species Committee Society',
    'Columbia Shuswap Invasive Species Society',
    'East Kootenay Invasive Species Council',
    'Fraser Valley Invasive Species Society',
    'Invasive Species Council of British Columbia Society',
    'Invasive Species Council of Metro Vancouver Society',
    'Lillooet Regional Invasive Species Society',
    'Northwest Invasive Plant Council',
    'Okanagan and Similkameen Invasive Species Society',
    'Sea to Sky Invasive Species Council',
    'Thompson Nicola Invasive Plant Management Committee',
    'Ducks Unlimited Canada - Canards Illimites Canada'
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
      status: 'Not Approved'
    };
    console.log('Access request: ', accessRequest);

    const response = await api.submitAccessRequest(accessRequest);
    console.log('Response: ', response);
  };

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
