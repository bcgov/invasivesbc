import 'UI/Layout/WideLayout/WideLayout.css';
import { AppRoutes } from 'UI/Layout/Routes/AppRoutes';
import { LayoutMode, usePrimaryNavigationLinks } from 'UI/Layout/Routes/PrimaryNavigation';
import { Link } from 'react-router';
import { useDispatch, useSelector } from 'utils/use_selector';
import { useEffect, useState } from 'react';
import NewRecordDialog from 'UI/Features/Records/NewRecordDialog';
import CustomizeLayerMenu from 'UI/Features/LegacyMap/Controls/CustomizeLayerDialog';
import AlertsContainer from 'UI/Layout/AlertsContainer/AlertsContainer';
import UserInputModalController from 'UI/Reusable/UserInputModals/UserInputModalController';
import { AuthActions } from 'state/actions/auth/Auth';
import { selectAuth } from 'state/reducers/auth';
import { Menu } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { OfflineSyncHeaderButton } from 'UI/Layout/OverlayLayout/Header/OfflineSyncHeaderButton';
import { MobileOnly } from 'UI/Reusable/Predicates/MobileOnly';
import { OfflineDataSyncDialog } from 'UI/Features/OfflineDataSync/OfflineDataSyncDialog';
import { OfflineUserMenu } from 'UI/Features/OfflineUserMenu/OfflineUserMenu';
import DebugMenu from 'UI/Layout/DebugMenu/DebugMenu';
import { NetworkStateControl } from 'UI/Reusable/NetworkStateControl';
import { FeatureGated } from 'UI/Reusable/Predicates/FeatureGated';
import ContextualPopover from 'UI/Layout/ContextualPopover/ContextualPopover';
import { Map as InvasivesMap } from 'UI/Features/LegacyMap/Map';

const WideLayout = () => {
  const { filteredLinks } = usePrimaryNavigationLinks();
  const { authenticated } = useSelector(selectAuth);

  const layoutMode = useSelector((state) => state.AppMode.layout.viewLayout);
  const loggedInOrWorkingOffline = useSelector((state) => state.Auth.loggedInOrWorkingOffline);

  const [mapShown, setMapShown] = useState(false);
  const dispatch = useDispatch();

  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    switch (layoutMode) {
      case LayoutMode.MAP_HIDDEN:
        setMapShown(false);
        break;
      case LayoutMode.MAP_FOCUSED:
      case LayoutMode.MAP_EXCLUSIVE:
      default:
        setMapShown(true);
        break;
    }
  }, [layoutMode]);

  return (
    <div id="wide-layout">
      <AlertsContainer />
      <UserInputModalController />
      <div id="nav" className={collapsed ? 'collapsed' : ''}>
        <IconButton
          className={'menu-button'}
          onClick={() => {
            setCollapsed(!collapsed);
          }}
        >
          <Menu />
        </IconButton>

        {!collapsed && (
          <>
            <h3>InvasivesBC</h3>

            <ul className={'primary-nav'}>
              {filteredLinks.map((link) => (
                <li key={link.id}>
                  <Link to={link.path} className={link.active ? 'active' : 'inactive'}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className={'spacer'} />
            <DebugMenu />

            <MobileOnly>
              <NetworkStateControl />
            </MobileOnly>

            <ul className={'user-actions'}>
              {loggedInOrWorkingOffline && <OfflineSyncHeaderButton />}
              {authenticated || (
                <>
                  <li>
                    <a
                      onClick={() => {
                        dispatch(AuthActions.signinRequest({ idpHint: 'idir' }));
                      }}
                    >
                      Login (IDIR)
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => {
                        dispatch(AuthActions.signinRequest({ idpHint: 'bceidbusiness' }));
                      }}
                    >
                      Login (BCEID)
                    </a>
                  </li>
                </>
              )}
              {authenticated && (
                <li>
                  <a
                    onClick={() => {
                      dispatch(AuthActions.signoutRequest());
                    }}
                  >
                    Logout
                  </a>
                </li>
              )}
            </ul>
          </>
        )}
      </div>
      <div id="content">
        {mapShown && (
          <div id="map">
            <InvasivesMap />
          </div>
        )}

        <ContextualPopover />

        <AppRoutes />
      </div>
      <FeatureGated requires={'OFFLINE_SYNC'}>
        <OfflineDataSyncDialog />
      </FeatureGated>
      <MobileOnly>
        <OfflineUserMenu />
      </MobileOnly>
      <NewRecordDialog />;
      <CustomizeLayerMenu />;
    </div>
  );
};

export default WideLayout;
