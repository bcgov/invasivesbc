import WhatsHerePagination from 'UI/Features/WhatsHere/Subcomponents/WhatsHerePagination';
import { useSelector } from 'utils/use_selector';
import { useDispatch } from 'react-redux';
import NoRowsInSearch from 'UI/Features/WhatsHere/Subcomponents/NoRowsInSearch';
import { RecordSetType } from 'interfaces/UserRecordSet';
import { Fragment, MouseEvent, TouchEvent, useState } from 'react';
import UserSettings from 'state/actions/userSettings/UserSettings';
import CustomPopover from 'UI/Reusable/CustomPopover/CustomPopover';
import RecordTablePopoverContent from 'UI/Features/Records/RecordSet/RecordTablePopoverContent/RecordTablePopoverContent';
import StyledTable from 'UI/Reusable/StyledTable/StyledTable';

type PropTypes = {
  recordsetType: RecordSetType;
};

const TabularWhatsHereData = ({ recordsetType }: PropTypes) => {
  const dispatch = useDispatch();
  const whatsHere = useSelector((state) => state.Map?.whatsHere);
  const { loggedInOrWorkingOffline } = useSelector((state) => state.Auth);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [activeRecord, setActiveRecord] = useState<{ readableIdentifier: string; id: string }>();

  const handleCellClick = (e: MouseEvent | TouchEvent, row) => {
    if (!loggedInOrWorkingOffline) return;
    dispatchUpdatedID(row);
    setAnchorEl(e.currentTarget as HTMLElement);
  };
  const dispatchUpdatedID = (params) => {
    const { id, readableId } = config[recordsetType];
    const payload = {
      recordType: recordsetType,
      id: params[id],
      geom: params.geometry,
      readableIdentifier: params[readableId]
    };
    setActiveRecord(payload);
    dispatch(UserSettings.Map.setHoveredRecordset(payload));
  };
  const config = {
    [RecordSetType.Activity]: {
      id: 'id',
      readableId: 'short_id',
      rows: whatsHere.activityRows,
      cols: [
        { field: 'short_id', headerName: 'Record ID' },
        { field: 'activity_type', headerName: 'Type' },
        { field: 'reported_area', headerName: 'Area' },
        { field: 'created', headerName: 'Date' },
        { field: 'jurisdiction_code', headerName: 'Jurisdiction(s)' },
        { field: 'species_positive_full', headerName: 'Species Positive' },
        { field: 'species_negative_full', headerName: 'Species Negative' },
        { field: 'species_treated_full', headerName: 'Species Treated' },
        { field: 'created_by', headerName: 'Created By' }
      ]
    },
    [RecordSetType.IAPP]: {
      id: 'site_id',
      readableId: 'site_id',
      rows: whatsHere.iappRows,
      cols: [
        { field: 'site_id', headerName: 'Site ID' },
        { field: 'earliest_survey', headerName: 'Earliest Survey' },
        { field: 'jurisdiction_code', headerName: 'Jurisdictions' },
        { field: 'species_code', headerName: 'Species Code' }
      ]
    }
  };
  if (config[recordsetType].rows.length === 0) {
    return <NoRowsInSearch />;
  }
  return (
    <Fragment>
      <CustomPopover buttonOverrideOptions={{ anchorEl, setAnchorEl }}>
        <RecordTablePopoverContent
          recordDisplayId={activeRecord?.readableIdentifier ?? ''}
          recordType={recordsetType}
          recordLookupId={activeRecord?.id ?? ''}
        />
      </CustomPopover>
      <StyledTable>
        <thead>
          <tr>
            {config[recordsetType].cols.map(({ headerName }) => (
              <th key={headerName}>{headerName}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {config[recordsetType].rows.map((r) => (
            <tr key={r?.[config[recordsetType].id]} onMouseOver={() => dispatchUpdatedID(r)}>
              {config[recordsetType].cols.map(({ field }) => (
                <td key={field} onClick={(e) => handleCellClick(e, r)}>
                  {r?.[field] ?? <div className="null-value" />}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </StyledTable>
      <WhatsHerePagination type={recordsetType} />
    </Fragment>
  );
};

export default TabularWhatsHereData;
