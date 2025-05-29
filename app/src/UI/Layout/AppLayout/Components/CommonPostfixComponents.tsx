import React from 'react';
import { WebOnly } from 'UI/Reusable/Predicates/WebOnly';
import { Footer } from 'UI/Layout/Footer/Footer';
import NewRecordDialog from 'UI/Features/Records/NewRecordDialog';
import { MobileOnly } from 'UI/Reusable/Predicates/MobileOnly';
import { OfflineDataSyncDialog } from 'UI/Features/OfflineDataSync/OfflineDataSyncDialog';
import { OfflineUserMenu } from 'UI/Features/OfflineUserMenu/OfflineUserMenu';
import CustomizeLayerMenu from 'UI/Features/LegacyMap/Controls/CustomizeLayerDialog';

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
