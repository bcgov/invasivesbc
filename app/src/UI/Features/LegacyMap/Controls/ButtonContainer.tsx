import { useSelector } from 'utils/use_selector';
import { AccuracyToggle } from 'UI/Features/LegacyMap/Controls/AccuracyToggle';
import 'UI/Features/LegacyMap/Controls/ButtonContainer.css';
import { CenterCurrentRecord } from 'UI/Features/LegacyMap/Controls/CenterCurrentRecord';
import { FindMeToggle } from 'UI/Features/LegacyMap/Controls/FindMe';
import { LegendsButton } from 'UI/Features/LegacyMap/Controls/LegendsButton';
import { NewRecord } from 'UI/Features/LegacyMap/Controls/NewRecord';
import { WhatsHereButton } from 'UI/Features/LegacyMap/Controls/WhatsHereButton';
import { WebOnly } from 'UI/Reusable/Predicates/WebOnly';
import TrackingButtonsContainer from 'UI/Features/LegacyMap/Controls/TrackingButtonsContainer';
import PrimaryLayerSelect, { PrimaryLayerSelectProps } from 'UI/Features/LegacyMap/Controls/PrimaryLayerSelect';
import { RecordSetType } from 'interfaces/UserRecordSet';

type ButtonContainerProps = PrimaryLayerSelectProps & {};

export const ButtonContainer = ({ layers, selectLayer }: ButtonContainerProps) => {
  const { loggedInOrWorkingOffline, writePrivilege } = useSelector((state) => state.Auth);
  const { positionTracking } = useSelector((state) => state.Map);

  return (
    <div id="map-btn-container">
      <PrimaryLayerSelect layers={layers} selectLayer={selectLayer} />

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
