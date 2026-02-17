import { useInvasivesApi } from 'hooks/useInvasivesApi';
import { ChangeEvent, useEffect, useState } from 'react';
import {
  Button,
  Chip,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  TextField
} from '@mui/material';
import { selectAuth } from 'state/reducers/auth';
import { useSelector } from 'utils/use_selector';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import 'UI/Features/AccessRequest/AccessRequestPage.css';
import { useNavigate } from 'react-router';

const AccessRequestPage = () => {
  enum AuthOptions {
    BCeID = 'BCeID',
    IDIR = 'IDIR'
  }

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        maxWidth: 250
      }
    }
  };
  const getAgencyDescription = (name: string): string =>
    fundingAgenciesList.find(({ code_name }) => code_name === name)?.code_description;

  const getEmployerDescription = (name: string): string =>
    employersList.find(({ code_name }) => code_name === name)?.code_description;

  const getRoleDescription = (name: string): string =>
    roles.find(({ role_name }) => role_name === name)?.role_description;

  const handleRequestedRoleChange = (event: SelectChangeEvent<typeof requestedRoles>) => {
    const {
      target: { value }
    } = event;
    setRequestedRoles(typeof value === 'string' ? value.split(',') : value);
  };

  const handleFundingAgenciesChange = (event: SelectChangeEvent<typeof fundingAgencies>) => {
    const {
      target: { value }
    } = event;
    if (!value || value?.length < 0) {
      setFundingAgenciesErrorText('');
    }
    setFundingAgencies(typeof value === 'string' ? value.split(',') : value);
  };

  const api = useInvasivesApi();
  const authState = useSelector(selectAuth);
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState<AuthOptions>(AuthOptions.IDIR);
  const [bceid, setBceid] = useState<string>(authState?.username ?? '');
  const [comments, setComments] = useState<string>();
  const [email, setEmail] = useState(authState.email ?? '');
  const [employer, setEmployer] = useState<string[]>([]);
  const [employersList, setEmployersList] = useState<any[]>([]);
  const [firstName, setFirstName] = useState<string>(authState?.displayName?.split(' ')[1] ?? '');
  const [formValid, setFormValid] = useState<boolean>(false);
  const [fundingAgencies, setFundingAgencies] = useState<string[]>([]);
  const [fundingAgenciesList, setFundingAgenciesList] = useState<any[]>([]);
  const [idir, setIdir] = useState<string>(authState?.username ?? '');
  const [lastName, setLastName] = useState(authState?.displayName?.split(' ')[0].replace(',', '') ?? '');
  const [pacNumber, setPacNumber] = useState<number>();
  const [phone, setPhone] = useState<string>();
  const [psn1, setPsn1] = useState<string>();
  const [psn2, setPsn2] = useState<string>();
  const [requestedRoles, setRequestedRoles] = useState<string[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<Record<PropertyKey, any>>();

  // Validation Error Messages
  const [bceidErrorText, setBceidErrorText] = useState<string>();
  const [emailErrorText, setEmailErrorText] = useState<string>();
  const [employerErrorText, setEmployerErrorText] = useState<string>();
  const [firstNameErrorText, setFirstNameErrorText] = useState<string>();
  const [fundingAgenciesErrorText, setFundingAgenciesErrorText] = useState<string>();
  const [idirErrorText, setIdirErrorText] = useState<string>();
  const [lastNameErrorText, setLastNameErrorText] = useState<string>();
  const [requestedRolesErrorText, setRequestedRolesErrorText] = useState<string>();
  const isUpdating = authState?.roles?.length > 0 && authState?.extendedInfo?.account_status === 1;
  const idir_userid = authState?.idir_user_guid ?? '';
  const bceid_userid = authState?.bceid_user_guid ?? '';

  const submitAccessRequest = async () => {
    if (formValid) {
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
      await api.submitAccessRequest(accessRequest).then(() => {
        setSubmitted(true);
      });
    }
  };
  useEffect(() => {
    let isFormValid: boolean = true;
    const requiredFields: Array<{ value: string | string[]; error: any; text: string }> = [
      { value: firstName, error: setFirstNameErrorText, text: 'Please enter First name ' },
      { value: lastName, error: setLastNameErrorText, text: 'Please enter Last name ' },
      { value: email, error: setEmailErrorText, text: 'Please enter primary Email ' },
      { value: employer, error: setEmployerErrorText, text: 'Please enter Employer ' },
      {
        value: fundingAgencies?.join(),
        error: setFundingAgenciesErrorText,
        text: 'Please enter 1 or more Funding Agencies'
      },
      {
        value: requestedRoles?.join(),
        error: setRequestedRolesErrorText,
        text: 'Please enter 1 or more Requested Roles'
      }
    ];

    if (accountType === AuthOptions.IDIR) {
      requiredFields.push({ value: idir, error: setIdirErrorText, text: 'Please enter IDIR name ' });
    } else if (accountType === AuthOptions.BCeID) {
      requiredFields.push({ value: bceid, error: setBceidErrorText, text: 'Please enter BCeID ' });
    }

    requiredFields.forEach((field) => {
      if (!field.value || field.value.length === 0) {
        isFormValid = false;
        field.error(field.text);
      } else {
        field.error('');
      }
    });
    setFormValid(isFormValid);
  }, [
    accountType,
    bceid,
    comments,
    email,
    employer,
    employersList,
    firstName,
    formValid,
    fundingAgencies,
    fundingAgenciesList,
    idir,
    lastName,
    pacNumber,
    phone,
    psn1,
    psn2,
    requestedRoles,
    roles,
    submitted,
    userInfo
  ]);

  const submitUpdateRequest = async () => {
    if (formValid) {
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
        idirUserId: idir_userid,
        bceidUserId: bceid_userid
      };
      await api.submitUpdateRequest(updateRequest);
      setSubmitted(true);
    }
  };

  useEffect(() => {
    if (userInfo !== undefined) {
      if (userInfo?.idir_account_name) {
        setAccountType(AuthOptions.IDIR);
        setIdir(userInfo?.idir_account_name);
      } else if (userInfo?.bceid_business_name) {
        setAccountType(AuthOptions.BCeID);
        setBceid(userInfo?.bceid_business_name);
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
        setRoles(response.filter((res) => res.role_name.indexOf('administrator') == -1));
      else setRoles(response);
    });
  }, []);

  const handleAccountRadioChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAccountType(event.target.value as AuthOptions);
  };

  const handleEmployerChange = (event: SelectChangeEvent<string[]>) => {
    setEmployer(event.target.value as string[]);
  };

  if (submitted) {
    return (
      <div id="access-request-page">
        <h1>InvasivesBC Access Request</h1>
        <div className="content">
          <p>
            {isUpdating
              ? 'Your request to update your information has been received. We will inform you when your information has been updated.'
              : 'Thank you for submitting your request'}
          </p>
          <Button
            color="primary"
            variant="outlined"
            onClick={() => {
              navigate('/');
            }}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div id="access-request-page">
      <h1>InvasivesBC Access Request</h1>
      <form className="content">
        {isUpdating ? (
          <p>
            Please update any necessary fields if they have changed since you submitted your access request. Your
            information will be updated upon review.
          </p>
        ) : (
          <>
            <p>
              The following information is required to properly establish your access to the new InvasivesBC
              applications. This information will not be shared with any other organization within government or
              externally with other agencies.
            </p>

            <p>
              If you have more than one IAPP user account (i.e. two or more BCeIDs), please provide a separate form for
              each account.
            </p>
          </>
        )}
        {!isUpdating && (
          <section className="new-user">
            <fieldset className="account-type">
              <legend>Account type</legend>
              <RadioGroup
                row
                aria-label="account-type"
                name="row-radio-buttons-group"
                value={accountType}
                onChange={handleAccountRadioChange}
              >
                <FormControlLabel control={<Radio />} label={AuthOptions.IDIR} value={AuthOptions.IDIR} />
                <FormControlLabel control={<Radio />} label={AuthOptions.BCeID} value={AuthOptions.BCeID} />
              </RadioGroup>
            </fieldset>
            {
              {
                [AuthOptions.IDIR]: (
                  <TextField
                    value={idir}
                    onChange={(e) => setIdir(e.target.value)}
                    required
                    error={!!idirErrorText}
                    helperText={idirErrorText}
                    id="idir"
                    label="IDIR Account Name"
                  />
                ),
                [AuthOptions.BCeID]: (
                  <TextField
                    required
                    value={bceid}
                    onChange={(e) => setBceid(e.target.value)}
                    error={!!bceidErrorText}
                    helperText={bceidErrorText}
                    id="bceid"
                    label="BCeID Account Name"
                  />
                )
              }[accountType]
            }
          </section>
        )}
        <section className="contact-information">
          <TextField
            required
            value={firstName ?? ''}
            onChange={(e) => setFirstName(e.target.value)}
            error={!!firstNameErrorText}
            helperText={firstNameErrorText}
            id="first-name"
            label="First Name"
          />
          <TextField
            required
            value={lastName ?? ''}
            onChange={(e) => setLastName(e.target.value)}
            error={!!lastNameErrorText}
            helperText={lastNameErrorText}
            id="last-name"
            label="Last Name"
          />
          <TextField
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!emailErrorText}
            helperText={emailErrorText}
            id="primary-email"
            label="Primary Email"
          />
          <TextField
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            id="work-phone"
            label="Work Phone (optional)"
          />
        </section>
        <section className="employer-details">
          <FormControl>
            <FormLabel>
              Employer <TooltipWithIcon tooltipText="Who do you work for?" />
            </FormLabel>
            <Select
              id="employer"
              required
              multiple
              value={employer ?? []}
              error={!!employerErrorText}
              onChange={handleEmployerChange}
              renderValue={(selected) => (
                <div className="selected-menu-options">
                  {selected?.map((value) => (
                    <Chip key={value} label={getEmployerDescription(value)} />
                  ))}
                </div>
              )}
              MenuProps={MenuProps}
            >
              {employersList?.map((employer) => (
                <MenuItem key={employer.code_id} value={employer.code_name}>
                  {employer.code_description}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText error>{employerErrorText}</FormHelperText>
          </FormControl>
          <FormControl>
            <FormLabel>
              Funding Agencies&nbsp;
              <TooltipWithIcon tooltipText="Select one or more funding agencies that you collect/provide Invasives content for. May or may not be the same as your employer." />
            </FormLabel>
            <Select
              id="funding-agency"
              required
              multiple
              value={fundingAgencies}
              error={!!fundingAgenciesErrorText}
              onChange={handleFundingAgenciesChange}
              renderValue={(selected) => (
                <div className="selected-menu-options">
                  {selected?.map((value) => (
                    <Chip key={value} label={getAgencyDescription(value)} />
                  ))}
                </div>
              )}
              MenuProps={MenuProps}
            >
              {fundingAgenciesList?.map((fundingAgency) => (
                <MenuItem key={fundingAgency.code_id} value={fundingAgency.code_name}>
                  {fundingAgency.code_description}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText error>{fundingAgenciesErrorText}</FormHelperText>
          </FormControl>
        </section>
        <section className="licensing-details">
          <TextField
            value={pacNumber ?? ''}
            onChange={(e) => {
              const userInput = e.target.value;
              if (RegExp(/^\d+$/).test(e.target.value)) {
                setPacNumber(Number.parseInt(e.target.value) ?? '');
              } else if (userInput === '') {
                setPacNumber(undefined);
              }
            }}
            id="pac-number"
            label={
              <>
                PAC Number <TooltipWithIcon tooltipText="Pesticide Applicator Certificate (PAC) Number" />
              </>
            }
          />
          <TextField
            value={psn1}
            onChange={(e) => setPsn1(e.target.value)}
            id="psn1"
            label={
              <>
                Pesticide Service Number #1&nbsp;
                <TooltipWithIcon tooltipText="Enter the Service licence Number and Company name separated by a dash and no spaces" />
              </>
            }
          />
          <TextField
            value={psn2}
            onChange={(e) => setPsn2(e.target.value)}
            id="psn2"
            label={
              <>
                Pesticide Service Number #2&nbsp;
                <TooltipWithIcon tooltipText="Enter the Service licence Number and Company name separated by a dash and no spaces" />
              </>
            }
          />
        </section>
        <section className="requested-roles">
          <FormControl>
            <FormLabel>
              Requested roles <TooltipWithIcon tooltipText="Select one or more roles to request." />
            </FormLabel>
            <Select
              id="requested-roles"
              required
              multiple
              value={requestedRoles}
              error={!!requestedRolesErrorText}
              onChange={handleRequestedRoleChange}
              renderValue={(selected) => (
                <div className="selected-menu-options">
                  {selected?.map((value) => (
                    <Chip key={value} label={getRoleDescription(value)} />
                  ))}
                </div>
              )}
              MenuProps={MenuProps}
            >
              {roles?.map((role) => (
                <MenuItem key={role.role_id} value={role.role_name}>
                  {role.role_description}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText error>{requestedRolesErrorText}</FormHelperText>
          </FormControl>
        </section>
        <section className="additional-comments">
          <TextField
            multiline
            rows={4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            name="Comments"
            id="comments"
            placeholder="If your employer or agency were not on our lists, please enter it here."
            label={
              <>
                Additional Comments&nbsp;
                <TooltipWithIcon tooltipText="If your employer or agency were not on our lists, please enter it here." />
              </>
            }
          />
        </section>
        <section className="closing-remark">
          <p>
            {isUpdating
              ? 'We will inform you when your information has been updated.'
              : 'We will inform you when the training materials are ready and again when your access is approved'}
          </p>
        </section>
        <div className="controls">
          <Button
            color="primary"
            variant="outlined"
            onClick={() => {
              navigate('/');
            }}
          >
            Go Back
          </Button>
          {!isUpdating && (
            <Button variant="contained" color="primary" disabled={!formValid} onClick={submitAccessRequest}>
              Submit Access Request
            </Button>
          )}
          {isUpdating && (
            <Button variant="contained" color="primary" disabled={!formValid} onClick={submitUpdateRequest}>
              Submit Update Request
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AccessRequestPage;
