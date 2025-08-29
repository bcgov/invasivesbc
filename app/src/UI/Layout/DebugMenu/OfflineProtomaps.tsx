import { useDispatch } from 'utils/use_selector';
import { OfflineProtomapsActions } from 'state/actions/offlineProtomaps';

const OfflineProtomapsDebug = () => {
  const dispatch = useDispatch();

  return <button onClick={() => dispatch(OfflineProtomapsActions.setDebugPanelState(true))}>Offline Protomaps</button>;
};

export default OfflineProtomapsDebug;
