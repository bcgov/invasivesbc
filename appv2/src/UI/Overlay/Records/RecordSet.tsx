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
  RECORDSET_CLEAR_FILTERS,
  RECORDSET_REMOVE_FILTER,
  RECORDSET_UPDATE_FILTER,
  USER_SETTINGS_SET_RECORD_SET_REQUEST
} from 'state/actions';
import { OverlayHeader } from '../OverlayHeader';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';

export const RecordSet = (props) => {
  const userSettingsState = useSelector(selectUserSettings);
  const history = useHistory();
  const dispatch = useDispatch();

  const [filterTypeChooserOpen, setFilterTypeChooserOpen] = React.useState(false);


  const onClickBackButton = () => {
    history.push('/Records');
  };


  switch (userSettingsState?.recordSets?.[props.setID]) {
    case undefined:
      return <></>;
    default:
      return (
        <div className="recordSet_container">
          <OverlayHeader />
          <div className="stickyHeader">
            <div
              className="recordSet_header"
              style={{ backgroundColor: userSettingsState?.recordSets?.[props.setID]?.color }}>
              <div className="recordSet_back_button">
                <Button onClick={onClickBackButton} variant="contained">
                  {'< Back'}
                </Button>{' '}
              </div>
              <div className="recordSet_header_name">{userSettingsState?.recordSets?.[props.setID]?.recordSetName}</div>
              <div className="recordSet_clear_filter_button">
                <Button
                  onClick={() => {
                    dispatch({
                      type: RECORDSET_CLEAR_FILTERS,
                      payload: {
                        setID: props.setID
                      }
                    });
                  }}
                  variant="contained">
                  <FilterAltOffIcon/>
                </Button>
              </div>
              <div className="recordSet_new_filter_button">
                <Button
                  onClick={() => {
                    dispatch({
                      type: RECORDSET_ADD_FILTER,
                      payload: {
                        filterType: 'tableFilter',
                        field: 'short_id',
                        setID: props.setID,
                        operator: 'CONTAINS',
                        blockFetchForNow: true
                      }
                    });
                  }}
                  variant="contained">
                  + <FilterAltIcon/>
                </Button>
              </div>
            </div>
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
                    userSettingsState?.recordSets?.[props.setID]?.searchBoundary?.name ? (
                      <Filter
                        operator="DOES Match"
                        type="searchBoundary"
                        name={userSettingsState?.recordSets?.[props.setID]?.searchBoundary?.name}
                      />
                    ) : (
                      <></>
                    )
                  }
                  {userSettingsState?.recordSets?.[props.setID]?.tableFilters ? (
                    userSettingsState?.recordSets?.[props.setID]?.tableFilters.map((filter: any, i) => {
                      return <Filter key={'filterIndex' + i} type="data" setID={props.setID} id={filter.id} />;
                    })
                  ) : (
                    <></>
                  )}
                  {userSettingsState?.recordSets?.[props.setID]?.advancedFilters ? (
                    userSettingsState?.recordSets?.[props.setID]?.advancedFilters?.map((filter: any, i) => {
                      return (
                        <Filter setID={props.setID} key={'filterIndex' + i} operator="DOES Match" type="data2" name={filter?.filterKey} />
                      );
                    })
                  ) : (
                    <></>
                  )}
                </table>
              </div>
            </div>
          </div>
          <RecordTable setID={props.setID} />
          <div className="recordSet_footer"></div>
        </div>
      );
  }
};

  const Filter = (props) => {
    const userSettingsState = useSelector((state: any) => state.UserSettings);
    console.dir(userSettingsState)

  const filterColumns =
    userSettingsState?.recordSets?.[props.setID].recordSetType === 'Activity'
      ? activityColumnsToDisplay
      : iappColumnsToDisplay;
  const filterOptions = filterColumns.map((option) => {
    return { label: option.name, value: option.key };
  });
    const dispatch = useDispatch();

    const valueInState = userSettingsState?.recordSets?.[props.setID]?.tableFilters?.find(
      (filter) => filter.id === props.id
    )?.filter;

    const typeInState = userSettingsState?.recordSets?.[props.setID]?.tableFilters?.find(
      (filter) => filter.id === props.id
    )?.field;

    const operatorInState = userSettingsState?.recordSets?.[props.setID]?.tableFilters?.find(
      (filter) => filter.id === props.id
    )?.operator;

    const value = useRef();

    //const debouncedUpdate = debounce((value) => {
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
    }

    return (
      <tr>
        <td>Data</td>
        <select
          className="filterSelect"
          key={'operand' + props.name}
          value={operatorInState}
          onChange={(e) => {
            console.dir(e.target.value);

            dispatch({
              type: RECORDSET_UPDATE_FILTER,
              payload: {
                filterType: 'tableFilter',
                setID: props.setID,
                filterID: props.id,
                operator: e.target.value
              }
            });
          }}>
          <option key={Math.random()} value={'CONTAINS'} label={'CONTAINS'}>
            CONTAINS
          </option>
          <option key={Math.random()} value={'DOES NOT CONTAIN'} label={'DOES NOT CONTAIN'}>
            DOES NOT CONTAIN
          </option>
        </select>
        <td>
          <select
            className="filterSelect"
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
               key={"banana" + props.id}
              ref={value}
              className="filterSelect"
              onChange={(e) => {
                console.log('it changed');
                debouncedUpdate(e.target.value);
              }}
              type="text"
              value={valueInState}
              //defaultValue={valueInState}
            />
          </td>
        ) : (
          <></>
        )}
        <td className="deleteButtonCell">
          <Button
            className={'deleteButton'}
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