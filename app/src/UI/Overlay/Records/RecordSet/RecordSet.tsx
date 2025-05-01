import { useDispatch } from 'react-redux';
import './RecordSet.css';
import Button from '@mui/material/Button';
import { useHistory } from 'react-router';
import { Tooltip } from '@mui/material';
import { RecordTable } from './RecordTable';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import ExcelExporter from '../ExcelExporter';
import RecordSetFooter from './RecordSetFooter';
import Filter from './Filter';
import { useSelector } from 'utils/use_selector';
import { MOBILE } from 'state/build-time-config';
import { useEffect, useState } from 'react';
import UserSettings from 'state/actions/userSettings/UserSettings';
import { RecordSetType } from 'interfaces/UserRecordSet';
import { IFilter } from 'state/actions/userSettings/RecordSet';
import { RecordCacheServiceFactory } from 'utils/record-cache/context';

type PropTypes = { setID: string };
interface ExtendedFilter extends IFilter {
  disabled: boolean;
}
export const RecordSet = ({ setID }: PropTypes) => {
  const viewFilters = useSelector((state) => state.Map.viewFilters);
  const history = useHistory();
  const dispatch = useDispatch();

  const onClickBackButton = () => {
    history.push('/Records');
  };

  const recordSet = useSelector((state) => state.UserSettings?.recordSets?.[setID]);
  const tableType = recordSet?.recordSetType;

  const [cacheFilters, setCacheFilters] = useState<IFilter[]>([]);
  const [filters, setFilters] = useState<ExtendedFilter[]>([]);

  /**
   * Get filters from recordset metadata that were applied at time of caching.
   */
  useEffect(() => {
    if (!MOBILE) return;
    (async () => {
      const service = await RecordCacheServiceFactory.getPlatformInstance();
      if (await service.isCached(setID)) {
        const filtersInCache =
          (await service.getRepository(setID, ['filter_objects']))?.filter_objects?.tableFilters ?? [];
        setCacheFilters(filtersInCache);
      }
    })();
  }, []);

  /**
   * Disabled modification of filters that part of the Cache.
   * Enabling a user to filter into their cache, but not move out of it
   */
  useEffect(() => {
    const disabledFilters: ExtendedFilter[] = (recordSet?.tableFilters ?? []).map((filter, i) => {
      const filterCopy = { ...filter }; // Decouple from immutable Selector
      filterCopy['disabled'] = cacheFilters?.[i]?.id === filterCopy.id;
      return filterCopy as ExtendedFilter;
    });
    setFilters(disabledFilters);
  }, [cacheFilters, recordSet?.tableFilters]);

  const onlyFilterIsForDrafts =
    recordSet?.tableFilters?.length === 1 && recordSet?.tableFilters[0]?.field === 'form_status';

  if (!recordSet) {
    return;
  }
  return (
    <>
      <div className="stickyHeader">
        <div className="recordSet_header" style={{ backgroundColor: recordSet?.color + `50` }}>
          <div className="recordSet_back_button">
            <Button onClick={onClickBackButton} variant="contained">
              {'< Back'}
            </Button>
          </div>
          <div className="recordSet_header_name">
            {recordSet?.recordSetName || `New Recordset - ${recordSet?.recordSetType}`}
          </div>
        </div>
      </div>
      <div className="recordSet_container">
        <div className="recordSet_filter_buttons_container">
          <div className="recordSet_clear_filter_button">
            <Tooltip classes={{ tooltip: 'toolTip' }} title="Clear all filters and refetch all data for this layer.">
              <span>
                <Button
                  size={'small'}
                  disabled={cacheFilters.length > 0}
                  onClick={() => dispatch(UserSettings.RecordSet.clearFilters({ setID }))}
                  variant="contained"
                >
                  Clear Filters
                  <FilterAltOffIcon />
                </Button>
              </span>
            </Tooltip>
          </div>
          <div className="recordSet_toggleView_filter_button">
            <Tooltip classes={{ tooltip: 'toolTip' }} title="Toggle hiding filters - does not toggle applying them.">
              <span>
                <Button
                  size={'small'}
                  onClick={() => dispatch(UserSettings.RecordSet.hideFilters())}
                  variant="contained"
                >
                  {viewFilters ? (
                    <>
                      Hide Filters
                      <VisibilityOffIcon />
                      <FilterAltIcon />
                    </>
                  ) : (
                    <>
                      Show Filters{' '}
                      {(recordSet?.tableFilters?.length || 0) > 0 &&
                        !onlyFilterIsForDrafts &&
                        `(${recordSet?.tableFilters?.length})`}
                      <VisibilityIcon />
                      <FilterAltIcon />
                    </>
                  )}
                </Button>
              </span>
            </Tooltip>
          </div>
          <div className="recordSet_new_filter_button">
            <Tooltip
              classes={{ tooltip: 'toolTip' }}
              title="Add a new filter, drawn, uploaded KML, or just text search on a field."
            >
              <span>
                <Button
                  size={'small'}
                  onClick={() =>
                    dispatch(
                      UserSettings.RecordSet.addFilter({
                        field: tableType === RecordSetType.Activity ? 'short_id' : 'site_id',
                        filterType: 'tableFilter',
                        operator: 'CONTAINS',
                        operator2: 'AND',
                        setID: setID
                      })
                    )
                  }
                  variant="contained"
                >
                  Add Filter + <FilterAltIcon />
                </Button>
              </span>
            </Tooltip>
          </div>
        </div>
        <div className="recordSet_filters_container">
          <div className="recordSet_filters">
            {recordSet?.tableFilters?.length > 0 && !onlyFilterIsForDrafts && viewFilters && (
              <table className="recordSetFilterTable">
                <thead>
                  <tr>
                    <th>Operator 1</th>
                    <th>Operator 2</th>
                    <th>Filter type</th>
                    <th>Filter On</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {filters.map((filter) => {
                    if (filter.field !== 'form_status') {
                      return (
                        <Filter
                          key={filter.id}
                          recordSetType={recordSet.recordSetType}
                          setID={setID}
                          filterSet={filter}
                          disabled={filter.disabled}
                        />
                      );
                    }
                  })}
                  <tr>
                    {MOBILE && cacheFilters.length > 0 && (
                      <td colSpan={5}>
                        <i>Filters applied after caching will not be reflected on the map.</i>
                      </td>
                    )}
                  </tr>
                </tbody>
              </table>
            )}
          </div>
          <ExcelExporter setName={setID} />
        </div>
        <RecordTable setID={setID} />
      </div>
      <RecordSetFooter recordSet={recordSet} />
    </>
  );
};
