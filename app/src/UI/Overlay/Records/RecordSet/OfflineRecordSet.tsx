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
import { ActivitySubtypeShortLabels, ActivitySubtypeTargetKey } from 'sharedAPI/src/constants';
import { findSpeciesCodesAndConcatenateLabels } from 'utils/addActivity';
import { ActivitySubtype } from 'sharedAPI';
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
  const listOptions = offlineDocs[0]?.apiDocsWithViewOptions;

  const history = useHistory();
  const dispatch = useDispatch();

  const onClickBackButton = () => {
    history.push('/Records');
  };

  const recordSet = useSelector((state) => state.UserSettings?.recordSets?.[setID]);
  const { serializedActivities } = useSelector(selectOfflineActivity);
  const isTouch = detectTouchDevice();

  let unsyncedOfflineActivities = Object.fromEntries(
    Object.entries(serializedActivities)
      .filter(([_, value]) => (value as OfflineActivityRecord).sync_state !== OfflineActivitySyncState.SYNCHRONIZED)
      .map(([key, value]) => {
        const typedValue = value as OfflineActivityRecord;
        return [key, { ...typedValue, data: JSON.parse(typedValue.data) }];
      })
  );

  try {
    Object.entries(unsyncedOfflineActivities).forEach(([key, value]) => {
      unsyncedOfflineActivities[key].data.activity_date = new Date(
        value.data?.form_data?.activity_data?.activity_date_time ??
          value.data?.form_data?.activity_data?.activity_date_time ??
          null
      )
        .toISOString()
        .substring(0, 10);

      unsyncedOfflineActivities[key].data.activity_subtype =
        ActivitySubtypeShortLabels[(value as OfflineActivityRecord).record_type] || 'Unknown';

      unsyncedOfflineActivities[key].data.invasive_plant = findSpeciesCodesAndConcatenateLabels(
        unsyncedOfflineActivities[key].data.form_data.activity_subtype_data,
        ActivitySubtypeTargetKey[unsyncedOfflineActivities[key].record_type],
        listOptions?.components?.schemas.ChemicalTreatment_Species_Codes.properties,
        [
          // Special case: if activity_subtype is in this list, switch between invasive_plant_code and invasive_plant_aquatic_code when searching api docs
          ActivitySubtype.Treatment_MechanicalPlantAquatic,
          ActivitySubtype.Treatment_ChemicalPlantAquatic,
          ActivitySubtype.Observation_PlantAquatic
        ].includes(unsyncedOfflineActivities[key].record_type as ActivitySubtype)
      );

      unsyncedOfflineActivities[key].data.jurisdiction_display = (
        unsyncedOfflineActivities[key].data?.jurisdiction ?? []
      )
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

      unsyncedOfflineActivities[key].data.agency =
        listOptions?.components?.schemas[
          (value as OfflineActivityRecord).record_type
        ].properties.activity_data.properties.invasive_species_agency_code.options.find(
          (item) =>
            item.value === unsyncedOfflineActivities[key].data.form_data.activity_data.invasive_species_agency_code
        )?.label || '';

      unsyncedOfflineActivities[key].data.reported_area =
        unsyncedOfflineActivities[key].data.form_data.activity_data.reported_area;
    });
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
