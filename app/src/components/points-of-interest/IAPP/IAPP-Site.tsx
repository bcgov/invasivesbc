import { Accordion, AccordionDetails, AccordionSummary, Container, Grid, Theme, Typography } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import { TreatmentsTable } from './ExtractTables';
import { getJurisdictions } from './IAPP-Functions';
import { SurveysTable } from './SurveyTable';
import { Photos } from './Photos';
import { RequiresNetwork } from '../../common/RequiresNetwork';

const useStyles = makeStyles((theme: Theme) => ({
  heading: {
    fontSize: theme.typography.pxToRem(18),
    fontWeight: theme.typography.fontWeightBold,
    align: 'center'
  },
  subHeading: {
    fontSize: theme.typography.pxToRem(16),
    fontWeight: theme.typography.fontWeightBold,
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
  const media = props?.record?.point_of_interest_payload?.importedMedia || [];
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
  const date_entered = site.date_entered.substring(0, site.date_entered.indexOf('T'));
  const date_updated = site.date_updated.substring(0, site.date_updated.indexOf('T'));

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
              <Typography className={classes.subHeading}>Created:</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(date_created)}
            </Grid>
            <Grid item xs={3} sm={2}>
              <Typography className={classes.subHeading}>Paper File ID:</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.project_code[0]?.description)}
            </Grid>

            <Grid item xs={3} sm={2}>
              <Typography className={classes.subHeading}>Mapsheet:</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.map_sheet)}
            </Grid>
            <Grid item xs={3} sm={2}>
              <Typography className={classes.subHeading}>UTM Zone:</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.utm_zone)}
            </Grid>

            <Grid item xs={3} sm={2}>
              <Typography className={classes.subHeading}>UTM Easting:</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.utm_easting)}
            </Grid>
            <Grid item xs={3} sm={2}>
              <Typography className={classes.subHeading}>UTM Northing:</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.utm_northing)}
            </Grid>

            <Grid item xs={3} sm={2}>
              <Typography className={classes.subHeading}>Longitude:</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(longitude)}
            </Grid>
            <Grid item xs={3} sm={2}>
              <Typography className={classes.subHeading}>Latitude:</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(latitude)}
            </Grid>

            <Grid item xs={3} sm={2}>
              <Typography className={classes.subHeading}>Elevation (m):</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.site_elevation)}
            </Grid>
            <Grid item xs={3} sm={2}>
              <Typography className={classes.subHeading}>Range Unit ID:</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.range_unit_id)}
            </Grid>

            <Grid item xs={3} sm={2}>
              <Typography className={classes.subHeading}>Site Specific Use:</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.specific_use_code)}
            </Grid>

            <Grid item xs={3} sm={2}>
              <Typography className={classes.subHeading}>Aspect:</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.aspect_code)}
            </Grid>
            <Grid item xs={3} sm={2}>
              <Typography className={classes.subHeading}>Slope (%):</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.slope_code)}
            </Grid>

            <Grid item xs={3} sm={2}>
              <Typography className={classes.subHeading}>Soil Texture:</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.soil_texture_code)}
            </Grid>

            <Grid item xs={3} sm={2}>
              <Typography className={classes.subHeading}>Jurisdictions:</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
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
              <Typography className={classes.subHeading}>Site Location Details:</Typography>{' '}
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.access_description)}
            </Grid>
            <Grid item xs={3} sm={2}>
              <Typography className={classes.subHeading}>Site Comments:</Typography>
            </Grid>
            <Grid item xs={9} sm={10}>
              {ifApplicable(site?.general_comment)}
            </Grid>

            <Grid item xs={3} sm={2}>
              <Typography className={classes.subHeading}>Entered By:</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.entered_by)}
            </Grid>

            <Grid item xs={3} sm={2}>
              <Typography className={classes.subHeading}>Date Entered:</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(date_entered)}
            </Grid>

            <Grid item xs={3} sm={2}>
              <Typography className={classes.subHeading}>Updated By:</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.updated_by)}
            </Grid>

            <Grid item xs={3} sm={2}>
              <Typography className={classes.subHeading}>Date Updated:</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(date_updated)}
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <RequiresNetwork networkRequirement={'connected'}>
        <Photos media={media} />
      </RequiresNetwork>

      {/* oldRecords Table <IAPPSurveyTable rows={surveys} /> */}
      <SurveysTable surveys={surveys} />

      {mechanical_treatments.length > 0 && (
        <TreatmentsTable type={'Mechanical Treatment'} treatments={mechanical_treatments} />
      )}

      {chemical_treatments.length > 0 && (
        <TreatmentsTable type={'Chemical Treatment'} treatments={chemical_treatments} />
      )}

      {biological_treatments.length > 0 && (
        <TreatmentsTable type={'Biological Treatment'} treatments={biological_treatments} />
      )}

      {biological_dispersals.length > 0 && (
        <TreatmentsTable type={'Biological Dispersal'} treatments={biological_dispersals} />
      )}
    </Container>
  );
};
