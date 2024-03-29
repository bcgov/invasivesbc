import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Theme
} from '@mui/material';
import { createStyles, withStyles } from '@mui/styles';
import { useDataAccess } from 'hooks/useDataAccess';
import React, { useEffect, useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { DataGrid, GridCellParams, GridRenderCellParams, MuiEvent } from '@mui/x-data-grid';
import {
  getJurisdictions,
  getLatestReportedArea,
  getReportedAreaOutput
} from 'components/points-of-interest/IAPP/IAPP-Functions';
import { useSelector } from '../../../../state/utilities/use_selector';
import { selectAuth } from '../../../../state/reducers/auth';
import { ErrorContext } from 'contexts/ErrorContext';
import { selectMap } from 'state/reducers/map';
import {
  MAP_SET_WHATS_HERE_PAGE_LIMIT,
  MAP_WHATS_HERE_SET_HIGHLIGHTED_ACTIVITY,
  MAP_WHATS_HERE_SET_HIGHLIGHTED_IAPP,
  USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST,
  USER_SETTINGS_SET_ACTIVE_IAPP_REQUEST,
  WHATS_HERE_PAGE_ACTIVITY,
  WHATS_HERE_PAGE_POI,
  WHATS_HERE_SORT_FILTER_UPDATE
} from 'state/actions';
import { useDispatch } from 'react-redux';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import DoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';

const CreateTableHead = ({ labels }) => {
  return (
    <TableHead>
      <StyledTableRow>
        {labels.map((label) => (
          <StyledTableCell>{label}</StyledTableCell>
        ))}
      </StyledTableRow>
    </TableHead>
  );
};

const CreateEmptyRows = ({ emptyRows }) => {
  return (
    <StyledTableRow style={{ height: 34 * emptyRows }}>
      <StyledTableCell colSpan={6} />
    </StyledTableRow>
  );
};

const CreateTableFooter = ({ records, rowsPerPage, page, handleChangePage, handleChangeRowsPerPage }) => {
  return (
    <TableFooter>
      <TableRow>
        <TablePagination
          count={records?.length}
          rowsPerPageOptions={[5]}
          rowsPerPage={rowsPerPage}
          page={page}
          SelectProps={{
            inputProps: { 'aria-label': 'rows per page' },
            native: true
          }}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableRow>
    </TableFooter>
  );
};

function WhatsHerePagination(props) {
  const dispatch = useDispatch();
  const mapState = useSelector(selectMap);
  let pageNumber = 0;
  let pageLimit = 5;
  let setLength = 1;
  let actionType = '';
  if (mapState?.whatsHere) {
    if (
      props.type === 'activity' &&
      mapState?.whatsHere?.activityRows &&
      mapState?.whatsHere?.activityRows.length > 0
    ) {
      setLength = mapState?.whatsHere?.ActivityIDs.length;
      actionType = WHATS_HERE_PAGE_ACTIVITY;
      pageNumber = mapState?.whatsHere?.ActivityPage;
      pageLimit = mapState?.whatsHere?.ActivityLimit;
    } else if (props.type === 'iapp' && mapState?.whatsHere?.IAPPIDs && mapState?.whatsHere?.IAPPIDs.length > 0) {
      setLength = mapState?.whatsHere?.IAPPIDs.length;
      actionType = WHATS_HERE_PAGE_POI;
      pageNumber = mapState?.whatsHere?.IAPPPage;
      pageLimit = mapState?.whatsHere?.IAPPLimit;
    }
  }

  return (
    <div key={'pagination'}>
      <div key={'paginationControls'}>
        {pageNumber <= 0 ? (
          <Button disabled sx={{ m: 0, p: 0 }} size={'small'}>
            <DoubleArrowLeftIcon></DoubleArrowLeftIcon>
          </Button>
        ) : (
          <Button
            sx={{ m: 1, p: 1 }}
            size={'small'}
            onClick={(e) => {
              e.stopPropagation();
              dispatch({
                type: actionType,
                payload: {
                  page: 0,
                  limit: pageLimit
                }
              });
            }}>
            <DoubleArrowLeftIcon></DoubleArrowLeftIcon>
          </Button>
        )}
        {pageNumber <= 0 ? (
          <Button disabled sx={{ m: 0, p: 0 }} size={'small'}>
            <ArrowLeftIcon></ArrowLeftIcon>
          </Button>
        ) : (
          <Button
            sx={{ m: 1, p: 1 }}
            size={'small'}
            onClick={(e) => {
              e.stopPropagation();
              dispatch({
                type: actionType,
                payload: {
                  page: pageNumber - 1,
                  limit: pageLimit
                }
              });
            }}>
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
            sx={{ m: 1, p: 1 }}
            size={'small'}
            onClick={(e) => {
              e.stopPropagation();
              dispatch({
                type: actionType,
                payload: {
                  page: pageNumber + 1,
                  limit: pageLimit
                }
              });
            }}>
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

export const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    body: {
      fontSize: 12,
      textAlign: 'left',
      width: 100
    }
  })
)(TableCell);

export const StyledTableRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover
      }
    }
  })
)(TableRow);

export const createDataUTM = (name: string, value: any) => {
  return { name, value };
};

export const RenderTablePosition = ({ rows }) => {
  const mapState = useSelector(selectMap);
  return (
    <>
      {mapState?.whatsHere?.section === "position" ? 
        <TableBody>
          {rows &&
            rows?.map((row) => (
              <StyledTableRow key={row.name}>
                <StyledTableCell style={{ width: 250 }} component="th" scope="row">
                  {row.name}
                </StyledTableCell>
                <StyledTableCell style={{ width: 250 }}>{row.value}</StyledTableCell>
              </StyledTableRow>
            ))}
        </TableBody>
      :
        <></>
      }
    </>
  );
};

export const RenderTableActivity = (props: any) => {
  const dataAccess = useDataAccess();
  const history = useHistory();
  const dispatch = useDispatch();
  const { authenticated, roles } = useSelector(selectAuth);
  const mapState = useSelector(selectMap);
  const errorContext = useContext(ErrorContext);

  const dispatchUpdatedID = (params) => {
    dispatch({
      type: MAP_WHATS_HERE_SET_HIGHLIGHTED_ACTIVITY,
      payload: {
        id: params.value,
      }
    });
  }

  const MetresSquaredCell = ({ value }: GridRenderCellParams) => {
    return <Box>{value} m&#178;</Box>;
  };

  const columns = [
    {
      field: 'id',
      headerName: 'Activity ID',
      hide: true,
      sortable: false,
    },
    {
      field: 'short_id',
      headerName: 'Activity ID',
      minWidth: 130,
      sortable: false,
      renderCell: (params) => {
        return (
          <div
            onMouseEnter={() => {
              dispatchUpdatedID(params)
            }}>
            {params.value}
          </div>
        );
      }
    },
    {
      field: 'activity_type',
      headerName: 'Activity Type',
      sortable: false,
      minWidth: 110
    },
    {
      field: 'reported_area',
      headerName: 'Reported Area',
      minWidth: 130,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => <MetresSquaredCell {...params} />
    },
    {
      field: 'created',
      headerName: 'Created',
      width: 200,
      sortable: false,
    },
    {
      field: 'jurisdiction_code',
      headerName: 'Jurisdiction Code',
      width: 200,
      sortable: false,
    },
    {
      field: 'species_code',
      headerName: 'Species Code',
      sortable: false,
      width: 200
    },
    {
      field: 'geometry',
      headerName: 'Geometry',
      sortable: false,
      hide: true
    }
  ];

  const activityPage = async (params) => {
    const id = params.row.id;
    const short_id = params.row.short_id;
    dispatch({
      type: USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST,
      payload: {
        description: 'Activity-' + short_id,
        id: id
      }
    });
    history.push({ pathname: `/home/activity` });
  };

  return (
    <>
      {mapState?.whatsHere?.section === "invasivesbc" ? 
        <div style={{ height: 300, minWidth: '100%', display: 'flex', flexDirection: 'column' }}>
          <DataGrid
            columns={columns}
            rows={mapState?.whatsHere?.activityRows}
            hideFooterPagination
            hideFooter
            disableColumnMenu
            disableColumnFilter
            
            onColumnHeaderClick={((c) => {
              dispatch({type: WHATS_HERE_SORT_FILTER_UPDATE, payload: {recordType: 'Activity', field: c.field}})
            })}
            getRowHeight={() => 'auto'}
            headerHeight={30}
            onCellClick={(params: GridCellParams, _event: MuiEvent<React.MouseEvent>) => {
              if (authenticated && roles.length > 0) {
                activityPage(params);
              } else {
                errorContext.pushError({
                  message:
                    'InvasivesBC Access is required to view complete records. Access can be requested at the top right of the page under the Person Icon',
                  code: 401,
                  namespace: ''
                });
              }
            }}
          />
          <WhatsHerePagination type="activity"></WhatsHerePagination>
        </div>
      :
      <></>
    }
    </>
  );
};

export const RenderTableDataBC = ({ rows }) => {
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows?.length - page * rowsPerPage);

  const labels = ['AQUIFER ID', 'Coordinates   ', 'Street Address'];

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Table padding="none" size="small">
      <CreateTableHead labels={labels} />
      <TableBody>
        <>
          {(rowsPerPage > 0 ? rows?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : rows).map((row) => (
            <>
              <StyledTableRow key={row?.properties.WELL_TAG_NUMBER}>
                <StyledTableCell style={{ width: 51 }} component="th" scope="row">
                  {row.properties.AQUIFER_ID}
                </StyledTableCell>
                <StyledTableCell style={{ width: 150 }}>
                  {row.geometry.coordinates[0].toFixed(2)}, {row.geometry.coordinates[1].toFixed(2)}
                  <></>
                </StyledTableCell>
                <StyledTableCell style={{ width: 150 }}>{row.properties.STREET_ADDRESS}</StyledTableCell>
              </StyledTableRow>
            </>
          ))}
        </>
        {emptyRows > 0 && <CreateEmptyRows emptyRows={emptyRows} />}
        <CreateTableFooter
          records={rows}
          rowsPerPage={rowsPerPage}
          page={page}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </TableBody>
    </Table>
  );
};

export const RenderTablePOI = (props: any) => {
  const { bufferedGeo } = props;
  const dispatch = useDispatch();
  const history = useHistory();
  const { authenticated, roles } = useSelector(selectAuth);
  const mapState = useSelector(selectMap);
  const errorContext = useContext(ErrorContext);
  // const [columns, setColumns] = useState(null);

  const dispatchUpdatedID = (params) => {
                dispatch({
                  type: MAP_WHATS_HERE_SET_HIGHLIGHTED_IAPP,
                  payload: {
                    id: params.value,
                  }
                });
  }

  // don't use the tables sort or paging - there can be too many records for table to handle, control state externally via store
    let columns = [
      {
        field: 'id',
        headerName: 'IAPP ID',
        hide: true,
        sortable: false,
        
      },
      {
        field: 'site_id',
        headerName: 'IAPP ID',
        sortable: false,
        
        width: 70,
        renderCell: (params) => {
          return (
            <div
              onMouseEnter={() => {
                dispatchUpdatedID(params)
              }}>
              {params.value}
            </div>
          );
        }
      },
      {
        field: 'reported_area',
        headerName: 'Reported Area',
        sortable: false,
        minWidth: 115
      },
      {
        field: 'earliest_survey',
        headerName: 'Earliest Survey',
        sortable: false,
        minWidth: 115
      },
      {
        field: 'jurisdiction_code',
        headerName: 'Jurisdictions',
        sortable: false,
        width: 200
      },
      {
        field: 'species_code',
        headerName: 'Species',
        sortable: false,
        width: 120
      },
      {
        field: 'geometry',
        headerName: 'Geometry',
        sortable: false,
        hide: true
      }
    ];

  return (
    <>
      {mapState?.whatsHere?.section === "iapp" ? 
        <div style={{ height: 300, minWidth: '100%', display: 'flex', flexDirection: 'column' }}>
          <DataGrid
            columns={columns}
            rows={mapState?.whatsHere?.iappRows}
            hideFooterPagination
            hideFooter
            disableColumnMenu
            getRowHeight={() => 'auto'}
            headerHeight={30}
            onColumnHeaderClick={((c) => {
              dispatch({type: WHATS_HERE_SORT_FILTER_UPDATE, payload: {recordType: 'IAPP', field: c.field}})
            })}
            onCellClick={(params: GridCellParams, _event: MuiEvent<React.MouseEvent>) => {
              dispatch({
                type: USER_SETTINGS_SET_ACTIVE_IAPP_REQUEST,
                payload: {
                  description: 'IAPP-' + params.id,
                  id: params.id
                }
              });
              if (authenticated && roles.length > 0) {
                history.push(`/home/iapp/`);
              } else {
                errorContext.pushError({
                  message:
                    'InvasivesBC Access is required to view complete records. Access can be requested at the top right of the page under the Person Icon',
                  code: 401,
                  namespace: ''
                });
              }
            }}
          />
          <WhatsHerePagination type="iapp"></WhatsHerePagination>
        </div>
      :
        <></>
      }
    </>
  );
};
