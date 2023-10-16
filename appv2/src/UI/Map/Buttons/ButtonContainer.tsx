import React, { useEffect } from 'react';
import { AccuracyMarker, AccuracyToggle } from './AccuracyToggle';
import { BaseMapToggle } from './BaseMapToggle';
import { FindMeToggle, LocationMarker, PanToMe } from './FindMe';
import { HDToggle } from './HDToggle';
import { LegendsButton } from "./LegendsButton";
import { WhatsHereButton, WhatsHereDrawComponent } from './WhatsHereButton';
import { WhatsHereCurrentRecordHighlighted, WhatsHereMarker } from './WhatsHereMarker';
import './ButtonContainer.css';
import { useSelector } from 'util/use_selector';
import { NewRecord } from './NewRecord';
import { QuickPanToRecordToggle } from './ToggleQuickRecordPan';

export const ButtonContainer = (props) => {
  const isAuth = useSelector((state: any) => state.Auth?.authenticated);

  
  return (
    <div id="map-btn-container">
      <HDToggle />
      <BaseMapToggle />
      {isAuth && <FindMeToggle />}
      <LegendsButton />
      <AccuracyToggle />
      {isAuth && <WhatsHereButton />}

      {/* helpers */}
      <AccuracyMarker />
      <LocationMarker />
      <PanToMe />
      {isAuth && <WhatsHereMarker />}
      {isAuth && <WhatsHereCurrentRecordHighlighted />}
      {isAuth && <WhatsHereDrawComponent />}
      <NewRecord/>
      <QuickPanToRecordToggle/>
    </div>
  );
};
