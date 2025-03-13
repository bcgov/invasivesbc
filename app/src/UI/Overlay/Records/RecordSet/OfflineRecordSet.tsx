import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import './RecordSet.css';
import { useHistory } from 'react-router';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Button } from '@mui/material';

import RecordSetFooter from './RecordSetFooter';
import { useSelector } from 'utils/use_selector';
import { MOBILE } from 'state/build-time-config';
import { RecordSetType } from 'interfaces/UserRecordSet';
import { OfflineActivityRecord, OfflineActivitySyncState, selectOfflineActivity } from 'state/reducers/offlineActivity';
import { detectTouchDevice } from 'utils/detectTouch';
import { offlineActivityColumnsToDisplay } from './RecordTableHelpers';
import { validActivitySortColumns } from 'sharedAPI/src/misc/sortColumns';
import { RECORDSET_SET_SORT, USER_CLICKED_RECORD, USER_HOVERED_RECORD, USER_TOUCHED_RECORD } from 'state/actions';
import UserRecord from 'interfaces/UserRecord';
import { ActivitySubtypeShortLabels, ActivitySubtypeTargetKey } from 'sharedAPI/src/constants';
type PropTypes = { setID: string };

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
          const optionsMap = new Map<string, string>(
            properties[propertyKey].options.map((option: { value: string; label: string }) => [
              option.value,
              option.label
            ])
          );

          result[key].forEach((value) => {
            const label = optionsMap.get(value);
            if (label) {
              labels.push(label);
            }
          });
        }
      }

      return labels.join(', ');
    }

    search(obj);
    return getLabels();
  }

  const convertCodeToLabelUsingRecordType = (activity_subtype, activity_subtype_data, properties) => {
    const plantCodes = findCodesFromKey(
      activity_subtype_data,
      ActivitySubtypeTargetKey[activity_subtype],
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
  const offlineDocs = useSelector((state) => state.UserSettings.offlineDocs);
  const listOptions = offlineDocs[0]?.apiDocsWithViewOptions;

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
          <div className="recordSet_header_name">{recordSet?.recordSetName}</div>
        </div>
      </div>
      <div className="recordSet_container">
        {Object.keys(parsedObj).length === 0 ? (
          <div className="no-records">
            <p>There are no locally stored unsynced activities.</p>
          </div>
        ) : (
          <>
            <div style={{ margin: '8px', padding: '8px' }} />
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
