import './Landing.css';
import { Box, Button, Divider, Grid } from '@mui/material';
import { selectNetworkConnected } from 'state/reducers/network';
import { selectAuth } from 'state/reducers/auth';
import { selectUserInfo } from 'state/reducers/userInfo';
import { useSelector } from 'utils/use_selector';
import { useDispatch } from 'react-redux';
import { TOGGLE_PANEL } from 'state/actions';
import { useHistory } from 'react-router';
import { INFORMATIONAL_LINKS } from 'constants/links';
import { MobileOnly } from 'UI/Reusable/Predicates/MobileOnly';
import { AuthActions } from 'state/actions/auth/Auth';
import DataSharingAgreement from './DataSharingAgreement/DataSharingAgreement';
import IosDownloadLink from 'UI/Reusable/IosDownloadLink/IosDownloadLink';
import AndroidDownloadLink from 'UI/Reusable/AndroidDownloadLink/AndroidDownloadLink';
import { WebOnly } from 'UI/Reusable/Predicates/WebOnly';
import { FeatureGated } from 'UI/Reusable/Predicates/FeatureGated';

const InformationalLinkBox = () => {
  return (
    <MobileOnly>
      {/*web receives this in the footer, but the footer is hidden on mobile*/}
      <Box mt={4} className={'links-box'}>
        <u>Informational Links</u>
        <ul>
          {INFORMATIONAL_LINKS.map((link) => (
            <li key={link.label}>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </Box>
    </MobileOnly>
  );
};

export const LandingComponent = () => {
  const connected = useSelector(selectNetworkConnected);
  const dispatch = useDispatch();
  const history = useHistory();

  const requestAccess = async () => {
    if (connected && !authenticated) {
      dispatch(AuthActions.signinRequest({}));
    } else {
      history.push('/AccessRequest');
      dispatch({
        type: TOGGLE_PANEL,
        payload: { panelOpen: true, fullScreen: true }
      });
    }
  };

  const { authenticated, loggedInOrWorkingOffline, workingOffline, username, displayName, email, roles } =
    useSelector(selectAuth);
  const { loaded: userInfoLoaded, activated } = useSelector(selectUserInfo);
  return (
    <section id="landing">
      <div className="content">
        <h2>Welcome to the InvasivesBC Application!</h2>
        <FeatureGated requires={'DEGRADED_EXPERIENCE_WARNING'}>
          <Box mt={2} className="degraded-experience-warning">
            <h3>Reduced Experience Warning</h3>
            <p>
              Your device does not report sufficient available memory to reliably enable all features. Some features
              have been disabled.
            </p>
          </Box>
        </FeatureGated>
        {(userInfoLoaded || loggedInOrWorkingOffline) && (
          <>
            <Box mt={2}>
              <h3>User Information</h3>
              <Grid className="userInfoItemGrid" container spacing={2} sx={{ mt: 2 }}>
                <Grid item md={3}>
                  <Box overflow="hidden" textOverflow="ellipsis">
                    <p>
                      <strong>Name:</strong>
                    </p>
                    {displayName}
                  </Box>
                </Grid>
                <Divider className="h-divider" flexItem={true} orientation="vertical" />
                <Grid item md={3}>
                  <Box overflow="hidden" textOverflow="ellipsis">
                    <p>
                      <strong>Email:</strong>
                    </p>
                    {email}
                  </Box>
                </Grid>
                <Divider className="h-divider" flexItem={true} orientation="vertical" />
                <Grid item md={3}>
                  <Box overflow="hidden" textOverflow="ellipsis">
                    <p>
                      <strong>Username:</strong>
                    </p>
                    {username}
                  </Box>
                </Grid>
              </Grid>
            </Box>
            <Box mt={6}>
              <Grid className="userInfoItemGrid" container spacing={2}>
                {!workingOffline && (
                  <>
                    <Grid item md={3}>
                      <Box overflow="hidden" textOverflow="ellipsis">
                        <p>
                          <strong>Activation Status:</strong>
                        </p>
                        {activated ? 'Activated' : 'Not Activated'}
                      </Box>
                    </Grid>
                    <Divider className="h-divider" flexItem={true} orientation="vertical" />
                  </>
                )}
                {roles.length > 0 && (
                  <Grid item md={8}>
                    <Box overflow="hidden" textOverflow="ellipsis">
                      <p>
                        <strong>Roles:</strong>
                      </p>
                      {roles.map((role) => (
                        <p key={role.role_id}>{role.role_name}</p>
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
            <Box mt={8}>
              <Divider />
            </Box>
            <Box mt={10}>
              <h3 className="landing-header">PRIVACY REQUIREMENTS AND LEGAL DISCLAIMER:</h3>
            </Box>
            <Box mt={4}>
              <ul>
                <li>
                  Names, addresses or other information that could be used to identify an individual that is not
                  registered as a user in this system are not permitted and will be deleted from a record if found. Eg:
                  a location description that contains an address or a person's name.
                </li>
                <li>
                  InvasivesBC has a drinking well warning system built in that will notify the user if a <u>mapped</u>{' '}
                  well or water license is located within close proximity to the geometry of the record being entered.
                  This tool is to be used for information only, and the absence of a well warning does NOT confirm there
                  are not wells or water licences in close proximity. Many wells and water licences are unmapped in BC.
                  It remains the responsibility of the pesticide applicator to confirm water sources and wells prior to
                  application of pesticides, and not rely solely on the well indicator in InvasivesBC.
                </li>
              </ul>
            </Box>
            <Box mt={4}>By using this application, you agree to the Data Sharing Agreement</Box>
            <Box mt={1}>
              <DataSharingAgreement />
            </Box>
            <WebOnly>
              <Box mt={5} className="app-store-links">
                <h3 className="landing-header">Download the Mobile app:</h3>
                <p>InvasivesBC is currently available for download in the App Store. Coming soon to Google Play.</p>
                <div className="download-links">
                  <IosDownloadLink />
                  <AndroidDownloadLink />
                </div>
              </Box>
            </WebOnly>
            <Box mt={5}>
              <h3 className="landing-header">FOR MORE INFORMATION:</h3>
            </Box>
            <Box mt={4}>
              For training materials and more info:{' '}
              <a
                href="https://www2.gov.bc.ca/gov/content/environment/plants-animals-ecosystems/invasive-species/invasivesbc"
                target="_blank"
                rel="noreferrer"
              >
                www2.gov.bc.ca/gov/content/environment/plants-animals-ecosystems/invasive-species/invasivesbc
              </a>
            </Box>
            <Box mt={4}>
              Or email us at <a href="mailto:InvasivesBC@gov.bc.ca">InvasivesBC@gov.bc.ca</a>
            </Box>
            <InformationalLinkBox />
          </>
        )}
        {roles.length === 0 && (
          <p className="bottomAccess">
            To gain full access to the InvasivesBC application, please submit an access request.
          </p>
        )}
        {connected && !activated && (
          <Box mt={2} paddingBottom={'50px'}>
            <Button variant="outlined" color="primary" onClick={requestAccess}>
              Request Access
            </Button>
          </Box>
        )}
        {!loggedInOrWorkingOffline && (
          <>
            <Box mt={8}>
              <Divider />
            </Box>
            <Box mt={8}>
              <strong>
                <i>InvasivesBC</i> is British Columbia's province-wide mapping and data collection system for invasive
                species.
              </strong>
            </Box>
            <Box mt={8}>
              <u>
                <strong>IF YOU ARE A NEW USER: </strong>
              </u>
            </Box>
            <Box mt={4}>
              <strong>To request access: </strong> click the “REQUEST ACCESS” button at the top of the page and fill out
              the request access form. Please note that the employer and funding agency information provided will be
              used to autofill those fields into the activity forms, therefore it is important you complete the full
              access form with your current employer and all potential funding agencies. An active IDIR or Business
              BCEID is required to request access.
            </Box>
            <Box mt={8}>
              <u>
                <strong>IF YOU ARE AN EXISTING USER: </strong>
              </u>
            </Box>
            <Box mt={4}>
              <strong>To log in: </strong> click the person icon at the top right of the page and select "Login".
            </Box>
            <Box mt={4}>
              <strong>To update or change your account details: </strong> log in and then choose "update my info" from
              the person icon on the top right.
            </Box>
            <WebOnly>
              <Box mt={5} className="app-store-links">
                <h3 className="landing-header">Download the Mobile app:</h3>
                <p>InvasivesBC is currently available for download in the App Store. Coming soon to Google Play.</p>
                <div className="download-links">
                  <IosDownloadLink />
                  <AndroidDownloadLink />
                </div>
              </Box>
            </WebOnly>
            <Box mt={8}>
              <u>
                <strong>FOR MORE INFORMATION: </strong>
              </u>
            </Box>
            <Box mt={4}>
              For training materials and more info:{' '}
              <a
                href="https://www2.gov.bc.ca/gov/content/environment/plants-animals-ecosystems/invasive-species"
                target="_blank"
                rel="noreferrer"
              >
                www2.gov.bc.ca/gov/content/environment/plants-animals-ecosystems/invasive-species
              </a>
            </Box>
            <Box mt={4}>
              Or email us at <a href="mailto:InvasivesBC@gov.bc.ca">InvasivesBC@gov.bc.ca</a>
            </Box>
            <InformationalLinkBox />
          </>
        )}
      </div>
    </section>
  );
};
