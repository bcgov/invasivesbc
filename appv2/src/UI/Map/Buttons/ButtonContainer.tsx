import React from 'react';
import { useSelector } from 'util/use_selector';
import { AccuracyToggle } from './AccuracyToggle';
import { BaseMapToggle } from './BaseMapToggle';
import './ButtonContainer.css';
import { CenterCurrentRecord } from './CenterCurrentRecord';
import { FindMeToggle } from './FindMe';
import { LegendsButton } from "./LegendsButton";
import { NewRecord } from './NewRecord';
import { QuickPanToRecordToggle } from './ToggleQuickRecordPan';
import { WhatsHereButton } from './WhatsHereButton';

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