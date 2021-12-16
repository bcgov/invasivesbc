import { Capacitor } from '@capacitor/core';
import { IonAlert } from '@ionic/react';
import {
  AppBar,
  Avatar,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  FormControlLabel,
  Grid,
  Hidden,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Menu,
  MenuItem,
  Switch,
  Tab,
  Tabs,
  Theme,
  Toolbar
} from '@material-ui/core';
import { Assignment, Bookmarks, Explore, Home, HomeWork, Map, Search } from '@material-ui/icons';
import Brightness2Icon from '@material-ui/icons/Brightness2';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import MenuIcon from '@material-ui/icons/Menu';
import WbSunnyIcon from '@material-ui/icons/WbSunny';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import clsx from 'clsx';
import { AuthStateContext } from 'contexts/authStateContext';
import { NetworkContext } from 'contexts/NetworkContext';
import { ThemeContext } from 'contexts/themeContext';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import invbclogo from '../../InvasivesBC_Icon.svg';
import './TabsContainer.css';
import {useNetworkInformation} from "../../hooks/useNetworkInformation";

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
    }),
    fontSize: '0.9em'
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
    justifyContent: 'space-between',
    padding: theme.spacing(1, 1),
    paddingLeft: theme.spacing(3),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3)
  },
  themeSwitch: {
    paddingLeft: theme.spacing(3)
  },
  chip: {
    margin: theme.spacing(1)
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

const TabsContainer: React.FC<ITabsContainerProps> = (props: any) => {
  const authState = useContext(AuthStateContext);
  const { isMobile } = useNetworkInformation();
  const classes = useStyles();
  const history = useHistory();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const [open, setOpen] = React.useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const handleClose = () => {
    setAnchorEl(null);
    setOpen(false);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const showLogoutAlert = () => {
    setShowAlert(true);
  };

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
  const networkContext = useContext(NetworkContext);
  const { connected, setConnected } = networkContext;

  const [avatarName, setAvatarName] = useState('');

  useEffect( () => {
    setAvatarName(authState.keycloak?.obj?.tokenParsed?.name?.match(/\b(\w)/g).join('') ?? '');
  }, [authState.keycloak?.obj?.tokenParsed]);

  useEffect(() => {
    setActiveTab((activeTabNumber) => getActiveTab(activeTabNumber));
  }, [history.location.pathname, getActiveTab]);

  useEffect(() => {
    const setTabConfigBasedOnRoles = async () => {
      await setTabConfig(() => {
        const tabsUserHasAccessTo: ITabConfig[] = [];
        if (authState.isAuthenticated) {
          tabsUserHasAccessTo.push({
            label: 'Search',
            path: '/home/search',
            icon: <Search fontSize={'small'} />
          });
        }
        tabsUserHasAccessTo.push({
          label: 'Map',
          path: '/home/map',
          icon: <Map fontSize={'small'} />
        });

        if (authState.isAuthenticated && process.env.REACT_APP_REAL_NODE_ENV !== 'production') {
          tabsUserHasAccessTo.push({
            label: 'Current Activity',
            path: '/home/activity',
            icon: <Assignment fontSize={'small'} />
          });
        }
        tabsUserHasAccessTo.push({
          label: 'Home',
          path: '/home/landing',
          icon: <Home fontSize={'small'} />
        });

        if (authState.isAuthenticated && isMobile() && process.env.REACT_APP_REAL_NODE_ENV !== 'production') {
          tabsUserHasAccessTo.push({
            label: 'Plan My Trip',
            path: '/home/plan',
            icon: <Explore fontSize={'small'} />
          });
        }

        if (authState.isAuthenticated && isMobile() && process.env.REACT_APP_REAL_NODE_ENV !== 'production') {
          tabsUserHasAccessTo.push({
            label: 'Cached Records',
            path: '/home/references',
            childPaths: ['/home/references/activity'],
            icon: <Bookmarks fontSize={'small'} />
          });
        }

        if (authState.isAuthenticated && process.env.REACT_APP_REAL_NODE_ENV !== 'production') {
          tabsUserHasAccessTo.push({
            label: 'My Records',
            path: '/home/activities',
            icon: <HomeWork fontSize={'small'} />
          });
        }

        if (authState.isAuthenticated) {
          tabsUserHasAccessTo.push({
            label: 'Current Activity',
            path: '/home/activity',
            icon: <Assignment />
          });
        }
        return tabsUserHasAccessTo;
      });
    };
    setTabConfigBasedOnRoles();
  }, [authState, authState.isAuthenticated]);

  if (!tabConfig || !tabConfig.length) {
    return <CircularProgress />;
  }

  return (
    <>
      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header={'Are you sure?'}
        message={
          'If you log out while you are offline, you will not be able to access the app until you reconnect to a network.'
        }
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {}
          },
          {
            text: 'Okay',
            handler: () => {
              authState.doLogout();
            }
          }
        ]}
      />
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
            {/*<Grid style={{ width: '200px' }} item>*/}
            <Grid
              style={{ alignItems: 'center', display: 'flex', width: '200px' }}
              item
              container
              align-items="center"
              flex-direction="row">
              <Grid item>
                <img
                  className={classes.pointer}
                  src={invbclogo}
                  width="60"
                  style={{ marginRight: '5px' }}
                  height="60"
                  alt="B.C. Government Logo"
                  onClick={() => history.push('/')}
                />
              </Grid>
              <Grid item>
                <b>InvasivesBC</b>
              </Grid>
              <Grid item>
                <div className={'beta'}>BETA</div>
              </Grid>
              {/*</Grid>*/}
            </Grid>
            <Hidden smDown>
              <Grid xs={11} item>
                <Tabs value={activeTab} onChange={handleChange} variant="scrollable" scrollButtons="on">
                  {tabConfig.map((tab) => (
                    <Tab
                      style={{ fontSize: '.7rem', fontWeight: 'bold' }}
                      label={tab.label}
                      key={tab.label.split(' ').join('_')}
                      icon={tab.icon}
                      onClick={() => history.push(tab.path)}
                    />
                  ))}
                </Tabs>
              </Grid>
              <Grid xs={1} container justifyContent="center" alignItems="center" item>
                <IconButton onClick={handleClick} size="small">
                  {authState.isAuthenticated ? <Avatar>{avatarName}</Avatar> : <Avatar />}
                </IconButton>
              </Grid>
              <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleClose}
                PaperProps={{
                  elevation: 3
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}>
                <MenuItem>
                  <Switch
                    color="secondary"
                    checked={themeType}
                    checkedIcon={themeType ? <Brightness2Icon /> : <WbSunnyIcon />}
                    onChange={() => {
                      setThemeType(!themeType);
                    }}
                  />
                  Theme
                </MenuItem>
                {authState.isAuthenticated ? (
                  <MenuItem onClick={authState.doLogout}>
                    <ListItemIcon>
                      <LogoutIcon />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                ) : (
                  <MenuItem onClick={authState.doLogin}>
                    <ListItemIcon>
                      <LoginIcon />
                    </ListItemIcon>
                    Log In
                  </MenuItem>
                )}
              </Menu>
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
          variant="permanent">
          _{/* removed style component with paddingTop */}
          <div className={classes.toolbar}>
            <Grid xs={1} container justifyContent="center" alignItems="center" item>
              <IconButton onClick={handleClick} size="small">
                {authState.isAuthenticated ? <Avatar>{avatarName}</Avatar> : <Avatar />}
              </IconButton>
            </Grid>
            <IconButton onClick={handleDrawerClose}>
              <ChevronLeftIcon />
            </IconButton>
          </div>
          {networkContext.connected ? (
            <div>
              {authState.isAuthenticated ? (
                <MenuItem onClick={showLogoutAlert}>
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              ) : (
                <MenuItem onClick={authState.doLogin}>
                  <ListItemIcon>
                    <LoginIcon />
                  </ListItemIcon>
                  Log In
                </MenuItem>
              )}
            </div>
          ) : (
            <Chip className={classes.chip} color="primary" label="Offline Mode" />
          )}
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
          {Capacitor.getPlatform() !== 'web' ? (
            <Grid container justifyContent="center" alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={connected}
                    checkedIcon={connected ? <Brightness2Icon /> : <WbSunnyIcon />}
                    onChange={() => {
                      console.log('on click');
                      console.dir(connected);
                      setConnected(!connected);
                    }}
                  />
                }
                label="Network Mode"
              />
            </Grid>
          ) : (
            <></>
          )}
        </Drawer>
      </Hidden>
    </>
  );
};

export default TabsContainer;
