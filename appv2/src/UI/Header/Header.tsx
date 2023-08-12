import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LogoutIcon from '@mui/icons-material/Logout';
import React from 'react';
import './Header.css';
import { IconButton } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AUTH_SIGNIN_REQUEST, AUTH_SIGNOUT_REQUEST, TOGGLE_PANEL } from 'state/actions';
import { selectAuth } from 'state/reducers/auth';
import { Route, useHistory } from 'react-router';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { AdminPanelSettings, Assessment, FileUpload, Home, School } from '@mui/icons-material';

const Tab = (props: any) => {
  const history = useHistory();
  const dispatch = useDispatch();

  return (
    <div
      className="Tab"
      onClick={() => {
        history.push(props.path);
        dispatch({ type: TOGGLE_PANEL, payload: { panelOpen: props.panelOpen, fullScreen: props.panelFullScreen } });
      }}>
      <div className="Tab__Content">{props.children}</div>
      <div className="Tab__Label">{props.label}</div>
      <Route exact={true} path={props.path} render={(props) => <div className="Tab__Indicator"></div>} />
    </div>
  );
};

export const Header: React.FC = () => {
  const dispatch = useDispatch();
  const authState = useSelector(selectAuth);
  const userSettingsState = useSelector((state: any) => state.userSettings);

  const ButtonWrapper = (props: any) => {
    return <div className="ButtonWrapper">{props.children}</div>;
  };

  const LoginButton = () => {
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

  return (
    <div className="HeaderBar">
      <ButtonWrapper>
        <Tab path={'/Landing'} label="Home" panelOpen={true} panelFullScreen={true}>
          <Home />
        </Tab>

        <Tab path="/Records" label="Records" panelOpen={true} panelFullScreen={false}>
          <ManageSearchIcon />
        </Tab>

        <Tab path={'/Training'} label="Training" panelOpen={true} panelFullScreen={false}>
          <School />
        </Tab>

        <Tab
          path={'/Records/Activity:' + userSettingsState?.activeActivity}
          label="Current Activity"
          panelOpen={true}
          panelFullScreen={false}>
          <AssignmentIcon />
        </Tab>

        <Tab
          path={'/Records/IAPP:' + userSettingsState?.activeIAPP}
          label="Current IAPP"
          panelOpen={true}
          panelFullScreen={false}>
          <img alt="iapp logo" src={'/assets/iapp_logo.gif'} style={{ maxWidth: '1rem', marginBottom: '0px' }} />
        </Tab>

        <Tab path={'/Batch'} label="Batch" panelOpen={true} panelFullScreen={false}>
          <FileUpload />
        </Tab>

        <Tab path={'/Reports'} label="Reports" panelOpen={true} panelFullScreen={false}>
          <Assessment />
        </Tab>

        {authState.roles.find((role) => role.role_id === 18) ? (
          <Tab path={'/Admin'} label="Admin" panelOpen={true} panelFullScreen={false}>
            <AdminPanelSettings />
          </Tab>
        ) : (
          <></>
        )}

        {authState.authenticated ? <LogoutButton /> : <LoginButton />}
      </ButtonWrapper>
    </div>
  );
};
