import React from 'react';
import { MainMap } from 'UI/Features/ComponentizedMap/MainMap';
import Overlay from 'UI/Layout/OverlayLayout/Overlay';
import { ButtonContainer } from 'UI/Features/LegacyMap/Controls/ButtonContainer';
import { LayerPicker } from 'UI/Features/LegacyMap/LayerPicker/LayerPicker';
import { Map } from 'UI/Features/LegacyMap/Map';
import { useSelector } from 'utils/use_selector';
import { OverlayContent } from 'UI/Layout/AppLayout/Components/OverlayContent';
import { MapProvider } from 'react-map-gl/maplibre';
import CommonPrefixComponents from 'UI/Layout/AppLayout/Components/CommonPrefixComponents';
import CommonPostfixComponents from 'UI/Layout/AppLayout/Components/CommonPostfixComponents';

const ComponentizedMapLayout = () => {
  const loggedInOrWorkingOffline = useSelector((state) => state.Auth.loggedInOrWorkingOffline);

  return (
    <MapProvider>
      <CommonPrefixComponents />

      {!loggedInOrWorkingOffline ? (
        <MainMap>
          <Overlay>
            <OverlayContent />
          </Overlay>
          <ButtonContainer />
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
