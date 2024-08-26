import { DataGrid, GridCellParams, GridRenderCellParams, MuiEvent } from '@mui/x-data-grid';
import {
  MAP_WHATS_HERE_SET_HIGHLIGHTED_ACTIVITY,
  WHATS_HERE_ID_CLICKED,
  WHATS_HERE_SORT_FILTER_UPDATE
} from 'state/actions';
import WhatsHerePagination from './WhatsHerePagination';
import { Box } from '@mui/material';
import { useSelector } from 'utils/use_selector';
import { useDispatch } from 'react-redux';

export const RenderTableActivity = (props: any) => {
  const dispatch = useDispatch();
  const { authenticated, roles } = useSelector((state: any) => state.Auth);
  const whatsHere = useSelector((state) => state.Map?.whatsHere);
  // const errorContext = useContext(ErrorContext);

  const dispatchUpdatedID = (params) => {
    dispatch({
      type: MAP_WHATS_HERE_SET_HIGHLIGHTED_ACTIVITY,
      payload: {
        id: params.row.id,
        short_id: params.row.short_id
      }
    });
  };

  const MetresSquaredCell = ({ value }: GridRenderCellParams) => {
    return (
      <Box
        onMouseEnter={() => {
          dispatchUpdatedID(props.params);
        }}
      >
        {value} m&#178;
      </Box>
    );
  };

  const columns = [
    {
      field: 'short_id',
      headerName: 'Activity ID',
      minWidth: 130,
      sortable: false,
      renderCell: (params) => {
        return (
          <div
            onMouseEnter={() => {
              dispatchUpdatedID(params);
            }}
          >
            {params.value}
          </div>
        );
      }
    },
    {
      field: 'activity_type',
      headerName: 'Activity Type',
      sortable: false,
      minWidth: 110,
      renderCell: (params) => {
        return (
          <div
            onMouseEnter={() => {
              dispatchUpdatedID(params);
            }}
          >
            {params.value}
          </div>
        );
      }
    },
    {
      field: 'reported_area',
      headerName: 'Reported Area',
      minWidth: 130,
      sortable: false,
      renderCell: (params) => {
        return (
          <div
            onMouseEnter={() => {
              dispatchUpdatedID(params);
            }}
          >
            {params.value}m
          </div>
        );
      }
    },
    {
      field: 'created',
      headerName: 'Created',
      width: 250,
      sortable: false,
      renderCell: (params) => {
        return (
          <div
            onMouseEnter={() => {
              dispatchUpdatedID(params);
            }}
          >
            {params.value}
          </div>
        );
      }
    },
    {
      field: 'jurisdiction_code',
      headerName: 'Jurisdiction Code',
      width: 200,
      sortable: false,
      renderCell: (params) => {
        return (
          <div
            onMouseEnter={() => {
              dispatchUpdatedID(params);
            }}
          >
            {params.value}
          </div>
        );
      }
    },
    {
      field: 'species_code',
      headerName: 'Species Code',
      sortable: false,
      width: 200,
      renderCell: (params) => {
        return (
          <div
            onMouseEnter={() => {
              dispatchUpdatedID(params);
            }}
          >
            {params.value}
          </div>
        );
      }
    }
  ];

  const highlightActivity = async (params) => {
    const id = params.row.id;
    const short_id = params.row.short_id;
    dispatch({
      type: WHATS_HERE_ID_CLICKED,
      payload: {
        type: 'Activity',
        description: 'Activity-' + short_id,
        id: id
      }
    });
    dispatch({
      type: MAP_WHATS_HERE_SET_HIGHLIGHTED_ACTIVITY,
      payload: {
        id: params?.row?.id,
        short_id: params?.row?.short_id
      }
    });
    // activityPage(params);
  };

  return (
    <>
      {whatsHere?.section === 'invasivesbc' ? (
        <div style={{ height: '100%', minWidth: '100%', display: 'flex', flexDirection: 'column' }}>
          <DataGrid
            columns={columns}
            rows={whatsHere?.activityRows}
            hideFooterPagination
            hideFooter
            disableColumnMenu
            disableColumnFilter
            onColumnHeaderClick={(c) => {
              dispatch({ type: WHATS_HERE_SORT_FILTER_UPDATE, payload: { recordType: 'Activity', field: c.field } });
            }}
            getRowHeight={() => 'auto'}
            headerHeight={30}
            onCellClick={(params: GridCellParams, _event: MuiEvent<React.MouseEvent>) => {
              if (authenticated && roles.length > 0) {
                highlightActivity(params);
              } else {
                // errorContext.pushError({
                //   message:
                //     'InvasivesBC Access is required to view complete records. Access can be requested at the top right of the page under the Person Icon',
                //   code: 401,
                //   namespace: ''
                // });
              }
            }}
          />
          <WhatsHerePagination type="activity" />
        </div>
      ) : (
        <></>
      )}
    </>
  );
};
