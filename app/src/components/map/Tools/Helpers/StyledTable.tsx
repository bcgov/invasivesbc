import {
  Box,
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
            <StyledTableCell style={{ width: 150.5 }} component="th" scope="row">
              {row.name}
            </StyledTableCell>
            <StyledTableCell style={{ width: 150.5 }}>{row.value}</StyledTableCell>
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
      const activities = await dataAccess.getActivitiesLean({
        search_feature: bufferedGeo,
        limit: 500,
        page: 0
      });
      console.log(activities);

      const tempArr = [];

      activities?.rows?.forEach((a) => {
        const id = a?.geojson?.properties?.id;
        const short_id = a?.geojson?.properties?.short_id;
        const activity_type = a?.geojson?.properties?.type;
        const reported_area = a?.geojson?.properties?.reported_area;
        const jurisdiction_code = [];
        a?.geojson?.properties?.jurisdiction?.forEach((item) => {
          jurisdiction_code.push(item.jurisdiction_code + ' (' + item.percent_covered + '%)');
        });
        const species_code = [];
        switch (activity_type) {
          case 'Observation':
            a?.geojson?.properties?.species_positive?.forEach((s) => {
              species_code.push(s);
            });
            a?.geojson?.properties?.species_negative?.forEach((s) => {
              species_code.push(s);
            });
            break;
          case 'Biocontrol':
          case 'Treatment':
          case 'Monitoring':
            try {
              const speciesTemp = JSON.parse(a.geojson.properties.species_treated);
              speciesTemp.forEach((s) => {
                species_code.push(s);
              });
            } catch (e) {
              console.log('JSON Parsing error', e);
            }
            break;
        }
        const geometry = a?.geojson;

        tempArr.push({
          id: id,
          short_id: short_id,
          activity_type: activity_type,
          reported_area: reported_area ? reported_area : 0,
          jurisdiction_code: jurisdiction_code,
          species_code: species_code,
          geometry: geometry
        });
      });

      setRows(tempArr);
    } catch (e) {
      console.log('Activities error', e);
      setRows([]);
    }
  }, [bufferedGeo, dataAccess]);

  const activityPage = async (params) => {
    const id = params.row.id;
    await dataAccess.setAppState({ activeActivity: id });
    history.push({ pathname: `/home/activity` });
  };

  return (
    <div style={{ height: 300, minWidth: '100%' }}>
      <DataGrid
        columns={columns}
        rows={rows}
        pageSize={5}
        rowsPerPageOptions={[5]}
        getRowHeight={() => 'auto'}
        headerHeight={30}
        onCellClick={(params: GridCellParams, _event: MuiEvent<React.MouseEvent>) => {
          if (authenticated && roles.length > 0) {
            activityPage(params);
          } else {
            errorContext.pushError({
              message: 'You need InvasivesBC access to open this record.',
              code: 401,
              namespace: ''
            });
          }
        }}
        // onCellDoubleClick={(params: GridCellParams, event: MuiEvent<React.MouseEvent>) => {
        //   console.log('params', params);
        // }}
      />
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
  const dataAccess = useDataAccess();
  const [rows, setRows] = useState([]);
  const history = useHistory();
  const { authenticated, roles } = useSelector(selectAuth);
  const errorContext = useContext(ErrorContext);

  const columns = [
    {
      field: 'id',
      headerName: 'IAPP ID',
      hide: true
    },
    {
      field: 'site_id',
      headerName: 'IAPP ID',
      width: 70
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

  useEffect(() => {
    updatePOIRecords();
  }, [bufferedGeo]);

  const updatePOIRecords = React.useCallback(async () => {
    try {
      const pointsofinterest = await dataAccess.getPointsOfInterestLean({
        search_feature: bufferedGeo,
        isIAPP: true,
        limit: 500,
        page: 0
      });

      if (!pointsofinterest) {
        return;
      }

      // Removed for now: setPoisObj(pointsofinterest);
      const tempArr = [];
      pointsofinterest.forEach((poi) => {
        const { site_id, reported_area } = poi.properties;
        const jurisdictions: string = poi.properties.jurisdictions.join('\n');
        const species: string[] = poi.properties.species_on_site.join(' ');
        tempArr.push({
          id: site_id,
          site_id: site_id,
          jurisdiction_code: jurisdictions,
          species_code: species,
          geometry: poi,
          reported_area: reported_area
        });
      });
      setRows(tempArr);
    } catch (e) {
      console.log('Point of Interest error', e);
    }
  }, [bufferedGeo]);

  return (
    <div style={{ height: 300, minWidth: '100%' }}>
      <DataGrid
        columns={columns}
        rows={rows}
        pageSize={5}
        rowsPerPageOptions={[5]}
        getRowHeight={() => 'auto'}
        headerHeight={30}
        onCellClick={(params: GridCellParams, _event: MuiEvent<React.MouseEvent>) => {
          if (params.field === 'site_id') {
            if (authenticated && roles.length > 0) {
              history.push(`/home/iapp/${params.id}`);
            } else {
              errorContext.pushError({
                message: 'You need InvasivesBC access to open this record.',
                code: 401,
                namespace: ''
              });
              if (roles.length > 0) {
                history.push(`/home/iapp/${params.id}`);
              }
            }
          }
        }}
        // onCellDoubleClick={(params: GridCellParams, event: MuiEvent<React.MouseEvent>) => {
        //   console.log('params', params);
        // }}
      />
    </div>
  );
};
