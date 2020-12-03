import { Container, Accordion, AccordionDetails, AccordionSummary, Grid, makeStyles, Paper, Typography,
  TableContainer, TableCell, TableRow, TableHead, Table, TableBody } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import FormContainer, { IFormContainerProps } from 'components/form/FormContainer';
import MapContainer, { IMapContainerProps } from 'components/map/MapContainer';
import PhotoContainer, { IPhotoContainerProps } from 'components/photo/PhotoContainer';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  heading: {
    fontSize: theme.typography.pxToRem(18),
    fontWeight: theme.typography.fontWeightRegular,
    align: 'center'
  },
  container: {
  },
  siteContainer: {},
  surveyContainer: {},
  treatmentContainer: {},
  photoContainer: {},
  paper: {
    padding: theme.spacing(2),
    textAlign: 'left',
    color: theme.palette.text.primary
  },
  table: {
    width: "auto",
    tableLayout: 'auto'
  },
  cell: {
    whiteSpace: 'nowrap'
  },
  wideCell: {
    whiteSpace: 'nowrap'
  },
  missingValue: {
    fontStyle: 'italic',
    color: '#777'
  }
}));

export interface IAPPSitePropType {
  record: any;
}
export const IAPPSite: React.FC<IAPPSitePropType> = (props) => {
  const classes = useStyles();

  const {site_id, map_sheet, slope, aspect, elevation, specific_use, soil_texture, surveys, mechanical_treatments, comments}
     = props?.record?.point_of_interest_payload?.form_data?.point_of_interest_type_data;
  const {access_description, created_date_on_device}
     = props?.record?.point_of_interest_payload?.form_data?.point_of_interest_data;
  const paper_file = props?.record?.point_of_interest_payload?.form_data?.point_of_interest_data?.paper_file[0]?.description;
  const longitude = props?.record?.point_of_interest_payload?.geometry[0]?.geometry?.coordinates[0];
  const latitude = props?.record?.point_of_interest_payload?.geometry[0]?.geometry?.coordinates[1];
  const {Jur1, Jur1pct, Jur2, Jur2pct, Jur3, Jur3pct} = surveys ? surveys[0] : {Jur1: 'Not Specified', Jur1pct: '100', Jur2: '', Jur2pct: '0', Jur3: '', Jur3pct: '0'};
  // Tester: {Jur1:'A', Jur1pct:'50', Jur2:'B', Jur2pct:'20', Jur3:'C', Jur3pct:'30'};

  const ifApplicable = (value) => (value && String(value).trim() != '') ? value : <div className={classes.missingValue}>N/A</div>;

  return (
    <Container style={{maxWidth: 1200}}>
      <Accordion defaultExpanded={true} className={classes.container}>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-map-content" id="panel-map-header">
          <Typography className={classes.heading}>
            Legacy IAPP Site: {site_id}
          </Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.siteContainer}>
          <Grid container spacing={1}>
            <Grid item xs={3} sm={2}>Created</Grid>
            <Grid item xs={9} sm={4}>{ifApplicable(created_date_on_device)}</Grid>
            <Grid item xs={3} sm={2}>Slope</Grid>
            <Grid item xs={9} sm={4}>{ifApplicable(slope)}</Grid>

            <Grid item xs={3} sm={2}>PaperFile</Grid>
            <Grid item xs={9} sm={4}>{ifApplicable(paper_file)}</Grid>
            <Grid item xs={3} sm={2}>Aspect</Grid>
            <Grid item xs={9} sm={4}>{ifApplicable(aspect)}</Grid>

            <Grid item xs={3} sm={2}>Longitude</Grid>
            <Grid item xs={9} sm={4}>{ifApplicable(longitude)}</Grid>
            <Grid item xs={3} sm={2}>Latitude</Grid>
            <Grid item xs={9} sm={4}>{ifApplicable(latitude)}</Grid>

            <Grid item xs={3} sm={2}>Elevation</Grid>
            <Grid item xs={9} sm={4}>{ifApplicable(latitude)}</Grid>
            <Grid item xs={3} sm={2}>Specific Use</Grid>
            <Grid item xs={9} sm={4}>{ifApplicable(specific_use)}</Grid>

            <Grid item xs={3} sm={2}>Mapsheet</Grid>
            <Grid item xs={9} sm={4}>{ifApplicable(map_sheet)}</Grid>
            <Grid item xs={3} sm={2}>Soil Texture</Grid>
            <Grid item xs={9} sm={4}>{ifApplicable(soil_texture)}</Grid>

            <Grid item xs={3} sm={2}>Jurisdiction</Grid>
            <Grid item xs={3}>{ifApplicable(Jur1)}{Jur1pct && Jur1pct != '0' ? ' (' + Jur1pct + '%)' : ''}</Grid>
            <Grid item xs={3}>{Jur2 ?? ''}{Jur2pct && Jur2pct != '0' ? ' (' + Jur2pct + '%)' : ''}</Grid>
            <Grid item xs={3}>{Jur3 ?? ''}{Jur3pct && Jur3pct != '0' ? ' (' + Jur3pct + '%)' : ''}</Grid>

            <Grid item xs={3} sm={2}>Location</Grid>
            <Grid item xs={9} sm={10}>{ifApplicable(access_description)}</Grid>

            <Grid item xs={3} sm={2}>Comments</Grid>
            <Grid item xs={9} sm={10}>{ifApplicable(comments)}</Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-map-content" id="panel-map-header">
          <Typography className={classes.heading}>Survey Details on Site {site_id}</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.surveyContainer}>
          {!surveys || surveys.length === 0 && <Container>No Surveys</Container>}
          {surveys && surveys.length !== 0 &&
            <TableContainer component={Paper}>
              <Table className={classes.table} aria-label="surveys">
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.cell}>Survey ID</TableCell>
                    <TableCell className={classes.cell}>Common Name</TableCell>
                    <TableCell className={classes.cell}>Species</TableCell>
                    <TableCell className={classes.cell}>Survey Date</TableCell>
                    <TableCell className={classes.cell}>Agency</TableCell>
                    <TableCell className={classes.cell}>Hectares</TableCell>
                    <TableCell align="center" className={classes.cell}>Density</TableCell>
                    <TableCell align="center" className={classes.cell}>Distribution</TableCell>
                    <TableCell className={classes.wideCell}>Comments</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {surveys.map((row) => (
                    <TableRow key={row.SurveyID}>
                      <TableCell className={classes.cell}>{ifApplicable(row.SurveyID)}</TableCell>
                      <TableCell className={classes.cell}>{ifApplicable(row.CommonName)}</TableCell>
                      <TableCell className={classes.cell}>{ifApplicable(row.Species)}</TableCell>
                      <TableCell className={classes.cell}>{ifApplicable(row.SurveyDate)}</TableCell>
                      <TableCell className={classes.cell}>{ifApplicable(row.SurveyAgency)}</TableCell>
                      <TableCell className={classes.cell}>{ifApplicable(row.EstArea)}</TableCell>
                      <TableCell align="center" className={classes.cell}>{ifApplicable(row.Density)}</TableCell>
                      <TableCell align="center" className={classes.cell}>{ifApplicable(row.Distribution)}</TableCell>
                      <TableCell className={classes.wideCell}>{ifApplicable(row.Comment)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          }
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-map-content" id="panel-map-header">
          <Typography className={classes.heading}>Treatment Details</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.treatmentContainer}>
          {!mechanical_treatments || mechanical_treatments.length === 0 && <Container>No Treatments</Container>}
          {mechanical_treatments && mechanical_treatments.length !== 0 &&
            <TableContainer component={Paper}>
              <Table className={classes.table} aria-label="surveys">
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.cell}>Mechanical ID</TableCell>
                    <TableCell className={classes.cell}>Common Name</TableCell>
                    <TableCell className={classes.cell}>Treatment Date</TableCell>
                    <TableCell className={classes.cell}>Agency</TableCell>
                    <TableCell className={classes.cell}>Hectares</TableCell>
                    <TableCell align="center" className={classes.cell}>Mech Method</TableCell>
                    <TableCell align="center" className={classes.cell}>PaperFile ID</TableCell>
                    <TableCell className={classes.wideCell}>Comments</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mechanical_treatments.map((row) => (
                    <TableRow key={row.MechanicalID}>
                      <TableCell className={classes.cell}>{ifApplicable(row.MechanicalID)}</TableCell>
                      <TableCell className={classes.cell}>{ifApplicable(row.CommonName)}</TableCell>
                      <TableCell className={classes.cell}>{ifApplicable(row.TreatmentDate)}</TableCell>
                      <TableCell className={classes.cell}>{ifApplicable(row.TreatmentAgency)}</TableCell>
                      <TableCell className={classes.cell}>{ifApplicable(row.AreaTreated)}</TableCell>
                      <TableCell align="center" className={classes.cell}>{ifApplicable(row.MechanicalMethod)}</TableCell>
                      <TableCell align="center" className={classes.cell}>{ifApplicable(row.PaperFileID)}</TableCell>
                      <TableCell className={classes.wideCell}>{ifApplicable(row.Comment)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          }
        </AccordionDetails>
      </Accordion>
      <br/><br/><br/><br/>
    </Container>
  );
};
