import React, { useEffect } from 'react';
import { AccuracyMarker, AccuracyToggle } from './AccuracyToggle';
import { BaseMapToggle } from './BaseMapToggle';
import { FindMeToggle, LocationMarker } from './FindMe';
import { HDToggle } from './HDToggle';
import { LegendsButton } from "./LegendsButton";
import { WhatsHereButton, WhatsHereDrawComponent } from './WhatsHereButton';
import { WhatsHereCurrentRecordHighlighted } from './WhatsHereMarker';
import './ButtonContainer.css';
import { useSelector } from 'util/use_selector';
import { NewRecord } from './NewRecord';
import { QuickPanToRecordToggle } from './ToggleQuickRecordPan';
import { SelectedRecordIndicator } from '../SelectedRecordIndicator';
import { CenterCurrentRecord } from './CenterCurrentRecord';

export const ButtonContainer = (props) => {
  const isAuth = useSelector((state: any) => state.Auth?.authenticated);

  
  return (
    <div id="map-btn-container">
      {/* Maybe not needed anymore? <HDToggle /> */}
      <BaseMapToggle />
      {isAuth && <FindMeToggle />}
      <LegendsButton />
      <AccuracyToggle />
      {isAuth && <WhatsHereButton />}

      <NewRecord/>
      <CenterCurrentRecord type="Activity"/>
      <CenterCurrentRecord type="IAPP"/>
      <QuickPanToRecordToggle/>
      {/*

      {isAuth && <WhatsHereCurrentRecordHighlighted />}
      {isAuth && <WhatsHereDrawComponent />}
      <SelectedRecordIndicator/>
      <AccuracyMarker />
      <LocationMarker />
  */}
    </div>
  );
};
