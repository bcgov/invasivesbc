import { AppBar, makeStyles, Tab, Tabs, Theme } from '@material-ui/core';
import { Assignment, Explore, HomeWork, Map, Gamepad } from '@material-ui/icons';
import React, { useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

function a11yProps(index: any) {
  return {
    id: `home-tab-${index}`,
    'aria-controls': `home-tabpanel-${index}`
  };
}

interface IBaseProps {
  classes?: any;
}

const TabsContainer: React.FC<IBaseProps> = (props) => {
  const history = useHistory();

  const getActiveTab = useCallback(
    (activeTab: number): number => {
      switch (history.location.pathname) {
        case '/home/plan':
          return 0;
        case '/home/activities':
          return 1;
        case '/home/map':
          return 2;
        case '/home/activity':
          return 3;
        case '/home/observation':
          return 4;
        default:
          return activeTab;
      }
    },
    [history.location.pathname]
  );

  const [activeTab, setActiveTab] = React.useState(getActiveTab(0));

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    setActiveTab((activeTab) => getActiveTab(activeTab));
  }, [history.location.pathname, getActiveTab]);

  return (
    <div className={props.classes.tabBar}>
      <AppBar position="static">
        <Tabs value={activeTab} onChange={handleChange} variant="scrollable" scrollButtons="on">
          <Tab label="Plan My Trip" icon={<Explore />} onClick={() => history.push('/home/plan')} {...a11yProps(0)} />
          <Tab
            label="My Activities"
            icon={<HomeWork />}
            onClick={() => history.push('/home/activities')}
            {...a11yProps(1)}
          />
          <Tab label="Map" icon={<Map />} onClick={() => history.push('/home/map')} {...a11yProps(2)} />
          <Tab
            label="Current Activity"
            icon={<Assignment />}
            onClick={() => history.push('/home/activity')}
            {...a11yProps(3)}
          />
          <Tab
            label="Observation WIP"
            icon={<Gamepad />}
            onClick={() => history.push('/home/observation')}
            {...a11yProps(4)}
          />
        </Tabs>
      </AppBar>
    </div>
  );
};

export default TabsContainer;
