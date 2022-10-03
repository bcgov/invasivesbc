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
  Box
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import Brightness2Icon from '@mui/icons-material/Brightness2';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import clsx from 'clsx';
import { ThemeContext } from 'utils/CustomThemeProvider';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import invbclogo from '../../InvasivesBC_Icon.svg';
import './TabsContainer.css';
import { useDispatch } from 'react-redux';
import {
  AUTH_SIGNIN_REQUEST,
  AUTH_SIGNOUT_REQUEST,
  NETWORK_GO_OFFLINE,
  NETWORK_GO_ONLINE,
  TABS_SET_ACTIVE_TAB_REQUEST
} from '../../state/actions';
import { useSelector } from '../../state/utilities/use_selector';
import { selectAuth } from '../../state/reducers/auth';
import { MobileOnly } from '../common/MobileOnly';
import { selectNetworkConnected } from '../../state/reducers/network';
import { selectTabs } from 'state/reducers/tabs';
import { getTabIconByName } from './TabIconIndex';

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

export interface ITabsContainerProps {}

const TabsContainer: React.FC<ITabsContainerProps> = (props: any) => {
  const classes = useStyles();
  const history = useHistory();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const [open, setOpen] = React.useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const dispatch = useDispatch();

  const { displayName, roles, authenticated } = useSelector(selectAuth);
  const connected = useSelector(selectNetworkConnected);
  const { showLoggedInTabs, activeTab, initialized: tabsInitialized, tabConfig } = useSelector(selectTabs);

  const [isAdmin, setIsAdmin] = useState(
    authenticated && roles.includes({ role_id: 18, role_name: 'master_administrator' })
  );

  useEffect(() => {
    setIsAdmin(authenticated && roles.includes({ role_id: 18, role_name: 'master_administrator' }));
  }, [authenticated, roles]);

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

  const logoutUser = async () => {
    history.push('/home/landing');
    dispatch({ type: AUTH_SIGNOUT_REQUEST });
    handleClose();
  };

  const loginUser = async () => {
    dispatch({ type: AUTH_SIGNIN_REQUEST });
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

  // const [tabConfig, setTabConfig] = useState<ITabConfig[]>([]);

  /**
   * Determine the active tab index, based on the current url path.
   *
   * @param {number} activeTabNumber The current active tab index, to be used as backup if no matching paths are found.
   * @return {*}  {number}
   */
  const getActiveTab = (pathname: string): number => {
    for (let index = 0; index < tabConfig.length; index++) {
      const pathsToMatchAgainst = [tabConfig[index].path, ...(tabConfig[index].childPaths || [])];

      // If the current url path contains any of the paths for a tab, return its index as the new active tab index.
      if (
        pathsToMatchAgainst.some((pathToMatch) => {
          return pathname.includes(pathToMatch) && !open;
        })
      ) {
        return index;
      }
    }

    // Otherwise return the current active tab index as a fallback
    return activeTab;
  };

  // const [activeTab, setActiveTab] = React.useState(getActiveTab());

  const themeContext = useContext(ThemeContext);
  const { themeType, setThemeType } = themeContext;

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    console.log('TAB CHANGED! SETTING TO: ', newValue);
    dispatch({
      type: TABS_SET_ACTIVE_TAB_REQUEST,
      payload: {
        activeTab: newValue
      }
    });
  };

  return useMemo(() => {
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
              <Box sx={{ display: { md: 'none', xs: 'block' } }}>
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
              </Box>
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
              <Box sx={{ flexGrow: 1, width: '100%', display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                {tabConfig && tabConfig.length > 0 && tabsInitialized ? (
                  <Tabs
                    indicatorColor="secondary"
                    textColor="inherit"
                    value={activeTab}
                    color="primary"
                    centered
                    style={{ width: '80%', color: '#fff' }}
                    onChange={handleChange}>
                    {tabConfig.map((tab) => {
                      if (tab && tab.label)
                        return (
                          <Tab
                            style={{
                              fontSize: '.7rem',
                              fontWeight: 'bold',
                              justifyContent: 'space-between',
                              paddingBottom: '15px',
                              paddingTop: '15px'
                            }}
                            color="primary"
                            label={tab.label}
                            key={tab.label.split(' ').join('_')}
                            icon={getTabIconByName(tab.icon)}
                            onClick={() => history.push(tab.path)}
                          />
                        );
                    })}
                  </Tabs>
                ) : (
                  <></>
                )}
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
                  {/*<MobileOnly>*/}
                  <MenuItem>
                    <Switch
                      color="secondary"
                      checked={connected}
                      checkedIcon={connected ? <Brightness2Icon /> : <WbSunnyIcon />}
                      onChange={() => {
                        dispatch({ type: connected ? NETWORK_GO_OFFLINE : NETWORK_GO_ONLINE });
                      }}
                    />
                    Network Online
                  </MenuItem>
                  {/*</MobileOnly>*/}
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
                  {showLoggedInTabs && (
                    <MenuItem onClick={navToUpdateRequest}>
                      <ListItemIcon>
                        <AssignmentIndIcon />
                      </ListItemIcon>
                      Update My Info
                    </MenuItem>
                  )}
                  {isAdmin && (
                    <MenuItem onClick={navToAdmin}>
                      <ListItemIcon>
                        <AdminPanelSettingsIcon />
                      </ListItemIcon>
                      Admin
                    </MenuItem>
                  )}
                  {authenticated ? (
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
            </Toolbar>
          </Container>
        </AppBar>
        <Box sx={{ display: { md: 'none', xs: 'block' } }}>
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
                  <>{authenticated ? <Avatar>{displayName.match(/\b(\w)/g)?.join('')}</Avatar> : <Avatar />}</>
                </IconButton>
              </Grid>
              <IconButton onClick={handleDrawerClose}>
                <ChevronLeftIcon />
              </IconButton>
            </div>
            {connected ? (
              <div>
                {authenticated ? (
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
            <MobileOnly>
              <Grid container justifyContent="center" alignItems="center">
                <FormControlLabel
                  control={
                    <Switch
                      checked={connected}
                      checkedIcon={connected ? <Brightness2Icon /> : <WbSunnyIcon />}
                      onChange={() => {
                        dispatch({ type: connected ? NETWORK_GO_OFFLINE : NETWORK_GO_ONLINE });
                      }}
                    />
                  }
                  label="Network Mode"
                />
              </Grid>
            </MobileOnly>
          </Drawer>
        </Box>
      </>
    );
    //},[tabConfig,activeTab,open]);
  }, [tabConfig, history.location.pathname, open, anchorEl]);
};

export default TabsContainer;
