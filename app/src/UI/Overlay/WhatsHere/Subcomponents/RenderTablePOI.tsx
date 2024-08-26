import { useSelector } from 'utils/use_selector';
import { useDispatch } from 'react-redux';
import { DataGrid, GridCellParams, MuiEvent } from '@mui/x-data-grid';
import WhatsHerePagination from './WhatsHerePagination';
import {
  MAP_WHATS_HERE_SET_HIGHLIGHTED_IAPP,
  WHATS_HERE_ID_CLICKED,
  WHATS_HERE_SORT_FILTER_UPDATE
} from 'state/actions';
import NoRowsInSearch from './NoRowsInSearch';

export const RenderTablePOI = (props: any) => {
  const dispatch = useDispatch();
  const { authenticated, roles } = useSelector((state: any) => state.Auth);
  const whatsHere = useSelector((state: any) => state.Map?.whatsHere);

  const dispatchUpdatedID = (params) => {
    dispatch({
      type: MAP_WHATS_HERE_SET_HIGHLIGHTED_IAPP,
      payload: {
        id: params.row.site_id
      }
    });
  };

  // don't use the tables sort or paging - there can be too many records for table to handle, control state externally via store
  const columns = [
    {
      field: 'id',
      headerName: 'IAPP ID',
      hide: true,
      flex: 0.1,
      sortable: false,
      renderCell: (params) => {
        return <div onMouseEnter={dispatchUpdatedID.bind(this, params)}>{params.value}</div>;
      }
    },
    {
      field: 'site_id',
      headerName: 'Site ID',
      sortable: false,
      flex: 0.1,
      renderCell: (params) => {
        return <div onMouseEnter={dispatchUpdatedID.bind(this, params)}>{params.value}</div>;
      }
    },
    {
      field: 'earliest_survey',
      headerName: 'Earliest Survey',
      sortable: false,
      flex: 0.15,
      renderCell: (params) => {
        return <div onMouseEnter={dispatchUpdatedID.bind(this, params)}>{params.value}</div>;
      }
    },
    {
      field: 'jurisdiction_code',
      headerName: 'Jurisdictions',
      sortable: false,
      flex: 0.4,
      renderCell: (params) => {
        return <div onMouseEnter={dispatchUpdatedID.bind(this, params)}>{params.value}</div>;
      }
    },
    {
      field: 'species_code',
      headerName: 'Species',
      sortable: false,
      flex: 0.2,
      renderCell: (params) => {
        return <div onMouseEnter={dispatchUpdatedID.bind(this, params)}>{params.value}</div>;
      }
    }
  ];

  const highlightPOI = async (params) => {
    dispatch({
      type: WHATS_HERE_ID_CLICKED,
      payload: {
        type: 'IAPP',
        description: 'IAPP-' + params.id,
        id: params.row.id
      }
    });
    dispatch({
      type: MAP_WHATS_HERE_SET_HIGHLIGHTED_IAPP,
      payload: {
        id: params?.id
      }
    });
  };

  return (
    <>
      {whatsHere.iappRows.length > 0 ? (
        <div>
          <DataGrid
            columns={columns}
            rows={whatsHere?.iappRows}
            hideFooterPagination
            hideFooter
            disableColumnMenu
            onColumnHeaderClick={(c) => {
              dispatch({ type: WHATS_HERE_SORT_FILTER_UPDATE, payload: { recordType: 'IAPP', field: c.field } });
            }}
            onCellClick={(params: GridCellParams, _event: MuiEvent<React.MouseEvent>) => {
              if (authenticated && roles.length > 0) {
                highlightPOI(params);
              }
            }}
          />
          <WhatsHerePagination type="iapp" />
        </div>
      ) : (
        <NoRowsInSearch />
      )}
    </>
  );
};

export default RenderTablePOI;
