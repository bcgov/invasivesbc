import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import './RecordSet.css';
import { useHistory } from 'react-router';
import { Tooltip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Button, IconButton } from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import ExcelExporter from '../ExcelExporter';
import RecordSetFooter from './RecordSetFooter';
import Filter from './Filter';
import { useSelector } from 'utils/use_selector';
import { MOBILE } from 'state/build-time-config';
import UserSettings from 'state/actions/userSettings/UserSettings';
import { RecordSetType } from 'interfaces/UserRecordSet';
import { OfflineActivityRecord, OfflineActivitySyncState, selectOfflineActivity } from 'state/reducers/offlineActivity';
import { detectTouchDevice } from 'utils/detectTouch';
import { offlineActivityColumnsToDisplay } from './RecordTableHelpers';
import { validActivitySortColumns } from 'sharedAPI/src/misc/sortColumns';
import { RECORDSET_SET_SORT, USER_CLICKED_RECORD, USER_HOVERED_RECORD, USER_TOUCHED_RECORD } from 'state/actions';
import UserRecord from 'interfaces/UserRecord';
import { ActivitySubtypeShortLabels } from 'sharedAPI/src/constants';
type PropTypes = { setID: string };

// display only locally modified/stored ones, if synchronized dont display (?)
export const OfflineRecordSet = ({ setID }: PropTypes) => {
  const onUserHoveredRecord = (row: UserRecord) => {
    dispatch({
      type: USER_HOVERED_RECORD,
      payload: {
        recordType: RecordSetType.Activity,
        id: row.activity_id,
        row: row
      }
    });
  };

  function findCodesFromKey(obj: any, targetKey: string, properties: any, specialCase: boolean): string {
    const result: Record<string, Set<string>> = {
      invasive_plant_code: new Set(),
      invasive_plant_aquatic_code: new Set()
    };

    const keysToFind = ['invasive_plant_code', 'invasive_plant_aquatic_code'];

    // Function to recursively search through the object
    function search(obj: any): void {
      if (Array.isArray(obj)) {
        obj.forEach(search);
      } else if (obj !== null && typeof obj === 'object') {
        Object.keys(obj).forEach((key) => {
          if (key === targetKey) {
            extractCodes(obj[key]);
          } else {
            search(obj[key]);
          }
        });
      }
    }

    // Function to extract the codes
    function extractCodes(obj: any): void {
      if (Array.isArray(obj)) {
        obj.forEach(extractCodes);
      } else if (obj !== null && typeof obj === 'object') {
        Object.keys(obj).forEach((key) => {
          if (keysToFind.includes(key) && obj[key]) {
            const values = Array.isArray(obj[key]) ? obj[key] : [obj[key]];
            values.forEach((value) => result[key].add(value));
          } else {
            extractCodes(obj[key]);
          }
        });
      }
    }

    // Function to retrieve labels
    function getLabels(): string {
      let labels: string[] = [];

      for (const key of keysToFind) {
        let propertyKey = specialCase ? 'invasive_plant_aquatic_code' : key;

        if (result[key].size > 0 && properties[propertyKey]?.options) {
          let options = properties[propertyKey].options;
          result[key].forEach((value) => {
            // change this to Map for O(1)
            let found = options.find((option: { value: string; label: string }) => option.value === value);
            if (found) labels.push(found.label);
          });
        }
      }

      return labels.join(', ');
    }

    search(obj);
    return getLabels();
  }

  const convertCodeToLabelUsingRecordType = (activity_subtype, activity_subtype_data, properties) => {
    let target_key: string;

    switch (activity_subtype) {
      case 'Activity_Observation_PlantTerrestrial':
        target_key = 'TerrestrialPlants'; //invasive_plant_code
        break;
      case 'Activity_Observation_PlantAquatic':
        target_key = 'AquaticPlants'; //invasive_plant_code
        break;
      case 'Activity_Treatment_ChemicalPlantAquatic':
        target_key = 'chemical_treatment_details'; //, 'invasive_plants'; //invasive_plant_code
        break;
      case 'Activity_Treatment_ChemicalPlantTerrestrial':
        target_key = 'chemical_treatment_details'; //, 'invasive_plants']; //invasive_plant_code
        break;
      case 'Activity_Treatment_MechanicalPlantAquatic':
        target_key = 'Treatment_MechanicalPlant_Information'; // invasive_plant_code
        break;
      case 'Activity_Treatment_MechanicalPlantTerrestrial':
        target_key = 'Treatment_MechanicalPlant_Information'; // invasive_plant_code
        break;
      case 'Activity_Biocontrol_Release':
        target_key = 'Biocontrol_Release_Information'; //invasive_plant_code
        break;
      case 'Activity_Biocontrol_Collection':
        target_key = 'Biocontrol_Collection_Information'; // invasive_plant_code
        break;
      case 'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant':
        target_key = 'Monitoring_BiocontrolDispersal_Information'; //invasive_plant_code
        break;
      case 'Activity_Monitoring_ChemicalTerrestrialAquaticPlant':
        target_key = 'Monitoring_ChemicalTerrestrialAquaticPlant_Information'; // invasive_plant_code,invasive_plant_aquatic_code
        break;
      case 'Activity_Monitoring_MechanicalTerrestrialAquaticPlant':
        target_key = 'Monitoring_MechanicalTerrestrialAquaticPlant_Information'; // invasive_plant_code,invasive_plant_aquatic_code
        break;
      case 'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant':
        target_key = 'Monitoring_BiocontrolRelease_TerrestrialPlant_Information'; // invasive_plant_code
        break;
      default:
        target_key = '';
    }
    const plantCodes = findCodesFromKey(
      activity_subtype_data,
      target_key,
      properties,
      [
        'Activity_Treatment_MechanicalPlantAquatic',
        'Activity_Treatment_ChemicalPlantAquatic',
        'Activity_Observation_PlantAquatic'
      ].includes(
        activity_subtype // Special case: if subtype in this list, switch between invasive_plant_code and invasive_plant_aquatic_code
      )
    );
    return plantCodes;
  };
  const viewFilters = useSelector((state) => state.Map.viewFilters);
  const connected = useSelector((state) => state.Network.connected);
  const listOptions = useSelector((state) => state.UserSettings.apiDocsWithViewOptions); // listOptions.components.schemas
  console.log('Do they have options?', listOptions?.components?.schemas);

  const history = useHistory();
  const dispatch = useDispatch();

  const onClickBackButton = () => {
    history.push('/Records');
  };
  const [userOfflineMobile, setUserOfflineMobile] = useState<boolean>(!connected && MOBILE);
  const recordSet = useSelector((state) => state.UserSettings?.recordSets?.[setID]);
  const { working, serializedActivities } = useSelector(selectOfflineActivity);
  const isTouch = detectTouchDevice();
  const activitySortColumns = userOfflineMobile ? [] : validActivitySortColumns;
  const sortColumn = useSelector((state: any) => state.UserSettings?.recordSets?.[setID]?.sortColumn);
  const sortOrder = useSelector((state: any) => state.UserSettings?.recordSets?.[setID]?.sortOrder);
  let parsedObj = Object.fromEntries(
    Object.entries(serializedActivities)
      .filter(([_, value]) => value.sync_state !== OfflineActivitySyncState.SYNCHRONIZED)
      .map(([key, value]) => {
        const typedValue = value as OfflineActivityRecord;
        return [key, { ...typedValue, data: JSON.parse(typedValue.data) }];
      })
  );

  console.log('---> parsed obj', parsedObj);

  try {
    Object.entries(parsedObj).forEach(([key, value]) => {
      const concatenatedLabels = convertCodeToLabelUsingRecordType(
        parsedObj[key].record_type,
        parsedObj[key].data.form_data.activity_subtype_data,
        listOptions?.components?.schemas.ChemicalTreatment_Species_Codes.properties
      );

      parsedObj[key].data.activity_date = new Date(
        value.data?.form_data?.activity_data?.activity_date_time ??
          value.data?.form_data?.activity_data?.activity_date_time ??
          null
      )
        .toISOString()
        .substring(0, 10);
      parsedObj[key].data.activity_subtype =
        ActivitySubtypeShortLabels[(value as OfflineActivityRecord).record_type] || 'Unknown';
      parsedObj[key].data.invasive_plant = concatenatedLabels;

      parsedObj[key].data.jurisdiction_display = parsedObj[key].data.jurisdiction
        .map(
          (val) =>
            listOptions?.components?.schemas[
              (value as OfflineActivityRecord).record_type
            ].properties.activity_data.properties.jurisdictions.items.properties.jurisdiction_code.options.find(
              (item) => item.value === val
            )?.label
        )
        .filter((label) => label)
        .join(', ');
      parsedObj[key].data.agency =
        listOptions?.components?.schemas[
          (value as OfflineActivityRecord).record_type
        ].properties.activity_data.properties.invasive_species_agency_code.options.find(
          (item) => item.value === parsedObj[key].data.form_data.activity_data.invasive_species_agency_code
        )?.label || '';
      parsedObj[key].data.reported_area = parsedObj[key].data.form_data.activity_data.reported_area;

      const match = listOptions?.components?.schemas[
        (value as OfflineActivityRecord).record_type
      ].properties.activity_data.properties.invasive_species_agency_code.options.find(
        (item) => item.value === parsedObj[key].data.form_data.activity_data.invasive_species_agency_code
      );
    });
  } catch (error) {
    console.log(error);
  }

  const tableType = recordSet?.recordSetType;

  useEffect(() => {
    setUserOfflineMobile(MOBILE && !connected);
  }, [connected]);

  const onlyFilterIsForDrafts =
    recordSet?.tableFilters?.length === 1 && recordSet?.tableFilters[0]?.field === 'form_status';

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
        {Object.keys(parsedObj).length === 0 ? (
          <div className="no-records">
            <p>There are no locally stored unsynced activities.</p>
          </div>
        ) : (
          <>
            <div className="recordSet_filter_buttons_container">
              <div className="recordSet_clear_filter_button">
                <Tooltip
                  classes={{ tooltip: 'toolTip' }}
                  title="Clear all filters and refetch all data for this layer."
                >
                  <span>
                    <Button
                      size={'small'}
                      disabled={userOfflineMobile}
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
                <Tooltip
                  classes={{ tooltip: 'toolTip' }}
                  title="Toggle hiding filters - does not toggle applying them."
                >
                  <span>
                    <Button
                      size={'small'}
                      disabled={userOfflineMobile}
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
                      disabled={userOfflineMobile}
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
                      {recordSet.tableFilters.map((filter) => {
                        if (filter.field !== 'form_status') {
                          return (
                            <Filter
                              key={filter.id}
                              recordSetType={recordSet.recordSetType}
                              setID={setID}
                              filterSet={filter}
                              userOfflineMobile={userOfflineMobile}
                            />
                          );
                        }
                      })}
                    </tbody>
                  </table>
                )}
              </div>
              <ExcelExporter setName={setID} />
            </div>

            <div className="record_table_container">
              <table className="record_table">
                <tbody>
                  <tr className="record_table_header">
                    {isTouch && (
                      <th className="record_table_header_column" style={{ width: '50px' }}>
                        View/Edit
                      </th>
                    )}
                    {offlineActivityColumnsToDisplay.map((col: any) => (
                      <th
                        className={'record_table_header_column'}
                        key={col.key}
                        onClick={() => {
                          if (activitySortColumns.includes(col.key)) {
                            dispatch({ type: RECORDSET_SET_SORT, payload: { setID: setID, sortColumn: col.key } });
                          }
                        }}
                      >
                        {col.name}{' '}
                        {activitySortColumns.includes(sortColumn) &&
                          sortColumn === col.key &&
                          (sortOrder === 'ASC' ? '▲' : '▼')}
                      </th>
                    ))}
                  </tr>
                  {Object.entries(parsedObj).map(([key, value]) => {
                    // console.log('--->', key, value.data);

                    return (
                      <tr
                        onContextMenu={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}
                        onClick={() => {
                          if (!isTouch) {
                            dispatch({
                              type: USER_CLICKED_RECORD,
                              payload: {
                                recordType: tableType,
                                id: key,
                                row: value.data
                              }
                            });
                          }
                        }}
                        onMouseOver={() => onUserHoveredRecord(value.data)}
                        onFocus={() => onUserHoveredRecord(value.data)}
                        onTouchStart={() => {
                          dispatch({
                            type: USER_TOUCHED_RECORD,
                            payload: {
                              recordType: tableType,
                              id: key,
                              row: value.data
                            }
                          });
                        }}
                        className="record_table_row"
                        key={value?.data?.activity_id}
                      >
                        {isTouch && (
                          <td
                            onTouchStart={() => {
                              dispatch({
                                type: USER_CLICKED_RECORD,
                                payload: {
                                  recordType: tableType,
                                  id: key,
                                  row: value.data
                                }
                              });
                            }}
                            className="record_table_row_column"
                            style={{ width: '50px' }}
                          >
                            <VisibilityIcon />
                          </td>
                        )}
                        {offlineActivityColumnsToDisplay.map((col) => {
                          return (
                            <td className="record_table_row_column" key={col.key + col.name}>
                              {value.data[col.key]}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      <RecordSetFooter setID={setID} />
    </>
  );
};
