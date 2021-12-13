import { AppBar, Tab, Tabs, Toolbar } from '@material-ui/core';
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
      <Toolbar style={{ minHeight: '20', fontSize: '.7rem', justifyContent: 'flex-end' }}>
        <img
          alt="bcLogo"
          src={sunriseLogo}
          width="90"
          style={{ objectFit: 'cover', cursor: 'pointer' }}
          height="30"
          onClick={() => history.push('/')}
        />
        <Tabs value={false} variant="scrollable" scrollButtons="on">
          {tabs.map((tab) => (
            <Tab
              style={{ fontSize: '0.7rem' }}
              label={tab.label}
              key={tab.label}
              onClick={() => window.open(tab.url)}
            />
          ))}
        </Tabs>
      </Toolbar>
    </AppBar>
  );
};

export default Footer;
