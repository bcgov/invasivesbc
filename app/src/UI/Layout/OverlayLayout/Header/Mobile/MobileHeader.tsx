import InvBcLogo from 'UI/Reusable/InvBcLogo/InvBcLogo';
import NavTab from 'UI/Layout/OverlayLayout/Header/NavTab';
import { useSelector } from 'utils/use_selector';
import HeaderPopover from 'UI/Layout/OverlayLayout/Header/Mobile/HeaderPopover';
import { OfflineSyncHeaderButton } from 'UI/Layout/OverlayLayout/Header/OfflineSyncHeaderButton';

import 'UI/Layout/OverlayLayout/Header/Mobile/MobileHeader.css';
import React from 'react';
import { usePrimaryNavigationLinks } from 'UI/Layout/Routes/PrimaryNavigation';
import DebugMenu from 'UI/Layout/DebugMenu/DebugMenu';
import { FeatureGated } from 'UI/Reusable/Predicates/FeatureGated';

const MobileHeader = () => {
  const loggedInOrWorkingOffline = useSelector((state) => state.Auth.loggedInOrWorkingOffline);

  const { filteredLinks } = usePrimaryNavigationLinks();

  return (
    <header id="nav-header">
      <InvBcLogo />

      <nav>
        {filteredLinks.map((link) => {
          return <NavTab key={link.id} {...link} />;
        })}
        {loggedInOrWorkingOffline && (
          <FeatureGated requires={'OFFLINE_SYNC'}>
            <OfflineSyncHeaderButton />
          </FeatureGated>
        )}
      </nav>
      <div>
        <DebugMenu />
        <HeaderPopover />
      </div>
    </header>
  );
};

export default MobileHeader;
