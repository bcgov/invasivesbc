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
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { debounce, set, values } from 'lodash';
import {
  ACTIVITIES_TABLE_ROWS_GET_REQUEST,
  PAGE_OR_LIMIT_UPDATE,
  RECORDSETS_TOGGLE_VIEW_FILTER,
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
  const viewFilters = useSelector((state: any) => state.Map.viewFilters);
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
                  <FilterAltOffIcon />
                </Button>
              </div>
              <div className="recordSet_toggleView_filter_button">
                <Button
                  onClick={() => {
                    dispatch({
                      type: RECORDSETS_TOGGLE_VIEW_FILTER
                    });
                  }}
                  variant="contained">
                  {!viewFilters ? (
                    <>
                      <VisibilityIcon />
                      <FilterAltIcon />
                    </>
                  ) : (
                    <>
                      <VisibilityOffIcon />
                      <FilterAltIcon />
                    </>
                  )}
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
                  + <FilterAltIcon />
                </Button>
              </div>
            </div>
          </div>
          <div className="recordSet_filters_container">
            <div className="recordSet_filters">
              {userSettingsState?.recordSets?.[props.setID]?.tableFilters?.length > 0 && viewFilters ? (
                <table className="recordSetFilterTable">
                  <tr>
                    <th>Filter type</th>
                    <th>Operator</th>
                    <th>Filter On</th>
                    <th>Value</th>
                    <th></th>
                  </tr>
                  {userSettingsState?.recordSets?.[props.setID]?.tableFilters.map((filter: any, i) => {
                    return <Filter key={'filterIndex' + i} setID={props.setID} id={filter.id} />;
                  })}
                </table>
              ) : (
                <></>
              )}
            </div>
          </div>
          <RecordTable setID={props.setID} />
          <RecordSetFooter setID={props.setID} />
        </div>
      );
  }
};

const RecordSetFooter = (props) => {
  const mapState = useSelector((state: any) => state.Map);

  const totalRecords = mapState?.layers?.[props.setID]?.IDList?.length;
  const firstRowIndex = mapState?.recordTables?.[props.setID]?.page * mapState?.recordTables?.[props.setID]?.limit;
  const lastRowIndex =
    totalRecords < firstRowIndex + mapState?.recordTables?.[props.setID]?.limit
      ? totalRecords
      : firstRowIndex + mapState?.recordTables?.[props.setID]?.limit;

  const shouldDisplayNextButton = totalRecords > lastRowIndex;
  const shouldDisplayPreviousButton = firstRowIndex > 0;

  const dispatch = useDispatch();

  const onClickPrevious = () => {
    dispatch({
      type: PAGE_OR_LIMIT_UPDATE,
      payload: {
        setID: props.setID,
        page: mapState?.recordTables?.[props.setID]?.page - 1,
        limit: mapState?.recordTables?.[props.setID]?.limit
      }
    });
  };
  const onClickNext = () => {
    dispatch({
      type: PAGE_OR_LIMIT_UPDATE,
      payload: {
        setID: props.setID,
        page: mapState?.recordTables?.[props.setID]?.page + 1,
        limit: mapState?.recordTables?.[props.setID]?.limit
      }
    });
  };

  return (
    <div className="recordSet_footer">
      <div className="recordSet_pagePrevious">
        {shouldDisplayPreviousButton ? <ArrowLeftIcon onClick={onClickPrevious} /> : <></>}
      </div>
      <div className="recordSet_pageOfAndTotal">{`${firstRowIndex + 1} to ${lastRowIndex} of ${
        totalRecords ? totalRecords : '(Loading)'
      } records`}</div>
      <div className="recordSet_pageNext">
        {shouldDisplayNextButton ? <ArrowRightIcon onClick={onClickNext} /> : <></>}
      </div>
    </div>
  );
};

const Filter = (props) => {
  const userSettingsState = useSelector((state: any) => state.UserSettings);
  const serverBoundariesToDisplay = useSelector((state: any) => state.Map.serverBoundaries)?.map((boundary) => {
    return { label: boundary.title, value: boundary.id };
  });
  console.dir(userSettingsState);

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
            console.log('it changed');
            debouncedUpdate(e.target.value);
          }}
          type="text"
          value={valueInState}
          //defaultValue={valueInState}
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
            console.dir(e.target);

            dispatch({
              type: RECORDSET_UPDATE_FILTER,
              payload: {
                setID: props.setID,
                filterID: props.id,
                filter: e.target.value
              }
            });
          }}>
          {serverBoundariesToDisplay.map((option) => {
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
          className="filterTypeSelect"
          key={'filterTypeSelect' + props.name}
          value={filterTypeInState}
          onChange={(e) => {
            console.dir(e.target.value);

            dispatch({
              type: RECORDSET_UPDATE_FILTER,
              payload: {
                filterType: e.target.value,
                setID: props.setID,
                filterID: props.id
                //operator: e.target.value
              }
            });
          }}>
          <option key={Math.random()} value={'tableFilter'} label={'Field/Column'}>
            Field/Column
          </option>
          <option key={Math.random()} value={'spatialFilterDrawn'} label={'Spatial - Drawn'}>
            Spatial - Drawn
          </option>
          <option key={Math.random()} value={'spatialFilterUploaded'} label={'Spatial - Uploaded'}>
            Spatial - Uploaded
          </option>
        </select>
      </td>
      <td>
        <select
          className="filterSelect"
          key={'operand' + props.name}
          value={operatorInState}
          onChange={(e) => {
            console.dir(e.target.value);

            dispatch({
              type: RECORDSET_UPDATE_FILTER,
              payload: {
                //filterType: 'tableFilter',
                setID: props.setID,
                filterID: props.id,
                operator: e.target.value
              }
            });
          }}>
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
                  <option key={Math.random()} value={'NOT CONTAINED IN'} label={'NOT CONTAINED IN'}>
                    NOT CONTAINED IN
                  </option>
                </>
              ),
              spatialFilterUploaded: (
                <>
                  <option key={Math.random()} value={'CONTAINED IN'} label={'CONTAINED IN'}>
                    CONAINED IN
                  </option>
                  <option key={Math.random()} value={'NOT CONTAINED IN'} label={'NOT CONTAINED IN'}>
                    NOT CONTAINED IN
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
      <td>
        {input}
      </td>
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
