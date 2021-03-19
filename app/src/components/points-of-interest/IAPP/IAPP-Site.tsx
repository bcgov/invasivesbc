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
import RecordTable from '../../common/RecordTable';

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

      <CollapseableTable
        tableName={"Survey Details on Site " + site.site_id}
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

      <CollapseableTable
        tableName="Mechanical Treatments and Efficacy Monitoring"
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
                row.project_code?.[0]?.description,
                {
                  className: classes.wideCell,
                  children: row.general_comment
                }
              ])
        }
        dropdown={(i) =>
          !mechanical_treatments[i].monitoring?.length ? null : (
            <RecordTable
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
                row.project_code?.[0]?.description,
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

      <CollapseableTable
        tableName="Chemical Treatments and Efficacy Monitoring"
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
                row.project_code?.[0]?.description,
                {
                  className: classes.wideCell,
                  children: row.general_comment
                }
              ])
        }
        dropdown={(i) =>
          !chemical_treatments[i].monitoring?.length ? null : (
            <React.Fragment key={'dropdown_' + i}>
              <RecordTable
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
                <RecordTable
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
                    row.project_code?.[0]?.description,
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

      <CollapseableTable
        tableName="Biological Treatments and Efficacy Monitoring"
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
                row.project_code?.[0]?.description,
                {
                  className: classes.wideCell,
                  children: row.general_comment
                }
              ])
        }
        dropdown={(i) =>
          !biological_treatments[i].monitoring?.length ? null : (
            <RecordTable
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
                row.project_code?.[0]?.description,
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

      <CollapseableTable
        tableName="Biological Dispersals"
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
                row.project_code?.[0]?.description,
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

      <br />
      <br />
      <br />
      <br />
    </Container>
  );
};

const CollapseableTable = (props) => {
  const {tableName, ...etc} = props;
  const classes = useStyles();

  return (
    <Accordion defaultExpanded={false}>
      <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-map-content" id="panel-map-header">
        <Typography className={classes.heading}>{tableName}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <RecordTable {...etc} />
      </AccordionDetails>
    </Accordion>
  );
}