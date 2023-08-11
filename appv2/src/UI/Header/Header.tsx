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

const Tab = (props: any) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const panelState = useSelector((state: any) => state.AppMode?.panelOpen);

  return (
    <div
      className="Tab"
      onClick={() => {
        history.push(props.path);
        if (props.panelOpen && !panelState) dispatch({ type: TOGGLE_PANEL });
      }}>
      <div className="Tab__Content">{props.children}</div>
      <div className="Tab__Label">{props.label}</div>
      <Route path={props.path} render={(props) => <div className="Tab__Indicator"></div>} />
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
        <Tab path="/Records" label="Records" panelOpen={true} panelFullScreen={false}>
          <ManageSearchIcon />
        </Tab>

        <Tab
          path={'/Records/Activity:' + userSettingsState?.activeActivity}
          label="Current Activity"
          panelOpen={true}
          panelFullScreen={false}>
          <AssignmentIcon />
        </Tab>

        {authState.authenticated ? <LogoutButton /> : <LoginButton />}
      </ButtonWrapper>
    </div>
  );
};
