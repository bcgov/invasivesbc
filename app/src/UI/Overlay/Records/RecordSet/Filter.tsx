import { Button, Tooltip } from '@mui/material';
import { useCallback, useState } from 'react';
import { activityColumnsToDisplay, iappColumnsToDisplay } from './RecordTableHelpers';
import { useDispatch, useSelector } from 'utils/use_selector';
import { RecordSetType } from 'interfaces/UserRecordSet';
import UserSettings from 'state/actions/userSettings/UserSettings';
import debounce from 'lodash.debounce';

type PropTypes = {
  setID: string;
  id: string;
};

const Filter = ({ setID, id }: PropTypes) => {
  const TIME_TO_AUTO_UPDATE_IN_SECONDS = 0.75;

  /**
   * @desc Change Handler for text input filter.
   *       Sets/refreshes timeouts so updates won't fire until user finishes typing.
   */
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = event.target.value;
    setInputValue(newVal);
    debouncedFormChange(newVal);
  };

  const debouncedFormChange = useCallback(
    debounce((value: string) => {
      if (value !== valueInState) {
        dispatch(
          UserSettings.RecordSet.updateFilter({
            filterType: 'tableFilter',
            setID: setID,
            filterID: id,
            filter: value
          })
        );
      }
    }, TIME_TO_AUTO_UPDATE_IN_SECONDS * 1000),
    []
  );
  /**
   * Update the Recordsets filters
   * @param newVal additional object keys
   */
  const updateFilter = (newVal: Record<string, any>) => {
    dispatch(
      UserSettings.RecordSet.updateFilter({
        setID: setID,
        filterID: id,
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
        filterID: id,
        filterType: filterType
      })
    );
  };

  const getFilterType = (filterTypeInState: string) => {
    switch (filterTypeInState) {
      case 'tableFilter':
        return <input key={id} className="filterSelect" onChange={handleInputChange} type="text" value={inputValue} />;
      case 'spatialFilterUploaded':
        return (
          <select
            className="filterSelect"
            value={valueInState}
            onChange={(e) => updateFilter({ filter: e.target.value })}
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
            value={valueInState}
            onChange={(e) => updateFilter({ filter: e.target.value })}
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
  const userSettingsState = useSelector((state) => state.UserSettings);
  const serverBoundariesToDisplay = useSelector((state) => state.Map.serverBoundaries)?.map((boundary) => ({
    label: boundary.title,
    value: boundary.id
  }));
  const clientBoundariesToDisplay = useSelector((state) => state.Map.clientBoundaries)?.map((boundary) => ({
    label: boundary.title,
    value: boundary.id
  }));

  const filterColumns =
    userSettingsState?.recordSets?.[setID].recordSetType === RecordSetType.Activity
      ? activityColumnsToDisplay
      : iappColumnsToDisplay;
  const filterOptions = filterColumns.map((option) => ({ label: option.name, value: option.key }));

  const filterByPropId = userSettingsState?.recordSets?.[setID]?.tableFilters.find((filter) => filter.id === id);
  const filterTypeInState = filterByPropId?.filterType;
  const valueInState = filterByPropId?.filter;
  const typeInState = filterByPropId?.field;
  const operatorInState = filterByPropId?.operator;
  const operator2InState = filterByPropId?.operator2;
  const [inputValue, setInputValue] = useState<string>(valueInState);
  const input = getFilterType(filterTypeInState);

  return (
    <tr>
      <td>
        <select
          className="filterSelect"
          value={operator2InState}
          onChange={(e) => updateFilter({ operator2: e.target.value })}
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
            }[filterTypeInState]
          }
        </select>
      </td>
      <td>
        <select
          className="filterSelect"
          value={operatorInState}
          onChange={(e) => updateFilter({ operator: e.target.value })}
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
            }[filterTypeInState]
          }
        </select>
      </td>
      <td>
        <select
          className="filterTypeSelect"
          value={filterTypeInState}
          onChange={(e) => {
            const payload = {
              filterType: e.target.value,
              setID: setID,
              filterID: id
            } as any;

            if (e.target.value === 'spatialFilterUploaded') {
              payload.filter = serverBoundariesToDisplay[0].value;
            }
            if (e.target.value === 'spatialFilterDrawn') {
              payload.filter = clientBoundariesToDisplay[0].value;
            }

            updateFilter({ ...payload });
          }}
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
          value={typeInState}
          onChange={(e) => updateFilter({ filterID: id, field: e.target.value, filterType: 'tableFilter' })}
        >
          {filterTypeInState === 'tableFilter' ? (
            filterOptions.map((option) => (
              <option key={option.value + option.label} value={option.value}>
                {option.label}
              </option>
            ))
          ) : (
            <option key={id + 'SHAPEOPTION'} value={'SHAPE'}>
              SHAPE
            </option>
          )}
        </select>
      </td>
      <td>{input}</td>
      <td className="deleteButtonCell">
        <Tooltip classes={{ tooltip: 'toolTip' }} title="Delete the filter in this row, data will be refetched.">
          <Button className={'deleteButton'} variant="contained" onClick={() => removeFilter('tableFilter')}>
            Delete
          </Button>
        </Tooltip>
      </td>
    </tr>
  );
};

export default Filter;
