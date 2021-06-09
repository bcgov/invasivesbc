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
import { KeyboardArrowUp, KeyboardArrowDown, ExpandMore, DeleteForever } from '@material-ui/icons';
import React from 'react';
import {
  IAPPSurveyTable,
  IAPPMechanicalTreatmentsTable,
  IAPPChemicalTreatmentsTable,
  IAPPBiologicalTreatmentsTable,
  IAPPBiologicalDispersalsTable
} from '../../common/RecordTables';

const useStyles = makeStyles((theme) => ({
  heading: {
    fontSize: theme.typography.pxToRem(18),
    fontWeight: theme.typography.fontWeightRegular,
    align: 'center'
  },
  wideCell: {
    minWidth: 500,
    maxWidth: 500
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
  const form_data = props?.record?.point_of_interest_payload?.form_data;
  const site = {
    ...form_data?.point_of_interest_data,
    ...form_data?.point_of_interest_type_data
  };
  const {
    surveys,
    mechanical_treatments,
    chemical_treatments,
    biological_treatments,
    biological_dispersals
  } = form_data;
  const coordinates = props?.record?.point_of_interest_payload?.geometry[0]?.geometry?.coordinates;
  const longitude = parseFloat(coordinates[0]).toFixed(6);
  const latitude = parseFloat(coordinates[1]).toFixed(6);

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
              {(surveys?.[0]?.jurisdictions?.length > 0 &&
                ifApplicable(surveys[0].jurisdictions[0].jurisdiction_code) +
                  ' (' +
                  surveys[0].jurisdictions[0].percent_covered +
                  '%)') ||
                'Not Provided'}
            </Grid>
            <Grid item xs={3}>
              {surveys?.[0]?.jurisdictions?.length > 1 &&
                ifApplicable(surveys[0].jurisdictions[1].jurisdiction_code) +
                  ' (' +
                  surveys[0].jurisdictions[1].percent_covered +
                  '%)'}
            </Grid>
            <Grid item xs={3}>
              {surveys?.[0]?.jurisdictions?.length > 2 &&
                ifApplicable(surveys[0].jurisdictions[2].jurisdiction_code) +
                  ' (' +
                  surveys[0].jurisdictions[2].percent_covered +
                  '%)'}
            </Grid>

            <Grid item xs={3} sm={2}>
              Access Description
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

      <IAPPSurveyTable rows={surveys} />

      <IAPPMechanicalTreatmentsTable rows={mechanical_treatments} />

      <IAPPChemicalTreatmentsTable rows={chemical_treatments} />

      <IAPPBiologicalTreatmentsTable rows={biological_treatments} />

      <IAPPBiologicalDispersalsTable rows={biological_dispersals} />

      <br />
      <br />
      <br />
      <br />
    </Container>
  );
};
