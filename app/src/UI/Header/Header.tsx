import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LogoutIcon from '@mui/icons-material/Logout';
import React, { PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';
import './Header.css';
import {
  Avatar,
  FormControl,
  FormControlLabel,
  Grow,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Switch
} from '@mui/material';
import { TOGGLE_PANEL } from 'state/actions';
import { useHistory } from 'react-router-dom';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import AssignmentIcon from '@mui/icons-material/Assignment';
import {
  AdminPanelSettings,
  Assessment,
  FileUpload,
  Home,
  Map,
  Newspaper,
  OfflineBolt,
  School,
  SignalWifi4Bar,
  SignalWifiOff
} from '@mui/icons-material';
import invbclogo from '/assets/InvasivesBC_Icon.svg';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import { RENDER_DEBUG } from 'UI/App';
import { AppDispatch, useDispatch, useSelector } from 'utils/use_selector';
import { selectAuth } from 'state/reducers/auth';
import { OfflineSyncHeaderButton } from 'UI/Header/OfflineSyncHeaderButton';
import { MOBILE } from 'state/build-time-config';
import NetworkActions from 'state/actions/network/NetworkActions';
import MapActions from 'state/actions/map';
import { AuthActions } from 'state/actions/auth/Auth';
import Alerts from 'state/actions/alerts/Alerts';
import NavTab from './NavTab';

const ButtonWrapper = ({ children }) => {
  return (
    <div className="ButtonWrapperContainer">
      <div id="left-icon-container">
        <ArrowLeftIcon className="direction-icon" />
      </div>
      <div id="ButtonWrapper">{children}</div>
      <div id="right-icon-container">
        <ArrowRightIcon className="direction-icon" />
      </div>
    </div>
  );
};

const LoginButton = ({ labelText = 'Login', idpHint }) => {
  const dispatch = useDispatch();
  const loginInProgress = useSelector((state) => state.Auth.loginInProgress);
  return (
    <MenuItem
      disabled={loginInProgress}
      onClick={() => {
        dispatch(AuthActions.signinRequest({ idpHint }));
      }}
    >
      <ListItemIcon>
        <VpnKeyIcon />
      </ListItemIcon>
      {labelText}
    </MenuItem>
  );
};

const LogoutButton = () => {
  const dispatch = useDispatch();
  const signOutAndTogglePanel = () => {
    return (dispatch: AppDispatch) => {
      dispatch({
        type: TOGGLE_PANEL,
        payload: { panelOpen: false }
      });
      dispatch(AuthActions.signoutRequest());
      dispatch(MapActions.toggleOverlay('public_layer'));
    };
  };
  return (
    <MenuItem
      onClick={() => {
        dispatch(signOutAndTogglePanel());
      }}
    >
      <ListItemIcon>
        <LogoutIcon />
      </ListItemIcon>
      Logout
    </MenuItem>
  );
};

const InvIcon = () => {
  return (
    <div className="inv-icon">
      <img src={invbclogo} id="InvBcLogo" alt="B.C. Government Logo" />
      <div id="appTitle">InvasivesBC</div>
    </div>
  );
};

const ActivityTabMemo = () => {
  const activeActivity = useSelector((state) => state.UserSettings.activeActivity) || undefined;
  return (
    <NavTab
      key={'tab3'}
      path={'/Records/Activity:' + activeActivity + '/form'}
      label="Current Activity"
      predicate={'authenticated_any'}
      platform={'both'}
      panelOpen={true}
      panelFullScreen={false}
    >
      <AssignmentIcon />
    </NavTab>
  );
};

const IAPPTabMemo = () => {
  const activeIAPP = useSelector((state) => state.UserSettings.activeIAPP) || undefined;
  return (
    <NavTab
      key={'tab4'}
      path={'/Records/IAPP/' + activeIAPP + '/summary'}
      label="Current IAPP"
      predicate={'authenticated_any'}
      platform={'both'}
      panelOpen={true}
      panelFullScreen={false}
    >
      <img
        alt="iapp logo"
        className="iapp-logo"
        src={'/assets/iapp_logo.gif'}
        style={{ maxWidth: '1rem', marginBottom: '0px' }}
      />
    </NavTab>
  );
};

const AdminPanelMemo = () => {
  const roles = useSelector((state) => state.Auth.roles);
  return (
    <>
      {roles.find((role) => role.role_id === 18) ? (
        <NavTab
          key={'tab9'}
          path={'/Admin'}
          label="Admin"
          panelOpen={true}
          predicate={'authenticated_online'}
          platform={'web'}
          panelFullScreen={true}
        >
          <AdminPanelSettings />
        </NavTab>
      ) : (
        <></>
      )}
    </>
  );
};

const LoginOrOutMemo = React.memo(() => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { authenticated, offlineUsers, workingOffline, loggedInOrWorkingOffline } = useSelector(selectAuth);
  const { alerts, prompts } = useSelector((state) => state.AlertsAndPrompts);
  const activated = useSelector((state) => state.UserInfo.activated);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    dispatch(Alerts.deleteAll());
  };

  const [offlineUserSelectionAvailable, setOfflineUserSelectionAvailable] = useState(false);

  useEffect(() => {
    if (!MOBILE) {
      setOfflineUserSelectionAvailable(false);
    } else if (loggedInOrWorkingOffline) {
      setOfflineUserSelectionAvailable(false);
    } else if (offlineUsers.length > 0) {
      setOfflineUserSelectionAvailable(true);
    }
  }, [offlineUsers, loggedInOrWorkingOffline]);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const navToUpdateRequest = () => {
    history.push({ pathname: '/AccessRequest' });
    dispatch({
      type: TOGGLE_PANEL,
      payload: { panelOpen: true, fullScreen: true }
    });
  };

  const requestAccess = async () => {
    if (!authenticated) {
      dispatch(AuthActions.signinRequest({}));
    } else {
      history.push('/AccessRequest');
      dispatch({
        type: TOGGLE_PANEL,
        payload: { panelOpen: true, fullScreen: true }
      });
    }
  };

  useEffect(() => {
    if (alerts.length > 0 || prompts.length > 0) {
      handleClose();
    }
  }, [alerts, prompts]);

  return (
    <div className={'avatar-menu'}>
      <IconButton onClick={handleClick}>
        <Avatar />
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleClose}
        slotProps={{
          paper: {
            elevation: 3
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        {activated && (
          <MenuItem onClick={navToUpdateRequest}>
            <ListItemIcon>
              <AssignmentIcon />
            </ListItemIcon>
            Update My Info
          </MenuItem>
        )}
        {!activated && (
          <MenuItem onClick={requestAccess}>
            <ListItemIcon>
              <AssignmentIcon />
            </ListItemIcon>
            Request Access
          </MenuItem>
        )}
        {offlineUserSelectionAvailable && (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);

              dispatch(AuthActions.openOfflineUserSelectionDialog(true));
            }}
          >
            <ListItemIcon>
              <AssignmentIcon />
            </ListItemIcon>
            Choose Offline User
          </MenuItem>
        )}
        {workingOffline && [
          <LoginButton labelText={'Go Online (IDIR)'} idpHint={'idir'} key={'idir-go'} />,
          <LoginButton labelText={'Login (BCEID Business)'} idpHint={'bceidbusiness'} key={'bceidbusiness-go'} />
        ]}
        {loggedInOrWorkingOffline ? (
          <LogoutButton />
        ) : (
          [
            <LoginButton labelText={'Login (IDIR)'} idpHint={'idir'} key={'idir'} />,
            <LoginButton labelText={'Login (BCEID Business)'} idpHint={'bceidbusiness'} key={'bceidbusiness'} />
          ]
        )}
      </Menu>
    </div>
  );
});

export const NetworkStateControl: React.FC = () => {
  const handleNetworkStateChange = () => {
    dispatch(connected ? NetworkActions.setAdministrativeStatus(false) : NetworkActions.manualReconnect());
  };
  const connected = useSelector((state) => state.Network.connected);
  const dispatch = useDispatch();
  return (
    <div className={'network-state-control'}>
      <FormControl className="network-status-display">
        <FormControlLabel
          control={
            <Switch
              checked={connected}
              color={'primary'}
              size={'medium'}
              onChange={handleNetworkStateChange}
              inputProps={{ 'aria-label': 'controlled' }}
            />
          }
          label={'Network'}
          labelPlacement="end"
        />
      </FormControl>
      <div className="network-status-display"></div>
      {connected && (
        <div className={'network-status-display'}>
          <Grow in={true} appear={true}>
            <SignalWifi4Bar fontSize={'medium'} aria-label={'Online'} />
          </Grow>
          <span className={'network-status-label'}>&nbsp;Online</span>
        </div>
      )}
      {connected || (
        <div className={'network-status-display'}>
          <Grow in={true} appear={true}>
            <SignalWifiOff fontSize={'medium'} aria-label={'Offline'} />
          </Grow>
          <span className={'network-status-label'}>Offline</span>
        </div>
      )}
    </div>
  );
};

export const Header: React.FC = () => {
  const { loggedInOrWorkingOffline } = useSelector(selectAuth);
  const ref = useRef(0);
  ref.current += 1;
  if (RENDER_DEBUG) {
    console.log('%cHeader render:' + ref.current.toString(), 'color: yellow');
  }

  return (
    <header className="HeaderBar">
      <InvIcon />

      <ButtonWrapper>
        <NavTab
          key={'tab1'}
          path={'/Landing'}
          predicate={'always'}
          platform={'both'}
          label="Home"
          panelOpen={true}
          panelFullScreen={true}
        >
          <Home />
        </NavTab>

        <NavTab
          key={'tab2'}
          path="/Records"
          label="Records"
          predicate={'authenticated_any'}
          platform={'both'}
          panelOpen={true}
          panelFullScreen={false}
        >
          <ManageSearchIcon />
        </NavTab>

        <ActivityTabMemo />

        <IAPPTabMemo />

        <NavTab
          key={'tileCache'}
          path="/OfflineTiles"
          label={'Tile Cache Status'}
          predicate={'authenticated_any'}
          platform={'mobile'}
          panelOpen={true}
          panelFullScreen={false}
        >
          <OfflineBolt />
        </NavTab>

        <NavTab
          key={'tab5'}
          path={'/Batch/list'}
          label="Batch"
          predicate={'authenticated_online'}
          platform={'web'}
          panelOpen={true}
          panelFullScreen={true}
        >
          <FileUpload />
        </NavTab>

        <NavTab
          key={'tab6'}
          path={'/Reports'}
          label="Reports"
          predicate={'authenticated_online'}
          platform={'web'}
          panelOpen={true}
          panelFullScreen={true}
        >
          <Assessment />
        </NavTab>

        <NavTab
          key="tab7-1/2"
          path="/News"
          label="News"
          predicate={'authenticated_online'}
          platform={'web'}
          panelOpen={true}
          panelFullScreen={true}
        >
          <Newspaper />
        </NavTab>

        <NavTab
          key={'tab7'}
          path={'/Training'}
          label="Training"
          predicate={'always'}
          platform={'web'}
          panelOpen={true}
          panelFullScreen={true}
        >
          <School />
        </NavTab>

        <AdminPanelMemo />

        <NavTab
          key={'tab8'}
          path={'/Map'}
          label="Map"
          predicate={'unauthenticated'}
          platform={'both'}
          panelFullScreen={false}
          panelOpen={false}
        >
          <Map />
        </NavTab>

        {MOBILE && loggedInOrWorkingOffline && <OfflineSyncHeaderButton />}

        {MOBILE && <NetworkStateControl />}
      </ButtonWrapper>
      <LoginOrOutMemo />
    </header>
  );
};
