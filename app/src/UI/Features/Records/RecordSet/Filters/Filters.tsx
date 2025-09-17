import { FilterAlt, FilterAltOff } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { EFilterType, IFilter } from 'state/actions/userSettings/RecordSet';
import Accordion from 'UI/Reusable/Accordion/Accordion';
import { RecordCacheServiceFactory } from 'utils/record-cache/context';
import { useDispatch, useSelector } from 'utils/use_selector';
import Filter from './Filter';
import './filters.css';
import UserSettings from 'state/actions/userSettings/UserSettings';
import { RecordSetId, RecordSetType } from 'interfaces/UserRecordSet';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';

type PropTypes = {
  recordsetId: string;
};
interface ExtendedFilter extends IFilter {
  disabled: boolean;
}

const Filters = ({ recordsetId }: PropTypes) => {
  const MOST_RECENT_TOOLTIP =
    'Show only the most recent observation at a given location. Historical observations will be hidden.';
  const handleAddFilter = () => {
    dispatch(
      UserSettings.RecordSet.addFilter({
        field: recordset.recordSetType === RecordSetType.Activity ? 'short_id' : 'site_id',
        filterType: EFilterType.Table,
        operator: 'CONTAINS',
        operator2: 'AND',
        setID: recordsetId
      })
    );
  };
  const handleMostRecentFilter = () => {
    const currFilter = filters.find((f) => f.filterType === EFilterType.MostRecentObservation);
    if (currFilter) {
      dispatch(
        UserSettings.RecordSet.removeFilter({
          setID: recordsetId,
          filterID: currFilter.id,
          filterType: currFilter.filterType
        })
      );
    } else {
      dispatch(
        UserSettings.RecordSet.addFilter({
          field: EFilterType.MostRecentObservation,
          filterType: EFilterType.MostRecentObservation,
          operator: 'CONTAINS',
          operator2: 'AND',
          filter: EFilterType.MostRecentObservation,
          setID: recordsetId,
          hidden: true
        })
      );
    }
  };
  const handleRemoveFilters = () => dispatch(UserSettings.RecordSet.clearFilters({ setID: recordsetId }));
  const dispatch = useDispatch();
  const MOBILE = useSelector((state) => state.Configuration.current.build.MOBILE);
  const recordset = useSelector((state) => state.UserSettings.recordSets[recordsetId]);
  const [cacheFilters, setCacheFilters] = useState<IFilter[]>([]);
  const [filters, setFilters] = useState<ExtendedFilter[]>([]);

  const shouldRenderTable = useMemo(() => filters.some((f) => !f.hidden), [filters]);

  /**
   * Display sum of Records in Accordion title if there are any
   */
  const accordionTitle = useMemo(() => {
    let sumFilters = filters.length;
    if (recordsetId === RecordSetId.Drafts) sumFilters--; // Don't count 'form_status' = 'Draft' filter
    if (sumFilters > 0)
      return (
        <>
          Filters <span className="sum-of-filters">({sumFilters})</span>
        </>
      );
    return 'Filters';
  }, [filters.length, shouldRenderTable]);

  /**
   * Get filters from recordset metadata that were applied at time of caching.
   */
  useEffect(() => {
    if (!MOBILE) return;
    (async () => {
      const service = await RecordCacheServiceFactory.getPlatformInstance();
      if (await service.isCached(recordsetId)) {
        const filtersInCache =
          (await service.getRepository(recordsetId, ['filter_objects']))?.filter_objects?.tableFilters ?? [];
        setCacheFilters(filtersInCache);
      } else {
        setCacheFilters([]);
      }
    })();
  }, [recordset?.cacheMetadataStatus]);

  /**
   * Disabled modification of filters that part of the Cache.
   * Enabling a user to filter into their cache, but not move out of it
   */
  useEffect(() => {
    const disabledFilters: Array<ExtendedFilter> = (recordset?.tableFilters ?? []).map((filter, i) => {
      const filterCopy = { ...filter }; // Decouple from immutable Selector
      filterCopy['disabled'] = cacheFilters?.[i]?.id === filterCopy.id;
      return filterCopy as ExtendedFilter;
    });
    setFilters(disabledFilters);
  }, [cacheFilters, recordset?.tableFilters]);

  if (!recordset) return;
  console.log(filters);
  return (
    <Accordion title={accordionTitle} icon={<FilterAlt color="primary" />}>
      <div id="filters-cont">
        <div className="control">
          <Button size="small" variant="contained" onClick={handleRemoveFilters}>
            Clear Filters
            <FilterAltOff />
          </Button>
          <Button size="small" variant="contained" onClick={handleAddFilter}>
            Add Filter
            <FilterAlt />
          </Button>
        </div>
        <div className="filter-toggles">
          <ul>
            {recordset.recordSetType === RecordSetType.Activity && (
              <li className="row">
                <input
                  type="checkbox"
                  id="most-recent-observations"
                  checked={filters.some((f) => f.filterType === EFilterType.MostRecentObservation)}
                  onChange={handleMostRecentFilter}
                />
                <label htmlFor="most-recent-observations">Most Recent Observations Only</label>
                <TooltipWithIcon tooltipText={MOST_RECENT_TOOLTIP} />
              </li>
            )}
          </ul>
        </div>
        {shouldRenderTable && (
          <div className="filters-selector">
            <table className="recordset-filter-table">
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
                {filters
                  .filter((f) => !f.hidden)
                  .map((filter) => (
                    <Filter
                      key={filter.id}
                      recordSetType={recordset.recordSetType}
                      setID={recordsetId}
                      filterSet={filter}
                      disabled={filter.disabled}
                    />
                  ))}
                <tr>
                  {MOBILE && cacheFilters.length > 0 && (
                    <td colSpan={5}>
                      <i>Filters applied after caching will not be reflected on the map.</i>
                    </td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Accordion>
  );
};

export default Filters;
