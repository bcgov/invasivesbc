import { Accordion, AccordionDetails, AccordionSummary, Grid, makeStyles, Paper, Typography } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  heading: {
    fontSize: theme.typography.pxToRem(18),
    fontWeight: theme.typography.fontWeightRegular,
    align: 'center'
  },
  siteContainer: {
    height: '600px'
  },
  photoContainer: {},
  paper: {
    padding: theme.spacing(2),
    textAlign: 'left',
    color: theme.palette.text.primary
  }
}));

export interface IAPPSitePropType {
  record: any;
}
export const IAPPSite: React.FC<IAPPSitePropType> = (props) => {
  const classes = useStyles();

  const getSiteID = () => {
    return props?.record?.point_of_interest_payload?.form_data?.point_of_interest_type_data?.site_id;
  };

  const getCreated = () => {
    return props?.record?.point_of_interest_payload?.form_data?.point_of_interest_data?.created_date_on_device;
  };

  const getPaper = () => {
    return props?.record?.point_of_interest_payload?.form_data?.point_of_interest_data?.paper_file[0]?.description;
  };

  const getLong = () => {
    return props?.record?.point_of_interest_payload?.geometry[0]?.geometry?.coordinates[0];
  };

  const getLat = () => {
    return props?.record?.point_of_interest_payload?.geometry[0]?.geometry?.coordinates[1];
  };

  const getMapsheet = () => {
    return props?.record?.point_of_interest_payload?.form_data?.point_of_interest_type_data?.map_sheet;
  };

  const getSlope = () => {
    return props?.record?.point_of_interest_payload?.form_data?.point_of_interest_type_data?.slope;
  };

  const getAspect = () => {
    return props?.record?.point_of_interest_payload?.form_data?.point_of_interest_type_data?.aspect;
  };

  const getElevation = () => {
    return props?.record?.point_of_interest_payload?.form_data?.point_of_interest_type_data?.elevation;
  };

  const getSpecificUse = () => {
    return props?.record?.point_of_interest_payload?.form_data?.point_of_interest_type_data?.specific_use;
  };

  const getSoilTexture = () => {
    return props?.record?.point_of_interest_payload?.form_data?.point_of_interest_type_data?.soil_texture;
  };
  return (
    <>
      <Typography align="center" className={classes.heading}>
        Legacy IAPP Site {getSiteID()}
      </Typography>
      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-map-content" id="panel-map-header">
          <Typography align="center" className={classes.heading}>
            Site {getSiteID()} Details
          </Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.siteContainer}>
          <Paper className={classes.paper} elevation={5}>
            <Grid container xs={8} spacing={5}>
              <Grid item xs={4}>
                SiteID: {getSiteID()}
              </Grid>
              <Grid item xs={4}>
                Created: {getCreated()}
              </Grid>
              <Grid item xs={4}>
                PaperFile: {getPaper()}
              </Grid>
              <Grid item xs={4}>
                Longitude: {getLong()}
              </Grid>
              <Grid item xs={4}>
                Latitude: {getLat()}
              </Grid>
              <Grid item xs={4}>
                Mapsheet: {getMapsheet()}
              </Grid>
              <Grid item xs={4}>
                Slope: {getSlope()}
              </Grid>
              <Grid item xs={4}>
                Aspect: {getAspect()}
              </Grid>
              <Grid item xs={4}>
                Elevation: {getElevation()}
              </Grid>
              <Grid item xs={4}>
                Specific Use: {getSpecificUse()}
              </Grid>
              <Grid item xs={4}>
                Soil Texture: {getSoilTexture()}
              </Grid>
              <Grid item xs={4}>
                All species found:
              </Grid>
              <Grid item xs={4}>
                All species treated:
              </Grid>
              <Grid item xs={4}>
                Species to be treated:
              </Grid>
            </Grid>
          </Paper>
          <br></br>
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-map-content" id="panel-map-header">
          <Typography className={classes.heading}>Survey Details</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.siteContainer}>{JSON.stringify(props?.record)}</AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-map-content" id="panel-map-header">
          <Typography className={classes.heading}>Treatment Details</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.siteContainer}>{JSON.stringify(props?.record)}</AccordionDetails>
      </Accordion>
      ;
    </>
  );
};
