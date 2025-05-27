import React from 'react';
import { Map } from 'UI/LegacyMap/Map';
import Overlay from 'UI/Overlay/Overlay';
import { OverlayContent } from 'UI/AppLayout/Components/OverlayContent';
import { ButtonContainer } from 'UI/LegacyMap/Controls/ButtonContainer';
import { LayerPicker } from 'UI/LegacyMap/LayerPicker/LayerPicker';
import CommonPrefixComponents from 'UI/AppLayout/Components/CommonPrefixComponents';
import CommonPostfixComponents from 'UI/AppLayout/Components/CommonPostfixComponents';
import { useSelector } from 'utils/use_selector';

const LegacyMapLayout = () => {
  const loggedInOrWorkingOffline = useSelector((state) => state.Auth.loggedInOrWorkingOffline);
  return (
    <>
      <CommonPrefixComponents />

      <Map>
        <Overlay>
          <OverlayContent />
        </Overlay>
        <ButtonContainer />
        {loggedInOrWorkingOffline && <LayerPicker />}
      </Map>

      <CommonPostfixComponents />
    </>
  );
};

export default LegacyMapLayout;
