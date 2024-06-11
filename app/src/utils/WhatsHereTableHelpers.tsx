import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Table, TableBody, TableCell, TableRow } from '@mui/material';
import { DataGrid, GridCellParams, GridRenderCellParams, MuiEvent } from '@mui/x-data-grid';
import {
  MAP_WHATS_HERE_SET_HIGHLIGHTED_ACTIVITY,
  MAP_WHATS_HERE_SET_HIGHLIGHTED_IAPP,
  WHATS_HERE_ID_CLICKED,
  WHATS_HERE_PAGE_ACTIVITY,
  WHATS_HERE_PAGE_POI,
  WHATS_HERE_SORT_FILTER_UPDATE
} from 'state/actions';
import './WhatsHerePagination.css';

import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import DoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';

function WhatsHerePagination(props) {
  const dispatch = useDispatch();
  const whatsHere = useSelector((state: any) => state.Map?.whatsHere);

  let pageNumber = 0;
  let pageLimit = 5;
  let setLength = 1;
  let actionType: typeof WHATS_HERE_PAGE_ACTIVITY | typeof WHATS_HERE_PAGE_POI;
  if (whatsHere) {
    if (props.type === 'activity' && whatsHere?.activityRows && whatsHere?.activityRows.length > 0) {
      setLength = whatsHere?.ActivityIDs.length;
      actionType = WHATS_HERE_PAGE_ACTIVITY;
      pageNumber = whatsHere?.ActivityPage;
      pageLimit = whatsHere?.ActivityLimit;
    } else if (props.type === 'iapp' && whatsHere?.IAPPIDs && whatsHere?.IAPPIDs.length > 0) {
      setLength = whatsHere?.IAPPIDs.length;
      actionType = WHATS_HERE_PAGE_POI;
      pageNumber = whatsHere?.IAPPPage;
      pageLimit = whatsHere?.IAPPLimit;
    }
  }

  return (
    <div key={'pagination'} className={'whatsHere-pagination'}>
      <div key={'paginationControls'}>
        {pageNumber <= 0 ? (
          <Button disabled sx={{ m: 0, p: 0 }} size={'small'}>
            <DoubleArrowLeftIcon></DoubleArrowLeftIcon>
          </Button>
        ) : (
          <Button
            sx={{ m: 0, p: 0 }}
            size={'small'}
            onClick={(e) => {
              e.stopPropagation();
              dispatch(
                actionType({
                  page: 0,
                  limit: pageLimit
                })
              );
            }}
          >
            <DoubleArrowLeftIcon></DoubleArrowLeftIcon>
          </Button>
        )}
        {pageNumber <= 0 ? (
          <Button disabled sx={{ m: 0, p: 0 }} size={'small'}>
            <ArrowLeftIcon></ArrowLeftIcon>
          </Button>
        ) : (
          <Button
            sx={{ m: 0, p: 0 }}
            size={'small'}
            onClick={(e) => {
              e.stopPropagation();
              dispatch(
                actionType({
                  page: pageNumber - 1,
                  limit: pageLimit
                })
              );
            }}
          >
            <ArrowLeftIcon></ArrowLeftIcon>
          </Button>
        )}
        <span>
          {pageNumber + 1} / {Math.ceil(setLength / pageLimit)}
        </span>
        {(pageNumber + 1) * pageLimit >= setLength ? (
          <Button disabled sx={{ m: 0, p: 0 }} size={'small'}>
            <ArrowRightIcon></ArrowRightIcon>
          </Button>
        ) : (
          <Button
            sx={{ m: 0, p: 0 }}
            size={'small'}
            onClick={(e) => {
              e.stopPropagation();
              dispatch(
                actionType({
                  page: pageNumber + 1,
                  limit: pageLimit
                })
              );
            }}
          >
            <ArrowRightIcon></ArrowRightIcon>
          </Button>
        )}
      </div>
      <div key={'paginationRecords'}>
        <span>
          Showing records {pageLimit * (pageNumber + 1) - pageLimit + 1} -{' '}
          {setLength < pageLimit * (pageNumber + 1) ? setLength : pageLimit * (pageNumber + 1)} out of {setLength}
        </span>
      </div>
    </div>
  );
}

export const RenderTablePosition = ({ rows }) => {
  const whatsHere = useSelector((state: any) => state.Map?.whatsHere);
  return (
    <>
      {whatsHere?.section === 'position' ? (
        <Table>
          <TableBody>
            {rows &&
              rows?.map((row) => (
                <TableRow key={row.name}>
                  <TableCell component="th" scope="row">
                    {row.name}
                  </TableCell>
                  <TableCell align="right">{row.value}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      ) : (
        <></>
      )}
    </>
  );
};

export const RenderTableActivity = (props: any) => {
  const dispatch = useDispatch();
  const { authenticated, roles } = useSelector((state: any) => state.Auth);
  const whatsHere = useSelector((state: any) => state.Map?.whatsHere);
  // const errorContext = useContext(ErrorContext);

  const dispatchUpdatedID = (params) => {
    dispatch(
      MAP_WHATS_HERE_SET_HIGHLIGHTED_ACTIVITY({
        id: params.row.id,
        short_id: params.row.short_id
      })
    );
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
    dispatch(
      WHATS_HERE_ID_CLICKED({
        type: 'Activity',
        description: 'Activity-' + short_id,
        id: id
      })
    );
    dispatch(
      MAP_WHATS_HERE_SET_HIGHLIGHTED_ACTIVITY({
        id: params?.row?.id,
        short_id: params?.row?.short_id
      })
    );
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
              dispatch(WHATS_HERE_SORT_FILTER_UPDATE({ recordType: 'Activity', field: c.field }));
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
          <WhatsHerePagination type="activity"></WhatsHerePagination>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export const RenderTablePOI = (props: any) => {
  const dispatch = useDispatch();
  const { authenticated, roles } = useSelector((state: any) => state.Auth);
  const whatsHere = useSelector((state: any) => state.Map?.whatsHere);
  // const errorContext = useContext(ErrorContext);

  const dispatchUpdatedID = (params) => {
    dispatch(
      MAP_WHATS_HERE_SET_HIGHLIGHTED_IAPP({
        id: params.row.site_id
      })
    );
  };

  // don't use the tables sort or paging - there can be too many records for table to handle, control state externally via store
  const columns = [
    {
      field: 'id',
      headerName: 'IAPP ID',
      hide: true,
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
      field: 'site_id',
      headerName: 'Site ID',
      sortable: false,

      width: 70,
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
    /*{
      field: 'reported_area',
      headerName: 'Reported Area',
      sortable: false,
      minWidth: 115,
      renderCell: (params) => {
        return (
          <div
            onMouseEnter={() => {
              dispatchUpdatedID(params);
            }}>
            {params.value}
          </div>
        );
      }
    },*/
    {
      field: 'earliest_survey',
      headerName: 'Earliest Survey',
      sortable: false,
      minWidth: 115,
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
      headerName: 'Jurisdictions',
      sortable: false,
      width: 500,
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
      headerName: 'Species',
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

  const highlightPOI = async (params) => {
    dispatch(
      WHATS_HERE_ID_CLICKED({
        type: 'IAPP',
        description: 'IAPP-' + params.id,
        id: params.row.id
      })
    );
    dispatch(
      MAP_WHATS_HERE_SET_HIGHLIGHTED_IAPP({
        id: params?.id
      })
    );
  };

  return (
    <>
      {whatsHere?.section === 'iapp' ? (
        <div style={{ height: '100%', minWidth: '100%', display: 'flex', flexDirection: 'column' }}>
          <DataGrid
            columns={columns}
            rows={whatsHere?.iappRows}
            hideFooterPagination
            hideFooter
            disableColumnMenu
            getRowHeight={() => 'auto'}
            headerHeight={30}
            onColumnHeaderClick={(c) => {
              dispatch(WHATS_HERE_SORT_FILTER_UPDATE({ recordType: 'IAPP', field: c.field }));
            }}
            onCellClick={(params: GridCellParams, _event: MuiEvent<React.MouseEvent>) => {
              if (authenticated && roles.length > 0) {
                highlightPOI(params);
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
          <WhatsHerePagination type="iapp"></WhatsHerePagination>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};
