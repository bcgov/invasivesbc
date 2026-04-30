import WhatsHerePagination from 'UI/Features/WhatsHere/Subcomponents/WhatsHerePagination';
import { useSelector } from 'utils/use_selector';
import { useDispatch } from 'react-redux';
import NoRowsInSearch from 'UI/Features/WhatsHere/Subcomponents/NoRowsInSearch';
import WhatsHere from 'state/actions/whatsHere/WhatsHere';
import { RecordSetType } from 'interfaces/UserRecordSet';
import { MouseEvent, TouchEvent } from 'react';
import UserSettings from 'state/actions/userSettings/UserSettings';

type PropTypes = {
  setAnchorEl: (anchorEl: HTMLElement | null) => void;
  recordsetType: RecordSetType;
};

const TabularWhatsHereData = ({ setAnchorEl, recordsetType }: PropTypes) => {
  const dispatch = useDispatch();
  const { loggedInOrWorkingOffline } = useSelector((state) => state.Auth);
  const whatsHere = useSelector((state) => state.Map?.whatsHere);

  const handleCellClick = (e: MouseEvent | TouchEvent, row) => {
    if (loggedInOrWorkingOffline) {
      dispatchUpdatedID(row);
      setAnchorEl(e.currentTarget as HTMLElement);
      highlightGeometry(row);
    }
  };

  const dispatchUpdatedID = (params) => {
    const { id, readableId } = config[recordsetType];
    dispatch(
      UserSettings.Map.setHoveredRecordset({
        id: params[id],
        geom: params.geometry,
        recordType: recordsetType,
        readableIdentifier: params[readableId]
      })
    );
  };

  const highlightGeometry = async (params) => {
    const { id, readableId } = config[recordsetType];
    dispatch(WhatsHere.id_clicked({ type: recordsetType, description: params[readableId], id: params[id] }));
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
        { field: 'species_code', headerName: 'Invasive Plant(s)' },
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
  console.log(config[recordsetType].rows);
  return (
    <>
      <div className="whats-here-table-container">
        <table className={recordsetType}>
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
                    {r?.[field]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <WhatsHerePagination type={recordsetType} />
    </>
  );
};

export default TabularWhatsHereData;
