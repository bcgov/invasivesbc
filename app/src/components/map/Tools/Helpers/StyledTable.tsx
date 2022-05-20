import {
  ClickAwayListener,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Theme,
  Tooltip,
  Typography
} from '@mui/material';
import area from '@turf/area';
import center from '@turf/center';
import { createStyles, withStyles } from '@mui/styles';
import * as turf from '@turf/helpers';
import { ActivitySubtypeShortLabels } from 'constants/activities';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { useDataAccess } from 'hooks/useDataAccess';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { DataGrid, GridCellParams, MuiEvent } from '@mui/x-data-grid';
import {
  getJurisdictions,
  getLatestReportedArea,
  getReportedAreaOutput
} from 'components/points-of-interest/IAPP/IAPP-Functions';
import {useSelector} from "../../../../state/utilities/use_selector";
import {selectAuth} from "../../../../state/reducers/auth";

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

const getPlantName = (subtype, invasivePlantCode, response) => {
  try {
    if (subtype === 'Terrestrial Invasive Plant Chemical Treatment:')
      subtype = subtype.substring(0, subtype.length - 1);
    var plantType;
    switch (subtype) {
      case 'Plant Terrestrial':
        plantType = response.components.schemas.TerrestrialPlants;
        break;
      case 'Plant Aquatic':
        plantType = response.components.schemas.AquaticPlants;
        break;
      case 'Terrestrial Invasive Plant Chemical Treatment':
        plantType = response.components.schemas.TerrestrialPlants;
        break;
      case 'Aquatic Invasive Plant Chemical Treatment':
        plantType = response.components.schemas.AquaticPlants;
        break;
      case 'Terrestrial Invasive Plant Mechanical Treatment':
        plantType = response.components.schemas.TerrestrialPlants;
        break;
      case 'Aquatic Invasive Plant Mechanical Treatment':
        plantType = response.components.schemas.AquaticPlants;
        break;
      case 'Chemical':
        plantType = response.components.schemas.TerrestrialPlants;
        break;
      case 'Mechanical':
        plantType = response.components.schemas.TerrestrialPlants;
        break;
      case 'Biocontrol Release Monitoring':
        plantType = response.components.schemas.TerrestrialPlants;
        break;
      default:
        plantType = null;
        break;
    }
    if (plantType) {
      var plants = plantType.properties.invasive_plant_code.anyOf;
      for (let i in plants) {
        if (plants[i].enum[0] === invasivePlantCode) {
          return plants[i].title.split('(')[0];
        }
      }
    } else return null;
  } catch (error) {
    throw new error('Parameter not read');
  }
};

const getPlantCodes = (obj) => {
  var plantCodeList = [];
  if (obj.species_positive) {
    obj.species_positive.forEach((code) => {
      plantCodeList.push(code);
    });
  }
  if (obj.species_negative) {
    obj.species_negative.forEach((code) => {
      plantCodeList.push(code);
    });
  }
  return plantCodeList;
};

const getArea = (shape) => {
  if (shape.geometry.type === 'Polygon') {
    var polygon = turf.polygon(shape.geometry.coordinates);
    return area(polygon);
  } else {
    return Math.PI * shape.properties?.radius;
  }
};

const getCenter = (shape) => {
  if (shape.geometry.type === 'Polygon') {
    var polygon = turf.polygon(shape.geometry.coordinates);
    return center(polygon).geometry.coordinates;
  } else {
    return shape.geometry.coordinates;
  }
};

const CreateAccordionTable = ({ map, row, response, setActivityGeo }) => {
  const [open, setOpen] = useState(false);
  const handleTooltipClose = () => {
    setOpen(false);
  };
  const handleTooltipOpen = () => {
    setOpen(true);
  };
  // Shortcuts
  var activity_payload = row.obj.activity_payload;
  var form_data = activity_payload.form_data;
  var shape = activity_payload.geometry[0];
  // Variables for table
  // for species name
  var codes = getPlantCodes(activity_payload);
  var area = getArea(shape);
  var center = getCenter(shape);
  var jurisdictions = form_data.activity_data.jurisdictions;
  var subtype = ActivitySubtypeShortLabels[row.obj.activity_subtype];

  return (
    <>
      <StyledTableRow>
        <StyledTableCell>Created Date</StyledTableCell>
        <StyledTableCell>{activity_payload.date_created}</StyledTableCell>
      </StyledTableRow>
      <StyledTableRow>
        <StyledTableCell>Subtype</StyledTableCell>
        <StyledTableCell>{subtype}</StyledTableCell>
      </StyledTableRow>
      {jurisdictions && (
        <StyledTableRow>
          <StyledTableCell>Jurisdiction</StyledTableCell>
          <StyledTableCell>
            {jurisdictions.map((j) => (
              <>{j.jurisdiction_code} </>
            ))}
          </StyledTableCell>
        </StyledTableRow>
      )}
      {codes && (
        <StyledTableRow>
          <StyledTableCell>Invasive Plant</StyledTableCell>
          <StyledTableCell>
            {codes.map((code) => (
              <ClickAwayListener onClickAway={handleTooltipClose}>
                <Tooltip
                  onClose={handleTooltipClose}
                  open={open}
                  disableFocusListener
                  disableHoverListener
                  disableTouchListener
                  title={getPlantName(subtype, code, response)}>
                  <span onClick={handleTooltipOpen}>{code}</span>
                </Tooltip>
              </ClickAwayListener>
            ))}
          </StyledTableCell>
        </StyledTableRow>
      )}
      <StyledTableRow>
        <StyledTableCell>Area</StyledTableCell>
        <StyledTableCell>
          {area || area > 0 ? (
            <span
              onClick={() => {
                setActivityGeo(shape);
                map.flyTo([center[1], center[0]], 17);
              }}>
              {area.toFixed(2)}
            </span>
          ) : (
            <>NWF</>
          )}
        </StyledTableCell>
      </StyledTableRow>
    </>
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
  const dbContext = useContext(DatabaseContext);
  const dataAccess = useDataAccess();
  const invasivesAccess = useInvasivesApi();
  const [response, setResponse] = useState(null);
  const [rows, setRows] = useState([]);
  const history = useHistory();
  const { authenticated } = useSelector(selectAuth);

  // Removed for now: const labels = ['ID', 'Species'];

  useEffect(() => {
    updateActivityRecords();
  }, [bufferedGeo]);

  useEffect(() => {
    const getApiSpec = async () => {
      setResponse(await invasivesAccess.getCachedApiSpec());
    };
    if (authenticated) {
      getApiSpec();
    }
  }, [rows, authenticated]);

  const activityPage = async (row) => {
    var id = row.obj.activity_id;
    await dataAccess.setAppState({ activeActivity: id });
    history.push({ pathname: `/home/activity` });
  };

  const updateRow = (row, fieldsToUpdate: Object) => {
    var arrLen = rows.length;
    if (arrLen > 0) {
      var index;
      for (let i in rows) {
        if (rows[i].obj.activity_id === row.obj.activity_id) {
          index = i;
        }
      }
      const rowsBefore = [...rows.slice(0, index)];
      const rowsAfter = [...rows.slice(index)];
      const oldRow = rows[index];
      const updatedRow = { ...oldRow, ...fieldsToUpdate };
      rowsAfter[0] = updatedRow;
      setRows([...rowsBefore, ...rowsAfter]);
    }
  };

  const updateActivityRecords = React.useCallback(async () => {
    try {
      const activities = await dataAccess.getActivities({
        limit: 10
      });
      console.log(activities);
      var tempArr = [];
      for (let i in activities) {
        if (activities[i]) {
          var obj = activities.rows[i];
          tempArr.push({
            obj,
            open: false
          });
        }
      }
      setRows(tempArr);
    } catch (e) {
      console.log('Activities error', e);
      setRows([]);
    }
  }, [bufferedGeo, dataAccess, dbContext]);

  return (
    <div style={{ height: 300, minWidth: '100%' }}>
      <Typography>Work in progress</Typography>
      {/* Removed for now:
      <DataGrid
        columns={columns}
        rows={rows}
        pageSize={5}
        rowsPerPageOptions={[5]}
        rowHeight={30}
        headerHeight={30}
        onCellClick={(params: GridCellParams, event: MuiEvent<React.MouseEvent>) => {
          history.push(`/home/iapp/${params.id}`);
        }}
        // onCellDoubleClick={(params: GridCellParams, event: MuiEvent<React.MouseEvent>) => {
        //   console.log('params', params);
        // }}
      /> */}
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

  const columns = [
    {
      field: 'id',
      headerName: 'IAPP ID',
      hide: true
    },
    {
      field: 'site_id',
      headerName: 'IAPP ID',
      minWidth: 80
    },
    {
      field: 'reported_area',
      headerName: 'Reported Area',
      minWidth: 130
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
    updatePOIRecords();
  }, [bufferedGeo]);

  const updatePOIRecords = React.useCallback(async () => {
    try {
      var pointsofinterest = await dataAccess.getPointsOfInterest({
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
      pointsofinterest.rows.forEach((poi) => {
        const surveys = poi.point_of_interest_payload.form_data.surveys;
        const tempSurveyArea = getLatestReportedArea(surveys);
        const newArr: any = getJurisdictions(surveys);
        const arrJurisdictions = [];
        newArr.forEach((item) => {
          arrJurisdictions.push(item.jurisdiction_code + ' (' + item.percent_covered + '%)');
        });

        var row = {
          id: poi.point_of_interest_id,
          site_id: poi.point_of_interest_payload.form_data.point_of_interest_type_data.site_id,
          jurisdiction_code: arrJurisdictions,
          species_code: poi.species_on_site,
          geometry: poi.point_of_interest_payload.geometry,
          reported_area: getReportedAreaOutput(tempSurveyArea)
        };
        tempArr.push(row);
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
        rowHeight={30}
        headerHeight={30}
        onCellClick={(params: GridCellParams, event: MuiEvent<React.MouseEvent>) => {
          history.push(`/home/iapp/${params.id}`);
        }}
        // onCellDoubleClick={(params: GridCellParams, event: MuiEvent<React.MouseEvent>) => {
        //   console.log('params', params);
        // }}
      />
    </div>
  );
};
