import { Capacitor } from '@capacitor/core';
import {
  AppBar,
  CircularProgress,
  Tab,
  Tabs,
  Toolbar,
  Grid,
  makeStyles,
  Theme,
  FormGroup,
  FormControlLabel,
  Switch,
  ListItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  List,
  createStyles,
  IconButton,
  Divider,
  Hidden
} from '@material-ui/core';
import clsx from 'clsx';
import { Assignment, Bookmarks, Explore, HomeWork, Map, Search, Home } from '@material-ui/icons';
import { ALL_ROLES } from 'constants/roles';
import { ThemeContext } from 'contexts/themeContext';
import useKeycloakWrapper from 'hooks/useKeycloakWrapper';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import React, { useCallback, useLayoutEffect, useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import invbclogo from '../../InvasivesBC_Icon.svg';
import MenuIcon from '@material-ui/icons/Menu';
import Brightness2Icon from '@material-ui/icons/Brightness2';
import WbSunnyIcon from '@material-ui/icons/WbSunny';

const drawerWidth = 240;

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
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  menuButton: {
    marginRight: 36
  },
  hide: {
    display: 'none'
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap'
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    overflowX: 'hidden',
    width: 0,
    [theme.breakpoints.up('sm')]: {
      width: 0
    }
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(1, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3)
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

  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    function handleResize() {
      setOpen(false);
    }
    window.scrollTo(0, 0);

    window.addEventListener('resize', handleResize);
  }, []);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

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

  const themeContext = useContext(ThemeContext);
  const { themeType, setThemeType } = themeContext;

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

          if (Capacitor.getPlatform() !== 'web') {
            tabsUserHasAccessTo.push({
              label: 'Plan My Trip',
              path: '/home/plan',
              icon: <Explore />
            });
          }

          if (Capacitor.getPlatform() != 'web') {
            tabsUserHasAccessTo.push({
              label: 'Cached Records',
              path: '/home/references',
              childPaths: ['/home/references/activity'],
              icon: <Bookmarks />
            });
          }

          tabsUserHasAccessTo.push({
            label: 'My Records',
            path: '/home/activities',
            icon: <HomeWork />
          });

          tabsUserHasAccessTo.push({
            label: 'Map',
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
    <>
      <AppBar
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open
        })}
        position="static">
        <Toolbar>
          <Hidden mdUp>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              className={clsx(classes.menuButton, {
                [classes.hide]: open
              })}>
              <MenuIcon />
            </IconButton>
          </Hidden>

          <Grid className={classes.alignment} flex-direction="row" container>
            <Grid container justifyContent="center" alignItems="center" xs={6} md={1} item>
              <img
                className={classes.pointer}
                src={invbclogo}
                width="50"
                style={{ marginRight: '5px' }}
                height="50"
                alt="B.C. Government Logo"
                onClick={() => history.push('/')}
              />
              <b>InvasivesBC</b>
            </Grid>
            <Hidden smDown>
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
              <Grid xs={1} container justifyContent="center" alignItems="center" item>
                <FormControlLabel
                  control={
                    <Switch
                      checked={themeType}
                      checkedIcon={themeType ? <Brightness2Icon /> : <WbSunnyIcon />}
                      onChange={() => {
                        setThemeType(!themeType);
                      }}
                    />
                  }
                  label="Theme Mode"
                />
              </Grid>
            </Hidden>
          </Grid>
        </Toolbar>
      </AppBar>
      <Hidden mdUp>
        <Drawer
          className={clsx(classes.drawer, {
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open
          })}
          classes={{
            paper: clsx({
              [classes.drawerOpen]: open,
              [classes.drawerClose]: !open
            })
          }}
          style={{ paddingTop: '100px' }}
          variant="permanent">
          <div className={classes.toolbar}>
            <IconButton onClick={handleDrawerClose}>
              <ChevronLeftIcon />
            </IconButton>
          </div>
          <Divider />
          <List>
            {tabConfig.map((tab) => (
              <ListItem button onClick={() => history.push(tab.path)} key={tab.label.split(' ').join('_')}>
                <ListItemIcon>{tab.icon}</ListItemIcon>
                <ListItemText primary={tab.label} />
              </ListItem>
            ))}
          </List>

          <Divider />
          <Grid container justifyContent="center" alignItems="center">
            <FormControlLabel
              control={
                <Switch
                  checked={themeType}
                  checkedIcon={themeType ? <Brightness2Icon /> : <WbSunnyIcon />}
                  onChange={() => {
                    setThemeType(!themeType);
                  }}
                />
              }
              label="Theme Mode"
            />
          </Grid>
        </Drawer>
      </Hidden>
    </>
  );
};

export default TabsContainer;
