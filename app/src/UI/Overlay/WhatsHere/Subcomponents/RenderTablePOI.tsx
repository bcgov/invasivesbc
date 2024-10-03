import { useSelector } from 'utils/use_selector';
import { useDispatch } from 'react-redux';
import { DataGrid, GridCellParams, MuiEvent } from '@mui/x-data-grid';
import WhatsHerePagination from './WhatsHerePagination';
import NoRowsInSearch from './NoRowsInSearch';
import WhatsHere from 'state/actions/whatsHere/WhatsHere';
import { RecordSetType } from 'interfaces/UserRecordSet';

const RenderTablePOI = (props: any) => {
  const dispatch = useDispatch();
  const { authenticated, roles } = useSelector((state: any) => state.Auth);
  const whatsHere = useSelector((state: any) => state.Map?.whatsHere);

  const dispatchUpdatedID = (params) => {
    dispatch(WhatsHere.set_highlighted_iapp(params.row.site_id));
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
    dispatch(WhatsHere.set_highlighted_iapp(params?.id));
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
            onCellClick={(params: GridCellParams, _event: MuiEvent<React.MouseEvent>) => {
              if (authenticated && roles.length > 0) {
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
