import { AppBar, Tab, Tabs, Toolbar } from '@mui/material';
import { NetworkContext } from 'contexts/NetworkContext';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import sunriseLogo from '../../bcGovSunriseLogo.png';

interface IFooterProps {
  classes?: any;
}

const Footer: React.FC<IFooterProps> = () => {
  const networkContext = useContext(NetworkContext);
  const history = useHistory();

  const defaultConnectionStatusString = (!window['cordova'] && 'Online') || '';

  const [networkStatusString, setNetworkStatusString] = useState(defaultConnectionStatusString);

  const tabs = [
    { label: `Network Status: ${networkStatusString}`, url: '/' },
    { label: 'Disclaimer', url: 'https://www.gov.bc.ca/gov/content/home/disclaimer' },
    { label: 'Privacy', url: 'https://www.gov.bc.ca/gov/content/home/privacy' },
    { label: 'Accessibility', url: 'https://www.gov.bc.ca/gov/content/home/accessible-government' },
    { label: 'Copyright', url: 'https://www.gov.bc.ca/gov/content/home/copyright' }
  ];

  useEffect(() => {
    if (!networkContext) {
      return;
    }

    const connectionStatus = (networkContext.connected && 'Online') || 'Offline';
    //const connectionStatusString = `${connectionStatus} (type: ${networkContext.connectionType})`;

    setNetworkStatusString(connectionStatus);
  }, [networkContext]);

  return (
    <AppBar position="static">
      <Toolbar
        style={{
          position: 'relative',
          minHeight: '10px',
          maxHeight: '30px',
          fontSize: '.5rem',
          justifyContent: 'flex-start'
        }}>
        <img
          alt="bcLogo"
          src={sunriseLogo}
          width="40px"
          style={{ objectFit: 'cover', cursor: 'pointer' }}
          height="17px"
          onClick={() => history.push('/')}
        />
        <Tabs indicatorColor="secondary" textColor="inherit" value={false}>
          {tabs.map((tab) => (
            <Tab label={tab.label} sx={{ fontSize: '0.6rem' }} key={tab.label} onClick={() => window.open(tab.url)} />
          ))}
        </Tabs>
      </Toolbar>
    </AppBar>
  );
};

export default Footer;
