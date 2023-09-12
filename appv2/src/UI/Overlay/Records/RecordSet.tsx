import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectUserSettings } from 'state/reducers/userSettings';
import './RecordSet.css';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import { useHistory } from 'react-router';
import Accordion from '@mui/material/Accordion';
import { AccordionSummary } from '@mui/material';
import { RecordTable } from './RecordTable';
import { activityColumnsToDisplay, iappColumnsToDisplay } from './RecordTableHelpers';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { debounce, set, values } from 'lodash';
import {
  ACTIVITIES_TABLE_ROWS_GET_REQUEST,
  RECORDSET_ADD_FILTER,
  RECORDSET_REMOVE_FILTER,
  RECORDSET_UPDATE_FILTER,
  USER_SETTINGS_SET_RECORD_SET_REQUEST
} from 'state/actions';
import { OverlayHeader } from '../OverlayHeader';

export const RecordSet = (props) => {
  const userSettingsState = useSelector(selectUserSettings);
  const history = useHistory();
  const dispatch = useDispatch();

  const [filterTypeChooserOpen, setFilterTypeChooserOpen] = React.useState(false);

  const filterColumns =
    userSettingsState?.recordSets?.[props.setId].recordSetType === 'Activity'
      ? activityColumnsToDisplay
      : iappColumnsToDisplay;
  const filterOptions = filterColumns.map((option) => {
    return { label: option.name, value: option.key };
  });

  const onClickBackButton = () => {
    history.push('/Records');
  };

  const Filter = (props) => {
    const dispatch = useDispatch();

    const valueInState = userSettingsState?.recordSets?.[props.setID]?.tableFilters?.find(
      (filter) => filter.id === props.id
    )?.filter;

    const typeInState = userSettingsState?.recordSets?.[props.setID]?.tableFilters?.find(
      (filter) => filter.id === props.id
    )?.field;

    const value = useRef();

    return (
      <tr>
        <td>Data</td>
        <td>Contains</td>
        <td>
          <select
            key={'filterType' + props.name}
            value={typeInState}
            onChange={(e) => {
              console.dir(e.target);
              dispatch({
                type: RECORDSET_UPDATE_FILTER,
                payload: {
                  filterType: 'tableFilter',
                  setID: props.setID,
                  filterID: props.id,
                  field: e.target.value
                }
              });
            }}>
            {filterOptions.map((option) => {
              return (
                <option key={option.value + option.label} value={option.value}>
                  {option.label}
                </option>
              );
            })}
          </select>
        </td>
        {props.type === 'data' ? (
          <td>
            <input
              ref={value}
              onBlur={(e) => {
                if (value.current !== undefined)
                  dispatch({
                    type: RECORDSET_UPDATE_FILTER,
                    payload: {
                      filterType: 'tableFilter',
                      setID: props.setID,
                      filterID: props.id,
                      filter: value.current.value
                    }
                  });
              }}
              type="text"
              //value={valueInState}
              defaultValue={valueInState}
            />
          </td>
        ) : (
          <></>
        )}
        <td>
          <Button
            variant="contained"
            onClick={() => {
              dispatch({
                type: RECORDSET_REMOVE_FILTER,
                payload: { filterType: 'tableFilter', setID: props.setID, filterID: props.id }
              });
            }}>
            Delete
          </Button>
        </td>
      </tr>
    );
  };

  switch (userSettingsState?.recordSets?.[props.setId]) {
    case undefined:
      return <></>;
    default:
      return (
        <div className="recordSet_container">
          <OverlayHeader/>
          <div className="stickyHeader">
            <div
              className="recordSet_header"
              style={{ backgroundColor: userSettingsState?.recordSets?.[props.setId]?.color }}>
              <div className="recordSet_back_button">
                <Button onClick={onClickBackButton} variant="contained">
                  {'< Back'}
                </Button>{' '}
              </div>
              <div className="recordSet_header_name">{userSettingsState?.recordSets?.[props.setId]?.recordSetName}</div>
              <div className="recordSet_new_filter_button">
                {filterTypeChooserOpen ? (
                  <select
                    onChange={(e) => {
                      setFilterTypeChooserOpen(false);

                      dispatch({
                        type: RECORDSET_ADD_FILTER,
                        payload: { filterType: e.target.value, field: 'short_id',  setID: props.setId, blockFetchForNow: true }
                      });
                    }}>
                    <option value="searchBoundary">Choose a filter type</option>
                    <option value="tableFilter">Data/Field</option>
                    <option value="searchBoundary">Search Boundary</option>
                    <option value="cancel">Cancel</option>
                  </select>
                ) : (
                  <Button
                    onClick={() => {
                      setFilterTypeChooserOpen(true);
                    }}
                    variant="contained">
                    + Add Filter
                  </Button>
                )}
              </div>
              <div className="recordSet_menu_button">
                <Button variant="contained">
                  <MenuIcon />
                  Menu
                </Button>
              </div>
            </div>
            <Accordion>
              <AccordionSummary className="recordSet_filter_accordion_collapsed">Filters: 5</AccordionSummary>
              <div className="recordSet_filters_container">
                <div className="recordSet_filters">
                  <table className="recordSetFilterTable">
                    <tr>
                      <th>Filter type</th>
                      <th>Operator</th>
                      <th>Field</th>
                      <th>Value</th>
                      <th></th>
                    </tr>
                    {
                      /*we'll map over a list of these later*/
                      userSettingsState?.recordSets?.[props.setId]?.searchBoundary?.name ? (
                        <Filter
                          operator="DOES Match"
                          type="searchBoundary"
                          name={userSettingsState?.recordSets?.[props.setId]?.searchBoundary?.name}
                        />
                      ) : (
                        <></>
                      )
                    }
                    {userSettingsState?.recordSets?.[props.setId]?.tableFilters ? (
                      userSettingsState?.recordSets?.[props.setId]?.tableFilters.map((filter: any, i) => {
                        return <Filter key={'filterIndex' + i} type="data" setID={props.setId} id={filter.id} />;
                      })
                    ) : (
                      <></>
                    )}
                    {userSettingsState?.recordSets?.[props.setId]?.advancedFilters ? (
                      userSettingsState?.recordSets?.[props.setId]?.advancedFilters?.map((filter: any, i) => {
                        return (
                          <Filter key={'filterIndex' + i} operator="DOES Match" type="data2" name={filter?.filterKey} />
                        );
                      })
                    ) : (
                      <></>
                    )}
                  </table>
                  <Button onClick={() => {dispatch({type: ACTIVITIES_TABLE_ROWS_GET_REQUEST, payload: { recordSetID: props.setId}})}}>APPLY FILTERS</Button>
                  <Button> CLEAR FILTERS </Button>
                </div>
              </div>
            </Accordion>
          </div>
          <RecordTable setId={props.setId} />
        </div>
      );
  }
};
