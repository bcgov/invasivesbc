import { DynamicMapComponent } from 'UI/Layout/DynamicMapComponent/DynamicMapComponent';
import 'UI/Layout/WideLayout/WideLayout.css';
import { AppRoutes } from 'UI/Layout/Routes/AppRoutes';
import { LayoutMode, usePrimaryNavigationLinks } from 'UI/Layout/Routes/PrimaryNavigation';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'utils/use_selector';
import React, { useEffect, useState } from 'react';
import NewRecordDialog from 'UI/Features/Records/NewRecordDialog';
import CustomizeLayerMenu from 'UI/Features/LegacyMap/Controls/CustomizeLayerDialog';
import AlertsContainer from 'UI/Layout/AlertsContainer/AlertsContainer';
import UserInputModalController from 'UI/Reusable/UserInputModals/UserInputModalController';
import { AuthActions } from 'state/actions/auth/Auth';

const WideLayout = () => {
  const { filteredLinks } = usePrimaryNavigationLinks();

  const layoutMode = useSelector((state) => state.AppMode.layout.mode);

  const [mapShown, setMapShown] = useState(false);
  const dispatch = useDispatch();

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
      <div id="nav">
        <AlertsContainer />
        <UserInputModalController />

        <h3>InvasivesBC</h3>
        <ul>
          {filteredLinks.map((link) => (
            <li key={link.id}>
              <Link to={link.path} className={link.active ? 'active' : 'inactive'}>
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <a
              onClick={() => {
                dispatch(AuthActions.signinRequest({ idpHint: 'idir' }));
              }}
            >
              Login
            </a>
          </li>
          <li>
            <a
              onClick={() => {
                dispatch(AuthActions.signoutRequest());
              }}
            >
              Logout
            </a>
          </li>
        </ul>
      </div>

      <div id="content">
        {mapShown && (
          <div id="map">
            <DynamicMapComponent />
          </div>
        )}

        <AppRoutes />

        <NewRecordDialog />

        <CustomizeLayerMenu />
      </div>
    </div>
  );
};

export { WideLayout };
