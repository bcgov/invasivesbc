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

      <RecordTable
        tableName={'Survey Details on Site ' + site.site_id}
        keyField="survey_id"
        startingOrderBy="survey_id"
        startingOrder="desc"
        actions={false}
        headers={[
          {
            id: 'survey_id',
            title: 'Survey ID',
            type: 'number'
          },
          {
            id: 'common_name',
            title: 'Common Name'
          },
          {
            id: 'species',
            title: 'Species'
          },
          {
            id: 'genus',
            title: 'Genus'
          },
          {
            id: 'survey_date',
            title: 'Survey Date'
          },
          {
            id: 'invasive_species_agency_code',
            title: 'Agency'
          },
          {
            id: 'reported_area',
            title: 'Area (m\u00B2)',
            type: 'number'
          },
          {
            id: 'density',
            align: 'center',
            title: 'Density'
          },
          {
            id: 'distribution',
            align: 'center',
            title: 'Distribution'
          },
          {
            id: 'general_comment',
            title: 'Comments'
          }
        ]}
        rows={
          !surveys?.length
            ? []
            : surveys.map((row) => ({
                ...row,
                density: row.density + (row.density ? ' (' + row.invasive_plant_density_code + ')' : ''),
                distribution:
                  row.distribution + (row.distribution ? ' (' + row.invasive_plant_distribution_code + ')' : '')
              }))
        }
      />

      <RecordTable
        tableName="Mechanical Treatments and Efficacy Monitoring"
        startExpanded={false}
        keyField="treatment_id"
        startingOrderBy="treatment_id"
        startingOrder="desc"
        actions={false}
        headers={[
          {
            id: 'treatment_id',
            title: 'Treatment ID',
            type: 'number'
          },
          {
            id: 'common_name',
            title: 'Species (Common)'
          },
          {
            id: 'treatment_date',
            title: 'Treatment Date'
          },
          {
            id: 'invasive_species_agency_code',
            title: 'Agency'
          },
          {
            id: 'reported_area',
            title: 'Reported Area (m\u00B2)',
            type: 'number'
          },
          {
            id: 'mechanical_method_code_label', // custom
            title: 'Mech Method'
          },
          {
            id: 'project_code_label',
            title: 'Project Code'
          },
          {
            id: 'general_comment',
            title: 'Comments'
          }
        ]}
        rows={
          !mechanical_treatments.length
            ? []
            : mechanical_treatments.map((row) => ({
                ...row,
                mechanical_method_code_title: '(' + row.mechanical_method_code + ') ' + row.mechanical_method,
                project_code_title: row.project_code[0].description
              }))
        }
        dropdown={(row) =>
          !row.monitoring?.length ? undefined : (
            <RecordTable
              tableName="Monitoring"
              startExpanded={true}
              startingOrderBy="monitoring_id"
              startingOrder="desc"
              keyField="monitoring_id"
              actions={false}
              headers={[
                {
                  id: 'monitoring_id',
                  title: 'Monitoring ID',
                  type: 'number'
                },
                {
                  id: 'monitoring_date',
                  title: 'Monitoring Date'
                },
                {
                  id: 'invasive_species_agency_code',
                  title: 'Agency'
                },
                {
                  id: 'efficacy_percent',
                  title: 'Efficacy',
                  type: 'number'
                },
                {
                  id: 'project_code_label',
                  title: 'Project Code'
                },
                {
                  id: 'general_comment',
                  title: 'Comments'
                }
              ]}
              rows={
                !row.monitoring.length
                  ? []
                  : row.monitoring.map((monitor, j) => ({
                      ...monitor,
                      project_code_title: monitor.project_code[0].description
                    }))
              }
            />
          )
        }
      />

      <RecordTable
        tableName="Chemical Treatments and Efficacy Monitoring"
        startExpanded={false}
        keyField="treatment_id"
        startingOrderBy="treatment_id"
        startingOrder="desc"
        actions={false}
        headers={[
          {
            id: 'treatment_id',
            title: 'Treatment ID',
            type: 'number'
          },
          {
            id: 'common_name',
            title: 'Species (Common)'
          },
          {
            id: 'treatment_date',
            title: 'Treatment Date'
          },
          {
            id: 'invasive_species_agency_code',
            title: 'Agency'
          },
          {
            id: 'reported_area',
            title: 'Reported Area (m\u00B2)',
            type: 'number'
          },
          {
            id: 'chemical_method', // custom
            title: 'Method'
          },
          {
            id: 'project_code_label',
            title: 'Project Code'
          },
          {
            id: 'general_comment',
            title: 'Comments'
          }
        ]}
        rows={
          !chemical_treatments.length
            ? []
            : chemical_treatments.map((row) => ({
                ...row,
                project_code_title: row.project_code[0].description
              }))
        }
        dropdown={(row) => (
          <React.Fragment key={row.treatment_id + '_expanded'}>
            <RecordTable
              startExpanded={true}
              keyField="treatment_id"
              actions={false}
              headers={[
                {
                  id: 'pmp_confirmation_number',
                  title: 'PMP Confirmation #'
                },
                {
                  id: 'herbicide_description',
                  title: 'Herbicide'
                },
                {
                  id: 'pmra_reg_number',
                  title: 'PMRA Reg #'
                },
                {
                  id: 'temperature',
                  title: 'Temperature',
                  type: 'number'
                },
                {
                  id: 'humidity',
                  title: 'Humidity'
                },
                {
                  id: 'wind_speed',
                  title: 'Wind Velocity',
                  type: 'number'
                },
                {
                  id: 'wind_direction',
                  title: 'Wind Direction'
                },
                {
                  id: 'application_rate',
                  title: 'Application Rate'
                },
                {
                  id: 'herbicide_amount',
                  title: 'Amount Used',
                  type: 'number'
                },
                {
                  id: 'dilution',
                  title: 'Dilution Rate'
                },
                {
                  id: 'mix_delivery_rate',
                  title: 'Mix Delivery Rate'
                }
              ]}
              rows={[row]} // singleton expanded table
              enableFiltering={false}
            />
            <RecordTable
              tableName="Monitoring"
              startExpanded={true}
              startingOrderBy="monitoring_date"
              keyField="monitoring_id"
              actions={false}
              headers={[
                {
                  id: 'monitoring_id',
                  title: 'Monitoring ID',
                  type: 'number'
                },
                {
                  id: 'monitoring_date',
                  title: 'Monitoring Date'
                },
                {
                  id: 'invasive_species_agency_code',
                  title: 'Agency'
                },
                {
                  id: 'efficacy_percent',
                  title: 'Efficacy',
                  type: 'number'
                },
                {
                  id: 'project_code_label',
                  title: 'Project Code'
                },
                {
                  id: 'general_comment',
                  title: 'Comments'
                }
              ]}
              rows={
                !row.monitoring.length
                  ? []
                  : row.monitoring.map((monitor, j) => ({
                      ...monitor,
                      project_code_title: monitor.project_code[0].description
                    }))
              }
            />
          </React.Fragment>
        )}
      />

      <RecordTable
        tableName="Biological Treatments and Efficacy Monitoring"
        startExpanded={false}
        keyField="treatment_id"
        startingOrderBy="treatment_id"
        startingOrder="desc"
        actions={false}
        headers={[
          {
            id: 'treatment_id',
            title: 'Treatment ID',
            type: 'number'
          },
          {
            id: 'common_name',
            title: 'Species (Common)'
          },
          {
            id: 'treatment_date',
            title: 'Treatment Date'
          },
          {
            id: 'collection_date',
            title: 'Collection Date'
          },
          {
            id: 'bioagent_source',
            title: 'Bioagent Source'
          },
          {
            id: 'invasive_species_agency_code',
            title: 'Agency'
          },
          {
            id: 'stage_larva_ind',
            title: 'Larvae?'
          },
          {
            id: 'stage_egg_ind',
            title: 'Eggs?'
          },
          {
            id: 'stage_pupa_ind',
            title: 'Pupae?'
          },
          {
            id: 'stage_other_ind',
            title: 'Other?'
          },
          {
            id: 'release_quantity',
            title: 'Release Quantity'
          },
          {
            id: 'area_classification_code',
            title: 'Area Classification Code'
          },
          {
            id: 'biological_agent_code',
            title: 'Biological Agent Code'
          },
          {
            id: 'project_code_label',
            title: 'Project Code'
          },
          {
            id: 'general_comment',
            title: 'Comments'
          }
        ]}
        rows={
          !biological_treatments.length
            ? []
            : biological_treatments.map((row) => ({
                ...row,
                project_code_title: row.project_code[0].description
              }))
        }
        dropdown={(row) =>
          !row.monitoring?.length ? undefined : (
            <RecordTable
              tableName="Monitoring"
              startExpanded={true}
              startingOrderBy="monitoring_id"
              startingOrder="desc"
              keyField="monitoring_id"
              actions={false}
              headers={[
                {
                  id: 'monitoring_id',
                  title: 'Monitoring ID',
                  type: 'number'
                },
                {
                  id: 'monitoring_date',
                  title: 'Monitoring Date'
                },
                {
                  id: 'plant_count',
                  title: 'Plant Count',
                  type: 'number'
                },
                {
                  id: 'agent_count',
                  title: 'Agent Count',
                  type: 'number'
                },
                {
                  id: 'count_duration',
                  title: 'Count Duration'
                },
                {
                  id: 'agent_destroyed_ind',
                  title: 'Agent Destroyed?'
                },
                {
                  id: 'legacy_presence_ind',
                  title: 'Legacy Presence?'
                },
                {
                  id: 'foliar_feeding_damage_ind',
                  title: 'Foliar Feeding Damage?'
                },
                {
                  id: 'root_feeding_damage_ind',
                  title: 'Root Feeding Damage?'
                },
                {
                  id: 'seed_feeding_damage_ind',
                  title: 'Seed Feeding Damage?'
                },
                {
                  id: 'oviposition_marks_ind',
                  title: 'Oviposition Marks?'
                },
                {
                  id: 'eggs_present_ind',
                  title: 'Eggs Present?'
                },
                {
                  id: 'larvae_present_ind',
                  title: 'Larvae Present?'
                },
                {
                  id: 'pupae_present_ind',
                  title: 'Pupae Present?'
                },
                {
                  id: 'adults_present_ind',
                  title: 'Adults Present?'
                },
                {
                  id: 'tunnels_present_ind',
                  title: 'Tunnels Present?'
                },
                {
                  id: 'project_code_label',
                  title: 'Project Code'
                },
                {
                  id: 'general_comment',
                  title: 'Comments'
                }
              ]}
              rows={
                !row.monitoring.length
                  ? []
                  : row.monitoring.map((monitor, j) => ({
                      ...monitor,
                      project_code_title: monitor.project_code[0].description
                    }))
              }
            />
          )
        }
      />

      <RecordTable
        tableName="Biological Dispersals"
        startExpanded={false}
        keyField="biological_id"
        startingOrderBy="biological_id"
        startingOrder="desc"
        actions={false}
        headers={[
          {
            id: 'treatment_id',
            title: 'Treatment ID',
            type: 'number'
          },
          {
            id: 'common_name',
            title: 'Species (Common)'
          },
          {
            id: 'monitoring_date',
            title: 'Inspection Date'
          },
          {
            id: 'project_code_label',
            title: 'Project Code'
          },
          {
            id: 'plant_count',
            title: 'Plant Count',
            type: 'number'
          },
          {
            id: 'agent_count',
            title: 'Agent Count',
            type: 'number'
          },
          {
            id: 'count_duration',
            title: 'Count Duration'
          },
          {
            id: 'biological_agent_code',
            title: 'Agent Code'
          },
          {
            id: 'foliar_feeding_damage_ind',
            title: 'Foliar Feeding Damage?'
          },
          {
            id: 'root_feeding_damage_ind',
            title: 'Root Feeding Damage?'
          },
          {
            id: 'seed_feeding_damage_ind',
            title: 'Seed Feeding Damage?'
          },
          {
            id: 'oviposition_marks_ind',
            title: 'Oviposition Marks?'
          },
          {
            id: 'eggs_present_ind',
            title: 'Eggs?'
          },
          {
            id: 'pupae_present_ind',
            title: 'Pupae?'
          },
          {
            id: 'adults_present_ind',
            title: 'Adults?'
          },
          {
            id: 'tunnels_present_ind',
            title: 'Tunnels?'
          },
          {
            id: 'general_comment',
            title: 'Comments'
          }
        ]}
        rows={
          !biological_dispersals.length
            ? []
            : biological_dispersals.map((row) => ({
                ...row,
                project_code_title: row.project_code[0].description
              }))
        }
      />

      <br />
      <br />
      <br />
      <br />
    </Container>
  );
};
