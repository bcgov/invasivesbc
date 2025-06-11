import { HelpCenter, Menu, Newspaper, OfflineBolt } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import CustomPopover from 'UI/Reusable/CustomPopover/CustomPopover';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LogoutIcon from '@mui/icons-material/Logout';
import { AppDispatch, useDispatch, useSelector } from 'utils/use_selector';
import { useEffect, useState } from 'react';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { useHistory } from 'react-router-dom';
import Alerts from 'state/actions/alerts/Alerts';
import { AuthActions } from 'state/actions/auth/Auth';
import MapActions from 'state/actions/map';
import { selectAuth } from 'state/reducers/auth';
import { NetworkStateControl } from 'UI/Layout/OverlayLayout/Header/NetworkStateControl';

import 'UI/Layout/OverlayLayout/Header/Mobile/MobileHeader.css';
import { LayoutMode } from 'UI/Layout/Routes/PrimaryNavigation';
import EventActions from 'state/actions/events/EventActions';
import { MobileOnly } from 'UI/Reusable/Predicates/MobileOnly';
import { FeatureGated } from 'UI/Reusable/Predicates/FeatureGated';

const LogoutButton = () => {
  const dispatch = useDispatch();
  const signOutAndTogglePanel = () => {
    return (dispatch: AppDispatch) => {
      dispatch(EventActions.setLayoutParameters({ viewLayout: LayoutMode.MAP_EXCLUSIVE }));
      dispatch(AuthActions.signoutRequest());
      dispatch(MapActions.toggleOverlay('public_layer'));
    };
  };
  return (
    <li>
      <button
        onClick={() => {
          dispatch(signOutAndTogglePanel());
        }}
      >
        <LogoutIcon />
        Logout
      </button>
    </li>
  );
};

const LoginButton = ({ labelText = 'Login', idpHint, disabled }) => {
  const dispatch = useDispatch();
  return (
    <li>
      <button disabled={disabled} onClick={() => dispatch(AuthActions.signinRequest({ idpHint }))}>
        <VpnKeyIcon />
        {labelText}
      </button>
    </li>
  );
};

const HeaderPopover = () => {
  const handleHamburgerClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    dispatch(Alerts.deleteAll());
  };
  const navToUpdateRequest = () => {
    history.push({ pathname: '/AccessRequest' });
    dispatch(EventActions.setLayoutParameters({ viewLayout: LayoutMode.MAP_HIDDEN }));
  };

  const requestAccess = async () => {
    if (!authenticated) {
      dispatch(AuthActions.signinRequest({}));
    } else {
      history.push('/AccessRequest');
      dispatch(EventActions.setLayoutParameters({ viewLayout: LayoutMode.MAP_HIDDEN }));
    }
  };
  const history = useHistory();
  const dispatch = useDispatch();

  const activated = useSelector((state) => state.UserInfo.activated);
  const { authenticated, offlineUsers, workingOffline, loggedInOrWorkingOffline } = useSelector(selectAuth);
  const loginInProgress = useSelector((state) => state.Auth.loginInProgress);
  const [offlineUserSelectionAvailable, setOfflineUserSelectionAvailable] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const { MOBILE } = useSelector((state) => state.Configuration.current.build);

  useEffect(() => {
    if (!MOBILE || authenticated || workingOffline) {
      setOfflineUserSelectionAvailable(false);
    } else if (offlineUsers.length > 0) {
      setOfflineUserSelectionAvailable(true);
    }
  }, [offlineUsers, authenticated, workingOffline, MOBILE]);

  return (
    <>
      <IconButton onClick={handleHamburgerClick}>
        <Menu htmlColor="#FFF" />
      </IconButton>
      <CustomPopover buttonOverrideOptions={{ anchorEl, setAnchorEl }} horizontal={'left'}>
        <div className="hamburger-nav">
          <section className="network-section">
            <NetworkStateControl />
          </section>
          <ul>
            {loggedInOrWorkingOffline && (
              <li>
                <button onClick={() => history.push('/OfflineTiles')}>
                  <OfflineBolt />
                  Tile Cache Status
                </button>
              </li>
            )}
            {activated && (
              <li>
                <button onClick={activated ? navToUpdateRequest : requestAccess}>
                  <AssignmentIcon />
                  Update My Info
                </button>
              </li>
            )}
            {loggedInOrWorkingOffline && (
              <>
                <li>
                  <button onClick={() => history.push('/News')}>
                    <Newspaper />
                    What's New
                  </button>
                </li>
                <MobileOnly>
                  <FeatureGated requires={'USER_GUIDE'}>
                    <li>
                      <button onClick={() => history.push('/Guide')}>
                        <HelpCenter />
                        User Guide
                      </button>
                    </li>
                  </FeatureGated>
                </MobileOnly>
              </>
            )}
            {offlineUserSelectionAvailable && (
              <li>
                <button
                  onClick={() => {
                    setAnchorEl(null);
                    dispatch(AuthActions.openOfflineUserSelectionDialog(true));
                  }}
                >
                  <AssignmentIcon />
                  Choose Offline User
                </button>
              </li>
            )}
            {workingOffline && [
              <LoginButton
                labelText={'Go Online (IDIR)'}
                idpHint={'idir'}
                key={'idir-go'}
                disabled={loginInProgress}
              />,
              <LoginButton
                labelText={'Login (BCEID Business)'}
                idpHint={'bceidbusiness'}
                key={'bceidbusiness-go'}
                disabled={loginInProgress}
              />
            ]}
            {authenticated || workingOffline ? (
              <LogoutButton />
            ) : (
              [
                <LoginButton labelText={'Login (IDIR)'} idpHint={'idir'} key={'idir'} disabled={loginInProgress} />,
                <LoginButton
                  labelText={'Login (BCEID Business)'}
                  idpHint={'bceidbusiness'}
                  key={'bceidbusiness'}
                  disabled={loginInProgress}
                />
              ]
            )}
          </ul>
        </div>
      </CustomPopover>
    </>
  );
};

export default HeaderPopover;
