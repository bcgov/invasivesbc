import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useDispatch } from 'utils/use_selector';
import AppActions from 'state/actions/appActions/appActions';

/* @todo we should deprecate the need for this by removing the need to monitor for location changes */
const LocationChangeListener = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(AppActions.urlChange(location.pathname));
  }, [location.pathname]);

  return null;
};

export default LocationChangeListener;
