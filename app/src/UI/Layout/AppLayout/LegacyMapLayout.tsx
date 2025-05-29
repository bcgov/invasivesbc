import React from 'react';
import { Map } from 'UI/Features/LegacyMap/Map';
import Overlay from 'UI/Layout/OverlayLayout/Overlay';
import { OverlayContent } from 'UI/Layout/AppLayout/Components/OverlayContent';
import { ButtonContainer } from 'UI/Features/LegacyMap/Controls/ButtonContainer';
import { LayerPicker } from 'UI/Features/LegacyMap/LayerPicker/LayerPicker';
import CommonPrefixComponents from 'UI/Layout/AppLayout/Components/CommonPrefixComponents';
import CommonPostfixComponents from 'UI/Layout/AppLayout/Components/CommonPostfixComponents';
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
