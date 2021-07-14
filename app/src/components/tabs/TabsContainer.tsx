import { AppBar, CircularProgress, Tab, Tabs, Toolbar, Grid, makeStyles, Theme } from '@material-ui/core';
import { Assignment, Bookmarks, Explore, HomeWork, Map, Search, Home } from '@material-ui/icons';
import { ALL_ROLES } from 'constants/roles';
import useKeycloakWrapper from 'hooks/useKeycloakWrapper';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import sunriseLogo from '../../bcGovSunriseLogo.png';
import invbclogo from '../../InvasivesBC_Icon.svg';

const useStyles = makeStyles((theme: Theme) => ({
  pointer: {
    cursor: 'pointer'
  },
  alignment: {
    justifyContent: 'inherit',
    flexWrap: 'nowrap',
    '@media (max-device-width: 1430px)': {
      justifyContent: 'center'
    }
  }
}));

export interface ITabConfig {
  path: string;
  childPaths?: string[];
  label: string;
  icon: React.ReactElement;
}

export interface ITabsContainerProps {
  isMobileNoNetwork: boolean;
}

//const bcGovLogoRev = 'https://bcgov.github.io/react-shared-components/images/bcid-logo-rev-en.svg';
//const invbclogo = require('InvasivesBC_Icon.svg');

const TabsContainer: React.FC<ITabsContainerProps> = (props: any) => {
  const keycloak = useKeycloakWrapper();

  const classes = useStyles();
  const history = useHistory();

  const [tabConfig, setTabConfig] = useState<ITabConfig[]>([]);

  /**
   * Determine the active tab index, based on the current url path.
   *
   * @param {number} activeTabNumber The current active tab index, to be used as backup if no matching paths are found.
   * @return {*}  {number}
   */
  const getActiveTab = useCallback(
    (activeTabNumber: number): number => {
      for (let index = 0; index < tabConfig.length; index++) {
        const pathsToMatchAgainst = [tabConfig[index].path, ...(tabConfig[index].childPaths || [])];

        // If the current url path contains any of the paths for a tab, return its index as the new active tab index.
        if (
          pathsToMatchAgainst.some((pathToMatch) => {
            return history.location.pathname.includes(pathToMatch);
          })
        ) {
          return index;
        }
      }

      // Otherwise return the current active tab index as a fallback
      return activeTabNumber;
    },
    [history.location.pathname]
  );

  const [activeTab, setActiveTab] = React.useState(getActiveTab(0));

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    setActiveTab((activeTabNumber) => getActiveTab(activeTabNumber));
  }, [history.location.pathname, getActiveTab]);

  useEffect(() => {
    const setTabConfigBasedOnRoles = () => {
      setTabConfig(() => {
        const tabsUserHasAccessTo: ITabConfig[] = [];

        if (keycloak.hasRole(ALL_ROLES) || props.isMobileNoNetwork) {
          tabsUserHasAccessTo.push({
            label: 'Home',
            path: '/home/landing',
            icon: <Home />
          });

          tabsUserHasAccessTo.push({
            label: 'Search',
            path: '/home/search',
            icon: <Search />
          });

          tabsUserHasAccessTo.push({
            label: 'Plan My Trip',
            path: '/home/plan',
            icon: <Explore />
          });

          tabsUserHasAccessTo.push({
            label: 'Cached Records',
            path: '/home/references',
            childPaths: ['/home/references/activity'],
            icon: <Bookmarks />
          });

          tabsUserHasAccessTo.push({
            label: 'My Records',
            path: '/home/activities',
            icon: <HomeWork />
          });

          tabsUserHasAccessTo.push({
            label: 'Map',
            path: '/home/map',
            icon: <Map />
          });

          tabsUserHasAccessTo.push({
            label: 'Map2',
            path: '/home/map2',
            icon: <Map />
          });

          tabsUserHasAccessTo.push({
            label: 'Current Activity',
            path: '/home/activity',
            icon: <Assignment />
          });
        }

        return tabsUserHasAccessTo;
      });
    };

    if (!tabConfig || !tabConfig.length) {
      setTabConfigBasedOnRoles();
    }
  }, [keycloak]);

  if (!tabConfig || !tabConfig.length) {
    return <CircularProgress />;
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Grid className={classes.alignment} flex-direction="row" container>
          <Grid xs={1} item>
            <img
              className={classes.pointer}
              src={invbclogo}
              width="50"
              height="50"
              alt="B.C. Government Logo"
              onClick={() => history.push('/')}
            />
            InvasivesBC
          </Grid>
          <Grid xs={1} item>
            <img
              className={classes.pointer}
              src={sunriseLogo}
              width="100"
              height="50"
              onClick={() => history.push('/')}
            />
          </Grid>
          <Grid xs={11} item>
            <Tabs value={activeTab} onChange={handleChange} variant="scrollable" scrollButtons="on">
              {tabConfig.map((tab) => (
                <Tab
                  label={tab.label}
                  key={tab.label.split(' ').join('_')}
                  icon={tab.icon}
                  onClick={() => history.push(tab.path)}
                />
              ))}
            </Tabs>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
};

export default TabsContainer;
