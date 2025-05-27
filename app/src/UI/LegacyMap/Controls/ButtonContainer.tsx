import { useSelector } from 'utils/use_selector';
import { AccuracyToggle } from './AccuracyToggle';
import './ButtonContainer.css';
import { CenterCurrentRecord } from './CenterCurrentRecord';
import { FindMeToggle } from './FindMe';
import { LegendsButton } from './LegendsButton';
import { NewRecord } from './NewRecord';
import { WhatsHereButton } from './WhatsHereButton';
import { WebOnly } from 'UI/Predicates/WebOnly';
import TrackingButtonsContainer from './TrackingButtonsContainer';
import { PrimaryLayerSelect } from 'UI/LegacyMap/Controls/PrimaryLayerSelect';
import { RecordSetType } from 'interfaces/UserRecordSet';

export const ButtonContainer = () => {
  const { loggedInOrWorkingOffline, writePrivilege } = useSelector((state) => state.Auth);
  const { positionTracking } = useSelector((state) => state.Map);

  return (
    <div id="map-btn-container">
      <PrimaryLayerSelect />
      {loggedInOrWorkingOffline && (
        <>
          <FindMeToggle />
          {positionTracking && (
            <>
              <TrackingButtonsContainer />
              <AccuracyToggle />
            </>
          )}

          <WebOnly>
            <LegendsButton />
          </WebOnly>

          <WhatsHereButton />
          {writePrivilege.length > 0 && <NewRecord />}

          <WebOnly>
            <CenterCurrentRecord type={RecordSetType.Activity} />
            <CenterCurrentRecord type={RecordSetType.IAPP} />
          </WebOnly>
        </>
      )}
    </div>
  );
};
