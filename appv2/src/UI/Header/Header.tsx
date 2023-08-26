import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LogoutIcon from '@mui/icons-material/Logout';
import React, { useCallback, useEffect, useRef } from 'react';
import './Header.css';
import { IconButton } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AUTH_SIGNIN_REQUEST, AUTH_SIGNOUT_REQUEST, TOGGLE_PANEL } from 'state/actions';
import { selectAuth } from 'state/reducers/auth';
import { Route, useHistory } from 'react-router';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InfoIcon from '@mui/icons-material/Info';
import { AdminPanelSettings, Assessment, FileUpload, Home, School } from '@mui/icons-material';
import { selectUserSettings } from 'state/reducers/userSettings';
import { debounce } from 'lodash';

const Tab = (props: any) => {
  const ref = useRef(0);
  ref.current += 1;
  console.log('%cTab ' + props.path + ' render:' + ref.current.toString(), 'color: yellow');

  const history = useHistory();
  const dispatch = useDispatch();
  const authenticated = useSelector((state: any) => state?.Auth?.authenticated);

  const canDisplay = useCallback(
    debounce(() => {
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
    }, 1000),
    [JSON.stringify(authenticated), JSON.stringify(props.loggedInOnly)]
  );

  return (
    <>
      {canDisplay ? (
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
  return <div className="ButtonWrapper">{props.children}</div>;
};

const LoginButton = () => {
  const dispatch = useDispatch();
  return (
    <div className="LoginButton">
      <IconButton
        onClick={() => {
          dispatch({ type: AUTH_SIGNIN_REQUEST });
        }}
        size="large"
        color="inherit"
        aria-label="login">
        <VpnKeyIcon />
      </IconButton>
    </div>
  );
};

const LogoutButton = () => {
  const dispatch = useDispatch();
  return (
    <div className="LogoutButton">
      <IconButton
        onClick={() => {
          dispatch({ type: AUTH_SIGNOUT_REQUEST });
        }}
        size="large"
        color="inherit"
        aria-label="logout">
        <LogoutIcon />
      </IconButton>
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
      path={'/Records/IAPP:' + activeIAPP}
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
  const authenticated = useSelector((state: any) => state?.Auth?.authenticated);
  return <>{authenticated ? <LogoutButton /> : <LoginButton />}</>;
});

export const Header: React.FC = () => {
  const ref = useRef(0);
  ref.current += 1;
  console.log('%cHeader render:' + ref.current.toString(), 'color: yellow');

  return (
    <div className="HeaderBar">
      <ButtonWrapper>
        <Tab key={'tab1'} path={'/Landing'} loggedInOnly={true} label="Home" panelOpen={true} panelFullScreen={true}>
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

        <Tab key={'tab6'} path={'/Reports'} label="Reports" loggedInOnly={true} panelOpen={true} panelFullScreen={true}>
          <Assessment />
        </Tab>

        <Tab
          key={'tab7'}
          path={'/Training'}
          label="Training"
          loggedInOnly={false}
          panelOpen={true}
          panelFullScreen={true}>
          <School />
        </Tab>

        <Tab
          key={'tab8'}
          path={'/Legend'}
          label="Map Legend"
          loggedInOnly={false}
          panelOpen={true}
          panelFullScreen={true}>
          <InfoIcon />
        </Tab>

        <AdminPanelMemo />

        <LoginOrOutMemo />
      </ButtonWrapper>
    </div>
  );
};
