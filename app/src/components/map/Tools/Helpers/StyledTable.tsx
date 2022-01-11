import {
  Button,
  ClickAwayListener,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Theme,
  Tooltip
} from '@material-ui/core';
import TablePaginationActions from '@material-ui/core/TablePagination/TablePaginationActions';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import { createStyles, withStyles } from '@material-ui/styles';
import * as turf from '@turf/turf';
import { ActivitySubtypeShortLabels } from 'constants/activities';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { useDataAccess } from 'hooks/useDataAccess';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

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
          ActionsComponent={TablePaginationActions}
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
    obj.species_positive.map((code) => {
      plantCodeList.push(code);
    });
  }
  if (obj.species_negative) {
    obj.species_negative.map((code) => {
      plantCodeList.push(code);
    });
  }
  return plantCodeList;
};

const getArea = (shape) => {
  if (shape.geometry.type === 'Polygon') {
    var polygon = turf.polygon(shape.geometry.coordinates);
    return turf.area(polygon);
  } else {
    return Math.PI * shape.properties?.radius;
  }
};

const getCenter = (shape) => {
  if (shape.geometry.type === 'Polygon') {
    var polygon = turf.polygon(shape.geometry.coordinates);
    return turf.center(polygon).geometry.coordinates;
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
                  <a onClick={handleTooltipOpen}>{code}</a>
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
            <a
              onClick={() => {
                setActivityGeo(shape);
                map.flyTo([center[1], center[0]], 17);
              }}>
              {area.toFixed(2)}
            </a>
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

export const RenderTableActivity = ({ map, rows, setRows, setActivityGeo }) => {
  // invasivesApi
  const invasivesAccess = useInvasivesApi();
  const [response, setResponse] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [emptyRows, setEmptyRows] = useState(0);
  const [page, setPage] = useState(0);
  const databaseContext = useContext(DatabaseContext);
  const dataAccess = useDataAccess();
  const history = useHistory();

  const labels = ['ID', 'Species'];

  useEffect(() => {
    if (rows) {
      setEmptyRows(rowsPerPage - Math.min(rowsPerPage, rows?.length - page * rowsPerPage));
    }
  }, [rows]);

  useEffect(() => {
    const getApiSpec = async () => {
      setResponse(await invasivesAccess.getCachedApiSpec());
    };
    getApiSpec();
  }, [rows]);

  const activityPage = async (row) => {
    var id = row.obj.activity_id;
    await dataAccess.setAppState({ activeActivity: id }, databaseContext);
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
        {(rowsPerPage > 0 ? rows?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : rows)?.map((row) => (
          <>
            <StyledTableRow key={row?.obj.activity_id}>
              <StyledTableCell
                style={{ display: 'flex', flexflow: 'row nowrap', width: 150.5 }}
                component="th"
                scope="row">
                <IconButton size="small" onClick={() => updateRow(row, { open: !row.open })}>
                  {row?.open ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
                </IconButton>
                <Button size="small" onClick={() => activityPage(row)}>
                  {row?.obj.activity_payload.short_id}
                </Button>
              </StyledTableCell>
              <StyledTableCell style={{ width: 150.5 }}>
                {getPlantCodes(row.obj).map((code) => (
                  <>{code}</>
                ))}
              </StyledTableCell>
              {/*<StyledTableCell>{row?.obj.activity_payload.activity_subtype.split('_')[2]}</StyledTableCell>*/}
            </StyledTableRow>
            <Collapse in={row?.open} timeout="auto" unmountOnExit>
              <CreateAccordionTable map={map} row={row} response={response} setActivityGeo={setActivityGeo} />
            </Collapse>
          </>
        ))}
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
                <StyledTableCell style={{ width: 125 }}>
                  {row.geometry.coordinates[0].toFixed(2)}, {row.geometry.coordinates[1].toFixed(2)}
                  <></>
                </StyledTableCell>
                <StyledTableCell style={{ width: 125 }}>{row.properties.STREET_ADDRESS}</StyledTableCell>
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

export const RenderTablePOI = ({ map, rows, setPoiMarker }) => {
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);
  const history = useHistory();

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows?.length - page * rowsPerPage);

  const labels = ['SITE ID', 'SPECIES', 'JURISDICTION'];

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
              <StyledTableRow key={row?.site_id}>
                <StyledTableCell style={{ width: 51 }} component="th" scope="row">
                  <a
                    onClick={() => {
                      // Removed for now:
                      // if (row.geometry)
                      //   map.flyTo(
                      //     [row.geometry[0].geometry.coordinates[1], row.geometry[0].geometry.coordinates[0]],
                      //     17
                      //   );
                      // setPoiMarker({
                      //   geometry: row.geometry[0],
                      //   species: row.species
                      // });
                      history.push(`/home/iapp/${row.id}`);
                    }}>
                    {row.site_id}
                  </a>
                </StyledTableCell>
                <StyledTableCell style={{ width: 125 }}>
                  {row.species.map((s) => (
                    <>
                      {s}
                      <br />
                    </>
                  ))}
                </StyledTableCell>
                <StyledTableCell style={{ width: 125 }}>
                  {row.jurisdictions.map((j) => (
                    <>
                      {j}
                      <br />
                    </>
                  ))}
                </StyledTableCell>
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
