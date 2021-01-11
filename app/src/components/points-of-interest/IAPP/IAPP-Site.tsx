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
  tableRow: {
    verticalAlign: 'top'
  },
  tableContainer: {
    display: 'table-row'
  },
  cell: {
    whiteSpace: 'nowrap',
    width: 1
  },
  wideCell: {
    minWidth: 500,
    maxWidth: 500
  },
  missingValue: {
    fontStyle: 'italic',
    color: '#777'
  },
  header: {
    backgroundColor: 'rgba(0, 0, 0, 0.06)'
  },
  dropdown: {
    paddingBottom: 0,
    paddingTop: 0,
    paddingLeft: '1em'
  },
  dropdownCol: {
    width: '1px'
  },
  openRow: {
    overflow: 'inherit',
    whiteSpace: 'inherit'
  },
  closedRow: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  }
}));

export interface IAPPSitePropType {
  record: any;
}

export const IAPPSite: React.FC<IAPPSitePropType> = (props) => {
  const classes = useStyles();
  const site = {
    ...props?.record?.point_of_interest_payload?.form_data?.point_of_interest_data,
    ...props?.record?.point_of_interest_payload?.form_data?.point_of_interest_type_data
  };
  const {
    surveys,
    mechanical_treatments,
    chemical_treatments,
    biological_treatments
  } = site;
  const longitude = parseFloat(props?.record?.point_of_interest_payload?.geometry[0]?.geometry?.coordinates[0]).toFixed(6);
  const latitude = parseFloat(props?.record?.point_of_interest_payload?.geometry[0]?.geometry?.coordinates[1]).toFixed(6);

  const ifApplicable = (value) =>
    value && String(value).trim() ? value : <div className={classes.missingValue}>N/A</div>;

  return (
    <Container>
      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-map-content" id="panel-map-header">
          <Typography className={classes.heading}>Legacy IAPP Site: {site.site_id}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={1}>
            <Grid item xs={3} sm={2}>
              Created
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site.created_date_on_device)}
            </Grid>
            <Grid item xs={3} sm={2}>
              Slope
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site.slope_code)}
            </Grid>

            <Grid item xs={3} sm={2}>
              PaperFile
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site.paper_file[0].description)}
            </Grid>
            <Grid item xs={3} sm={2}>
              Aspect
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site.aspect_code)}
            </Grid>

            <Grid item xs={3} sm={2}>
              Longitude
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(longitude)}
            </Grid>
            <Grid item xs={3} sm={2}>
              Latitude
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(latitude)}
            </Grid>

            <Grid item xs={3} sm={2}>
              Elevation
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site.elevation)}
            </Grid>
            <Grid item xs={3} sm={2}>
              Specific Use
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site.specific_use_code)}
            </Grid>

            <Grid item xs={3} sm={2}>
              Mapsheet
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site.map_sheet)}
            </Grid>
            <Grid item xs={3} sm={2}>
              Soil Texture
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site.soil_texture_code)}
            </Grid>

            <Grid item xs={3} sm={2}>
              Jurisdiction
            </Grid>
            <Grid item xs={3}>
              {(surveys.length &&
                surveys[0].jurisdictions.length > 0 &&
                ifApplicable(surveys[0].jurisdictions[0].jurisdiction_code) +
                  ' (' +
                  surveys[0].jurisdictions[0].percentage +
                  '%)') ||
                'Not Provided'}
            </Grid>
            <Grid item xs={3}>
              {surveys.length &&
                surveys[0].jurisdictions.length > 1 &&
                ifApplicable(surveys[0].jurisdictions[1].jurisdiction_code) +
                  ' (' +
                  surveys[0].jurisdictions[1].percentage +
                  '%)'}
            </Grid>
            <Grid item xs={3}>
              {surveys.length &&
                surveys[0].jurisdictions.length > 2 &&
                ifApplicable(surveys[0].jurisdictions[2].jurisdiction_code) +
                  ' (' +
                  surveys[0].jurisdictions[2].percentage +
                  '%)'}
            </Grid>

            <Grid item xs={3} sm={2}>
              Location
            </Grid>
            <Grid item xs={9} sm={10}>
              {ifApplicable(site.access_description)}
            </Grid>

            <Grid item xs={3} sm={2}>
              Comments
            </Grid>
            <Grid item xs={9} sm={10}>
              {ifApplicable(site.comments || site.general_comments)}
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-map-content" id="panel-map-header">
          <Typography className={classes.heading}>Survey Details on Site {site.site_id}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <IAPPTable
            headers={[
              'Survey ID',
              'Common Name',
              'Species',
              'Genus',
              'Survey Date',
              'Agency',
              'Area (m2)',
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
            rows={
              !surveys.length
                ? []
                : surveys.map((row) => [
                    row.survey_id,
                    row.common_name,
                    row.species,
                    row.genus,
                    row.survey_date,
                    row.invasive_species_agency_code,
                    row.reported_area,
                    {
                      align: 'center',
                      children: row.density + (row.density ? ' (' + row.invasive_plant_density_code + ')' : '')
                    },
                    {
                      align: 'center',
                      children:
                        row.distribution + (row.distribution ? ' (' + row.invasive_plant_distribution_code + ')' : '')
                    },
                    {
                      className: classes.wideCell,
                      children: row.comments
                    }
                  ])
            }
            pagination={true}
          />
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-map-content" id="panel-map-header">
          <Typography className={classes.heading}>Mechanical Treatments and Efficacy Monitoring</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <IAPPTable
            headers={[
              'Treatment ID',
              'Mechanical ID',
              'Species (Common)',
              'Treatment Date',
              'Agency',
              'Hectares',
              'Mech Method',
              'Paper File ID',
              {
                className: classes.wideCell,
                children: 'Comments'
              }
            ]}
            rows={
              mechanical_treatments.length > 0
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
              mechanical_treatments[i].monitoring || mechanical_treatments[i].monitoring.length === 0 ? null : (
                <IAPPTable
                  key={'dropdown_' + i}
                  headers={[
                    'Monitoring ID',
                    'Monitoring Date',
                    'Agency',
                    'Efficacy',
                    'Paper File ID',
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
        <AccordionDetails>
          <IAPPTable
            headers={[
              'Treatment ID',
              'Species (Common)',
              'Treatment Date',
              'Agency',
              'Hectares',
              'Chem Method',
              'Paper File ID',
              {
                className: classes.wideCell,
                children: 'Comments'
              }
            ]}
            rows={
              chemical_treatments.length > 0
                ? chemical_treatments.map((row) => [
                    row.TreatmentID,
                    row.MapCommon,
                    row.TreatmentDate,
                    row.TreatmentAgency,
                    parseFloat(row.AreaTreated).toFixed(4),
                    row.ChemicalMethod,
                    row.PAPER_FILE_ID,
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
                {chemical_treatments[i].monitoring || chemical_treatments[i].monitoring.length === 0 ? null : (
                  <IAPPTable
                    headers={[
                      'Monitoring ID',
                      'Monitoring Date',
                      'Agency',
                      'Efficacy',
                      'Paper File ID',
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

      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-map-content" id="panel-map-header">
          <Typography className={classes.heading}>Biological Treatments and Efficacy Monitoring</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <IAPPTable
            headers={[
              'Biological ID',
              'Species (Common)',
              'Treatment Date',
              'Collection Date',
              'Bioagent Source',
              'Agency',
              'Larva Stage',
              'Egg Stage',
              'Pupa Stage',
              'Other Stage',
              'Release Quantity',
              'Area Classification Code',
              'Biological Agent Code',
              'UTM Zone',
              'UTM Easting',
              'UTM Northing',
              'Paper File ID',
              {
                className: classes.wideCell,
                children: 'Comments'
              }
            ]}
            rows={
              biological_treatments.length === 0
                ? []
                : biological_treatments.map((row) => [
                    row.biological_id,
                    row.common_name,
                    row.treatment_date,
                    row.collection_date,
                    row.bioagent_source,
                    row.agency_code,
                    row.stage_larva_ind,
                    row.stage_egg_ind,
                    row.stage_pupa_ind,
                    row.stage_other_ind,
                    row.release_quantity,
                    row.area_classification_code,
                    row.biological_agent_code,
                    row.utm_zone,
                    row.utm_easting,
                    row.utm_northing,
                    row.paper_file[0].description,
                    {
                      className: classes.wideCell,
                      children: row.comments
                    }
                  ])
            }
            dropdown={(i) => (
              <React.Fragment key={'dropdown_' + i}>
                {biological_treatments[i].monitoring.length === 0 ? null : (
                  <IAPPTable
                    headers={[
                      'Monitoring ID',
                      'Inspection Date',
                      'Efficacy Rating Code',
                      'Paper File ID',
                      'Plant Count',
                      'Agent Count',
                      'Count Duration',
                      'Agent Destroyed',
                      'Legacy Presence',
                      'Foliar Feeding Damage',
                      'Root Feeding Damage',
                      'Seed Feeding Damage',
                      'Oviposition Marks',
                      'Eggs Present',
                      'Larvae Present',
                      'Pupae Present',
                      'Adults Present',
                      'Tunnels Present',
                      {
                        className: classes.wideCell,
                        children: 'Comment'
                      }
                    ]}
                    rows={biological_treatments[i].monitoring.map((row, j) => [
                      row.monitoring_id,
                      row.inspection_date,
                      row.efficacy_code,
                      row.paper_file[0].description,
                      row.plant_count,
                      row.agent_count,
                      row.count_duration,
                      row.agent_destroyed_ind,
                      row.legacy_presence_ind,
                      row.foliar_feeding_damage_ind,
                      row.root_feeding_damage_ind,
                      row.seed_feeding_damage_ind,
                      row.oviposition_marks_ind,
                      row.eggs_present_ind,
                      row.larvae_present_ind,
                      row.pupae_present_ind,
                      row.adults_present_ind,
                      row.tunnels_present_ind,
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
    value && String(value).trim().length ? value : <div className={classes.missingValue}>N/A</div>;

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
      typeof row === 'string' || React.isValidElement(row) ? row : row.map((cell, j) => renderCell(cell, j, open));

    return (
      <React.Fragment key={index}>
        <TableRow className={classes.tableRow} onClick={() => setOpen(!open)}>
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
          <TableRow className={classes.tableRow}>
            <TableCell className={classes.dropdown} colSpan={100}>
              <Collapse in={open} timeout="auto">
                <Box margin={2}>{renderedDropdown}</Box>
              </Collapse>
            </TableCell>
          </TableRow>
        )}
      </React.Fragment>
    );
  };

  const renderCell = (cell, i, open = false) =>
    typeof cell === 'object' ? (
      React.createElement(TableCell, {
        key: i,
        ...cell,
        className: `${classes.cell} ${cell.className} ${open ? classes.openRow : classes.closedRow}`
      })
    ) : (
      <TableCell key={i} className={classes.cell}>
        {ifApplicable(cell)}
      </TableCell>
    );
  const renderedHeaders = headers.map((cell, i) => renderCell(cell, i));
  const renderedRows = rows
    .slice(startingRow, startingRow + rowsPerPage)
    .map((row, i) => <IAPPBodyRow row={row} index={startingRow + i} key={startingRow + i} />);

  return !rows || rows.length === 0 ? (
    <div>No Data</div>
  ) : (
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
  );
};
