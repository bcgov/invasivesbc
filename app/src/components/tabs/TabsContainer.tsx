import { AppBar, Tab, Tabs } from '@material-ui/core';
import { Assignment, Bookmarks, Explore, HomeWork, Map, Search } from '@material-ui/icons';
import React, { useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

interface ITabsContainerProps {
  classes?: any;
}

const TabsContainer: React.FC<ITabsContainerProps> = (props) => {
  const history = useHistory();

  const urlContainsPath = (path: string): string => {
    return (history.location.pathname.includes(path) && history.location.pathname) || null;
  };

  const getActiveTab = useCallback(
    (activeTab: number): number => {
      switch (history.location.pathname) {
        case urlContainsPath('/home/search'):
          return 0;
        case urlContainsPath('/home/plan'):
          return 1;
        case urlContainsPath('/home/references'):
        case urlContainsPath('/home/references/activity/'):
          return 2;
        case urlContainsPath('/home/activities'):
          return 3;
        case urlContainsPath('/home/map'):
          return 4;
        case urlContainsPath('/home/activity'):
          return 5;
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
    <AppBar position="static">
      <Tabs value={activeTab} onChange={handleChange} variant="scrollable" scrollButtons="on">
        <Tab label="Search" icon={<Search />} onClick={() => history.push('/home/search')} />
        <Tab label="Plan My Trip" icon={<Explore />} onClick={() => history.push('/home/plan')} />
        <Tab label="References" icon={<Bookmarks />} onClick={() => history.push('/home/references')} />
        <Tab label="My Activities" icon={<HomeWork />} onClick={() => history.push('/home/activities')} />
        <Tab label="Map" icon={<Map />} onClick={() => history.push('/home/map')} />
        <Tab label="Current Activity" icon={<Assignment />} onClick={() => history.push('/home/activity')} />
      </Tabs>
    </AppBar>
  );
};

export default TabsContainer;
