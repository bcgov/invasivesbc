import { Accordion, AccordionDetails, AccordionSummary, Container, Grid, Theme, Typography } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import React from 'react';
import { getJurisdictions } from '../../../utils/IAPPHelpers';
import { SurveysTable } from './SurveyTable';
import { TreatmentsTable } from './TreatmentsTable';
// import { TreatmentsTable } from './ExtractTables';
// import { getJurisdictions } from './IAPP-Functions';
// import { SurveysTable } from './SurveyTable';

export interface IAPPSitePropType {
  record: any;
}

export const Summary: React.FC<IAPPSitePropType> = ({ record }) => {
  const form_data = record.point_of_interest_payload?.form_data;
  const site = {
    ...form_data?.point_of_interest_data,
    ...form_data?.point_of_interest_type_data
  };
  const { surveys, mechanical_treatments, chemical_treatments, biological_treatments, biological_dispersals } =
    form_data;
  const coordinates = record.point_of_interest_payload?.geometry[0]?.geometry?.coordinates;
  const longitude = parseFloat(coordinates[0]).toFixed(6);
  const latitude = parseFloat(coordinates[1]).toFixed(6);
  const jurisdictions: any = getJurisdictions(surveys);
  const date_created = site.date_created.substring(0, site.date_created.indexOf('T'));
  const date_entered = site.date_entered.substring(0, site.date_entered.indexOf('T'));
  const date_updated = site.date_updated.substring(0, site.date_updated.indexOf('T'));

  const ifApplicable = (value) =>
    value && String(value).trim() ? value : <div className="records__iapp__missing">N/A</div>;

  return (
    <Container style={{ paddingBottom: '50px' }}>
      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-map-content" id="panel-map-header">
          <Typography>Legacy IAPP Site: {site?.site_id}</Typography>
        </AccordionSummary>

        <AccordionDetails>
          <Grid container spacing={1}>
            <Grid item xs={3} sm={2}>
              <Typography>Created:</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(date_created)}
            </Grid>
            <Grid item xs={3} sm={2}>
              <Typography>Paper File ID:</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.project_code[0]?.description)}
            </Grid>

            <Grid item xs={3} sm={2}>
              <Typography>Mapsheet:</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.map_sheet)}
            </Grid>
            <Grid item xs={3} sm={2}>
              <Typography>UTM Zone:</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.utm_zone)}
            </Grid>

            <Grid item xs={3} sm={2}>
              <Typography>UTM Easting:</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.utm_easting)}
            </Grid>
            <Grid item xs={3} sm={2}>
              <Typography>UTM Northing:</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.utm_northing)}
            </Grid>

            <Grid item xs={3} sm={2}>
              <Typography>Longitude:</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(longitude)}
            </Grid>
            <Grid item xs={3} sm={2}>
              <Typography>Latitude:</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(latitude)}
            </Grid>

            <Grid item xs={3} sm={2}>
              <Typography>Elevation (m):</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.site_elevation)}
            </Grid>
            <Grid item xs={3} sm={2}>
              <Typography>Range Unit ID:</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.range_unit_id)}
            </Grid>

            <Grid item xs={3} sm={2}>
              <Typography>Site Specific Use:</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.specific_use_code)}
            </Grid>

            <Grid item xs={3} sm={2}>
              <Typography>Aspect:</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.aspect_code)}
            </Grid>
            <Grid item xs={3} sm={2}>
              <Typography>Slope (%):</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.slope_code)}
            </Grid>

            <Grid item xs={3} sm={2}>
              <Typography>Soil Texture:</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.soil_texture_code)}
            </Grid>

            <Grid item xs={3} sm={2}>
              <Typography>Jurisdictions:</Typography>
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
              <Typography>Site Location Details:</Typography>{' '}
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.access_description)}
            </Grid>
            <Grid item xs={3} sm={2}>
              <Typography>Site Comments:</Typography>
            </Grid>
            <Grid item xs={9} sm={10}>
              {ifApplicable(site?.general_comment)}
            </Grid>

            <Grid item xs={3} sm={2}>
              <Typography>Entered By:</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.entered_by)}
            </Grid>

            <Grid item xs={3} sm={2}>
              <Typography>Date Entered:</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(date_entered)}
            </Grid>

            <Grid item xs={3} sm={2}>
              <Typography>Updated By:</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.updated_by)}
            </Grid>

            <Grid item xs={3} sm={2}>
              <Typography>Date Updated:</Typography>
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(date_updated)}
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

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
