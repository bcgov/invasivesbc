import { AppBar, Toolbar, Tabs, Tab } from '@material-ui/core';
import { NetworkContext } from 'contexts/NetworkContext';
import React, { useContext, useEffect, useState } from 'react';

interface IFooterProps {
  classes?: any;
}

const Footer: React.FC<IFooterProps> = () => {
  const networkContext = useContext(NetworkContext);

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
    const connectionStatusString = `${connectionStatus} (type: ${networkContext.connectionType})`;

    setNetworkStatusString(connectionStatusString);
  }, [networkContext]);

  return (
    <AppBar position="static">
      <Toolbar style={{ justifyContent: 'flex-end' }}>
        <Tabs value={false} variant="scrollable" scrollButtons="on">
          {tabs.map((tab) => (
            <Tab label={tab.label} key={tab.label} onClick={() => window.open(tab.url)} />
          ))}
        </Tabs>
      </Toolbar>
    </AppBar>
  );
};

export default Footer;
