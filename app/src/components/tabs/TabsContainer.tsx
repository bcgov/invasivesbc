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
  Container,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Switch,
  Tab,
  Tabs,
  Theme,
  Toolbar,
  Typography,
  Box
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Assignment, Bookmarks, Explore, Home, HomeWork, Map, Search } from '@mui/icons-material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import Brightness2Icon from '@mui/icons-material/Brightness2';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import AssessmentIcon from '@mui/icons-material/Assessment';
import clsx from 'clsx';
import { AuthStateContext } from 'contexts/authStateContext';
import { NetworkContext } from 'contexts/NetworkContext';
import { ThemeContext } from 'utils/CustomThemeProvider';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import invbclogo from '../../InvasivesBC_Icon.svg';
import './TabsContainer.css';

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

//const bcGovLogoRev = 'https://bcgov.github.io/react-shared-components/images/bcid-logo-rev-en.svg';
//const invbclogo = require('InvasivesBC_Icon.svg');

const TabsContainer: React.FC<ITabsContainerProps> = (props: any) => {
  const authContext = useContext(AuthStateContext);
  const classes = useStyles();
  const history = useHistory();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const [open, setOpen] = React.useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const { userInfo, userInfoLoaded } = useContext(AuthStateContext);
  const handleClose = () => {
    setAnchorEl(null);
    setOpen(false);
  };
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    console.log('keycloak: ', authContext.keycloak);
    setAnchorEl(event.currentTarget);
  };

  const showLogoutAlert = () => {
    setShowAlert(true);
  };

  // loadUserFromCache();
  /*
    Function to logout current user by wiping their keycloak access token
  */
  const logoutUser = async () => {
    history.push('/home/landing');
    await authContext.logoutUser();
    handleClose();
  };

  const loginUser = async () => {
    await authContext.loginUser();
    handleClose();
  };

  const navToAdmin = async () => {
    // Redirect to /admin
    history.push('/admin');
    handleClose();
  };

  const navToUpdateRequest = async () => {
    // Redirect to /access-request
    history.push({
      pathname: '/home/access-request',
      state: {
        updateInfo: true
      }
    });
    handleClose();
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
  const getActiveTab = (activeTabNumber?: number): number => {
    for (let index = 0; index < tabConfig.length; index++) {
      const pathsToMatchAgainst = [tabConfig[index].path, ...(tabConfig[index].childPaths || [])];

      // If the current url path contains any of the paths for a tab, return its index as the new active tab index.
      if (
        pathsToMatchAgainst.some((pathToMatch) => {
          return window.location.pathname.includes(pathToMatch);
        })
      ) {
        return index;
      }
    }

    // Otherwise return the current active tab index as a fallback
    return activeTabNumber;
  };

  const [activeTab, setActiveTab] = React.useState(getActiveTab());

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setActiveTab(newValue);
  };

  const isMobile = () => {
    return Capacitor.getPlatform() !== 'web';
  };

  const isAuthorized = () => {
    return userInfoLoaded && authContext.userRoles.length > 0;
  };

  const isAdmin = (): boolean => {
    if (isAuthorized()) {
      return authContext.hasRole('master_administrator');
    } else return false;
  };

  const themeContext = useContext(ThemeContext);
  const { themeType, setThemeType } = themeContext;
  const networkContext = useContext(NetworkContext);
  const { connected, setConnected } = networkContext;

  useEffect(() => {
    setActiveTab((activeTabNumber) => getActiveTab(activeTabNumber));
  }, [history.location.pathname, getActiveTab]);

  useEffect(() => {
    const setTabConfigBasedOnRoles = async () => {
      await setTabConfig(() => {
        const tabsUserHasAccessTo: ITabConfig[] = [];
        tabsUserHasAccessTo.push({
          label: 'Home',
          path: '/home/landing',
          icon: <Home fontSize={'small'} />
        });

        if (!isAuthorized()) {
          tabsUserHasAccessTo.push({
            label: 'Map',
            path: '/home/map',
            icon: <Map fontSize={'small'} />
          });
        }

        if (isAuthorized()) {
          tabsUserHasAccessTo.push({
            label: 'Recorded Activities',
            path: '/home/activities',
            icon: <HomeWork fontSize={'small'} />
          });
        }

        if (isAuthorized() && isMobile() && process.env.REACT_APP_REAL_NODE_ENV !== 'production') {
          tabsUserHasAccessTo.push({
            label: 'Plan My Trip',
            path: '/home/plan',
            icon: <Explore fontSize={'small'} />
          });
        }

        if (isAuthorized()) {
          tabsUserHasAccessTo.push({
            label: 'Current Activity',
            path: '/home/activity',
            icon: <Assignment fontSize={'small'} />
          });
        }

        if (isAuthorized()) {
          tabsUserHasAccessTo.push({
            label: 'Current IAPP Site',
            path: '/home/iapp/',
            icon: (
              <img
                src={process.env.PUBLIC_URL + '/assets/iapp.gif'}
                style={{ maxWidth: '3.8rem', marginBottom: '6px' }}
              />
            )
          });
        }

        /*
        if (isAuthorized() && isMobile() && process.env.REACT_APP_REAL_NODE_ENV !== 'production') {
          tabsUserHasAccessTo.push({
            label: 'Cached Records',
            path: '/home/references',
            childPaths: ['/home/references/activity'],
            icon: <Bookmarks fontSize={'small'} />
          });
        }
        */

        if (isAdmin()) {
          tabsUserHasAccessTo.push({
            label: 'Admin',
            path: '/admin/useraccess',
            icon: <AdminPanelSettingsIcon fontSize={'small'} />
          });
        }

        if (isAuthorized() && !isMobile()) {
          tabsUserHasAccessTo.push({
            label: 'Reports',
            path: '/home/reports',
            icon: <AssessmentIcon fontSize={'small'} />
          });
        }
        return tabsUserHasAccessTo;
      });
    };
    setTabConfigBasedOnRoles();
  }, [authContext.keycloak, userInfo, userInfoLoaded]);

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
              logoutUser();
            }
          }
        ]}
      />

      <AppBar className={open ? classes.appBarShift : classes.appBar} position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters style={{ display: 'flex' }}>
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
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'center',
                justifyContent: 'center'
              }}>
              <img
                className={classes.pointer}
                src={invbclogo}
                style={{
                  marginRight: '5px',
                  objectFit: 'contain',
                  backgroundColor: 'white',
                  padding: 4,
                  borderRadius: 4
                }}
                height="60"
                width="60"
                alt="B.C. Government Logo"
                onClick={() => history.push('/')}
              />
              <b>InvasivesBC</b>
            </Box>
            <Hidden mdDown>
              <Box sx={{ flexGrow: 1, width: '100%', display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                <Tabs
                  indicatorColor="secondary"
                  textColor="inherit"
                  value={activeTab}
                  color="primary"
                  centered
                  style={{ width: '80%', color: '#fff' }}
                  onChange={handleChange}>
                  {tabConfig.map((tab) => (
                    <Tab
                      style={{ fontSize: '.7rem', fontWeight: 'bold' }}
                      color="primary"
                      label={tab.label}
                      key={tab.label.split(' ').join('_')}
                      icon={tab.icon}
                      onClick={() => history.push(tab.path)}
                    />
                  ))}
                </Tabs>
              </Box>
              <Box sx={{ flexGrow: 0 }}>
                <IconButton onClick={handleClick} size="small">
                  <Avatar></Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={openMenu}
                  onClose={handleClose}
                  PaperProps={{
                    elevation: 3
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}>
                  {isMobile() && (
                    <MenuItem>
                      <Switch
                        color="secondary"
                        checked={connected}
                        checkedIcon={connected ? <Brightness2Icon /> : <WbSunnyIcon />}
                        onChange={() => {
                          setConnected(!connected);
                        }}
                      />
                      Network Online
                    </MenuItem>
                  )}
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
                  {isAuthorized() && (
                    <MenuItem onClick={navToUpdateRequest}>
                      <ListItemIcon>
                        <AssignmentIndIcon />
                      </ListItemIcon>
                      Update My Info
                    </MenuItem>
                  )}
                  {isAdmin() && (
                    <MenuItem onClick={navToAdmin}>
                      <ListItemIcon>
                        <AdminPanelSettingsIcon />
                      </ListItemIcon>
                      Admin
                    </MenuItem>
                  )}
                  {authContext.keycloak.obj?.authenticated ? (
                    <MenuItem onClick={logoutUser}>
                      <ListItemIcon>
                        <LogoutIcon />
                      </ListItemIcon>
                      Logout
                    </MenuItem>
                  ) : (
                    <MenuItem onClick={loginUser}>
                      <ListItemIcon>
                        <LoginIcon />
                      </ListItemIcon>
                      Log In
                    </MenuItem>
                  )}
                </Menu>
              </Box>
            </Hidden>
          </Toolbar>
        </Container>
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
          <div className={classes.toolbar}>
            <Grid xs={1} container justifyContent="center" alignItems="center" item>
              <IconButton onClick={handleClick} size="small">
                <>
                  {userInfoLoaded ? (
                    () => {
                      if (userInfo.displayName) {
                        return <Avatar>{userInfo.displayName?.match(/\b(\w)/g)?.join('')}</Avatar>;
                      } else return <></>;
                    }
                  ) : (
                    <Avatar></Avatar>
                  )}
                </>
              </IconButton>
            </Grid>
            <IconButton onClick={handleDrawerClose}>
              <ChevronLeftIcon />
            </IconButton>
          </div>
          {authContext.keycloak?.obj?.token ? <p>Keycloak token is present</p> : <></>}
          {networkContext.connected ? (
            <div>
              {userInfoLoaded ? (
                <MenuItem onClick={showLogoutAlert}>
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              ) : (
                <MenuItem onClick={loginUser}>
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
