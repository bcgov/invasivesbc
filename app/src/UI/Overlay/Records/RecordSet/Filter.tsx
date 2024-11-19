import { Button, Tooltip } from '@mui/material';
import { useRef } from 'react';
import { RECORDSET_REMOVE_FILTER, RECORDSET_UPDATE_FILTER } from 'state/actions';
import { activityColumnsToDisplay, iappColumnsToDisplay } from './RecordTableHelpers';
import { useDispatch, useSelector } from 'utils/use_selector';

const Filter = (props) => {
  const userSettingsState = useSelector((state: any) => state.UserSettings);
  const serverBoundariesToDisplay = useSelector((state: any) => state.Map.serverBoundaries)?.map((boundary) => {
    return { label: boundary.title, value: boundary.id };
  });
  const clientBoundariesToDisplay = useSelector((state: any) => state.Map.clientBoundaries)?.map((boundary) => {
    return { label: boundary.title, value: boundary.id };
  });

  const filterColumns =
    userSettingsState?.recordSets?.[props.setID].recordSetType === 'Activity'
      ? activityColumnsToDisplay
      : iappColumnsToDisplay;
  const filterOptions = filterColumns.map((option) => {
    return { label: option.name, value: option.key };
  });
  const dispatch = useDispatch();

  const filterTypeInState = userSettingsState?.recordSets?.[props.setID]?.tableFilters?.find(
    (filter) => filter.id === props.id
  )?.filterType;

  const valueInState = userSettingsState?.recordSets?.[props.setID]?.tableFilters?.find(
    (filter) => filter.id === props.id
  )?.filter;

  const typeInState = userSettingsState?.recordSets?.[props.setID]?.tableFilters?.find(
    (filter) => filter.id === props.id
  )?.field;

  const operatorInState = userSettingsState?.recordSets?.[props.setID]?.tableFilters?.find(
    (filter) => filter.id === props.id
  )?.operator;

  const operator2InState = userSettingsState?.recordSets?.[props.setID]?.tableFilters?.find(
    (filter) => filter.id === props.id
  )?.operator2;

  const value = useRef();

  const debouncedUpdate = (value) => {
    dispatch({
      type: RECORDSET_UPDATE_FILTER,
      payload: {
        filterType: 'tableFilter',
        setID: props.setID,
        filterID: props.id,
        filter: value
      }
    });
  };

  let input = null;
  switch (filterTypeInState) {
    case 'tableFilter':
      input = (
        <input
          key={'banana' + props.id}
          ref={value}
          className="filterSelect"
          onChange={(e) => {
            debouncedUpdate(e.target.value);
          }}
          type="text"
          value={valueInState}
        />
      );
      break;
    case 'spatialFilterUploaded':
      input = (
        <select
          className="filterSelect"
          key={'filterType' + props.name}
          value={valueInState}
          onChange={(e) => {
            dispatch({
              type: RECORDSET_UPDATE_FILTER,
              payload: {
                setID: props.setID,
                filterID: props.id,
                filter: e.target.value
              }
            });
          }}
        >
          {serverBoundariesToDisplay?.map((option) => {
            return (
              <option key={option.value + option.label} value={option.value}>
                {option.label}
              </option>
            );
          })}
        </select>
      );

      break;
    case 'spatialFilterDrawn':
      input = (
        <select
          className="filterSelect"
          key={'filterType' + props.name}
          value={valueInState}
          onChange={(e) => {
            dispatch({
              type: RECORDSET_UPDATE_FILTER,
              payload: {
                setID: props.setID,
                filterID: props.id,
                filter: e.target.value
              }
            });
          }}
        >
          {clientBoundariesToDisplay?.map((option) => {
            return (
              <option key={option.value + option.label} value={option.value}>
                {option.label}
              </option>
            );
          })}
        </select>
      );

      break;
    default:
      null;
  }

  return (
    <tr>
      <td>
        <select
          className="filterSelect"
          key={'operand2' + props.name}
          value={operator2InState}
          onChange={(e) => {
            dispatch({
              type: RECORDSET_UPDATE_FILTER,
              payload: {
                //filterType: 'tableFilter',
                setID: props.setID,
                filterID: props.id,
                operator2: e.target.value
              }
            });
          }}
        >
          {
            {
              tableFilter: (
                <>
                  <option key={Math.random()} value={'AND'} label={'AND'}>
                    AND
                  </option>
                  <option key={Math.random()} value={'OR'} label={'OR'}>
                    OR
                  </option>
                </>
              ),
              spatialFilterDrawn: (
                <>
                  <option key={Math.random()} value={'AND'} label={'AND'}>
                    AND
                  </option>
                  <option disabled key={Math.random()} value={'OR'} label={'OR'}>
                    OR (Not yet available for this filter type)
                  </option>
                </>
              ),
              spatialFilterUploaded: (
                <>
                  <option key={Math.random()} value={'AND'} label={'AND'}>
                    AND
                  </option>
                  <option disabled key={Math.random()} value={'OR'} label={'OR'}>
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
          key={'operand' + props.name}
          value={operatorInState}
          onChange={(e) => {
            dispatch({
              type: RECORDSET_UPDATE_FILTER,
              payload: {
                //filterType: 'tableFilter',
                setID: props.setID,
                filterID: props.id,
                operator: e.target.value
              }
            });
          }}
        >
          {
            {
              tableFilter: (
                <>
                  <option key={Math.random()} value={'CONTAINS'} label={'CONTAINS'}>
                    CONTAINS
                  </option>
                  <option key={Math.random()} value={'DOES NOT CONTAIN'} label={'DOES NOT CONTAIN'}>
                    DOES NOT CONTAIN
                  </option>
                </>
              ),
              spatialFilterDrawn: (
                <>
                  <option key={Math.random()} value={'CONTAINED IN'} label={'CONTAINED IN'}>
                    CONTAINED IN
                  </option>
                  <option key={Math.random()} disabled={true} value={'NOT CONTAINED IN'} label={'NOT CONTAINED IN'}>
                    NOT CONTAINED IN (Not yet available for this filter type)
                  </option>
                </>
              ),
              spatialFilterUploaded: (
                <>
                  <option key={Math.random()} value={'CONTAINED IN'} label={'CONTAINED IN'}>
                    CONAINED IN
                  </option>
                  <option key={Math.random()} disabled={true} value={'NOT CONTAINED IN'} label={'NOT CONTAINED IN'}>
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
          key={'filterTypeSelect' + props.name}
          value={filterTypeInState}
          onChange={(e) => {
            const payload = {
              filterType: e.target.value,
              setID: props.setID,
              filterID: props.id
            } as any;

            if (e.target.value === 'spatialFilterUploaded') {
              payload.filter = serverBoundariesToDisplay[0].value;
            }
            if (e.target.value === 'spatialFilterDrawn') {
              payload.filter = clientBoundariesToDisplay[0].value;
            }

            dispatch({
              type: RECORDSET_UPDATE_FILTER,
              payload: {
                ...payload
              }
            });
          }}
        >
          <option key={Math.random()} value={'tableFilter'} label={'Field/Column'}>
            Field/Column
          </option>
          <option
            disabled={clientBoundariesToDisplay.length < 1}
            key={Math.random()}
            value={'spatialFilterDrawn'}
            label={'Spatial - Drawn'}
          >
            Spatial - Drawn
          </option>
          <option
            disabled={serverBoundariesToDisplay.length < 1}
            key={Math.random()}
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
          key={'filterType' + props.name}
          value={typeInState}
          onChange={(e) => {
            dispatch({
              type: RECORDSET_UPDATE_FILTER,
              payload: {
                filterType: 'tableFilter',
                setID: props.setID,
                filterID: props.id,
                field: e.target.value
              }
            });
          }}
        >
          {filterTypeInState === 'tableFilter' ? (
            filterOptions.map((option) => {
              return (
                <option key={option.value + option.label} value={option.value}>
                  {option.label}
                </option>
              );
            })
          ) : (
            <option key={props.id + 'SHAPEOPTION'} value={'SHAPE'}>
              SHAPE
            </option>
          )}
        </select>
      </td>
      <td>{input}</td>
      <td className="deleteButtonCell">
        <Tooltip classes={{ tooltip: 'toolTip' }} title="Delete the filter in this row, data will be refetched.">
          <Button
            className={'deleteButton'}
            variant="contained"
            onClick={() => {
              dispatch({
                type: RECORDSET_REMOVE_FILTER,
                payload: { filterType: 'tableFilter', setID: props.setID, filterID: props.id }
              });
            }}
          >
            Delete
          </Button>
        </Tooltip>
      </td>
    </tr>
  );
};

export default Filter;
