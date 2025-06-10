import React, { Suspense, useEffect, useState } from 'react';
import 'UI/Layout/OverlayLayout/Overlay.css';
import { useSelector } from 'utils/use_selector';
import { OverlayHeader } from 'UI/Layout/OverlayLayout/OverlayHeader';
import { AppRoutes } from 'UI/Layout/Routes/AppRoutes';
import AlertsContainer from 'UI/Layout/AlertsContainer/AlertsContainer';
import UserInputModalController from 'UI/Reusable/UserInputModals/UserInputModalController';
import { WebHeader } from 'UI/Layout/OverlayLayout/Header/Web/WebHeader';
import { MobileOnly } from 'UI/Reusable/Predicates/MobileOnly';
import { WebOnly } from 'UI/Reusable/Predicates/WebOnly';
import MobileHeader from 'UI/Layout/OverlayLayout/Header/Mobile/MobileHeader';
import { Footer } from 'UI/Layout/OverlayLayout/Footer/Footer';
import NewRecordDialog from 'UI/Features/Records/NewRecordDialog';
import { OfflineDataSyncDialog } from 'UI/Features/OfflineDataSync/OfflineDataSyncDialog';
import { OfflineUserMenu } from 'UI/Features/OfflineUserMenu/OfflineUserMenu';
import CustomizeLayerMenu from 'UI/Features/LegacyMap/Controls/CustomizeLayerDialog';
import Spinner from 'UI/Reusable/Spinner/Spinner';
import { DynamicMapComponent } from 'UI/Layout/DynamicMapComponent/DynamicMapComponent';
import { LayoutMode } from 'UI/Layout/Routes/PrimaryNavigation';

const Overlay = () => {
  const [panelOpen, setPanelOpen] = React.useState(true);
  const [fullScreen, setFullScreen] = React.useState(false);
  const [additionalClasses, setAdditionalClasses] = useState<string>('');

  const layoutMode = useSelector((state) => state.AppMode.layout.viewLayout);

  useEffect(() => {
    switch (layoutMode) {
      case LayoutMode.MAP_EXCLUSIVE:
        setPanelOpen(false);
        setFullScreen(false);
        break;
      case LayoutMode.MAP_HIDDEN:
        setPanelOpen(true);
        setFullScreen(true);
        break;
      case LayoutMode.MAP_FOCUSED:
      default:
        setPanelOpen(true);
        setFullScreen(false);
        break;
    }
  }, [layoutMode]);

  useEffect(() => {
    const classesToAdd: string[] = [];
    if (panelOpen) {
      classesToAdd.push('shown');
    }
    if (fullScreen) {
      classesToAdd.push('fullscreen');
    }
    setAdditionalClasses(classesToAdd.join(' '));
  }, [fullScreen, panelOpen]);

  return (
    <>
      <AlertsContainer />
      <UserInputModalController />
      <MobileOnly>
        <MobileHeader />
      </MobileOnly>
      <WebOnly>
        <WebHeader />
      </WebOnly>
      <Suspense fallback={<Spinner />}>
        <DynamicMapComponent />
      </Suspense>
      <div id="overlay-anchor">
        <div className={`overlay-panel ${additionalClasses}`}>
          {panelOpen && !fullScreen && <OverlayHeader />}
          <div className={`overlay-content`}>
            <AppRoutes />
          </div>
        </div>
      </div>
      <WebOnly>
        <Footer />
      </WebOnly>
      <NewRecordDialog />
      <MobileOnly>
        <OfflineDataSyncDialog />
        <OfflineUserMenu />
      </MobileOnly>
      <CustomizeLayerMenu />
    </>
  );
};

export default Overlay;
