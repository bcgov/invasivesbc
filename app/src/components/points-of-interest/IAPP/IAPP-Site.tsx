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
    biological_treatments,
    biological_dispersals
  } = props?.record?.point_of_interest_payload?.form_data;
  const longitude = parseFloat(props?.record?.point_of_interest_payload?.geometry[0]?.geometry?.coordinates[0]).toFixed(
    6
  );
  const latitude = parseFloat(props?.record?.point_of_interest_payload?.geometry[0]?.geometry?.coordinates[1]).toFixed(
    6
  );

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
              {ifApplicable(site.project_code[0].description)}
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
              {(surveys?.length &&
                surveys[0].jurisdictions?.length &&
                ifApplicable(surveys[0].jurisdictions[0].jurisdiction_code) +
                  ' (' +
                  surveys[0].jurisdictions[0].percentage +
                  '%)') ||
                'Not Provided'}
            </Grid>
            <Grid item xs={3}>
              {surveys?.length &&
                surveys[0].jurisdictions?.length > 1 &&
                ifApplicable(surveys[0].jurisdictions[1].jurisdiction_code) +
                  ' (' +
                  surveys[0].jurisdictions[1].percentage +
                  '%)'}
            </Grid>
            <Grid item xs={3}>
              {surveys?.length &&
                surveys[0].jurisdictions?.length > 2 &&
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
              {ifApplicable(site.general_comment)}
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
              'Area (m\u00B2)',
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
              !surveys?.length
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
                      children: row.general_comment
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
              'Reported Area (m\u00B2)',
              'Mech Method',
              'Paper File ID',
              {
                className: classes.wideCell,
                children: 'Comments'
              }
            ]}
            rows={
              !mechanical_treatments.length
                ? []
                : mechanical_treatments.map((row) => [
                    row.treatment_id,
                    row.mechanical_id,
                    row.common_name,
                    row.treatment_date,
                    row.invasive_species_agency_code,
                    row.reported_area,
                    '(' + row.mechanical_method_code + ') ' + row.mechanical_method,
                    row.project_code[0].description,
                    {
                      className: classes.wideCell,
                      children: row.general_comment
                    }
                  ])
            }
            dropdown={(i) =>
              !mechanical_treatments[i].monitoring?.length ? null : (
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
                    row.invasive_species_agency_code,
                    row.efficacy_percent,
                    row.project_code[0].description,
                    {
                      className: classes.wideCell,
                      children: row.general_comment
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
              'Reported Area (m\u00B2)',
              'Method',
              'Paper File ID',
              {
                className: classes.wideCell,
                children: 'Comments'
              }
            ]}
            rows={
              !chemical_treatments?.length
                ? []
                : chemical_treatments.map((row) => [
                    row.treatment_id,
                    row.common_name,
                    row.treatment_date,
                    row.invasive_species_agency_code,
                    row.reported_area,
                    row.chemical_method,
                    row.project_code[0].description,
                    {
                      className: classes.wideCell,
                      children: row.general_comment
                    }
                  ])
            }
            dropdown={(i) =>
              !chemical_treatments[i].monitoring?.length ? null : (
                <React.Fragment key={'dropdown_' + i}>
                  <IAPPTable
                    headers={[
                      'PMP Confirmation #',
                      'Herbicide',
                      'PMRA Reg #',
                      'Temperature',
                      'Humidity',
                      'Wind Velocity',
                      'Wind Direction',
                      'Application Rate',
                      'Amount Used',
                      'Dilution Rate',
                      'Mix Delivery Rate'
                    ]}
                    rows={[
                      [
                        chemical_treatments[i].pmp_confirmation_number,
                        chemical_treatments[i].herbicide_description,
                        chemical_treatments[i].pmra_reg_number,
                        chemical_treatments[i].temperature,
                        chemical_treatments[i].humidity,
                        chemical_treatments[i].wind_speed,
                        chemical_treatments[i].wind_direction,
                        chemical_treatments[i].application_rate,
                        chemical_treatments[i].herbicide_amount,
                        chemical_treatments[i].dilution,
                        chemical_treatments[i].mix_delivery_rate
                      ]
                    ]}
                  />
                  <br />
                  {chemical_treatments[i].monitoring?.length && (
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
                        row.monitoring_date,
                        row.invasive_species_agency_code,
                        row.efficacy_percent,
                        row.project_code[0].description,
                        {
                          className: classes.wideCell,
                          children: row.general_comment
                        }
                      ])}
                    />
                  )}
                </React.Fragment>
              )
            }
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
              'Treatment ID',
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
              !biological_treatments?.length
                ? []
                : biological_treatments.map((row) => [
                    row.treatment_id,
                    row.common_name,
                    row.treatment_date,
                    row.collection_date,
                    row.bioagent_source,
                    row.invasive_species_agency_code,
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
                    row.project_code[0].description,
                    {
                      className: classes.wideCell,
                      children: row.general_comment
                    }
                  ])
            }
            dropdown={(i) =>
              !biological_treatments[i].monitoring?.length ? null : (
                <IAPPTable
                  key={'dropdown_' + i}
                  headers={[
                    'Monitoring ID',
                    'Inspection Date',
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
                    'UTM Zone',
                    'UTM Easting',
                    'UTM Northing',
                    'Paper File ID',
                    {
                      className: classes.wideCell,
                      children: 'Comment'
                    }
                  ]}
                  rows={biological_treatments[i].monitoring.map((row, j) => [
                    row.monitoring_id,
                    row.monitoring_date,
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
                    row.utm_zone,
                    row.utm_easting,
                    row.utm_northing,
                    row.project_code[0].description,
                    {
                      className: classes.wideCell,
                      children: row.general_comment
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
          <Typography className={classes.heading}>Biological Dispersals</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <IAPPTable
            headers={[
              'Biological ID',
              'Species (Common)',
              'Inspection Date',
              'Paper File ID',
              'Plant Count',
              'Agent Count',
              'Count Duration',
              'Agent Code',
              'Foliar Feeding Damage',
              'Root Feeding Damage',
              'Seed Feeding Damage',
              'Oviposition Feeding Damage',
              'Eggs Present',
              'Larvae Present',
              'Pupae Present',
              'Adults Present',
              'Tunnels Present',
              'UTM Zone',
              'UTM Easting',
              'UTM Northing',
              {
                className: classes.wideCell,
                children: 'Comments'
              }
            ]}
            rows={
              !biological_dispersals?.length
                ? []
                : biological_dispersals.map((row) => [
                    row.biological_dispersal_id,
                    row.common_name,
                    row.monitoring_date,
                    row.project_code[0].description,
                    row.plant_count,
                    row.agent_count,
                    row.count_duration,
                    row.biological_agent_code,
                    row.foliar_feeding_damage_ind,
                    row.root_feeding_damage_ind,
                    row.seed_feeding_damage_ind,
                    row.oviposition_marks_ind,
                    row.eggs_present_ind,
                    row.larvae_present_ind,
                    row.pupae_present_ind,
                    row.adults_present_ind,
                    row.tunnels_present_ind,
                    row.utm_zone,
                    row.utm_easting,
                    row.utm_northing,
                    {
                      className: classes.wideCell,
                      children: row.general_comment
                    }
                  ])
            }
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

  return !rows?.length ? (
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
