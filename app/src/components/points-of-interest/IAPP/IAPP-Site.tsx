import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Collapse,
  Container,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow
} from '@material-ui/core';
import { KeyboardArrowUp, KeyboardArrowDown, ExpandMore } from '@material-ui/icons';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  heading: {
    fontSize: theme.typography.pxToRem(18),
    fontWeight: theme.typography.fontWeightRegular,
    align: 'center'
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'left',
    color: theme.palette.text.primary
  },
  table: {
    width: 'auto',
    tableLayout: 'auto'
  },
  tableContainer: {
    display: 'table-row'
  },
  cell: {
    whiteSpace: 'nowrap',
    width: '1px'
  },
  wideCell: {
    whiteSpace: 'normal',
    minWidth: '500px'
  },
  missingValue: {
    fontStyle: 'italic',
    color: '#777'
  },
  header: {
    backgroundColor: 'rgba(0, 0, 0, 0.06)' // TODO pull from theme
  },
  dropdown: {
    paddingBottom: 0,
    paddingTop: 0,
    paddingLeft: '1em'
  },
  dropdownCol: {
    maxWidth: '2em'
  }
}));

export interface IAPPSitePropType {
  record: any;
}

export const IAPPSite: React.FC<IAPPSitePropType> = (props) => {
  const classes = useStyles();
  const ifApplicable = (value) =>
    value && String(value).trim() != '' ? value : <div className={classes.missingValue}>N/A</div>;

  const {
    aspect,
    chemical_treatments,
    comments,
    map_sheet,
    mechanical_treatments,
    site_id,
    soil_texture,
    specific_use,
    surveys
  } = props?.record?.point_of_interest_payload?.form_data?.point_of_interest_type_data;
  const {
    access_description,
    created_date_on_device
  } = props?.record?.point_of_interest_payload?.form_data?.point_of_interest_data;
  const paper_file =
    props?.record?.point_of_interest_payload?.form_data?.point_of_interest_data?.paper_file[0]?.description;
  const longitude = props?.record?.point_of_interest_payload?.geometry[0]?.geometry?.coordinates[0];
  const latitude = props?.record?.point_of_interest_payload?.geometry[0]?.geometry?.coordinates[1];
  const { slope, elevation } = props?.record?.point_of_interest_payload?.geometry[0].properties;
  const { Jur1, Jur1pct, Jur2, Jur2pct, Jur3, Jur3pct } = surveys
    ? surveys[0]
    : { Jur1: 'Not Specified', Jur1pct: '100', Jur2: '', Jur2pct: '0', Jur3: '', Jur3pct: '0' };

  const ifApplicable = (value) =>
    value && String(value).trim() !== '' ? value : <div className={classes.missingValue}>N/A</div>;
  const toDecimalPlaces = (n, decimals = 4) => Number.parseFloat(n).toFixed(decimals);

  return (
    <Container className={classes.container}>
      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-map-content" id="panel-map-header">
          <Typography className={classes.heading}>Legacy IAPP Site: {site_id}</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.siteContainer}>
          <Grid container spacing={1}>
            <Grid item xs={3} sm={2}>
              Created
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(created_date_on_device)}
            </Grid>
            <Grid item xs={3} sm={2}>
              Slope
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(slope)}
            </Grid>

            <Grid item xs={3} sm={2}>
              PaperFile
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(paper_file)}
            </Grid>
            <Grid item xs={3} sm={2}>
              Aspect
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(aspect)}
            </Grid>

            <Grid item xs={3} sm={2}>
              Longitude
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(parseFloat(longitude).toFixed(6))}
            </Grid>
            <Grid item xs={3} sm={2}>
              Latitude
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(parseFloat(latitude).toFixed(6))}
            </Grid>

            <Grid item xs={3} sm={2}>
              Elevation
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(elevation)}
            </Grid>
            <Grid item xs={3} sm={2}>
              Specific Use
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(specific_use)}
            </Grid>

            <Grid item xs={3} sm={2}>
              Mapsheet
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(map_sheet)}
            </Grid>
            <Grid item xs={3} sm={2}>
              Soil Texture
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(soil_texture)}
            </Grid>

            <Grid item xs={3} sm={2}>
              Jurisdiction
            </Grid>
            <Grid item xs={3}>
              {ifApplicable(Jur1)}
              {Jur1pct && Jur1pct !== '0' ? ' (' + Jur1pct + '%)' : ''}
            </Grid>
            <Grid item xs={3}>
              {Jur2 ?? ''}
              {Jur2pct && Jur2pct !== '0' ? ' (' + Jur2pct + '%)' : ''}
            </Grid>
            <Grid item xs={3}>
              {Jur3 ?? ''}
              {Jur3pct && Jur3pct !== '0' ? ' (' + Jur3pct + '%)' : ''}
            </Grid>

            <Grid item xs={3} sm={2}>
              Location
            </Grid>
            <Grid item xs={9} sm={10}>
              {ifApplicable(access_description)}
            </Grid>

            <Grid item xs={3} sm={2}>
              Comments
            </Grid>
            <Grid item xs={9} sm={10}>
              {ifApplicable(comments)}
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-map-content" id="panel-map-header">
          <Typography className={classes.heading}>Survey Details on Site {site_id}</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.surveyContainer}>
          <IAPPTable
            headers={[
              'Survey ID',
              'Common Name',
              'Species',
              'Genus',
              'Survey Date',
              'Agency',
              'Hectares',
              {
                align: 'center',
                children: 'Density'
              },
              {
                align: 'center',
                children: 'Distribution'
              },
              {
                className: classes.wideCell,
                children: 'Comments'
              }
            ]}
            rows={surveys.map((row) => [
              row.SurveyID,
              row.CommonName,
              row.Species,
              row.Genus,
              row.SurveyDate,
              row.SurveyAgency,
              parseFloat(row.EstArea).toFixed(4),
              {
                align: 'center',
                children: row.Density
              },
              {
                align: 'center',
                children: row.Distribution
              },
              {
                className: classes.wideCell,
                children: row.Comment
              }
            ])}
            pagination={true}
          />
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-map-content" id="panel-map-header">
          <Typography className={classes.heading}>Mechanical Treatments and Efficacy Monitoring</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.treatmentContainer}>
          <IAPPTable
            headers={[
              'Treatment ID',
              'Mechanical ID',
              'Common Name',
              'Treatment Date',
              'Agency',
              'Hectares',
              'Mech Method',
              'PaperFile ID',
              {
                className: classes.wideCell,
                children: 'Comments'
              }
            ]}
            rows={
              mechanical_treatments
                ? mechanical_treatments.map((row) => [
                    row.TreatmentID,
                    row.MechanicalID,
                    row.CommonName,
                    row.TreatmentDate,
                    row.TreatmentAgency,
                    parseFloat(row.AreaTreated).toFixed(4),
                    row.MechanicalMethod,
                    row.PaperFileID,
                    {
                      className: classes.wideCell,
                      children: row.Comment
                    }
                  ])
                : []
            }
            dropdown={(i) =>
              mechanical_treatments[i].monitoring === undefined ||
              mechanical_treatments[i].monitoring.length === 0 ? null : (
                <IAPPTable
                  key={'dropdown_' + i}
                  headers={[
                    'Monitoring ID',
                    'Monitoring Date',
                    'Agency',
                    'Efficacy',
                    'PaperFile ID',
                    {
                      className: classes.wideCell,
                      children: 'Comments'
                    }
                  ]}
                  rows={mechanical_treatments[i].monitoring.map((row, j) => [
                    row.monitoring_id,
                    row.monitoring_date,
                    row.agency_code,
                    row.efficacy_percent,
                    row.paper_file_id,
                    {
                      className: classes.wideCell,
                      children: row.comment
                    }
                  ])}
                />
              )
            }
            pagination={true}
          />
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-map-content" id="panel-map-header">
          <Typography className={classes.heading}>Chemical Treatments and Efficacy Monitoring</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.treatmentContainer}>
          <IAPPTable
            headers={[
              'Treatment ID',
              'Common Name',
              'Treatment Date',
              'Agency',
              'Hectares',
              'Chem Method',
              'PaperFile ID',
              {
                className: classes.wideCell,
                children: 'Comments'
              }
            ]}
            rows={
              chemical_treatments
                ? chemical_treatments.map((row) => [
                    row.TreatmentID,
                    row.MapCommon,
                    row.TreatmentDate,
                    row.TreatmentAgency,
                    parseFloat(row.AreaTreated).toFixed(4),
                    row.ChemicalMethod,
                    row.PaperFileID,
                    {
                      className: classes.wideCell,
                      children: row.Comment
                    }
                  ])
                : []
            }
            dropdown={(i) => (
              <React.Fragment key={'dropdown_' + i}>
                <IAPPTable
                  headers={[
                    'PMP Confirmation #',
                    'Description',
                    'PMRA Reg #',
                    'Temperature',
                    'Humidity',
                    'Wind Velocity',
                    'Wind Direction',
                    'Application Rate',
                    'Amount Used',
                    'Dilution Rate'
                  ]}
                  rows={[
                    [
                      chemical_treatments[i].Pmp_Confirmation_Number,
                      chemical_treatments[i].Description,
                      chemical_treatments[i].Pmra_Reg_Number,
                      chemical_treatments[i].Temperature,
                      chemical_treatments[i].Humidity,
                      chemical_treatments[i].Wind_Velocity,
                      chemical_treatments[i].Wind_Direction,
                      chemical_treatments[i].Application_Rate,
                      chemical_treatments[i].Amount_Used,
                      chemical_treatments[i].Dilution_Rate
                    ]
                  ]}
                />
                <br />
                {chemical_treatments[i].monitoring === undefined ||
                chemical_treatments[i].monitoring.length === 0 ? null : (
                  <IAPPTable
                    headers={[
                      'Monitoring ID',
                      'Monitoring Date',
                      'Agency',
                      'Efficacy',
                      'PaperFile ID',
                      {
                        className: classes.wideCell,
                        children: 'Comments'
                      }
                    ]}
                    rows={chemical_treatments[i].monitoring.map((row, j) => [
                      row.monitoring_id,
                      row.inspection_date,
                      row.invasive_plant_agency_code,
                      row.EFFICACY_RATING_CODE,
                      row.PAPER_FILE_ID,
                      {
                        className: classes.wideCell,
                        children: row.comments
                      }
                    ])}
                  />
                )}
              </React.Fragment>
            )}
            pagination={true}
          />
        </AccordionDetails>
      </Accordion>

      <br />
      <br />
      <br />
      <br />
    </Container>
  );
};

export interface IAPPTablePropType {
  headers: Array<any | object>;
  rows: Array<Array<string | object> | object>;
  dropdown?: (index: number) => any;
  pagination?: boolean | object;
  startsOpen?: boolean;
}

/*
  headers: an array of (string/numeric) values (or objects if you want to get fancy and define other object cell properties)
  rows: an array of arrays of columns, which can each contain (string/numeric) values or objects defining overrides to each cell
  dropdown: if defined, gives a function to build the content of a dropdown section for each row, based on the 'source' and the current column index
  pagination: object defining pagination settings, or just boolean true to use defaults.  No pagination if undefined/false
  startsOpen: boolean to set the dropdown to open by default or not (default closed)
*/
// general table with pagination
const IAPPTable: React.FC<IAPPTablePropType> = (props) => {
  const { headers, rows, dropdown = undefined, pagination = undefined, startsOpen = undefined } = props;

  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const startingRow = page * rowsPerPage;

  const ifApplicable = (value) =>
    value && String(value).trim() != '' ? value : <div className={classes.missingValue}>N/A</div>;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const IAPPBodyRow = ({ row, index }) => {
    const [open, setOpen] = React.useState(startsOpen);

    const renderedDropdown = dropdown ? dropdown(index) : null;
    // allow the row to override standard rendering if it is a string or element
    const renderedCells =
      typeof row === 'string' || React.isValidElement(row) ? row : row.map((cell, j) => renderCell(cell, j));

    return (
      <React.Fragment key={index}>
        <TableRow onClick={() => setOpen(!open)}>
          {dropdown && (
            <TableCell className={classes.dropdownCol}>
              {renderedDropdown !== null && (
                <IconButton aria-label="expand row" size="small">
                  {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                </IconButton>
              )}
            </TableCell>
          )}
          {renderedCells}
        </TableRow>
        {dropdown && renderedDropdown !== null && (
          <TableRow>
            <TableCell className={classes.dropdown} colSpan={9}>
              <Collapse in={open} timeout="auto">
                <Box margin={2}>{renderedDropdown}</Box>
              </Collapse>
            </TableCell>
          </TableRow>
        )}
      </React.Fragment>
    );
  };

  const renderCell = (cell, i) => {
    if (typeof cell === 'string')
      return (
        <TableCell key={i} className={classes.cell}>
          {ifApplicable(cell)}
        </TableCell>
      );
    if (typeof cell === 'object') {
      return React.createElement(TableCell, {
        key: i,
        className: classes.cell,
        ...cell
      });
    }
  };

  const renderedHeaders = headers.map((cell, i) => renderCell(cell, i));
  const renderedRows = rows
    .slice(startingRow, startingRow + rowsPerPage)
    .map((row, i) => <IAPPBodyRow row={row} index={startingRow + i} key={startingRow + i} />);

  return !rows || rows.length === 0 ? (
    <div>No Data</div>
  ) : (
    <React.Fragment>
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table className={classes.table} aria-label="mechanical treatments">
          <TableHead className={classes.header}>
            <TableRow>
              {dropdown && <TableCell className={classes.dropdownCol} />}
              {renderedHeaders}
            </TableRow>
          </TableHead>
          <TableBody>{renderedRows}</TableBody>
        </Table>
        {pagination && rows && rows.length > rowsPerPage && (
          <TablePagination
            rowsPerPageOptions={[rowsPerPage]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
          />
        )}
      </TableContainer>
    </React.Fragment>
  );
};
