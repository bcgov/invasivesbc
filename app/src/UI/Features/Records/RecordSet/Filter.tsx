import { Button, Tooltip } from '@mui/material';
import { useCallback, useState } from 'react';
import { activityColumnsToDisplay, iappColumnsToDisplay } from 'UI/Features/Records/RecordSet/RecordTableHelpers';
import { useDispatch, useSelector } from 'utils/use_selector';
import { RecordSetType } from 'interfaces/UserRecordSet';
import UserSettings from 'state/actions/userSettings/UserSettings';
import debounce from 'lodash.debounce';
import { IFilter, IUpdateFilter } from 'state/actions/userSettings/RecordSet';

type PropTypes = {
  setID: string;
  disabled: boolean;
  filterSet: IFilter;
  recordSetType: RecordSetType;
};

const Filter = ({ setID, disabled, filterSet, recordSetType }: PropTypes) => {
  enum FilterType {
    Drawn = 'spatialFilterDrawn',
    Uploaded = 'spatialFilterUploaded',
    Table = 'tableFilter'
  }
  const TIME_TO_AUTO_UPDATE_IN_SECONDS = 0.75;

  /**
   * @desc Change Handler for text input filter.
   *       Sets/refreshes timeouts so updates won't fire until user finishes typing.
   */
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    debouncedFormChange(event.target.value);
  };

  const debouncedFormChange = useCallback(
    debounce((value: string) => {
      dispatch(
        UserSettings.RecordSet.updateFilter({
          filterType: FilterType.Table,
          setID: setID,
          filterID: filterSet.id,
          filter: value
        })
      );
    }, TIME_TO_AUTO_UPDATE_IN_SECONDS * 1000),
    []
  );

  const updateSpatialFilter = (id: string, filterType: string) => {
    let payload;
    if (filterType === FilterType.Uploaded) {
      const shape = serverBoundariesToDisplay.find(({ value }) => value == id);
      payload = { filter: shape.id };
    } else {
      const shape = clientBoundariesToDisplay.find(({ value }) => value === id);
      payload = { filter: shape.id, geojson: shape?.geojson };
    }
    updateFilter({ filterType: filterType, ...payload });
  };
  /**
   * Update the Recordsets filters
   * @param newVal additional object keys
   */
  const updateFilter = (newVal: Partial<IUpdateFilter>) => {
    dispatch(
      UserSettings.RecordSet.updateFilter({
        setID: setID,
        filterID: filterSet.id,
        ...newVal
      })
    );
  };
  /**
   * Remove a Filter parameter from the RecordSet
   * @param filterType
   */
  const removeFilter = (filterType: string) => {
    dispatch(
      UserSettings.RecordSet.removeFilter({
        setID: setID,
        filterID: filterSet.id,
        filterType: filterType
      })
    );
  };

  const getFilterType = (filterType: string) => {
    switch (filterType) {
      case FilterType.Table:
        return (
          <input
            className="filterSelect"
            disabled={disabled}
            onChange={handleInputChange}
            type="text"
            value={inputValue}
          />
        );
      case FilterType.Uploaded:
        return (
          <select
            className="filterSelect"
            disabled={disabled}
            onChange={(e) => updateSpatialFilter(e.target.value, FilterType.Uploaded)}
            value={filterSet.filter}
          >
            {serverBoundariesToDisplay.length > 0 ? (
              serverBoundariesToDisplay?.map((option) => (
                <option key={option.value + option.label} value={option.value}>
                  {option.label}
                </option>
              ))
            ) : (
              <option selected disabled value="">
                Original source removed
              </option>
            )}
          </select>
        );
      case FilterType.Drawn:
        return (
          <select
            className="filterSelect"
            disabled={disabled}
            onChange={(e) => updateSpatialFilter(e.target.value, FilterType.Drawn)}
            value={filterSet.filter}
          >
            {clientBoundariesToDisplay.length > 0 ? (
              clientBoundariesToDisplay?.map((option) => (
                <option key={option.value + option.label} value={option.value}>
                  {option.label}
                </option>
              ))
            ) : (
              <option selected disabled value="">
                Original source removed
              </option>
            )}
          </select>
        );
      default:
        return null;
    }
  };

  const dispatch = useDispatch();

  const serverBoundariesToDisplay = useSelector((state) => state.Map.serverBoundaries)?.map((boundary) => ({
    label: boundary.title,
    value: boundary.id,
    ...boundary
  }));
  const clientBoundariesToDisplay = useSelector((state) => state.Map.clientBoundaries)?.map((boundary) => ({
    label: boundary.title,
    value: boundary.id,
    ...boundary
  }));
  const filterColumns = recordSetType === RecordSetType.Activity ? activityColumnsToDisplay : iappColumnsToDisplay;
  const filterOptions = filterColumns.map((option) => ({ label: option.name, value: option.key }));

  const [inputValue, setInputValue] = useState<string>(filterSet.filter);
  const input = getFilterType(filterSet.filterType);
  return (
    <tr>
      <td>
        <select
          className="filterSelect"
          disabled={disabled}
          onChange={(e) => updateFilter({ operator2: e.target.value })}
          value={filterSet.operator2}
        >
          {
            {
              [FilterType.Table]: (
                <>
                  <option value={'AND'} label={'AND'}>
                    AND
                  </option>
                  <option value={'OR'} label={'OR'}>
                    OR
                  </option>
                </>
              ),
              [FilterType.Drawn]: (
                <>
                  <option value={'AND'} label={'AND'}>
                    AND
                  </option>
                  <option disabled value={'OR'} label={'OR'}>
                    OR (Not yet available for this filter type)
                  </option>
                </>
              ),
              [FilterType.Uploaded]: (
                <>
                  <option value={'AND'} label={'AND'}>
                    AND
                  </option>
                  <option disabled value={'OR'} label={'OR'}>
                    OR (Not yet available for this filter type)
                  </option>
                </>
              )
            }[filterSet.filterType]
          }
        </select>
      </td>
      <td>
        <select
          className="filterSelect"
          disabled={disabled}
          onChange={(e) => updateFilter({ operator: e.target.value })}
          value={filterSet.operator}
        >
          {
            {
              [FilterType.Table]: (
                <>
                  <option value={'CONTAINS'} label={'CONTAINS'}>
                    CONTAINS
                  </option>
                  <option value={'DOES NOT CONTAIN'} label={'DOES NOT CONTAIN'}>
                    DOES NOT CONTAIN
                  </option>
                </>
              ),
              [FilterType.Drawn]: (
                <>
                  <option value={'CONTAINED IN'} label={'CONTAINED IN'}>
                    CONTAINED IN
                  </option>
                  <option disabled={true} value={'NOT CONTAINED IN'} label={'NOT CONTAINED IN'}>
                    NOT CONTAINED IN (Not yet available for this filter type)
                  </option>
                </>
              ),
              [FilterType.Uploaded]: (
                <>
                  <option value={'CONTAINED IN'} label={'CONTAINED IN'}>
                    CONTAINED IN
                  </option>
                  <option disabled={true} value={'NOT CONTAINED IN'} label={'NOT CONTAINED IN'}>
                    NOT CONTAINED IN (Not yet available for this filter type)
                  </option>
                </>
              )
            }[filterSet.filterType]
          }
        </select>
      </td>
      <td>
        <select
          className="filterTypeSelect"
          disabled={disabled}
          onChange={(e) => {
            if (e.target.value === FilterType.Uploaded) {
              updateSpatialFilter(serverBoundariesToDisplay[0].value, FilterType.Uploaded);
            } else if (e.target.value === FilterType.Drawn) {
              updateSpatialFilter(clientBoundariesToDisplay[0].value, FilterType.Drawn);
            } else {
              updateFilter({
                filterType: e.target.value,
                setID: setID,
                filterID: filterSet.id
              });
            }
          }}
          value={filterSet.filterType}
        >
          <option value={FilterType.Table} label={'Field/Column'}>
            Field/Column
          </option>
          <option disabled={clientBoundariesToDisplay.length < 1} value={FilterType.Drawn} label={'Spatial - Drawn'}>
            Spatial - Drawn
          </option>
          <option
            disabled={serverBoundariesToDisplay.length < 1}
            value={FilterType.Uploaded}
            label={'Spatial - Uploaded'}
          >
            Spatial - Uploaded
          </option>
        </select>
      </td>
      <td>
        <select
          className="filterSelect"
          disabled={disabled}
          value={filterSet.field}
          onChange={(e) =>
            updateFilter({ filterID: filterSet.id, field: e.target.value, filterType: FilterType.Table })
          }
        >
          {filterSet.filterType === FilterType.Table ? (
            filterOptions.map((option) => (
              <option key={option.value + option.label} value={option.value}>
                {option.label}
              </option>
            ))
          ) : (
            <option key={filterSet.id + 'SHAPEOPTION'} value={'SHAPE'}>
              SHAPE
            </option>
          )}
        </select>
      </td>
      <td>{input}</td>
      <td className="deleteButtonCell">
        <Tooltip classes={{ tooltip: 'toolTip' }} title="Delete the filter in this row, data will be refetched.">
          <span>
            <Button
              className={'deleteButton'}
              disabled={disabled}
              onClick={() => removeFilter(FilterType.Table)}
              variant="contained"
            >
              Delete
            </Button>
          </span>
        </Tooltip>
      </td>
    </tr>
  );
};

export default Filter;
