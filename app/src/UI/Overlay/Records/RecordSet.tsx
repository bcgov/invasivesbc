import React, { ReactElement, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './RecordSet.css';
import Button from '@mui/material/Button';
import { useHistory } from 'react-router';
import { Tooltip } from '@mui/material';
import { RecordTable } from './RecordTable';
import { activityColumnsToDisplay, iappColumnsToDisplay } from './RecordTableHelpers';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

import {
  PAGE_OR_LIMIT_CHANGE,
  RECORDSET_ADD_FILTER,
  RECORDSET_CLEAR_FILTERS,
  RECORDSET_REMOVE_FILTER,
  RECORDSET_UPDATE_FILTER,
  RECORDSETS_TOGGLE_VIEW_FILTER
} from 'state/actions';
import { OverlayHeader } from '../OverlayHeader';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import ExcelExporter from './ExcelExporter';

export const RecordSet = (props) => {
  const viewFilters = useSelector((state: any) => state.Map.viewFilters);
  const history = useHistory();
  const dispatch = useDispatch();

  const [filterTypeChooserOpen, setFilterTypeChooserOpen] = React.useState(false);

  const onClickBackButton = () => {
    history.push('/Records');
  };

  const recordSet = useSelector((state: any) => state.UserSettings?.recordSets?.[props.setID]);
  const tableType = recordSet?.recordSetType;

  const onlyFilterIsForDrafts =
    recordSet?.tableFilters?.length === 1 && recordSet?.tableFilters[0]?.field === 'form_status';

  switch (recordSet) {
    case undefined:
      return <></>;
    default:
      return (
        <div className="recordSet_container">
          <OverlayHeader />
          <div className="stickyHeader">
            <div className="recordSet_header" style={{ backgroundColor: recordSet?.color }}>
              <div className="recordSet_back_button">
                <Button onClick={onClickBackButton} variant="contained">
                  {'< Back'}
                </Button>{' '}
              </div>
              <div className="recordSet_header_name">{recordSet?.recordSetName}</div>
            </div>
          </div>
          <div className="recordSet_filter_buttons_container">
            <div className="recordSet_clear_filter_button">
              <Tooltip classes={{ tooltip: 'toolTip' }} title="Clear all filters and refetch all data for this layer.">
                <Button
                  size={'small'}
                  onClick={() => {
                    dispatch(
                      RECORDSET_CLEAR_FILTERS({
                        setID: props.setID
                      })
                    );
                  }}
                  variant="contained"
                >
                  Clear Filters
                  <FilterAltOffIcon />
                </Button>
              </Tooltip>
            </div>
            <div className="recordSet_toggleView_filter_button">
              <Tooltip classes={{ tooltip: 'toolTip' }} title="Toggle hiding filters - does not toggle applying them.">
                <Button
                  size={'small'}
                  onClick={() => {
                    dispatch(RECORDSETS_TOGGLE_VIEW_FILTER());
                  }}
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
              </Tooltip>
            </div>
            <div className="recordSet_new_filter_button">
              <Tooltip
                classes={{ tooltip: 'toolTip' }}
                title="Add a new filter, drawn, uploaded KML, or just text search on a field."
              >
                <Button
                  size={'small'}
                  onClick={() => {
                    dispatch(
                      RECORDSET_ADD_FILTER({
                        filterType: 'tableFilter',
                        // short id if activity record set otherwise site_ID
                        field: tableType === 'Activity' ? 'short_id' : 'site_id',
                        setID: props.setID,
                        operator: 'CONTAINS',
                        operator2: 'AND',
                        blockFetchForNow: true
                      })
                    );
                  }}
                  variant="contained"
                >
                  Add Filter + <FilterAltIcon />
                </Button>
              </Tooltip>
            </div>
          </div>
          <div className="recordSet_filters_container">
            <div className="recordSet_filters">
              {recordSet?.tableFilters?.length > 0 && !onlyFilterIsForDrafts && viewFilters ? (
                <table className="recordSetFilterTable">
                  <tbody>
                    <tr>
                      <th>Operator 1</th>
                      <th>Operator 2</th>
                      <th>Filter type</th>
                      <th>Filter On</th>
                      <th>Value</th>
                      <th></th>
                    </tr>
                    {recordSet?.tableFilters.map((filter: any, i) => {
                      if (filter.field !== 'form_status')
                        return <Filter key={'filterIndex' + i} setID={props.setID} id={filter.id} />;
                    })}
                  </tbody>
                </table>
              ) : (
                <></>
              )}
              <ExcelExporter setName={props.setID} />
            </div>
          </div>
          <RecordTable setID={props.setID} />
          <RecordSetFooter setID={props.setID} />
        </div>
      );
  }
};

const RecordSetFooter = (props) => {
  const layer = useSelector((state: any) => state.Map.layers?.filter((layer) => layer.recordSetID === props.setID)[0]);
  const recordTable = useSelector((state: any) => state.Map.recordTables?.[props.setID]);

  const loading = layer?.loading || recordTable?.loading;

  const totalRecords = layer?.IDList?.length;
  const loaded = !loading;
  const firstRowIndex = recordTable?.page * recordTable?.limit;
  const lastRowIndex =
    totalRecords < firstRowIndex + recordTable?.limit ? totalRecords : firstRowIndex + recordTable?.limit;
  let recordDisplayString = 'Loading...';
  if (loaded) {
    if (totalRecords !== undefined && totalRecords > 0 && !isNaN(firstRowIndex) && !isNaN(lastRowIndex)) {
      recordDisplayString = `${firstRowIndex + 1} to ${lastRowIndex} of ${totalRecords} records`;
    } else if (layer?.IDList && totalRecords < 1) {
      recordDisplayString = 'No records found';
    }
  }

  const shouldDisplayNextButton = totalRecords > lastRowIndex && !loading;
  const shouldDisplayPreviousButton = firstRowIndex > 0 && !loading;

  const dispatch = useDispatch();

  const onClickPrevious = () => {
    dispatch(
      PAGE_OR_LIMIT_CHANGE({
        setID: props.setID,
        page: recordTable?.page - 1,
        limit: recordTable?.limit
      })
    );
  };
  const onClickNext = () => {
    dispatch(
      PAGE_OR_LIMIT_CHANGE({
        setID: props.setID,
        page: recordTable?.page + 1,
        limit: recordTable?.limit
      })
    );
  };

  return (
    <div className="recordSet_footer">
      <div className="recordSet_pagePrevious">
        {shouldDisplayPreviousButton ? <ArrowLeftIcon onClick={onClickPrevious} /> : <></>}
      </div>
      <div className="recordSet_pageOfAndTotal">{recordDisplayString}</div>
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

  const value = useRef(null);

  //const debouncedUpdate = debounce((value) => {
  const debouncedUpdate = (value) => {
    dispatch(
      RECORDSET_UPDATE_FILTER({
        filterType: 'tableFilter',
        setID: props.setID,
        filterID: props.id,
        filter: value
      })
    );
  };

  let input: ReactElement | null = null;
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
            dispatch(
              RECORDSET_UPDATE_FILTER({
                setID: props.setID,
                filterID: props.id,
                filter: e.target.value
              })
            );
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
            console.dir(e.target);

            dispatch(
              RECORDSET_UPDATE_FILTER({
                setID: props.setID,
                filterID: props.id,
                filter: e.target.value
              })
            );
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
            console.dir(e.target.value);

            dispatch(
              RECORDSET_UPDATE_FILTER({
                //filterType: 'tableFilter',
                setID: props.setID,
                filterID: props.id,
                operator2: e.target.value
              })
            );
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
            console.dir(e.target.value);

            dispatch(
              RECORDSET_UPDATE_FILTER({
                //filterType: 'tableFilter',
                setID: props.setID,
                filterID: props.id,
                operator: e.target.value
              })
            );
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

            dispatch(RECORDSET_UPDATE_FILTER({ ...payload }));
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
            console.dir(e.target);

            dispatch(
              RECORDSET_UPDATE_FILTER({
                filterType: 'tableFilter',
                setID: props.setID,
                filterID: props.id,
                field: e.target.value
              })
            );
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
              dispatch(RECORDSET_REMOVE_FILTER({ filterType: 'tableFilter', setID: props.setID, filterID: props.id }));
            }}
          >
            Delete
          </Button>
        </Tooltip>
      </td>
    </tr>
  );
};
