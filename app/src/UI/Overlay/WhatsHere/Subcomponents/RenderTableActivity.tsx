import { DataGrid, GridRowParams, MuiEvent } from '@mui/x-data-grid';
import {
  MAP_WHATS_HERE_SET_HIGHLIGHTED_ACTIVITY,
  WHATS_HERE_ID_CLICKED,
  WHATS_HERE_SORT_FILTER_UPDATE
} from 'state/actions';
import WhatsHerePagination from './WhatsHerePagination';
import { useSelector } from 'utils/use_selector';
import { useDispatch } from 'react-redux';
import NoRowsInSearch from './NoRowsInSearch';

const RenderTableActivity = () => {
  const dispatch = useDispatch();
  const { authenticated, roles } = useSelector((state) => state.Auth);
  const whatsHere = useSelector((state) => state.Map?.whatsHere);

  const dispatchUpdatedID = (params) => {
    const { id, short_id } = params.row;
    dispatch({
      type: MAP_WHATS_HERE_SET_HIGHLIGHTED_ACTIVITY,
      payload: { id, short_id }
    });
  };

  const columns = [
    {
      field: 'short_id',
      headerName: 'Activity ID',
      flex: 0.2,
      sortable: false,
      renderCell: (params) => {
        return <div onMouseEnter={dispatchUpdatedID.bind(this, params)}>{params.value}</div>;
      }
    },
    {
      field: 'activity_type',
      headerName: 'Activity Type',
      sortable: false,
      flex: 0.2,
      renderCell: (params) => {
        return <div onMouseEnter={dispatchUpdatedID.bind(this, params)}>{params.value}</div>;
      }
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
      renderCell: (params) => {
        return <div onMouseEnter={dispatchUpdatedID.bind(this, params)}>{params.value}</div>;
      }
    },
    {
      field: 'jurisdiction_code',
      headerName: 'Jurisdiction Code',
      flex: 0.4,
      sortable: false,
      renderCell: (params) => {
        return <div onMouseEnter={dispatchUpdatedID.bind(this, params)}>{params.value}</div>;
      }
    },
    {
      field: 'species_code',
      headerName: 'Species Code',
      sortable: false,
      flex: 0.3,
      renderCell: (params) => {
        return <div onMouseEnter={dispatchUpdatedID.bind(this, params)}>{params.value}</div>;
      }
    }
  ];

  const highlightActivity = async (params) => {
    const { id, short_id } = params.row;
    dispatch({
      type: WHATS_HERE_ID_CLICKED,
      payload: {
        type: 'Activity',
        description: 'Activity-' + short_id,
        id
      }
    });
    dispatch({
      type: MAP_WHATS_HERE_SET_HIGHLIGHTED_ACTIVITY,
      payload: { id, short_id }
    });
  };

  return (
    <div>
      {whatsHere.activityRows.length > 0 ? (
        <>
          <DataGrid
            sx={{ overflowX: 'auto' }}
            columns={columns}
            rows={whatsHere?.activityRows}
            hideFooterPagination
            hideFooter
            disableColumnMenu
            disableColumnFilter
            onColumnHeaderClick={(c) => {
              dispatch({
                type: WHATS_HERE_SORT_FILTER_UPDATE,
                payload: { recordType: 'Activity', field: c.field }
              });
            }}
            onRowClick={(params: GridRowParams, _event: MuiEvent<React.MouseEvent>) => {
              if (authenticated && roles.length > 0) {
                highlightActivity(params);
              }
            }}
          />
          <WhatsHerePagination type="activity" />
        </>
      ) : (
        <NoRowsInSearch />
      )}
    </div>
  );
};

export default RenderTableActivity;
