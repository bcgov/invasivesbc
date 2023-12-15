import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LogoutIcon from '@mui/icons-material/Logout';
import React, { useCallback, useEffect, useRef } from 'react';
import './Header.css';
import { Avatar, Box, IconButton, ListItemIcon, Menu, MenuItem } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AUTH_SIGNIN_REQUEST, AUTH_SIGNOUT_REQUEST, TOGGLE_PANEL } from 'state/actions';
import { Route, useHistory } from 'react-router';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InfoIcon from '@mui/icons-material/Info';
import { AdminPanelSettings, Assessment, FileUpload, Home, School } from '@mui/icons-material';
import invbclogo from '/assets/InvasivesBC_Icon.svg';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import { Map } from '@mui/icons-material';

const Tab = (props: any) => {
  const ref = useRef(0);
  ref.current += 1;
  console.log('%cTab ' + props.path + ' render:' + ref.current.toString(), 'color: yellow');

  const history = useHistory();
  const dispatch = useDispatch();
  const authenticated = useSelector((state: any) => state?.Auth?.authenticated);

  const canDisplayCallBack = useCallback(() => {
    if (props.looggedOutOnly && authenticated) {
      return false;
    }

    if (props.loggedOutOnly && !authenticated) {
      return true;
    }

    if (props.loggedInOnly && !authenticated) {
      return false;
    }

    if (props.loggedInOnly && authenticated) {
      return true;
    }

    if (!props.loggedInOnly) {
      return true;
    }

    if (!authenticated) {
      return false;
    }
  }, [JSON.stringify(authenticated), JSON.stringify(props.loggedInOnly), JSON.stringify(props.path)]);

  useEffect(() => {
    const scrollContainer = document.getElementById('ButtonWrapper');
    const rightIconContainer = document.getElementById('right-icon-container');
    const leftIconContainer = document.getElementById('left-icon-container');

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
  }, []);

  return (
    <>
      {canDisplayCallBack() ? (
        <div
          className="Tab"
          onClick={() => {
            history.push(props.path);
            dispatch({
              type: TOGGLE_PANEL,
              payload: { panelOpen: props.panelOpen, fullScreen: props.panelFullScreen }
            });
          }}>
          <div className="Tab__Content">{props.children}</div>
          <div className="Tab__Label">{props.label}</div>
          <Route exact={true} path={props.path} render={(props) => <div className="Tab__Indicator"></div>} />
        </div>
      ) : (
        <> </>
      )}
    </>
  );
};

const ButtonWrapper = (props: any) => {
  return (
    <div className="ButtonWrapperContainer">
      <div id="left-icon-container">
        <ArrowLeftIcon className="direction-icon" />
      </div>
      <div id="ButtonWrapper">{props.children}</div>
      <div id="right-icon-container">
        <ArrowRightIcon className="direction-icon" />
      </div>
    </div>
  );
};

const LoginButton = () => {
  const dispatch = useDispatch();
  return (
    <MenuItem
      onClick={() => {
        dispatch({ type: AUTH_SIGNIN_REQUEST });
      }}>
      <ListItemIcon>
        <VpnKeyIcon />
      </ListItemIcon>
      Login
    </MenuItem>
  );
};

const LogoutButton = () => {
  const dispatch = useDispatch();
  return (
    <MenuItem
      onClick={() => {
        dispatch({ type: AUTH_SIGNOUT_REQUEST });
      }}>
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
      <img
        src={invbclogo}
        style={{
          objectFit: 'contain',
          backgroundColor: 'white',
          borderRadius: 4,
          padding: 4
        }}
        height="20"
        width="20"
        alt="B.C. Government Logo"
      />
    </div>
  );
};

const ActivityTabMemo = React.memo((props) => {
  const activeActivity = useSelector((state: any) => state?.UserSettings?.activeActivity);
  return (
    <Tab
      key={'tab3'}
      path={'/Records/Activity:' + activeActivity + '/form'}
      label="Current Activity"
      loggedInOnly={true}
      panelOpen={true}
      panelFullScreen={false}>
      <AssignmentIcon />
    </Tab>
  );
});

const IAPPTabMemo = React.memo((props) => {
  const activeIAPP = useSelector((state: any) => state?.UserSettings?.activeIAPP);
  return (
    <Tab
      key={'tab4'}
      path={'/Records/IAPP/' + activeIAPP + '/summary'}
      label="Current IAPP"
      loggedInOnly={true}
      panelOpen={true}
      panelFullScreen={false}>
      <img alt="iapp logo" src={'/assets/iapp_logo.gif'} style={{ maxWidth: '1rem', marginBottom: '0px' }} />
    </Tab>
  );
});

const AdminPanelMemo = React.memo((props) => {
  const roles = useSelector((state: any) => state?.Auth?.roles);
  return (
    <>
      {roles.find((role) => role.role_id === 18) ? (
        <Tab key={'tab9'} path={'/Admin'} label="Admin" panelOpen={true} loggedInOnly={true} panelFullScreen={true}>
          <AdminPanelSettings />
        </Tab>
      ) : (
        <></>
      )}
    </>
  );
});

const LoginOrOutMemo = React.memo((props) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const authenticated = useSelector((state: any) => state?.Auth?.authenticated);
  const activated = useSelector((state: any) => state?.UserInfo?.activated);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
    // setOpen(false);
    console.log('closing');
  };

  const navToUpdateRequest = () => {
    history.push({
      pathname: '/AccessRequest',
      state: {
        updateInfo: true
      }
    });
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
    <Box sx={{ flexGrow: 0, float: 'right', marginRight: '1rem' }}>
      <IconButton onClick={handleClick} size="small">
        <Avatar></Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleClose}
        PaperProps={{
          elevation: 3
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}>
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
        {authenticated ? <LogoutButton /> : <LoginButton />}
      </Menu>
    </Box>
  );
});

export const Header: React.FC = () => {
  const ref = useRef(0);
  ref.current += 1;
  console.log('%cHeader render:' + ref.current.toString(), 'color: yellow');

  return (
    <div className="HeaderBar">
      <InvIcon />
      <ButtonWrapper>
        <Tab key={'tab1'} path={'/Landing'} loggedInOnly={false} label="Home" panelOpen={true} panelFullScreen={true}>
          <Home />
        </Tab>

        <Tab key={'tab2'} path="/Records" label="Records" loggedInOnly={true} panelOpen={true} panelFullScreen={false}>
          <ManageSearchIcon />
        </Tab>

        <ActivityTabMemo />

        <IAPPTabMemo />

        <Tab
          key={'tab5'}
          path={'/Batch/list'}
          label="Batch"
          loggedInOnly={true}
          panelOpen={true}
          panelFullScreen={true}>
          <FileUpload />
        </Tab>

        <>
          {/* <Tab key={'tab6'} path={'/Reports'} label="Reports" loggedInOnly={true} panelOpen={true} panelFullScreen={true}>
          <Assessment />
        </Tab> */}
        </>

        <Tab
          key={'tab7'}
          path={'/Training'}
          label="Training"
          loggedInOnly={false}
          panelOpen={true}
          panelFullScreen={true}>
          <School />
        </Tab>

        <AdminPanelMemo />

        <Tab key={'tab8'} path={'/'} label="Map" loggedOutOnly={true} panelOpen={false}>
          <Map />
        </Tab>
      </ButtonWrapper>
      <LoginOrOutMemo />
    </div>
  );
};
