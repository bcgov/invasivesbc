import { InvasivesMapLayerDefinitionWithState } from '../../helpers/functional/layers-hook';

type PropTypes = {
  closePicker: () => void;
  layers: InvasivesMapLayerDefinitionWithState[];
  setOverlayState: (layer: string) => void;
};
const LpPlanMyTrip = ({ closePicker, layers, setOverlayState }: PropTypes) => {
  return (
    <div className="lp-plan-my-trip">
      <h2>Plan My Trip</h2>
      <p>This feature allows users to plan their trips with various options.</p>
    </div>
  );
};
export default LpPlanMyTrip;
