import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LogoutIcon from '@mui/icons-material/Logout';
import React from 'react';
import './Header.css';
import { IconButton } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AUTH_SIGNIN_REQUEST, AUTH_SIGNOUT_REQUEST } from 'state/actions';
import { selectAuth } from 'state/reducers/auth';

export const Header: React.FC = () => {
  const dispatch = useDispatch();
  const authState = useSelector(selectAuth);

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
        {authState.authenticated ? <LogoutButton /> : <LoginButton />}
    </div>
  );
};
