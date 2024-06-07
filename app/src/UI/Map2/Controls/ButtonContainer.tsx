import React from 'react';
import { useSelector } from 'utils/use_selector';
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
import { WebOnly } from 'UI/Predicates/WebOnly';

export const ButtonContainer = () => {
  const isAuth = useSelector((state) => state.Auth?.authenticated);

  return (
    <div id="map-btn-container">
      <HDToggle />
      <BaseMapToggle />

      {isAuth && <FindMeToggle />}

      <WebOnly>
        <LegendsButton />
      </WebOnly>

      <AccuracyToggle />

      {isAuth && <WhatsHereButton />}

      {isAuth && <NewRecord />}

      <WebOnly>
        {isAuth && <CenterCurrentRecord type="Activity" />}
        {isAuth && <CenterCurrentRecord type="IAPP" />}
        <QuickPanToRecordToggle />
        {isAuth && <MapModeToggle />}
      </WebOnly>
    </div>
  );
};
