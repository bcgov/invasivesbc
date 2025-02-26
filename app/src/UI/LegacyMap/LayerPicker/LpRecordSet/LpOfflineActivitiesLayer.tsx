import { FeatureCollection } from 'geojson';
import { useContext, useEffect } from 'react';
import { selectNetworkConnected } from 'state/reducers/network';
import { OfflineActivityRecord, selectOfflineActivity } from 'state/reducers/offlineActivity';
import { MapContext } from 'UI/LegacyMap/helpers/components/MapContext';
import { LAYER_Z_FOREGROUND } from 'UI/LegacyMap/helpers/functional/layer-definitions';
import { useDispatch, useSelector } from 'utils/use_selector';
import LpRecordSetOption from './LpRecordSetOption';
import { Label, LabelOff, Palette, Visibility, VisibilityOff } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import Activity from 'state/actions/activity/Activity';
const LpOfflineActivitiesLayer = () => {
  const map = useContext(MapContext);

  const dispatch = useDispatch();
  const { visibility } = useSelector(selectOfflineActivity);
  const handleToggleVisibility = () => {
    dispatch(Activity.Offline.setAllShapeVisibility());
  };

  return (
    <div id="lp-layers">
      <ul className="layersList">
        <li className="lp-layers-item">
          <button onClick={handleToggleVisibility}>{visibility ? <Visibility /> : <VisibilityOff />}</button>
          <p>All Locally Stored Activities</p>
        </li>
      </ul>
    </div>
  );
};

export { LpOfflineActivitiesLayer };
