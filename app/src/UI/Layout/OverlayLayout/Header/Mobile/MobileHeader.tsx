import InvBcLogo from 'UI/Reusable/InvBcLogo/InvBcLogo';
import NavTab from 'UI/Layout/OverlayLayout/Header/NavTab';
import { useSelector } from 'utils/use_selector';
import HeaderPopover from 'UI/Layout/OverlayLayout/Header/Mobile/HeaderPopover';
import { OfflineSyncHeaderButton } from 'UI/Layout/OverlayLayout/Header/OfflineSyncHeaderButton';
import { AndroidMemoryReport } from 'UI/Layout/OverlayLayout/Header/Mobile/AndroidMemoryReport';
import { Platform } from 'state/configuration/build-time-config';

import 'UI/Layout/OverlayLayout/Header/Mobile/MobileHeader.css';
import React from 'react';
import { usePrimaryNavigationLinks } from 'UI/Layout/Routes/PrimaryNavigation';

const MobileHeader = () => {
  const loggedInOrWorkingOffline = useSelector((state) => state.Auth.loggedInOrWorkingOffline);
  
  const { PLATFORM } = useSelector((state) => state.Configuration.current.build);
  const { filteredLinks } = usePrimaryNavigationLinks();

  return (
    <header id="nav-header">
      <InvBcLogo />
      <nav>
        {filteredLinks.map((link) => {
          return <NavTab key={link.id} {...link} />;
        })}
        {loggedInOrWorkingOffline && <OfflineSyncHeaderButton />}
      </nav>
      {PLATFORM == Platform.ANDROID && <AndroidMemoryReport />}
      <HeaderPopover />
    </header>
  );
};

export default MobileHeader;
