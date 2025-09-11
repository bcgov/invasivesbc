import { FilterAlt, FilterAltOff } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import { useDispatch, useSelector } from 'utils/use_selector';
import UserSettings from 'state/actions/userSettings/UserSettings';
import './lpGlobalFilters.css';
import { Fragment } from 'react';
import { MapRecordsetLayerFilterCategory } from 'state/reducers/map';

const LpGlobalFilters = () => {
  const MAP_FILTER_TOOLTIP_TEXT = 'Show or hide the record layers on the map. This setting applies to all record sets.';
  const handleToggleGlobalMapFilter = (key: MapRecordsetLayerFilterCategory) => {
    dispatch(UserSettings.Map.toggleGlobalMapFilter(key));
  };

  const dispatch = useDispatch();

  const globalMapFilters = useSelector((state) => state.Map.globalMapFilters);
  return (
    <div id="lp-global-map-filters">
      <h3>
        Map Filters <TooltipWithIcon tooltipText={MAP_FILTER_TOOLTIP_TEXT} />
      </h3>
      <ul>
        {Object.entries(globalMapFilters).map(([key, value], index) => (
          <Fragment key={key}>
            {index !== 0 && <hr />}
            <li
              onClick={() => handleToggleGlobalMapFilter(key as MapRecordsetLayerFilterCategory)}
              className="lp-global-map-filter-option"
            >
              <IconButton>{value ? <FilterAlt /> : <FilterAltOff />}</IconButton>
              {key}
            </li>
          </Fragment>
        ))}
      </ul>
    </div>
  );
};

export default LpGlobalFilters;
