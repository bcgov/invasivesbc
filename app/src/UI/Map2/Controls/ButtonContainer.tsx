import { useSelector } from 'utils/use_selector';
import { AccuracyToggle } from './AccuracyToggle';
import './ButtonContainer.css';
import { CenterCurrentRecord } from './CenterCurrentRecord';
import { FindMeToggle } from './FindMe';
import { LegendsButton } from './LegendsButton';
import { NewRecord } from './NewRecord';
import { QuickPanToRecordToggle } from './QuickPanToRecordToggle';
import { WhatsHereButton } from './WhatsHereButton';
import { MapModeToggle } from './MapToggleCacheGeoJSON';
import { WebOnly } from 'UI/Predicates/WebOnly';
import TrackingButtonsContainer from './TrackingButtonsContainer';
import { BaseMapSelect } from 'UI/Map2/Controls/BaseMapSelect';
import { RecordSetType } from 'interfaces/UserRecordSet';

export const ButtonContainer = () => {
  const { authenticated, workingOffline } = useSelector((state) => state.Auth);
  const { positionTracking } = useSelector((state) => state.Map);

  return (
    <div id="map-btn-container">
      <BaseMapSelect />

      {(authenticated || workingOffline) && <FindMeToggle />}
      {positionTracking && <TrackingButtonsContainer />}

      <WebOnly>
        <LegendsButton />
      </WebOnly>

      <AccuracyToggle />

      {(authenticated || workingOffline) && <WhatsHereButton />}

      {(authenticated || workingOffline) && <NewRecord />}

      <WebOnly>
        {authenticated && <CenterCurrentRecord type={RecordSetType.Activity} />}
        {authenticated && <CenterCurrentRecord type={RecordSetType.IAPP} />}
        <QuickPanToRecordToggle />
        {authenticated && <MapModeToggle />}
      </WebOnly>
    </div>
  );
};
