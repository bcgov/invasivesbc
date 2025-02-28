import { selectOfflineActivity } from 'state/reducers/offlineActivity';
import { useDispatch, useSelector } from 'utils/use_selector';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Activity from 'state/actions/activity/Activity';
const LpOfflineActivitiesLayer = () => {
  const dispatch = useDispatch();
  const { mapToggle } = useSelector(selectOfflineActivity);
  const handleToggleVisibility = () => {
    dispatch(Activity.Offline.setAllShapeVisibility());
  };

  return (
    <div id="lp-layers">
      <ul className="layersList">
        <li className="lp-layers-item">
          <button onClick={handleToggleVisibility}>{mapToggle ? <Visibility /> : <VisibilityOff />}</button>
          <p>All Locally Stored Activities</p>
        </li>
      </ul>
    </div>
  );
};

export { LpOfflineActivitiesLayer };
