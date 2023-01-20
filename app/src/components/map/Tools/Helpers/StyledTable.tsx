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
  MAP_WHATS_HERE_SET_HIGHLIGHTED_IAPP,
  USER_SETTINGS_SET_ACTIVE_IAPP_REQUEST
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
  const pageNumber = mapState?.whatsHere && mapState?.whatsHere?.page ? mapState?.whatsHere?.page : 0;
  const pageLimit = mapState?.whatsHere && mapState?.whatsHere?.limit ? mapState?.whatsHere?.limit : 20;
  let setLength = 1;
  if (mapState?.whatsHere) {
    if (
      props.type === 'activity' &&
      mapState?.whatsHere?.activityRows &&
      mapState?.whatsHere?.activityRows.length > 0
    ) {
      setLength = mapState?.whatsHere?.activityRows.length;
    } else if (props.type === 'iapp' && mapState?.whatsHere?.iappRows && mapState?.whatsHere?.iappRows.length > 0) {
      setLength = mapState?.whatsHere?.iappRows.length;
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
                type: MAP_SET_WHATS_HERE_PAGE_LIMIT,
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
                type: MAP_SET_WHATS_HERE_PAGE_LIMIT,
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
                type: MAP_SET_WHATS_HERE_PAGE_LIMIT,
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
  return (
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
  );
};

export const RenderTableActivity = (props: any) => {
  const { bufferedGeo } = props;
  const dataAccess = useDataAccess();
  // Removed for now:
  // const invasivesAccess = useInvasivesApi();
  // const [response, setResponse] = useState(null);
  const [rows, setRows] = useState([]);
  const history = useHistory();
  const { authenticated, roles } = useSelector(selectAuth);
  const mapState = useSelector(selectMap);
  const errorContext = useContext(ErrorContext);

  const MetresSquaredCell = ({ value }: GridRenderCellParams) => {
    return <Box>{value} m&#178;</Box>;
  };

  const columns = [
    {
      field: 'id',
      headerName: 'Activity ID',
      hide: true
    },
    {
      field: 'short_id',
      headerName: 'Activity ID',
      minWidth: 80
    },
    {
      field: 'activity_type',
      headerName: 'Activity Type',
      minWidth: 110
    },
    {
      field: 'reported_area',
      headerName: 'Reported Area',
      minWidth: 130,
      renderCell: (params: GridRenderCellParams) => <MetresSquaredCell {...params} />
    },
    {
      field: 'jurisdiction_code',
      headerName: 'Jurisdiction Code',
      width: 200
    },
    {
      field: 'species_code',
      headerName: 'Species Code',
      width: 200
    },
    {
      field: 'geometry',
      headerName: 'Geometry',
      hide: true
    }
  ];

  useEffect(() => {
    updateActivityRecords();
  }, [bufferedGeo]);

  // Don't know if needed anymore?
  // Maybe associated with mobile?
  // useEffect(() => {
  //   const getApiSpec = async () => {
  //     setResponse(await invasivesAccess.getCachedApiSpec());
  //   };
  //   if (authenticated) {
  //     getApiSpec();
  //   }
  // }, [rows, authenticated]);

  const updateActivityRecords = React.useCallback(async () => {
    try {
      const arr = [];
      const startRecord = mapState?.whatsHere?.limit * (mapState?.whatsHere?.page + 1) - mapState?.whatsHere?.limit;
      const endRecord = mapState?.whatsHere?.limit * (mapState?.whatsHere?.page + 1);

      for (let i = startRecord; i < endRecord && i < mapState?.whatsHere?.activityRows?.length; i++) {
        const id = mapState?.whatsHere?.activityRows?.[i];
        const activityRecord = mapState?.activitiesGeoJSON?.features?.find((feature) => {
          return feature?.properties?.id === id;
        });

        const jurisdiction_code = [];
        activityRecord?.properties?.jurisdiction?.forEach((item) => {
          jurisdiction_code.push(item.jurisdiction_code + ' (' + item.percent_covered + '%)');
        });

        const species_code = [];
        switch (activityRecord?.properties?.type) {
          case 'Observation':
            activityRecord?.properties?.species_positive?.forEach((s) => {
              if (s !== null) species_code.push(s);
            });
            activityRecord?.properties?.species_negative?.forEach((s) => {
              if (s !== null) species_code.push(s);
            });
            break;
          case 'Biocontrol':
          case 'Treatment':
            if (
              activityRecord?.properties.species_treated &&
              activityRecord?.properties.species_treated.length > 0 &&
              activityRecord?.properties.species_treated[0] !== null
            ) {
              const treatmentTemp = activityRecord?.properties.species_treated;
              if (treatmentTemp) {
                treatmentTemp.forEach((s) => {
                  species_code.push(s);
                });
              }
            }
            break;
          case 'Monitoring':
            if (
              activityRecord?.properties.species_treated &&
              activityRecord?.properties.species_treated.length > 0 &&
              activityRecord?.properties.species_treated[0] !== null
            ) {
              const monitoringTemp = JSON.parse(activityRecord?.properties.species_treated);
              if (monitoringTemp) {
                monitoringTemp.forEach((s) => {
                  species_code.push(s);
                });
              }
            }
            break;
        }

        arr.push({
          id: activityRecord?.properties?.id,
          short_id: activityRecord?.properties?.short_id,
          activity_type: activityRecord?.properties?.type,
          reported_area: activityRecord?.properties?.reported_area ? activityRecord?.properties?.reported_area : 0,
          jurisdiction_code: jurisdiction_code,
          species_code: species_code,
          geometry: activityRecord?.geometry
        });
      }

      setRows(arr);
    } catch (e) {
      console.log('Activities error', e);
      setRows([]);
    }
  }, [bufferedGeo]);

  const activityPage = async (params) => {
    const id = params.row.id;
    await dataAccess.setAppState({ activeActivity: id });
    history.push({ pathname: `/home/activity` });
  };

  return (
    <div style={{ height: 300, minWidth: '100%', display: 'flex', flexDirection: 'column' }}>
      <DataGrid
        columns={columns}
        rows={rows}
        hideFooterPagination
        hideFooter
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
        // onCellDoubleClick={(params: GridCellParams, event: MuiEvent<React.MouseEvent>) => {
        //   console.log('params', params);
        // }}
      />
      <WhatsHerePagination type="activity"></WhatsHerePagination>
    </div>
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
  const [rows, setRows] = useState([]);
  const history = useHistory();
  const { authenticated, roles } = useSelector(selectAuth);
  const mapState = useSelector(selectMap);
  const errorContext = useContext(ErrorContext);
  const [columns, setColumns] = useState(null);


  const dispatchUpdatedID = (params) => {
                dispatch({
                  type: MAP_WHATS_HERE_SET_HIGHLIGHTED_IAPP,
                  payload: {
                    id: params.value
                  }
                });
  }

  useEffect(() => {
    console.log('rerender poi table')
    let tcolumns = [
      {
        field: 'id',
        headerName: 'IAPP ID',
        hide: true
      },
      {
        field: 'site_id',
        headerName: 'IAPP ID',
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
        minWidth: 115
      },
      {
        field: 'jurisdiction_code',
        headerName: 'Jurisdictions',
        width: 200
      },
      {
        field: 'species_code',
        headerName: 'Species',
        width: 120
      },
      {
        field: 'geometry',
        headerName: 'Geometry',
        hide: true
      }
    ];

    setColumns([...tcolumns]);
  }, []);

  useEffect(() => {
    updatePOIRecords();
  }, [bufferedGeo]);

  const updatePOIRecords = React.useCallback(async () => {
    const arr = [];
    const startRecord = mapState?.whatsHere?.limit * (mapState?.whatsHere?.page + 1) - mapState?.whatsHere?.limit;
    const endRecord = mapState?.whatsHere?.limit * (mapState?.whatsHere?.page + 1);
    for (let i = startRecord; i < endRecord && i < mapState?.whatsHere?.iappRows?.length; i++) {
      const id = mapState?.whatsHere?.iappRows?.[i];
      const iappRecord = mapState?.IAPPGeoJSON?.features.find((feature) => {
        return feature?.properties?.site_id === id;
      });

      arr.push({
        id: iappRecord?.properties.site_id,
        site_id: iappRecord?.properties.site_id,
        jurisdiction_code: iappRecord?.properties.jurisdictions,
        species_code: iappRecord?.properties.species_on_site,
        geometry: iappRecord?.geometry,
        reported_area: iappRecord?.properties.reported_area
      });
    }

    setRows(arr);
  }, [bufferedGeo]);


  return (
    <>
      {columns?.length > 0 ? (
        <div style={{ height: 300, minWidth: '100%', display: 'flex', flexDirection: 'column' }}>
          <DataGrid
            columns={columns}
            rows={rows}
            hideFooterPagination
            hideFooter
            getRowHeight={() => 'auto'}
            headerHeight={30}
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
      ) : (
        <></>
      )}
    </>
  );
};
