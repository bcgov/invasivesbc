import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LogoutIcon from '@mui/icons-material/Logout';
import React, { useEffect } from 'react';
import 'UI/Layout/OverlayLayout/Header/Web/WebHeader.css';
import { Avatar, IconButton, ListItemIcon, Menu, MenuItem } from '@mui/material';
import { useHistory } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import invbclogo from '/assets/InvasivesBC_Icon.svg';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import { AppDispatch, useDispatch, useSelector } from 'utils/use_selector';
import { selectAuth } from 'state/reducers/auth';
import MapActions from 'state/actions/map';
import { AuthActions } from 'state/actions/auth/Auth';
import Alerts from 'state/actions/alerts/Alerts';
import NavTab from 'UI/Layout/OverlayLayout/Header/NavTab';
import { usePrimaryNavigationLinks } from 'UI/Layout/Routes/PrimaryNavigation';
import DebugMenu from 'UI/Layout/DebugMenu/DebugMenu';

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

const LoginOrOutMemo = React.memo(() => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { authenticated } = useSelector(selectAuth);
  const { alerts, prompts } = useSelector((state) => state.AlertsAndPrompts);
  const activated = useSelector((state) => state.UserInfo.activated);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    dispatch(Alerts.deleteAll());
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const navToUpdateRequest = () => {
    history.push({ pathname: '/AccessRequest' });
  };

  const requestAccess = async () => {
    if (!authenticated) {
      dispatch(AuthActions.signinRequest({}));
    } else {
      history.push('/AccessRequest');
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

        {authenticated ? (
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

export const WebHeader: React.FC = () => {
  const { filteredLinks } = usePrimaryNavigationLinks();

  return (
    <header className="HeaderBar">
      <InvIcon />

      <ButtonWrapper>
        {filteredLinks.map((link) => {
          return <NavTab key={link.id} {...link} />;
        })}
      </ButtonWrapper>
      <DebugMenu />
      <LoginOrOutMemo />
    </header>
  );
};
