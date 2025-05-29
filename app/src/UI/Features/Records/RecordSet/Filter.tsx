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
          filterType: 'tableFilter',
          setID: setID,
          filterID: filterSet.id,
          filter: value
        })
      );
    }, TIME_TO_AUTO_UPDATE_IN_SECONDS * 1000),
    []
  );

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
      case 'tableFilter':
        return (
          <input
            className="filterSelect"
            disabled={disabled}
            onChange={handleInputChange}
            type="text"
            value={inputValue}
          />
        );
      case 'spatialFilterUploaded':
        return (
          <select
            className="filterSelect"
            disabled={disabled}
            onChange={(e) => updateFilter({ filter: e.target.value })}
            value={filterSet.filter}
          >
            {serverBoundariesToDisplay?.map((option) => (
              <option key={option.value + option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'spatialFilterDrawn':
        return (
          <select
            className="filterSelect"
            disabled={disabled}
            onChange={(e) => updateFilter({ filter: e.target.value })}
            value={filterSet.filter}
          >
            {clientBoundariesToDisplay?.map((option) => (
              <option key={option.value + option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  const dispatch = useDispatch();

  const serverBoundariesToDisplay = useSelector((state) => state.Map.serverBoundaries)?.map((boundary) => ({
    label: boundary.title,
    value: boundary.id
  }));
  const clientBoundariesToDisplay = useSelector((state) => state.Map.clientBoundaries)?.map((boundary) => ({
    label: boundary.title,
    value: boundary.id
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
              tableFilter: (
                <>
                  <option value={'AND'} label={'AND'}>
                    AND
                  </option>
                  <option value={'OR'} label={'OR'}>
                    OR
                  </option>
                </>
              ),
              spatialFilterDrawn: (
                <>
                  <option value={'AND'} label={'AND'}>
                    AND
                  </option>
                  <option disabled value={'OR'} label={'OR'}>
                    OR (Not yet available for this filter type)
                  </option>
                </>
              ),
              spatialFilterUploaded: (
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
              tableFilter: (
                <>
                  <option value={'CONTAINS'} label={'CONTAINS'}>
                    CONTAINS
                  </option>
                  <option value={'DOES NOT CONTAIN'} label={'DOES NOT CONTAIN'}>
                    DOES NOT CONTAIN
                  </option>
                </>
              ),
              spatialFilterDrawn: (
                <>
                  <option value={'CONTAINED IN'} label={'CONTAINED IN'}>
                    CONTAINED IN
                  </option>
                  <option disabled={true} value={'NOT CONTAINED IN'} label={'NOT CONTAINED IN'}>
                    NOT CONTAINED IN (Not yet available for this filter type)
                  </option>
                </>
              ),
              spatialFilterUploaded: (
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
            const payload: Partial<IUpdateFilter> = {
              filterType: e.target.value,
              setID: setID,
              filterID: filterSet.id
            };

            if (e.target.value === 'spatialFilterUploaded') {
              payload.filter = serverBoundariesToDisplay[0].value;
            } else if (e.target.value === 'spatialFilterDrawn') {
              payload.filter = clientBoundariesToDisplay[0].value;
            }
            updateFilter(payload);
          }}
          value={filterSet.filterType}
        >
          <option value={'tableFilter'} label={'Field/Column'}>
            Field/Column
          </option>
          <option
            disabled={clientBoundariesToDisplay.length < 1}
            value={'spatialFilterDrawn'}
            label={'Spatial - Drawn'}
          >
            Spatial - Drawn
          </option>
          <option
            disabled={serverBoundariesToDisplay.length < 1}
            value={'spatialFilterUploaded'}
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
          onChange={(e) => updateFilter({ filterID: filterSet.id, field: e.target.value, filterType: 'tableFilter' })}
        >
          {filterSet.filterType === 'tableFilter' ? (
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
              onClick={() => removeFilter('tableFilter')}
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
