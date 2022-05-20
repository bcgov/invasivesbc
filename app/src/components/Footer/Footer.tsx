import { AppBar, Tab, Tabs, Toolbar } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import sunriseLogo from '../../bcGovSunriseLogo.png';
import { selectNetworkConnected } from '../../state/reducers/network';
import { useSelector } from '../../state/utilities/use_selector';
import { selectConfiguration } from '../../state/reducers/configuration';

interface IFooterProps {
  classes?: any;
}

const Footer: React.FC<IFooterProps> = () => {
  const history = useHistory();
  const connected = useSelector(selectNetworkConnected);
  const [networkStatusString, setNetworkStatusString] = useState(connected ? 'Online' : 'Offline');

  useEffect(() => {
    setNetworkStatusString(connected ? 'Online' : 'Offline');
  }, [connected]);

  const tabs = [
    { label: `Network Status: ${networkStatusString}`, url: '/' },
    { label: 'Copyright', url: 'https://www2.gov.bc.ca/gov/content/home/copyright ' },
    { label: 'Disclaimer', url: 'https://www2.gov.bc.ca/gov/content/home/disclaimer ' },
    { label: 'Privacy Statement', url: 'https://www2.gov.bc.ca/gov/content/home/privacy' },
    { label: 'Accessibility', url: 'https://www2.gov.bc.ca/gov/content/home/accessible-government' }
  ];

  return (
    <AppBar position="static">
      <Toolbar
        style={{
          position: 'relative',
          minHeight: '2.5vh',
          maxHeight: '5vh',
          fontSize: '1rem',
          justifyContent: 'flex-start'
        }}>
        <img
          alt="bcLogo"
          src={sunriseLogo}
          width="60px"
          style={{ objectFit: 'cover', cursor: 'pointer' }}
          height="28px"
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
