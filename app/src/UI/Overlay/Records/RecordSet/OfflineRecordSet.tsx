import { useDispatch } from 'react-redux';
import './RecordSet.css';
import { useHistory } from 'react-router';
import { Button } from '@mui/material';

import RecordSetFooter from './RecordSetFooter';
import { useSelector } from 'utils/use_selector';
import { RecordSetType } from 'interfaces/UserRecordSet';
import { OfflineActivityRecord, OfflineActivitySyncState, selectOfflineActivity } from 'state/reducers/offlineActivity';
import { offlineActivityColumnsToDisplay } from './RecordTableHelpers';
import { USER_HOVERED_RECORD } from 'state/actions';
import UserRecord from 'interfaces/UserRecord';
import { transformOfflineActivitiesForRecordTable } from 'utils/addActivity';
import CustomPopover from 'UI/CustomPopover/CustomPopover';
import RecordTablePopoverContent from './RecordTablePopoverContent/RecordTablePopoverContent';
import { MouseEvent, TouchEvent, useState } from 'react';

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
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [recordDisplayId, setRecordDisplayId] = useState<string>('');
  const [recordLookupId, setRecordLookupId] = useState<string>('');

  const handlePopoverOpen = (evt: MouseEvent<any> | TouchEvent<any>, row: UserRecord) => {
    setRecordDisplayId((row.short_id as string) ?? '');
    setRecordLookupId((row.activity_id as string) ?? '');
    setAnchorEl(evt.currentTarget);
  };

  const offlineDocs = useSelector((state) => state.UserSettings.offlineDocs);
  const listOptions = offlineDocs[0]?.apiDocsWithViewOptions;

  const history = useHistory();
  const dispatch = useDispatch();

  const onClickBackButton = () => {
    history.push('/Records');
  };

  const recordSet = useSelector((state) => state.UserSettings?.recordSets?.[setID]);
  const recordTable = useSelector((state) => state.Map.recordTables?.[setID]);
  const { serializedActivities } = useSelector(selectOfflineActivity);

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
    console.error(error);
  }

  return (
    <>
      <CustomPopover buttonOverrideOptions={{ anchorEl, setAnchorEl }}>
        <RecordTablePopoverContent
          recordDisplayId={recordDisplayId}
          recordLookupId={recordLookupId}
          recordType={RecordSetType.Activity}
        />
      </CustomPopover>
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
                    {offlineActivityColumnsToDisplay.map((col) => (
                      <th className={'record_table_header_column'} key={col.key}>
                        {col.name}
                      </th>
                    ))}
                  </tr>
                  {Object.values(unsyncedOfflineActivities).map(({ data }) => (
                    <tr
                      onContextMenu={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                      onMouseOver={() => onUserHoveredRecord(data)}
                      onFocus={() => onUserHoveredRecord(data)}
                      className="record_table_row"
                      key={data?.activity_id}
                    >
                      {offlineActivityColumnsToDisplay.map((col) => (
                        <td
                          className="record_table_row_column"
                          key={col.key + col.name}
                          onClick={(evt) => handlePopoverOpen(evt, data)}
                        >
                          {data[col.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      <RecordSetFooter recordSet={recordSet} />
    </>
  );
};
