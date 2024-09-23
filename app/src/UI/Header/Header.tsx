import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LogoutIcon from '@mui/icons-material/Logout';
import React, { PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';
import './Header.css';
import {
  Avatar,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grow,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Switch
} from '@mui/material';
import { useDispatch } from 'react-redux';
import {
  AUTH_OPEN_OFFLINE_USER_SELECTION_DIALOG,
  AUTH_SIGNIN_REQUEST,
  AUTH_SIGNOUT_REQUEST,
  NETWORK_GO_OFFLINE,
  NETWORK_GO_ONLINE,
  TOGGLE_PANEL
} from 'state/actions';
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
  School,
  SignalWifi4Bar,
  SignalWifiOff
} from '@mui/icons-material';
import invbclogo from '/assets/InvasivesBC_Icon.svg';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import { RENDER_DEBUG } from 'UI/App';
import { useSelector } from 'utils/use_selector';
import { selectAuth } from 'state/reducers/auth';
import { OfflineSyncHeaderButton } from 'UI/Header/OfflineSyncHeaderButton';
import RefreshButton from './RefreshButton';
import { MOBILE } from 'state/build-time-config';

type TabPredicate =
  | 'authenticated_any'
  | 'authenticated_online'
  | 'working_offline'
  | 'unauthenticated'
  | 'always'
  | 'never';

type TabPlatformPredicate = 'web' | 'mobile' | 'both';

interface TabProps extends PropsWithChildren {
  predicate: TabPredicate;
  platform: TabPlatformPredicate;
  path: string;
  label: string;
  panelOpen: boolean;
  panelFullScreen: boolean;
}

const Tab: React.FC<TabProps> = ({ predicate, platform, children, path, label, panelOpen, panelFullScreen }) => {
  const ref = useRef(0);
  ref.current += 1;

  const urlFromAppModeState = useSelector((state) => state.AppMode.url);

  const history = useHistory();

  const dispatch = useDispatch();
  const authenticated = useSelector((state) => state.Auth.authenticated && state?.Auth.roles.length > 0);
  const workingOffline = useSelector((state) => state.Auth.workingOffline);

  const canDisplayCallBack = useCallback(() => {
    if (platform === 'mobile' && !MOBILE) {
      return false;
    }
    if (platform === 'web' && MOBILE) {
      return false;
    }

    switch (predicate) {
      case 'always':
        return true;
      case 'never':
        return false;
      case 'unauthenticated':
        return !workingOffline && !authenticated;
      case 'authenticated_online':
        return authenticated && !workingOffline;
      case 'working_offline':
        return workingOffline;
      case 'authenticated_any':
        return authenticated || workingOffline;
    }
  }, [authenticated, workingOffline, predicate, platform, MOBILE, JSON.stringify(path)]);

  useEffect(() => {
    const scrollContainer = document.getElementById('ButtonWrapper');
    const rightIconContainer = document.getElementById('right-icon-container');
    const leftIconContainer = document.getElementById('left-icon-container');

    if (scrollContainer !== null && rightIconContainer !== null && leftIconContainer !== null) {
      // workaround for scroll = client on load race
      setTimeout(() => {
        if (scrollContainer.scrollWidth > scrollContainer.clientWidth) {
          rightIconContainer.style.visibility = 'visible';
        }
      }, 100);

      scrollContainer.addEventListener('scroll', () => {
        if (scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth - 5) {
          rightIconContainer.style.visibility = 'hidden';
          leftIconContainer.style.visibility = 'visible';
        } else if (scrollContainer.scrollLeft <= 5) {
          rightIconContainer.style.visibility = 'visible';
          leftIconContainer.style.visibility = 'hidden';
        } else {
          rightIconContainer.style.visibility = 'visible';
          leftIconContainer.style.visibility = 'visible';
        }
      });
    }
  }, []);

  return (
    <>
      {canDisplayCallBack() ? (
        <div
          className={'Tab' + (urlFromAppModeState === path ? ' Tab__Indicator' : '')}
          onClick={() => {
            history.push(path);
            dispatch({
              type: TOGGLE_PANEL,
              payload: { panelOpen: panelOpen, fullScreen: panelFullScreen }
            });
          }}
        >
          <div className="Tab__Content">{children}</div>
          <div className="Tab__Label">{label}</div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

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

const LoginButton = ({ labelText = 'Login' }) => {
  const dispatch = useDispatch();
  return (
    <MenuItem
      onClick={() => {
        dispatch({ type: AUTH_SIGNIN_REQUEST });
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
  return (
    <MenuItem
      onClick={() => {
        dispatch({ type: AUTH_SIGNOUT_REQUEST });
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
    <Tab
      key={'tab3'}
      path={'/Records/Activity:' + activeActivity + '/form'}
      label="Current Activity"
      predicate={'authenticated_online'}
      platform={'both'}
      panelOpen={true}
      panelFullScreen={false}
    >
      <AssignmentIcon />
    </Tab>
  );
};

const IAPPTabMemo = () => {
  const activeIAPP = useSelector((state) => state.UserSettings.activeIAPP) || undefined;
  return (
    <Tab
      key={'tab4'}
      path={'/Records/IAPP/' + activeIAPP + '/summary'}
      label="Current IAPP"
      predicate={'authenticated_online'}
      platform={'both'}
      panelOpen={true}
      panelFullScreen={false}
    >
      <img alt="iapp logo" src={'/assets/iapp_logo.gif'} style={{ maxWidth: '1rem', marginBottom: '0px' }} />
    </Tab>
  );
};

const AdminPanelMemo = () => {
  const roles = useSelector((state) => state.Auth.roles);
  return (
    <>
      {roles.find((role) => role.role_id === 18) ? (
        <Tab
          key={'tab9'}
          path={'/Admin'}
          label="Admin"
          panelOpen={true}
          predicate={'authenticated_online'}
          platform={'web'}
          panelFullScreen={true}
        >
          <AdminPanelSettings />
        </Tab>
      ) : (
        <></>
      )}
    </>
  );
};

const LoginOrOutMemo = React.memo(() => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { authenticated, offlineUsers, workingOffline } = useSelector(selectAuth);
  const activated = useSelector((state) => state.UserInfo.activated);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const [offlineUserSelectionAvailable, setOfflineUserSelectionAvailable] = useState(false);

  useEffect(() => {
    if (!MOBILE) {
      setOfflineUserSelectionAvailable(false);
      return;
    }
    if (workingOffline) {
      setOfflineUserSelectionAvailable(false);
      return;
    }
    if (offlineUsers.length > 0) {
      setOfflineUserSelectionAvailable(true);
    }
  }, [offlineUsers, workingOffline]);

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
      dispatch({ type: AUTH_SIGNIN_REQUEST });
    } else {
      history.push('/AccessRequest');
      dispatch({
        type: TOGGLE_PANEL,
        payload: { panelOpen: true, fullScreen: true }
      });
    }
  };

  return (
    <div className={'avatar-menu'}>
      <IconButton onClick={handleClick}>
        <Avatar></Avatar>
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

              dispatch({
                type: AUTH_OPEN_OFFLINE_USER_SELECTION_DIALOG,
                payload: { state: true }
              });
            }}
          >
            <ListItemIcon>
              <AssignmentIcon />
            </ListItemIcon>
            Choose Offline User
          </MenuItem>
        )}
        {!authenticated && !workingOffline && <LoginButton />}
        {workingOffline && <LoginButton labelText={'Go Online'} />}
        {MOBILE && <RefreshButton />}
        {(authenticated || workingOffline) && <LogoutButton />}
      </Menu>
    </div>
  );
});

const NetworkStateControl: React.FC = () => {
  const { connected } = useSelector((state) => state.Network);
  const dispatch = useDispatch();
  return (
    <div className={'network-state-control'}>
      <FormControl>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={connected}
                color={'primary'}
                size={'medium'}
                onChange={() => {
                  dispatch({ type: connected ? NETWORK_GO_OFFLINE : NETWORK_GO_ONLINE });
                }}
                inputProps={{ 'aria-label': 'controlled' }}
              />
            }
            label={'Network'}
            labelPlacement="bottom"
          />
        </FormGroup>
      </FormControl>
      {connected && (
        <>
          <div className={'network-status-display'}>
            <Grow in={true} appear={true}>
              <SignalWifi4Bar fontSize={'medium'} aria-label={'Online'} />
            </Grow>
            <span className={'network-status-label'}>Online</span>
          </div>
        </>
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
  const ref = useRef(0);
  ref.current += 1;
  if (RENDER_DEBUG) {
    console.log('%cHeader render:' + ref.current.toString(), 'color: yellow');
  }

  const { DEBUG, MOBILE } = useSelector((state) => state.Configuration.current);

  return (
    <div className="HeaderBar">
      <InvIcon />

      <ButtonWrapper>
        <Tab
          key={'tab1'}
          path={'/Landing'}
          predicate={'always'}
          platform={'both'}
          label="Home"
          panelOpen={true}
          panelFullScreen={true}
        >
          <Home />
        </Tab>

        <Tab
          key={'tab2'}
          path="/Records"
          label="Records"
          predicate={'authenticated_any'}
          platform={'both'}
          panelOpen={true}
          panelFullScreen={false}
        >
          <ManageSearchIcon />
        </Tab>

        <ActivityTabMemo />

        <IAPPTabMemo />

        <Tab
          key={'tab5'}
          path={'/Batch/list'}
          label="Batch"
          predicate={'authenticated_online'}
          platform={'web'}
          panelOpen={true}
          panelFullScreen={true}
        >
          <FileUpload />
        </Tab>

        <Tab
          key={'tab6'}
          path={'/Reports'}
          label="Reports"
          predicate={'authenticated_online'}
          platform={'web'}
          panelOpen={true}
          panelFullScreen={true}
        >
          <Assessment />
        </Tab>

        <Tab
          key="tab7-1/2"
          path="/News"
          label="News"
          predicate={'authenticated_online'}
          platform={'web'}
          panelOpen={true}
          panelFullScreen={true}
        >
          <Newspaper />
        </Tab>

        <Tab
          key={'tab7'}
          path={'/Training'}
          label="Training"
          predicate={'always'}
          platform={'web'}
          panelOpen={true}
          panelFullScreen={true}
        >
          <School />
        </Tab>

        <AdminPanelMemo />

        <Tab
          key={'tab8'}
          path={'/Map'}
          label="Map"
          predicate={'unauthenticated'}
          platform={'both'}
          panelFullScreen={false}
          panelOpen={false}
        >
          <Map />
        </Tab>

        {MOBILE && <OfflineSyncHeaderButton />}

        {DEBUG && MOBILE && <NetworkStateControl />}
      </ButtonWrapper>

      <LoginOrOutMemo />
    </div>
  );
};
