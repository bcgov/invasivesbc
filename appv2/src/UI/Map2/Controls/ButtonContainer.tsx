import React from 'react';
import { useSelector } from 'util/use_selector';
import { AccuracyToggle } from './AccuracyToggle';
import { BaseMapToggle } from './BaseMapToggle';
import './ButtonContainer.css';
import { CenterCurrentRecord } from './CenterCurrentRecord';
import { FindMeToggle } from './FindMe';
import { LegendsButton } from './LegendsButton';
import { NewRecord } from './NewRecord';
import { QuickPanToRecordToggle } from './QuickPanToRecordToggle';
import { WhatsHereButton } from './WhatsHereButton';
import { MapModeToggle } from './MapToggleCacheGeoJSON';
import { HDToggle } from 'UI/Map2/Controls/HDToggle';

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

      <NewRecord />
      <CenterCurrentRecord type="Activity" />
      <CenterCurrentRecord type="IAPP" />
      <QuickPanToRecordToggle />
      <MapModeToggle/>
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
