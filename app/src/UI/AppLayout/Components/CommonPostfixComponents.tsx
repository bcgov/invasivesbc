import React from 'react';
import { WebOnly } from 'UI/Predicates/WebOnly';
import { Footer } from 'UI/Footer/Footer';
import NewRecordDialog from 'UI/Overlay/Records/NewRecordDialog';
import { MobileOnly } from 'UI/Predicates/MobileOnly';
import { OfflineDataSyncDialog } from 'UI/OfflineDataSync/OfflineDataSyncDialog';
import { OfflineUserMenu } from 'UI/OfflineUserMenu/OfflineUserMenu';
import CustomizeLayerMenu from 'UI/LegacyMap/Controls/CustomizeLayerDialog';

/* Components that occur before the map in the layout dom, in both layouts */
const CommonPostfixComponents = () => {
  return (
    <>
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

export default CommonPostfixComponents;
