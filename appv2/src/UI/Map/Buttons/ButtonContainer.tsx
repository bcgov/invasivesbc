import React from 'react';
import { AccuracyMarker, AccuracyToggle } from './AccuracyToggle';
import { BaseMapToggle } from './BaseMapToggle';
import { FindMeToggle, LocationMarker, PanToMe } from './FindMe';
import { HDToggle } from './HDToggle';
import { WhatsHereButton, WhatsHereDrawComponent } from './WhatsHereButton';
import { WhatsHereCurrentRecordHighlighted, WhatsHereMarker } from './WhatsHereMarker';
import './ButtonContainer.css';
import { useSelector } from 'util/use_selector';

export const ButtonContainer = (props) => {
  const isAuth = useSelector((state: any) => state.Auth?.authenticated);
  
  return (
    <div className="map-btn-container">
      <HDToggle />
      <BaseMapToggle />
      {isAuth && <FindMeToggle />}
      <AccuracyToggle />
      {isAuth && <WhatsHereButton />}

      {/* helpers */}
      <AccuracyMarker />
      <LocationMarker />
      <PanToMe />
      {isAuth && <WhatsHereMarker />}
      {isAuth && <WhatsHereCurrentRecordHighlighted />}
      {isAuth && <WhatsHereDrawComponent />}
    </div>
  );
};
