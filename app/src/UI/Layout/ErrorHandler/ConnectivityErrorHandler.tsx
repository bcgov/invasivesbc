import 'UI/Layout/ErrorHandler/ErrorHandler.css';
import { useDispatch } from 'react-redux';
import { AuthActions } from 'state/actions/auth/Auth';
import { Button } from '@mui/material';
import { useEffect, useState } from 'react';

export const ConnectivityErrorHandler = () => {
  const dispatch = useDispatch();
  const handleRefresh = () => location.reload();
  const handleOffline = () => {
    dispatch(AuthActions.signoutRequest());
  };
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSinceCrash(Math.floor((new Date().getTime() - time.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  });
  const [time] = useState<Date>(new Date());
  const [timeSinceCrash, setTimeSinceCrash] = useState<number>();
  return (
    <div id="connectivity-error-handler" className="errorHandler">
      <div>
        <h1>Having Trouble Connecting?</h1>
        <p>
          It looks like there's an issue connecting to the authentication server. The app will try to fix it on its own.
          Please be patient while it reconnects. If this message stays for more than a minute, try refreshing your
          browser.
        </p>
        <p>
          Elapsed time: <b>{timeSinceCrash?.toLocaleString()}</b> seconds
        </p>
        <div className="controls">
          <Button variant="contained" color="primary" onClick={handleRefresh}>
            Refresh
          </Button>
          <Button variant="contained" color="secondary" onClick={handleOffline} sx={{ margin: '0.5rem' }}>
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
};
