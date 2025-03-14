import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import './RecordSet.css';
import { useHistory } from 'react-router';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Button } from '@mui/material';

import RecordSetFooter from './RecordSetFooter';
import { useSelector } from 'utils/use_selector';
import { RecordSetType } from 'interfaces/UserRecordSet';
import { OfflineActivityRecord, OfflineActivitySyncState, selectOfflineActivity } from 'state/reducers/offlineActivity';
import { detectTouchDevice } from 'utils/detectTouch';
import { offlineActivityColumnsToDisplay } from './RecordTableHelpers';
import { USER_CLICKED_RECORD, USER_HOVERED_RECORD, USER_TOUCHED_RECORD } from 'state/actions';
import UserRecord from 'interfaces/UserRecord';
import { transformOfflineActivitiesForRecordTable } from 'utils/addActivity';
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

  const offlineDocs = useSelector((state) => state.UserSettings.offlineDocs);
  const listOptions: any = offlineDocs[0]?.apiDocsWithViewOptions;

  const history = useHistory();
  const dispatch = useDispatch();

  const onClickBackButton = () => {
    history.push('/Records');
  };

  const recordSet = useSelector((state) => state.UserSettings?.recordSets?.[setID]);
  const recordTable = useSelector((state: any) => state.Map.recordTables?.[setID]);
  const { serializedActivities } = useSelector(selectOfflineActivity);

  const isTouch = detectTouchDevice();
  const startIndex = recordTable?.page * recordTable?.limit;
  const endIndex = startIndex + recordTable?.limit;

  let unsyncedOfflineActivities: Record<string, any> = Object.fromEntries(
    Object.entries(serializedActivities as Record<string, OfflineActivityRecord>)
      .filter(([_, value]) => value.sync_state !== OfflineActivitySyncState.SYNCHRONIZED)
      .map(([key, value]) => {
        return [key, { ...value, data: JSON.parse(value.data) }];
      })
      .slice(startIndex, endIndex)
  );

  try {
    unsyncedOfflineActivities = transformOfflineActivitiesForRecordTable(unsyncedOfflineActivities, listOptions);
  } catch (error) {
    console.log(error);
  }

  const tableType = recordSet?.recordSetType;

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
        {Object.keys(unsyncedOfflineActivities).length === 0 ? (
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
                      <th className={'record_table_header_column'} key={col.key}>
                        {col.name}{' '}
                      </th>
                    ))}
                  </tr>
                  {Object.entries(unsyncedOfflineActivities).map(([key, value]) => {
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
