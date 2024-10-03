import { DataGrid, GridRowParams, MuiEvent } from '@mui/x-data-grid';
import WhatsHerePagination from './WhatsHerePagination';
import { useSelector } from 'utils/use_selector';
import { useDispatch } from 'react-redux';
import NoRowsInSearch from './NoRowsInSearch';
import WhatsHere from 'state/actions/whatsHere/WhatsHere';
import { RecordSetType } from 'interfaces/UserRecordSet';

const RenderTableActivity = () => {
  const dispatch = useDispatch();
  const { authenticated, roles } = useSelector((state) => state.Auth);
  const whatsHere = useSelector((state) => state.Map?.whatsHere);

  const dispatchUpdatedID = (params) => {
    const { id, short_id } = params.row;
    dispatch(WhatsHere.set_highlighted_activity(id, short_id));
  };

  const columns = [
    {
      field: 'short_id',
      headerName: 'Activity ID',
      flex: 0.2,
      sortable: false,
      renderCell: (params) => <div onMouseEnter={dispatchUpdatedID.bind(this, params)}>{params.value}</div>
    },
    {
      field: 'activity_type',
      headerName: 'Activity Type',
      sortable: false,
      flex: 0.2,
      renderCell: (params) => <div onMouseEnter={dispatchUpdatedID.bind(this, params)}>{params.value}</div>
    },
    {
      field: 'reported_area',
      headerName: 'Reported Area',
      flex: 0.2,
      sortable: false,
      renderCell: (params) => {
        return (
          <div onMouseEnter={dispatchUpdatedID.bind(this, params)}>
            {params.value}
            {'m\u00B2'}
          </div>
        );
      }
    },
    {
      field: 'created',
      headerName: 'Created',
      flex: 0.25,
      sortable: false,
      renderCell: (params) => <div onMouseEnter={dispatchUpdatedID.bind(this, params)}>{params.value}</div>
    },
    {
      field: 'jurisdiction_code',
      headerName: 'Jurisdiction Code',
      flex: 0.4,
      sortable: false,
      renderCell: (params) => <div onMouseEnter={dispatchUpdatedID.bind(this, params)}>{params.value}</div>
    },
    {
      field: 'species_code',
      headerName: 'Species Code',
      sortable: false,
      flex: 0.3,
      renderCell: (params) => <div onMouseEnter={dispatchUpdatedID.bind(this, params)}>{params.value}</div>
    }
  ];

  const highlightActivity = async (params) => {
    const { id, short_id } = params.row;
    dispatch(WhatsHere.id_clicked({ type: RecordSetType.Activity, description: 'Activity-' + short_id, id }));
    dispatch(WhatsHere.set_highlighted_activity(id, short_id));
  };

  return (
    <div>
      {whatsHere.activityRows.length > 0 ? (
        <>
          <DataGrid
            sx={{ overflowX: 'auto', minHeight: '318px' }}
            columns={columns}
            rows={whatsHere?.activityRows}
            hideFooterPagination
            hideFooter
            disableColumnMenu
            disableColumnFilter
            onColumnHeaderClick={(c) => {
              dispatch(WhatsHere.sort_filter_update(RecordSetType.Activity, c.field));
            }}
            onRowClick={(params: GridRowParams, _event: MuiEvent<React.MouseEvent>) => {
              if (authenticated && roles.length > 0) {
                highlightActivity(params);
              }
            }}
          />
          <WhatsHerePagination type={RecordSetType.Activity} />
        </>
      ) : (
        <NoRowsInSearch />
      )}
    </div>
  );
};

export default RenderTableActivity;
