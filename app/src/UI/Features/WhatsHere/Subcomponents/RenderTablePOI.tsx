import { useSelector } from 'utils/use_selector';
import { useDispatch } from 'react-redux';
import { DataGrid, GridCellParams, MuiEvent } from '@mui/x-data-grid';
import WhatsHerePagination from 'UI/Features/WhatsHere/Subcomponents/WhatsHerePagination';
import NoRowsInSearch from 'UI/Features/WhatsHere/Subcomponents/NoRowsInSearch';
import WhatsHere from 'state/actions/whatsHere/WhatsHere';
import { RecordSetType } from 'interfaces/UserRecordSet';
import { MouseEvent, TouchEvent } from 'react';
import UserSettings from 'state/actions/userSettings/UserSettings';

type PropTypes = {
  setAnchorEl: (anchorEl: HTMLElement | null) => void;
};
const RenderTablePOI = ({ setAnchorEl }: PropTypes) => {
  const dispatch = useDispatch();
  const { loggedInOrWorkingOffline } = useSelector((state) => state.Auth);
  const whatsHere = useSelector((state) => state.Map?.whatsHere);

  const dispatchUpdatedID = (params) => {
    dispatch(
      UserSettings.Map.setHoveredRecordset({
        id: params.row.id,
        geom: params.row.geometry,
        recordType: RecordSetType.IAPP
      })
    );
  };

  // don't use the tables sort or paging - there can be too many records for table to handle, control state externally via store
  const columns = [
    {
      field: 'id',
      headerName: 'IAPP ID',
      hide: true,
      flex: 0.1,
      sortable: false,
      renderCell: (params) => <div onMouseEnter={dispatchUpdatedID.bind(this, params)}>{params.value}</div>
    },
    {
      field: 'site_id',
      headerName: 'Site ID',
      sortable: false,
      flex: 0.1,
      renderCell: (params) => <div onMouseEnter={dispatchUpdatedID.bind(this, params)}>{params.value}</div>
    },
    {
      field: 'earliest_survey',
      headerName: 'Earliest Survey',
      sortable: false,
      flex: 0.15,
      renderCell: (params) => <div onMouseEnter={dispatchUpdatedID.bind(this, params)}>{params.value}</div>
    },
    {
      field: 'jurisdiction_code',
      headerName: 'Jurisdictions',
      sortable: false,
      flex: 0.4,
      renderCell: (params) => <div onMouseEnter={dispatchUpdatedID.bind(this, params)}>{params.value}</div>
    },
    {
      field: 'species_code',
      headerName: 'Species',
      sortable: false,
      flex: 0.2,
      renderCell: (params) => <div onMouseEnter={dispatchUpdatedID.bind(this, params)}>{params.value}</div>
    }
  ];

  const highlightPOI = async (params) => {
    dispatch(WhatsHere.id_clicked({ type: RecordSetType.IAPP, description: 'IAPP-' + params.id, id: params.row.id }));
  };

  return (
    <>
      {whatsHere.iappRows.length > 0 ? (
        <div>
          <DataGrid
            sx={{ overflowX: 'auto', minHeight: '318px' }}
            columns={columns}
            rows={whatsHere?.iappRows}
            hideFooterPagination
            hideFooter
            disableColumnMenu
            onColumnHeaderClick={(c) => {
              dispatch(WhatsHere.sort_filter_update(RecordSetType.IAPP, c.field));
            }}
            onCellClick={(params: GridCellParams, event: MuiEvent<MouseEvent | TouchEvent>) => {
              if (loggedInOrWorkingOffline) {
                dispatchUpdatedID(params);
                setAnchorEl(event.currentTarget as HTMLElement);
                highlightPOI(params);
              }
            }}
          />
          <WhatsHerePagination type={RecordSetType.IAPP} />
        </div>
      ) : (
        <NoRowsInSearch />
      )}
    </>
  );
};

export default RenderTablePOI;
