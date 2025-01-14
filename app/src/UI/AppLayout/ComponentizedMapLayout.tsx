import React from 'react';
import { MainMap } from 'UI/ComponentizedMap/MainMap';
import Overlay from 'UI/Overlay/Overlay';
import { ButtonContainer } from 'UI/LegacyMap/Controls/ButtonContainer';
import { LayerPicker } from 'UI/LegacyMap/LayerPicker/LayerPicker';
import { Map } from 'UI/LegacyMap/Map';
import { useSelector } from 'utils/use_selector';
import { OverlayContent } from 'UI/AppLayout/Components/OverlayContent';
import { MapProvider } from 'react-map-gl';
import CommonPrefixComponents from 'UI/AppLayout/Components/CommonPrefixComponents';
import CommonPostfixComponents from 'UI/AppLayout/Components/CommonPostfixComponents';

const ComponentizedMapLayout = () => {
  const authenticated = useSelector((state) => state.Auth.authenticated);

  return (
    <MapProvider>
      <CommonPrefixComponents />

      {!authenticated ? (
        <MainMap>
          <Overlay>
            <OverlayContent />
          </Overlay>
          <ButtonContainer />
          <LayerPicker />
        </MainMap>
      ) : (
        <Map>
          <Overlay>
            <OverlayContent />
          </Overlay>
          <ButtonContainer />
          <LayerPicker />
        </Map>
      )}

      <CommonPostfixComponents />
    </MapProvider>
  );
};

export default ComponentizedMapLayout;
