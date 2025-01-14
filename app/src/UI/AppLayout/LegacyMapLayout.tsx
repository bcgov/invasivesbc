import React from 'react';
import { Map } from 'UI/LegacyMap/Map';
import Overlay from 'UI/Overlay/Overlay';
import { OverlayContent } from 'UI/AppLayout/Components/OverlayContent';
import { ButtonContainer } from 'UI/LegacyMap/Controls/ButtonContainer';
import { LayerPicker } from 'UI/LegacyMap/LayerPicker/LayerPicker';
import CommonPrefixComponents from 'UI/AppLayout/Components/CommonPrefixComponents';
import CommonPostfixComponents from 'UI/AppLayout/Components/CommonPostfixComponents';

const LegacyMapLayout = () => {
  return (
    <>
      <CommonPrefixComponents />

      <Map>
        <Overlay>
          <OverlayContent />
        </Overlay>
        <ButtonContainer />
        <LayerPicker />
      </Map>

      <CommonPostfixComponents />
    </>
  );
};

export default LegacyMapLayout;
