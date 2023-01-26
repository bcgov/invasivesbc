import { Accordion, AccordionDetails, AccordionSummary, Container, Grid, Theme, Typography } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import { TreatmentsTable } from './ExtractTables';
import { getJurisdictions } from './IAPP-Functions';
import { SurveysTable } from './SurveyTable';
import IAPPPhotoContainer from 'components/photo/IAPPPhotoContainer';

const useStyles = makeStyles((theme: Theme) => ({
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
  const { surveys, mechanical_treatments, chemical_treatments, biological_treatments, biological_dispersals } =
    form_data;
  const coordinates = props?.record?.point_of_interest_payload?.geometry[0]?.geometry?.coordinates;
  const longitude = parseFloat(coordinates[0]).toFixed(6);
  const latitude = parseFloat(coordinates[1]).toFixed(6);
  const jurisdictions: any = getJurisdictions(surveys);
  const date_created = site.date_created.substring(0, site.date_created.indexOf('T'));

  const ifApplicable = (value) =>
    value && String(value).trim() ? value : <div className={classes.missingValue}>N/A</div>;

  return (
    <Container style={{ paddingBottom: '50px' }}>
      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-map-content" id="panel-map-header">
          <Typography className={classes.heading}>Legacy IAPP Site: {site?.site_id}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={1}>
            <Grid item xs={3} sm={2}>
              Created
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(date_created)}
            </Grid>
            <Grid item xs={3} sm={2}>
              Slope
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.slope_code)}
            </Grid>

            <Grid item xs={3} sm={2}>
              PaperFile
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.project_code[0]?.description)}
            </Grid>
            <Grid item xs={3} sm={2}>
              Aspect
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.aspect_code)}
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
              {ifApplicable(site?.site_elevation)}
            </Grid>
            <Grid item xs={3} sm={2}>
              Specific Use
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.specific_use_code)}
            </Grid>

            <Grid item xs={3} sm={2}>
              Mapsheet
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.map_sheet)}
            </Grid>
            <Grid item xs={3} sm={2}>
              Soil Texture
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.soil_texture_code)}
            </Grid>

            <Grid item xs={3} sm={2}>
              Jurisdiction
            </Grid>
            <Grid item xs={9}>
              {jurisdictions.map((jurisdiction) => {
                return (
                  <>
                    {jurisdiction.jurisdiction_code} ({jurisdiction.percent_covered}%)
                    <br />
                  </>
                );
              }) || 'Not Provided'}
            </Grid>
            <Grid item xs={3} sm={2}>
              Access Description
            </Grid>
            <Grid item xs={9} sm={10}>
              {ifApplicable(site?.access_description)}
            </Grid>

            <Grid item xs={3} sm={2}>
              Comments
            </Grid>
            <Grid item xs={9} sm={10}>
              {ifApplicable(site?.general_comment)}
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-photo-content" id="panel-photo-header">
          <Typography className={classes.heading}>IAPP Photos</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <IAPPPhotoContainer />
        </AccordionDetails>
      </Accordion>

      {/* oldRecords Table <IAPPSurveyTable rows={surveys} /> */}
      <SurveysTable surveys={surveys} />

      {/* oldRecords Table {mechanical_treatments && <IAPPMechanicalTreatmentsTable rows={mechanical_treatments} />} */}
      <TreatmentsTable type={'Mechanical'} treatments={mechanical_treatments} />

      {/* oldRecords Table {chemical_treatments && <IAPPChemicalTreatmentsTable rows={chemical_treatments} />} */}
      <TreatmentsTable type={'Chemical'} treatments={chemical_treatments} />

      {/* oldRecords Table {biological_treatments && <IAPPBiologicalTreatmentsTable rows={biological_treatments} />} */}
      <TreatmentsTable type={'Biological Treatment'} treatments={biological_treatments} />

      {/* oldRecords Table {biological_dispersals && <IAPPBiologicalDispersalsTable rows={biological_dispersals} />} */}
      <TreatmentsTable type={'Biological Dispersal'} treatments={biological_dispersals} />
    </Container>
  );
};
